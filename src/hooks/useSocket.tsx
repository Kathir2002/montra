// export interface User {
//   userId: string;
//   username?: string;
//   status?: 'online' | 'offline' | 'away';
//   lastSeen?: string;
// }

// export interface Room {
//   roomId: string;
//   name?: string;
//   participants: string[];
// }

// export interface MessagePayload {
//   message: string;
//   request_id: string;
//   replyTo: Message | undefined;
// }

// import {IFlatListData, Message} from '@components/profile/ChatView';
// // SocketContext.tsx
// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   useCallback,
//   ReactNode,
// } from 'react';
// import {Socket, io} from 'socket.io-client';

// interface SocketContextType {
//   socket: Socket | null;
//   isConnected: boolean;
//   activeUsers: User[];
//   joinRoom: (roomId: string) => void;
//   leaveRoom: (roomId: string) => void;
//   sendTypingStatus: (isTyping: boolean, roomId: string) => void;
//   initializeSocket:() => Socket
// }

// interface SocketProviderProps {
//   children: ReactNode;
//   serverUrl: string;
//   userId: string;
//   username?: string;
// }

// const SocketContext = createContext<SocketContextType | undefined>(undefined);

// export const SocketProvider: React.FC<SocketProviderProps> = ({
//   children,
//   serverUrl,
//   userId,
//   username,
// }) => {
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [isConnected, setIsConnected] = useState<boolean>(false);
//   const [activeUsers, setActiveUsers] = useState<User[]>([]);

//   const initializeSocket = () =>
//     io(serverUrl, {
//       auth: {userId, username},
//       transports: ['websocket'],
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//     });

//   useEffect(() => {
//     const socketInstance: Socket = initializeSocket();

//     const handleConnect = () => {
//       console.log('Socket connected');
//       setIsConnected(true);
//       socketInstance.emit('user:join', {userId, username});
//     };

//     const handleDisconnect = () => {
//       console.log('Socket disconnected');
//       setIsConnected(false);
//     };

//     const handleActiveUsers = (users: User[]) => {
//       setActiveUsers(users);
//     };

//     // Socket event listeners
//     socketInstance.on('connect', handleConnect);
//     socketInstance.on('disconnect', handleDisconnect);
//     socketInstance.on('users:active', handleActiveUsers);

//     setSocket(socketInstance);

//     // Cleanup function
//     return () => {
//       if (socketInstance) {
//         socketInstance.off('connect', handleConnect);
//         socketInstance.off('disconnect', handleDisconnect);
//         socketInstance.off('users:active', handleActiveUsers);
//         socketInstance.disconnect();
//       }
//     };
//   }, [serverUrl, userId, username]);

//   const joinRoom = useCallback(
//     (roomId: string): void => {
//       if (socket && isConnected) {
//         socket.emit('room:join', {roomId, userId});
//       }
//     },
//     [socket, isConnected, userId],
//   );

//   const leaveRoom = useCallback(
//     (roomId: string): void => {
//       if (socket && isConnected) {
//         socket.emit('room:leave', {roomId, userId});
//       }
//     },
//     [socket, isConnected, userId],
//   );

//   const sendTypingStatus = useCallback(
//     (isTyping: boolean, roomId: string): void => {
//       if (socket && isConnected) {
//         socket.emit('user:typing', {isTyping, roomId, userId});
//       }
//     },
//     [socket, isConnected, userId],
//   );

//   const value: SocketContextType = {
//     socket,
//     isConnected,
//     activeUsers,
//     initializeSocket,
//     joinRoom,
//     leaveRoom,
//     sendTypingStatus,
//   };

//   return (
//     <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
//   );
// };

// // Custom hook with type safety
// export const useSocket = (): SocketContextType => {
//   const context = useContext(SocketContext);
//   if (!context) {
//     throw new Error('useSocket must be used within a SocketProvider');
//   }
//   return context;
// };

export interface User {
  userId: string;
  username?: string;
  status?: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Socket, io } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeUsers: User[];
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendTypingStatus: (isTyping: boolean, roomId: string) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
}

interface SocketProviderProps {
  children: ReactNode;
  serverUrl: string;
  userId: string;
  username?: string;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  serverUrl,
  userId,
  username,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);

  const initializeSocket = useCallback(
    () =>
      io(serverUrl, {
        auth: { userId, username },
        transports: ['websocket', "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }),
    [serverUrl, userId, username],
  );

  const setupSocketListeners = useCallback(
    (socketInstance: Socket) => {
      const handleConnect = () => {
        console.log('Socket connected');
        setIsConnected(true);
        socketInstance.emit('user:join', { userId, username });
      };

      const handleDisconnect = () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      };

      const handleActiveUsers = (users: User[]) => {
        setActiveUsers(users);
      };

      socketInstance.on('connect', handleConnect);
      socketInstance.on('disconnect', handleDisconnect);
      socketInstance.on('users:active', handleActiveUsers);

      return () => {
        socketInstance.off('connect', handleConnect);
        socketInstance.off('disconnect', handleDisconnect);
        socketInstance.off('users:active', handleActiveUsers);
      };
    },
    [userId, username],
  );

  const connect = useCallback(async (): Promise<void> => {
    try {
      if (socket) {
        // If socket exists but not connected, try reconnecting
        if (!socket.connected) {
          socket.connect();
          return;
        }
        return; // Already connected
      }

      const socketInstance = initializeSocket();
      setSocket(socketInstance);

      // Setup listeners
      setupSocketListeners(socketInstance);

      // Return a promise that resolves when connected
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 5000);

        socketInstance.once('connect', () => {
          clearTimeout(timeout);
          resolve();
        });

        socketInstance.once('connect_error', error => {
          clearTimeout(timeout);
          reject(error);
        });
      });
    } catch (error) {
      console.error('Socket connection error:', error);
      throw error;
    }
  }, [socket, initializeSocket, setupSocketListeners]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  const joinRoom = useCallback(
    (roomId: string): void => {
      if (socket && isConnected) {
        socket.emit('room:join', { roomId, userId });
      }
    },
    [socket, isConnected, userId],
  );

  const leaveRoom = useCallback(
    (roomId: string): void => {
      if (socket && isConnected) {
        socket.emit('room:leave', { roomId, userId });
      }
    },
    [socket, isConnected, userId],
  );

  const sendTypingStatus = useCallback(
    (isTyping: boolean, roomId: string): void => {
      if (socket && isConnected) {
        socket.emit('user:typing', { isTyping, roomId, userId });
      }
    },
    [socket, isConnected, userId],
  );

  // Connect on mount
  useEffect(() => {
    connect().catch(console.error);
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const value: SocketContextType = {
    socket,
    isConnected,
    activeUsers,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendTypingStatus,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
