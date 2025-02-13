// import {
//   NavigationProp,
//   ParamListBase,
//   RouteProp,
//   useIsFocused,
//   useNavigation,
//   useRoute,
// } from '@react-navigation/native';
// import {Icon} from '@rneui/base';
// import ContactService from '@services/contactSupportService';
// import {appColors} from '@shared/appColors';
// import CommonHeader from '@shared/components/commonHeader/CommonHeader';
// import CommonLoader from '@shared/components/commonLoader/CommonLoader';
// import CommonText from '@shared/components/commonText/CommonText';
// import {Toast} from '@shared/ToastConfig';
// import {getDateLabel} from '@src/lib/functions';
// import {RootState} from '@store/store';
// import React, {useState, useRef, useCallback, FC, useEffect} from 'react';
// import {
//   View,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Animated,
//   PanResponder,
//   Keyboard,
//   ListRenderItemInfo,
//   StatusBar,
//   Vibration,
//   Modal,
//   Text,
// } from 'react-native';
// import {useSelector} from 'react-redux';

// // Types
// interface Message {
//   id: string;
//   text: string;
//   isOwn: boolean;
//   timestamp: Date;
//   replyTo?: Message;
//   senderId: string;
//   senderName: string;
// }
// interface IFlatListData extends Message {
//   type: 'date' | 'message';
// }
// interface ReplyPreviewProps {
//   replyTo: Message | null;
//   onCancel: () => void;
// }

// interface MessageBubbleProps {
//   message: Message;
//   isOwn: boolean;
//   onSwipeToReply: (message: Message) => void;
//   onReplyPress: (replyTo: Message) => void;
// }

// // Reply Component
// const ReplyPreview: FC<ReplyPreviewProps> = ({replyTo, onCancel}) => {
//   if (!replyTo) return null;

//   return (
//     <View style={styles.replyPreview}>
//       <View style={styles.replyContent}>
//         <CommonText
//           content="Replying to"
//           color={appColors.primary}
//           size={'error'}
//           style={styles.replyLabel}
//         />
//         <CommonText
//           numberOfLines={1}
//           color={appColors.transparentBackground}
//           size={'medium'}
//           content={replyTo?.text}
//         />
//       </View>
//       <TouchableOpacity onPress={onCancel}>
//         <Icon
//           name="close"
//           type="antdesign"
//           color={appColors.transparentBackground}
//           size={20}
//         />
//       </TouchableOpacity>
//     </View>
//   );
// };

// const MessageBubble: FC<MessageBubbleProps> = ({
//   message,
//   isOwn,
//   onSwipeToReply,
//   onReplyPress,
// }) => {
//   const pan = useRef(new Animated.Value(0)).current;
//   const bubbleRef = useRef<View>(null);

//   const panResponder = PanResponder.create({
//     onStartShouldSetPanResponder: () => true,
//     onPanResponderMove: (_, gestureState) => {
//       if (gestureState.dx > 0) {
//         // Only allow right swipe
//         pan.setValue(Math.min(gestureState.dx, 100));
//       }
//     },
//     onPanResponderRelease: (_, gestureState) => {
//       if (gestureState.dx > 50) {
//         // Threshold to trigger reply
//         Vibration.vibrate(50);
//         onSwipeToReply(message);
//       }
//       Animated.spring(pan, {
//         toValue: 0,
//         useNativeDriver: true,
//       }).start();
//     },
//   });

//   return (
//     // <View style={styles.messageWrapper} ref={bubbleRef}>
//     //   <Animated.View
//     //     {...panResponder.panHandlers}
//     //     style={[
//     //       styles.messageBubble,
//     //       isOwn ? styles.userBubble : styles.otherBubble,
//     //       {transform: [{translateX: pan}]},
//     //     ]}>
//     //     {message.replyTo && (
//     //       <TouchableOpacity
//     //         style={styles.replyBubble}
//     //         onPress={() => onReplyPress(message.replyTo!)}>
//     //         <CommonText
//     //           size={'error'}
//     //           color={appColors.lightBg}
//     //           numberOfLines={1}
//     //           content={message?.replyTo?.text}
//     //         />
//     //       </TouchableOpacity>
//     //     )}
//     //     <CommonText
//     //       content={message?.text}
//     //       size={'large'}
//     //       color={isOwn ? appColors.light : appColors.dark}
//     //     />

