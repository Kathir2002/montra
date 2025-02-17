// // types.ts
// export interface User {
//   userId: string;
//   username?: string;
// }

// export interface Message {
//   id: string;
//   content: string;
//   senderId: string;
//   receiverId?: string;
//   roomId?: string;
//   timestamp: string;
//   status?: 'sent' | 'delivered' | 'read';
// }

// export interface Room {
//   roomId: string;
//   name?: string;
//   participants: string[];
// }

// export interface MessagePayload {
//   content: string;
//   roomId?: string;
//   receiverId?: string;
// }

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
//   messages: Message[];
//   activeUsers: User[];
//   sendMessage: (messageData: MessagePayload) => void;
//   sendTypingStatus: (isTyping: boolean, roomId: string) => void;
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
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [activeUsers, setActiveUsers] = useState<User[]>([]);

//   useEffect(() => {
//     const socketInstance: Socket = io(serverUrl, {
//       auth: {userId, username},
//       transports: ['websocket'],
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//     });

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

//     const handleReceiveMessage = (message: Message) => {
//       setMessages(prev => [...prev, message]);
//     };

//     // Socket event listeners
//     socketInstance.on('connect', handleConnect);
//     socketInstance.on('disconnect', handleDisconnect);
//     socketInstance.on('users:active', handleActiveUsers);
//     socketInstance.on('message:receive', handleReceiveMessage);

//     setSocket(socketInstance);

//     // Cleanup function
//     return () => {
//       if (socketInstance) {
//         socketInstance.off('connect', handleConnect);
//         socketInstance.off('disconnect', handleDisconnect);
//         socketInstance.off('users:active', handleActiveUsers);
//         socketInstance.off('message:receive', handleReceiveMessage);
//         socketInstance.disconnect();
//       }
//     };
//   }, [serverUrl, userId, username]);

//   const sendMessage = useCallback(
//     (messageData: MessagePayload): void => {
//       if (socket && isConnected) {
//         const message: Omit<Message, 'id'> = {
//           ...messageData,
//           senderId: userId,
//           timestamp: new Date().toISOString(),
//           status: 'sent',
//         };

//         socket.emit('message:send', message);
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
//     messages,
//     activeUsers,
//     sendMessage,
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

// types.ts
export interface User {
  userId: string;
  username?: string;
  status?: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId?: string;
  roomId?: string;
  timestamp: string;
  type?: 'text' | 'image' | 'file';
  status?: 'sent' | 'delivered' | 'read';
}

export interface Room {
  roomId: string;
  name?: string;
  participants: string[];
}

export interface MessagePayload {
  content: string;
  roomId?: string;
  receiverId?: string;
  type?: 'text' | 'image' | 'file';
}

// SocketContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {Socket, io} from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  messages: Message[];
  activeUsers: User[];
  sendMessage: (messageData: MessagePayload) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendTypingStatus: (isTyping: boolean, roomId: string) => void;
  clearMessages: () => void;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);

  useEffect(() => {
    const socketInstance: Socket = io(serverUrl, {
      auth: {userId, username},
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const handleConnect = () => {
      console.log('Socket connected');
      setIsConnected(true);
      socketInstance.emit('user:join', {userId, username});
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    };

    const handleActiveUsers = (users: User[]) => {
      setActiveUsers(users);
    };

    const handleReceiveMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
    };

    // Socket event listeners
    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);
    socketInstance.on('users:active', handleActiveUsers);
    socketInstance.on('message:receive', handleReceiveMessage);

    setSocket(socketInstance);

    // Cleanup function
    return () => {
      if (socketInstance) {
        socketInstance.off('connect', handleConnect);
        socketInstance.off('disconnect', handleDisconnect);
        socketInstance.off('users:active', handleActiveUsers);
        socketInstance.off('message:receive', handleReceiveMessage);
        socketInstance.disconnect();
      }
    };
  }, [serverUrl, userId, username]);

  const sendMessage = useCallback(
    (messageData: MessagePayload): void => {
      if (socket && isConnected) {
        const message: Omit<Message, 'id'> = {
          ...messageData,
          senderId: userId,
          timestamp: new Date().toISOString(),
          status: 'sent',
        };

        socket.emit('message:send', message);
      }
    },
    [socket, isConnected, userId],
  );

  const joinRoom = useCallback(
    (roomId: string): void => {
      if (socket && isConnected) {
        socket.emit('room:join', {roomId, userId});
      }
    },
    [socket, isConnected, userId],
  );

  const leaveRoom = useCallback(
    (roomId: string): void => {
      if (socket && isConnected) {
        socket.emit('room:leave', {roomId, userId});
      }
    },
    [socket, isConnected, userId],
  );

  const sendTypingStatus = useCallback(
    (isTyping: boolean, roomId: string): void => {
      if (socket && isConnected) {
        socket.emit('user:typing', {isTyping, roomId, userId});
      }
    },
    [socket, isConnected, userId],
  );

  const clearMessages = useCallback((): void => {
    setMessages([]);
  }, []);

  const value: SocketContextType = {
    socket,
    isConnected,
    messages,
    activeUsers,
    sendMessage,
    joinRoom,
    leaveRoom,
    sendTypingStatus,
    clearMessages,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

// Custom hook with type safety
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