//     //     <CommonText
//     //       content={new Date(message?.timestamp)?.toLocaleTimeString([], {
//     //         hour: '2-digit',
//     //         minute: '2-digit',
//     //       })}
//     //       size={'error'}
//     //       style={[styles.timestamp]}
//     //       color={isOwn ? appColors.lightGrey : appColors.lightDark}
//     //     />
//     //   </Animated.View>
//     // </View>
//     <View style={styles.messageWrapper} ref={bubbleRef}>
//       <Animated.View
//         {...panResponder.panHandlers}
//         style={[
//           styles.bubbleContainer,
//           isOwn ? styles.ownMessageContainer : styles.otherMessageContainer,
//           {transform: [{translateX: pan}]},
//         ]}>
//         {/* Tail design */}
//         <View
//           style={[styles.tail, isOwn ? styles.ownTail : styles.otherTail]}
//         />
//         <View
//           style={[
//             styles.bubble,
//             isOwn ? styles.ownBubble : styles.otherBubble,
//           ]}>
//           {/* Reply section */}
//           {message?.replyTo && (
//             <TouchableOpacity
//               style={styles.replyContainer}
//               onPress={() => onReplyPress(message.replyTo!)}>
//               <View style={styles.replyBar} />
//               <View style={styles.replyContent}>
//                 <CommonText
//                   color="#25D366"
//                   size={'error'}
//                   numberOfLines={1}
//                   ellipsizeMode="clip"
//                   content={message?.replyTo?.senderName}
//                 />
//                 <CommonText
//                   color="#7C7C7C"
//                   numberOfLines={1}
//                   content={message?.replyTo.text}
//                 />
//               </View>
//             </TouchableOpacity>
//           )}

//           {/* Main message */}
//           <CommonText
//             size={'large'}
//             color={appColors.dark}
//             content={message?.text}
//           />

//           {/* Timestamp */}
//           <View style={styles.timestampContainer}>
//             <CommonText
//               color={'#7C7C7C'}
//               size={'error'}
//               content={new Date(message?.timestamp)?.toLocaleTimeString([], {
//                 hour: '2-digit',
//                 minute: '2-digit',
//               })}
//             />
//           </View>
//         </View>
//       </Animated.View>
//     </View>
//   );
// };

// // Main Chat Component
// const ChatView: FC = () => {
//   const isFocused = useIsFocused();
//   const navigation: NavigationProp<ParamListBase> = useNavigation();
//   const [isLoading, setIsLoading] = useState(true);
//   const [btnLoading, setBtnLoading] = useState(false);

//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [replyTo, setReplyTo] = useState<Message | null>(null);
//   const flatListRef = useRef<FlatList>(null);
//   const userDetails = useSelector((state: RootState) => state.auth.userDetails);

//   const route: RouteProp<{
//     params: {
//       id: string;
//     };
//   }> = useRoute();

//   const getChat = async () => {
//     await ContactService.getChatDetails({request_id: route.params.id})
//       .then((res: any) => {
//         if (res?.success) {
//           // console.log(JSON.stringify(res, undefined, 5));
//           const data = res?.chats?.map((chat: Message) => {
//             chat.isOwn = chat?.senderId === userDetails?.id;
//             return chat;
//           });

//           setMessages(data);
//           setIsLoading(false);
//         }
//       })
//       .catch(err => {
//         console.log(err?.message);
//         setIsLoading(false);
//         Toast({message: err?.message, type: 'error'});
//       });
//   };

//   useEffect(() => {
//     if (isFocused) {
//       getChat();
//     }
//   }, [isFocused]);

//   // Date Separator Component
//   const DateSeparator = ({date}: {date: Date}) => (
//     <View style={styles.dateSeparator}>
//       <View style={styles.dateLine} />
//       <Text style={styles.dateText}>{getDateLabel(date)}</Text>
//       <View style={styles.dateLine} />
//     </View>
//   );

//   // Group messages by date
//   const groupMessagesByDate = () => {
//     const groups: {
//       type: 'date' | 'message';
//       id: string;
//       timestamp?: Date;
//     }[] = [];
//     let currentDate: string | null = null;

//     messages.forEach(message => {
//       const messageDate = new Date(message.timestamp).toDateString();

//       if (messageDate !== currentDate) {
//         currentDate = messageDate;
//         groups.push({
//           type: 'date',
//           id: messageDate,
//           timestamp: message?.timestamp,
//         });
//       }

//       groups.push({
//         type: 'message',
//         ...message,
//       });
//     });

//     return groups;
//   };

//   // Scroll to message by ID
//   const scrollToMessage = useCallback(
//     (message: any) => {
//       const index = messages.findIndex(msg => {
//         return msg?.id === message?._id;
//       });

//       if (index !== -1) {
//         flatListRef.current?.scrollToIndex({
//           index,
//           animated: true,
//           viewPosition: 0.5,
//         });
//       }
//     },
//     [messages],
//   );

//   // Handle scroll failure
//   const onScrollToIndexFailed = (info: {
//     index: number;
//     highestMeasuredFrameIndex: number;
//     averageItemLength: number;
//   }) => {
//     const wait = new Promise(resolve => setTimeout(resolve, 500));
//     wait.then(() => {
//       flatListRef.current?.scrollToIndex({
//         index: info.index,
//         animated: true,
//         viewPosition: 0.5,
//       });
//     });
//   };

//   // Keyboard effect
//   useEffect(() => {
//     const keyboardDidShowListener = Keyboard.addListener(
//       'keyboardDidShow',
//       () => {
//         flatListRef.current?.scrollToEnd({animated: true});
//       },
//     );

//     return () => {
//       keyboardDidShowListener.remove();
//     };
//   }, []);

//   const sendMessage = async () => {
//     if (newMessage.trim()) {
//       setBtnLoading(true);
//       const newMsg = {
//         message: newMessage.trim(),
//         request_id: route.params.id,
//         replyTo: replyTo || undefined,
//       };
//       await ContactService.addReply(newMsg)
//         .then((res: any) => {
//           setBtnLoading(false);
//           if (res?.success) {
//             const data = res?.chats?.map((chat: Message) => {
//               chat.isOwn = chat?.senderId === userDetails?.id;
//               return chat;
//             });
//             setMessages(data);
//             setNewMessage('');
//             setReplyTo(null);

//             setTimeout(() => {
//               flatListRef.current?.scrollToEnd({animated: true});
//             }, 100);
//           }
//         })
//         .catch(err => {
//           setBtnLoading(false);
//           Toast({message: err?.response?.data?.message, type: 'error'});
//         });
//     }
//   };

//   const renderMessage = ({item}: ListRenderItemInfo<IFlatListData>) => {
//     if (item?.type === 'date') {
//       return <DateSeparator date={item?.timestamp} />;
//     }

//     return (
//       <MessageBubble
//         message={item}
//         isOwn={item?.isOwn}
//         onSwipeToReply={setReplyTo}
//         onReplyPress={scrollToMessage}
//       />
//     );
//   };

//   return (
//     <KeyboardAvoidingView style={styles.container}>
//       <CommonHeader
//         leftIcon
//         leftIconPressBack={() => navigation.goBack()}
//         title="Chat"
//       />
//       <StatusBar
//         backgroundColor={
//           isLoading ? appColors.transparentBackground : appColors.light
//         }
//         barStyle={isLoading ? 'light-content' : 'dark-content'}
//       />
//       <FlatList
//         ref={flatListRef}
//         data={groupMessagesByDate()}
//         renderItem={renderMessage}
//         keyExtractor={(item, index) => index.toString()}
//         contentContainerStyle={styles.messagesList}
//         onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
//         onScrollToIndexFailed={onScrollToIndexFailed}
//       />

//       <View style={styles.inputSection}>
//         <ReplyPreview replyTo={replyTo} onCancel={() => setReplyTo(null)} />
//         <View style={styles.inputContainer}>
//           <TextInput
//             style={styles.input}
//             value={newMessage}
//             onChangeText={setNewMessage}
//             placeholder="Type a message..."
//             multiline
//           />
//           <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
//             <CommonText content="Send" bold color={appColors.light} />
//           </TouchableOpacity>
//         </View>
//       </View>
//       <Modal visible={isLoading} animationType="fade" transparent={true}>
//         <CommonLoader />
//       </Modal>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: appColors.light,
//     paddingBottom: 15,
//   },
//   messagesList: {
//     padding: 16,
//   },
//   messageWrapper: {
//     marginBottom: 10,
//     paddingHorizontal: 5,
//     width: '100%',
//   },
//   messageBubble: {
//     maxWidth: '70%',
//     padding: 12,
//     borderRadius: 20,
//     marginBottom: 4,
//   },
//   userBubble: {
//     backgroundColor: appColors.primary,
//     borderBottomRightRadius: 4,
//     alignSelf: 'flex-end',
//   },
//   // otherBubble: {
//   //   backgroundColor: '#E8E8E8',
//   //   borderBottomLeftRadius: 4,
//   //   alignSelf: 'flex-start',
//   // },
//   // Add styles for improved touch handling
//   messageContainer: {
//     width: '100%',
//     backgroundColor: 'red',
//     flexDirection: 'row',
//     justifyContent: 'flex-start',
//     alignItems: 'flex-end',
//   },
//   userMessageContainer: {
//     justifyContent: 'flex-end',
//   },

//   // timestamp: {
//   //   alignSelf: 'flex-end',
//   // },
//   inputSection: {
//     backgroundColor: appColors.light,
//     borderTopWidth: 1,
//     borderTopColor: '#E8E8E8',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     padding: 16,
//     alignItems: 'center',
//   },
//   input: {
//     flex: 1,
//     backgroundColor: '#F0F0F0',
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     marginRight: 8,
//     maxHeight: 100,
//   },
//   sendButton: {
//     backgroundColor: appColors.primary,
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//   },
//   replyPreview: {
//     flexDirection: 'row',
//     padding: 8,
//     backgroundColor: appColors.formBorderColor,
//     borderTopLeftRadius: 8,
//     borderTopRightRadius: 8,
//     alignItems: 'center',
//   },
//   replyLabel: {
//     marginBottom: 2,
//   },
//   replyBubble: {
//     backgroundColor: 'rgba(0,0,0,0.1)',
//     padding: 8,
//     borderRadius: 8,
//     marginBottom: 8,
//   },

//   //demo
//   bubbleContainer: {
//     marginVertical: 4,
//     marginHorizontal: 8,
//     maxWidth: '80%',
//     minWidth: '40%',
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   ownMessageContainer: {
//     alignSelf: 'flex-end',
//   },
//   otherMessageContainer: {
//     alignSelf: 'flex-start',
//   },
//   bubble: {
//     borderRadius: 16,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     minWidth: '40%',
//   },
//   ownBubble: {
//     backgroundColor: '#DCF8C6',
//   },
//   otherBubble: {
//     backgroundColor: '#f0f0ff',
//   },
//   tail: {
//     width: 12,
//     height: 12,
//     position: 'absolute',
//     top: 0,
//     zIndex: 1,
//   },
//   ownTail: {
//     right: -6,
//     backgroundColor: '#DCF8C6',
//     transform: [{rotate: '45deg'}, {skewX: '-30deg'}],
//   },
//   otherTail: {
//     left: -6,
//     backgroundColor: '#f0f0ff',
//     transform: [{rotate: '-45deg'}, {skewX: '30deg'}],
//   },

//   timestampContainer: {
//     alignSelf: 'flex-end',
//     marginTop: 4,
//   },

//   replyContainer: {
//     marginBottom: 8,
//     padding: 8,
//     backgroundColor: 'rgba(0, 0, 0, 0.05)',
//     borderRadius: 8,
//     flexDirection: 'row',
//   },
//   replyBar: {
//     width: 4,
//     backgroundColor: '#25D366',
//     borderRadius: 2,
//     marginRight: 8,
//   },
//   replyContent: {
//     flex: 1,
//   },
//   replyName: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#25D366',
//   },

//   replyButton: {
//     padding: 8,
//     marginLeft: 8,
//     opacity: 0,
//   },
//   replyButtonText: {
//     fontSize: 20,
//     color: '#7C7C7C',
//   },

//   //date
//   dateSeparator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 16,
//   },
//   dateLine: {
//     flex: 1,
//     height: 1,
//     backgroundColor: '#E8E8E8',
//   },
//   dateText: {
//     color: '#8E8E93',
//     fontSize: 14,
//     fontWeight: '600',
//     marginHorizontal: 16,
//   },
// });

// export default ChatView;

import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {Icon} from '@rneui/base';
import ContactService from '@services/contactSupportService';
import {appColors} from '@shared/appColors';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import CommonText from '@shared/components/commonText/CommonText';
import {Toast} from '@shared/ToastConfig';
import {getDateLabel} from '@src/lib/functions';
import {RootState} from '@store/store';
import React, {useState, useRef, useCallback, FC, useEffect} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Animated,
  PanResponder,
  Keyboard,
  ListRenderItemInfo,
  StatusBar,
  Modal,
  Text,
  Vibration,
} from 'react-native';
import {useSelector} from 'react-redux';

interface Message {
  id: string;
  text: string;
  isOwn: boolean;
  timestamp: Date;
  replyTo?: Message;
  senderId: string;
  senderName: string;
  _id?: string;
}

interface IFlatListData extends Message {
  type: 'date' | 'message';
}

interface ReplyPreviewProps {
  replyTo: Message | null;
  onCancel: () => void;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onSwipeToReply: (message: Message) => void;
  onReplyPress: (replyTo: Message) => void;
}

const ReplyPreview: FC<ReplyPreviewProps> = ({replyTo, onCancel}) => {
  if (!replyTo) return null;

  return (
    <View style={styles.replyPreview}>
      <View style={styles.replyContent}>
        <CommonText
          content="Replying to"
          color={appColors.primary}
          size="error"
          style={styles.replyLabel}
        />
        <CommonText
          numberOfLines={1}
          color={appColors.transparentBackground}
          size="medium"
          content={replyTo.text}
        />
      </View>
      <TouchableOpacity onPress={onCancel}>
        <Icon
          name="close"
          type="antdesign"
          color={appColors.transparentBackground}
          size={20}
        />
      </TouchableOpacity>
    </View>
  );
};

const MessageBubble: FC<MessageBubbleProps> = ({
  message,
  isOwn,
  onSwipeToReply,
  onReplyPress,
}) => {
  const pan = useRef(new Animated.Value(0)).current;
  const bubbleRef = useRef<View>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx > 0) {
        pan.setValue(Math.min(gestureState.dx, 100));
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 50) {
        Vibration.vibrate(50);
        onSwipeToReply(message);
      }
      Animated.spring(pan, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    },
  });

  return (
    <View style={styles.messageWrapper} ref={bubbleRef}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.bubbleContainer,
          isOwn ? styles.ownMessageContainer : styles.otherMessageContainer,
          {transform: [{translateX: pan}]},
        ]}>
        <View
          style={[styles.tail, isOwn ? styles.ownTail : styles.otherTail]}
        />
        <View
          style={[
            styles.bubble,
            isOwn ? styles.ownBubble : styles.otherBubble,
          ]}>
          {message.replyTo && (
            <TouchableOpacity
              style={styles.replyContainer}
              onPress={() => onReplyPress(message.replyTo!)}>
              <View style={styles.replyBar} />
              <View style={styles.replyContent}>
                <CommonText
                  color="#25D366"
                  size="error"
                  numberOfLines={1}
                  ellipsizeMode="clip"
                  content={message.replyTo.senderName}
                />
                <CommonText
                  color="#7C7C7C"
                  numberOfLines={1}
                  content={message.replyTo.text}
                />
              </View>
            </TouchableOpacity>
          )}

          <CommonText
            size="large"
            color={appColors.dark}
            content={message.text}
          />

          <View style={styles.timestampContainer}>
            <CommonText
              color="#7C7C7C"
              size="error"
              content={new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const DateSeparator: FC<{date: Date}> = ({date}) => (
  <View style={styles.dateSeparator}>
    <View style={styles.dateLine} />
    <Text style={styles.dateText}>{getDateLabel(date)}</Text>
    <View style={styles.dateLine} />
  </View>
);

const ChatView: FC = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [isLoading, setIsLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const flatListRef = useRef<FlatList<IFlatListData>>(null);
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);

  const route = useRoute<RouteProp<{params: {id: string}}, 'params'>>();

  const getChat = async () => {
    try {
      const res: any = await ContactService.getChatDetails({
        request_id: route.params.id,
      });
      if (res?.success) {
        const data = res.chats.map((chat: Message) => ({
          ...chat,
          isOwn: chat.senderId === userDetails?.id,
        }));
        setMessages(data);
      }
    } catch (err: any) {
      Toast({message: err?.message, type: 'error'});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      getChat();
    }
  }, [isFocused]);

  const groupMessagesByDate = useCallback(() => {
    const groups: IFlatListData[] = [];
    let currentDate: string | null = null;

    messages.forEach(message => {
      const messageDate = new Date(message.timestamp).toDateString();

      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({
          type: 'date',
          id: messageDate,
          timestamp: message.timestamp,
        } as IFlatListData);
      }

      groups.push({
        type: 'message',
        ...message,
      } as IFlatListData);
    });

    return groups;
  }, [messages]);

  const scrollToMessage = useCallback(
    (message: Message) => {
      const index = messages.findIndex(msg => msg.id === message._id);
      if (index !== -1) {
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }
    },
    [messages],
  );

  const onScrollToIndexFailed = useCallback(
    (info: {
      index: number;
      highestMeasuredFrameIndex: number;
      averageItemLength: number;
    }) => {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: info.index,
          animated: true,
          viewPosition: 0.5,
        });
      }, 500);
    },
    [],
  );

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        flatListRef.current?.scrollToEnd({animated: true});
      },
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setBtnLoading(true);
    try {
      const res: any = await ContactService.addReply({
        message: newMessage.trim(),
        request_id: route.params.id,
        replyTo: replyTo || undefined,
      });

      if (res?.success) {
        const data = res.chats.map((chat: Message) => ({
          ...chat,
          isOwn: chat.senderId === userDetails?.id,
        }));
        setMessages(data);
        setNewMessage('');
        setReplyTo(null);

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({animated: true});
        }, 100);
      }
    } catch (err: any) {
      Toast({message: err?.response?.data?.message, type: 'error'});
    } finally {
      setBtnLoading(false);
    }
  };

  const renderMessage = ({item}: ListRenderItemInfo<IFlatListData>) => {
    if (item.type === 'date') {
      return <DateSeparator date={item.timestamp} />;
    }

    return (
      <MessageBubble
        message={item}
        isOwn={item.isOwn}
        onSwipeToReply={setReplyTo}
        onReplyPress={scrollToMessage}
      />
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <CommonHeader
        leftIcon
        leftIconPressBack={() => navigation.goBack()}
        title="Chat"
      />
      <StatusBar
        backgroundColor={
          isLoading ? appColors.transparentBackground : appColors.light
        }
        barStyle={isLoading ? 'light-content' : 'dark-content'}
      />
      <FlatList
        ref={flatListRef}
        data={groupMessagesByDate()}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onScrollToIndexFailed={onScrollToIndexFailed}
      />

      <View style={styles.inputSection}>
        <ReplyPreview replyTo={replyTo} onCancel={() => setReplyTo(null)} />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}
            disabled={btnLoading}>
            <CommonText content="Send" bold color={appColors.light} />
          </TouchableOpacity>
        </View>
      </View>
      <Modal visible={isLoading} animationType="fade" transparent>
        <CommonLoader />
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.light,
    paddingBottom: 15,
  },
  messagesList: {
    padding: 5,
  },
  messageWrapper: {
    marginBottom: 10,
    paddingHorizontal: 5,
    width: '100%',
  },
  bubbleContainer: {
    marginVertical: 4,
    marginHorizontal: 8,
    maxWidth: '80%',
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minWidth: '45%',
  },
  ownBubble: {
    backgroundColor: '#DCF8C6',
  },
  otherBubble: {
    backgroundColor: '#f0f0ff',
  },
  tail: {
    width: 12,
    height: 12,
    position: 'absolute',
    top: 0,
    zIndex: 1,
    // borderTopRightRadius: 6,
  },
  ownTail: {
    right: -6,
    backgroundColor: '#DCF8C6',
    transform: [{rotate: '45deg'}, {skewX: '-30deg'}],
  },
  otherTail: {
    left: -6,
    backgroundColor: '#f0f0ff',
    transform: [{rotate: '-45deg'}, {skewX: '30deg'}],
  },
  timestampContainer: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  replyContainer: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    flexDirection: 'row',
  },
  replyBar: {
    width: 4,
    backgroundColor: '#25D366',
    borderRadius: 2,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  inputSection: {
    backgroundColor: appColors.light,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: appColors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  replyPreview: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: appColors.formBorderColor,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center',
  },
  replyLabel: {
    marginBottom: 2,
  },
  replyBubble: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },

  //demo

  replyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#25D366',
  },

  replyButton: {
    padding: 8,
    marginLeft: 8,
    opacity: 0,
  },
  replyButtonText: {
    fontSize: 20,
    color: '#7C7C7C',
  },

  //date
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  dateText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 16,
  },
});

export default ChatView;
