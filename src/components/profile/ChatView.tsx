import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {Icon} from '@rneui/base';
const x = 10;

import ContactService from '@services/contactSupportService';
import {appColors} from '@shared/appColors';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import CommonText from '@shared/components/commonText/CommonText';
import {Toast} from '@shared/ToastConfig';
import {useSocket} from '@src/hooks/useSocket';
import {getDateLabel} from '@src/lib/functions';
import {RootState} from '@store/store';
import LottieView from 'lottie-react-native';
import React, {
  useState,
  useRef,
  useCallback,
  FC,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react';
import EditIcon from '@assets/svg/edit.svg';
import DeleteIcon from '@assets/svg/delete.svg';

import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  ListRenderItemInfo,
  StatusBar,
  Modal,
  Vibration,
  Text,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {useSelector} from 'react-redux';
import {RBSheetRef} from '@shared/components/commonRBSheet/CommonRBSheet';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import {Pressable} from 'react-native';
import CommonConfirmation from '@shared/components/CommonConfirmation';
import Popover from 'react-native-popover-view';

export interface Message {
  id: string;
  text: string;
  isOwn: boolean;
  isRead: boolean;
  timestamp: Date;
  replyTo?: Message;
  senderId: string;
  senderName: string;
  _id?: string;
}

export interface IFlatListData extends Message {
  type: 'date' | 'message' | 'typing';
}

interface ReplyPreviewProps {
  replyTo: Message | null;
  onCancel: () => void;
  isOwn: boolean;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onSwipeToReply: (message: Message) => void;
  onReplyPress: (replyTo: Message) => void;
  highLightMessageIndex: number;
  index: number;
  setShowMenu: Dispatch<
    SetStateAction<{visible: boolean; message: Message | null}>
  >;
  setHighLightMessageIndex: Dispatch<SetStateAction<number | null>>;
  isFocus: React.RefObject<TextInput>;
}

const ReplyPreview: FC<ReplyPreviewProps> = ({replyTo, onCancel, isOwn}) => {
  if (!replyTo) return null;
  return (
    <View style={styles.replyPreview}>
      <View style={styles.replyContainer}>
        <View
          style={[styles.replyBar, {backgroundColor: isOwn ? 'blue' : 'green'}]}
        />
        <View style={styles.replyContent}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <CommonText
              color={isOwn ? 'blue' : 'green'}
              size="error"
              // numberOfLines={1}
              ellipsizeMode="clip"
              content={isOwn ? 'You' : replyTo.senderName}
            />
            <TouchableOpacity onPress={onCancel} activeOpacity={0.7}>
              <Icon
                type="antdesign"
                name="close"
                color={isOwn ? 'blue' : 'green'}
                size={18}
              />
            </TouchableOpacity>
          </View>
          <CommonText
            color="#7C7C7C"
            numberOfLines={1}
            content={replyTo.text}
          />
        </View>
      </View>
    </View>
  );
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  onSwipeToReply,
  onReplyPress,
  highLightMessageIndex,
  index,
  setShowMenu,
  setHighLightMessageIndex,
  isFocus,
}) => {
  const translateX = useSharedValue(0);
  const bubbleRef = useRef<View>(null);

  const handleFocus = useCallback(() => {
    if (isFocus?.current) {
      isFocus.current.focus();
    }
  }, [isFocus]);

  const onGestureEvent = useAnimatedGestureHandler({
    onStart: () => {
      translateX.value = 0;
    },
    onActive: event => {
      if (event.translationX > 0) {
        translateX.value = Math.min(event.translationX, 100);
      }
    },
    onEnd: event => {
      if (event.translationX > 50) {
        runOnJS(Vibration.vibrate)(50);
        runOnJS(onSwipeToReply)(message);
        runOnJS(handleFocus)();
      }
      translateX.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: translateX.value}],
    };
  });

  return (
    <Pressable
      onPress={() => {
        setShowMenu({visible: false, message: null});
        setHighLightMessageIndex(null);
      }}
      style={{width: '100%'}}
      onLongPress={() => {
        if (message?.isOwn) {
          setShowMenu({visible: true, message: message});
          setHighLightMessageIndex(index);
          Vibration.vibrate(70);
        }
      }}>
      <Animated.View
        entering={highLightMessageIndex === index ? FadeIn : undefined}
        exiting={highLightMessageIndex === index ? FadeOut : undefined}
        style={[
          styles.messageWrapper,
          {
            backgroundColor:
              highLightMessageIndex === index ? 'rgba(0,0,0,0.1)' : undefined,
            borderRadius: highLightMessageIndex === index ? 5 : 0,
          },
        ]}
        ref={bubbleRef}>
        <PanGestureHandler onGestureEvent={onGestureEvent}>
          <Animated.View
            style={[
              styles.bubbleContainer,
              isOwn ? styles.ownMessageContainer : styles.otherMessageContainer,
              animatedStyle,
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
                  activeOpacity={0.7}
                  style={styles.replyContainer}
                  onPress={() => onReplyPress(message.replyTo!)}>
                  <View
                    style={[
                      styles.replyBar,
                      {backgroundColor: isOwn ? 'blue' : 'green'},
                    ]}
                  />
                  <View style={styles.replyContent}>
                    <Text
                      style={[
                        styles.replyName,
                        {color: isOwn ? 'blue' : 'green'},
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="clip">
                      {isOwn ? 'You' : message.replyTo.senderName}
                    </Text>
                    <Text style={styles.replyText} numberOfLines={1}>
                      {message.replyTo.text}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              <Text style={styles.messageText}>{message.text}</Text>
              <View style={styles.timestampContainer}>
                <Text style={styles.timestamp}>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                {isOwn && (
                  <Icon
                    name={
                      message.isRead
                        ? 'checkmark-done-outline'
                        : 'checkmark-outline'
                    }
                    type="ionicon"
                    color={message.isRead ? '#007AFF' : '#7C7C7C'}
                    size={15}
                  />
                )}
              </View>
            </View>
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </Pressable>
  );
};

const DateSeparator: FC<{date: Date}> = ({date}) => (
  <View style={styles.dateSeparator}>
    <View style={styles.dateLine} />
    <CommonText
      style={styles.dateText}
      bold
      color={'#8E8E93'}
      content={getDateLabel(date)}
    />
    <View style={styles.dateLine} />
  </View>
);

const TypingAnimation = () => {
  return (
    <View style={styles.messageWrapper}>
      <View
        style={[
          styles.bubbleContainer,
          styles.otherMessageContainer,
          {minWidth: '10%'},
        ]}>
        <View style={[styles.tail, styles.otherTail]} />
        <View
          style={[
            styles.bubble,
            styles.otherBubble,
            {minWidth: '10%', padding: 0},
          ]}>
          <LottieView
            style={{
              height: 25,
              width: 35,
              alignSelf: 'center',
            }}
            source={require('@assets/lottie/typing.json')}
            autoPlay
            loop
          />
        </View>
      </View>
    </View>
  );
};

const ChatView: FC = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [isLoading, setIsLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const flatListRef = useRef<FlatList<IFlatListData>>(null);
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const [flatListData, setFlatListData] = useState<IFlatListData[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [highLightMessageIndex, setHighLightMessageIndex] = useState<
    number | null
  >(null);
  const [showMenuOption, setShowMenuOptions] = useState<{
    visible: boolean;
    message: Message | null;
  }>({visible: false, message: null});
  const [rbSheetOpen, setRbSheetOpen] = useState(false);
  const deleteRBSheetRef = useRef<RBSheetRef>(null);
  const isFieldFocus = useRef<TextInput>(null);
  const [isSocketReconnecting, setisSocketReconnecting] = useState(false);
  const route = useRoute<RouteProp<{params: {id: string}}, 'params'>>();
  // FlatList viewability config
  const viewabilityConfig = useRef({itemVisiblePercentThreshold: 50}).current;
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const {sendTypingStatus, socket, joinRoom, leaveRoom, isConnected, connect} =
    useSocket();

  useEffect(() => {
    if (highLightMessageIndex && !showMenuOption?.message?.id) {
      setTimeout(() => {
        setHighLightMessageIndex(null);
      }, 1000);
    }
  }, [highLightMessageIndex]);

  useEffect(() => {
    if (isConnected) {
      setisSocketReconnecting(false);
    } else {
      setisSocketReconnecting(true);

      // Try to reconnect
      connect()
        .then(() => {
          setisSocketReconnecting(false);
        })
        .catch(error => {
          console.error('Socket reconnection failed:', error);
          setisSocketReconnecting(true);
        });
    }
  }, [isConnected, connect]);

  useEffect(() => {
    groupMessagesByDate(messages);
  }, [messages]);

  // To get the user is typing or not
  useEffect(() => {
    if (!socket) return;

    joinRoom(route?.params?.id);

    const handleTyping = (data: {isTyping: boolean}) => {
      setIsTyping(data?.isTyping);
      setFlatListData(prev => {
        // Remove existing typing indicator
        const filteredData = prev.filter(item => item.type !== 'typing');

        // If user is typing, add new typing indicator at the start
        return data?.isTyping
          ? [
              {
                type: 'typing',
                id: 'typing-indicator', // Use a fixed ID to prevent multiple duplicates
                isOwn: false,
                text: '',
                senderId: '',
                timestamp: new Date(),
                isRead: false,
                senderName: '',
              },
              ...filteredData,
            ]
          : filteredData; // Otherwise, just return filtered data
      });
    };
    const handleReceiveMessage = (message: IFlatListData) => {
      setMessages(prev => {
        return [
          {
            ...message,
            isOwn: userDetails?.id === message?.senderId,
          },
          ...prev,
        ];
      });

      setBtnLoading(false);
      setNewMessage('');
      setReplyTo(null);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: 0,
          animated: true,
        });
      }, 100);
    };
    const handleReceiveMessageStatus = (messageIDs: string[]) => {
      console.log(messageIDs, userDetails?.name);
      setMessages(prev => {
        return prev.map(item => {
          if (messageIDs?.includes(item?.id)) {
            return {...item, isRead: true};
          }
          return item;
        });
      });
    };

    const handleMessageDeleteStatus = (message: {
      messageId: string;
      success: boolean;
    }) => {
      if (message?.success) {
        setBtnLoading(false);
        setRbSheetOpen(false);
        setHighLightMessageIndex(null);
        deleteRBSheetRef.current?.close();
        setShowMenuOptions({visible: false, message: null});
        setMessages(prevMessages => {
          // Filter out the message with the given ID
          const filteredMessages = prevMessages.filter(
            msg => msg.id !== message?.messageId,
          );

          // Update replyTo in remaining messages
          return filteredMessages.map(msg => {
            if (msg.replyTo && msg.replyTo._id === message?.messageId) {
              return {...msg, replyTo: undefined};
            }
            return msg;
          });
        });
      }
    };

    socket.on('user:typing', handleTyping);
    socket?.on('message:receive', handleReceiveMessage); // Listen for incoming messages
    socket?.on('message:read-status', handleReceiveMessageStatus);
    socket?.on('message:deleteStatus', handleMessageDeleteStatus);
    return () => {
      socket.off('user:typing', handleTyping); // Cleanup the listener
      socket?.off('message:receive', handleReceiveMessage);
      socket?.off('message:read-status', handleReceiveMessageStatus);
      socket?.off('message:deleteStatus', handleMessageDeleteStatus);
      leaveRoom(route?.params?.id);
    };
  }, [socket, route?.params?.id]); // Ensure effect runs only when `socket` or `roomId` changes

  // UseRef to avoid unnecessary re-renders
  const onViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: {item: IFlatListData}[]}) => {
      const visibleIds = viewableItems?.map(({item}) => {
        if (!item?.isOwn && !item?.isRead && item?.type === 'message')
          return item?.id;
      });

      const ids = visibleIds.filter(visibleId => visibleId !== undefined);
      if (ids.length) {
        markAsRead(ids);
      }
    },
  ).current;

  const markAsRead = (visibleItems: string[]) => {
    socket?.emit('message:update-read-status', {
      request_id: route?.params?.id,
      messageIds: visibleItems,
      senderId: userDetails?.id,
    });
  };

  const handleTyping = () => {
    sendTypingStatus(true, route?.params?.id);

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      sendTypingStatus(false, route?.params?.id);
    }, 2000); // Hide typing status after 2 seconds of inactivity
  };

  const getChat = async () => {
    try {
      const res: any = await ContactService.getChatDetails({
        request_id: route.params.id,
      });
      if (res?.success) {
        const data = res.chats?.map((chat: Message) => ({
          ...chat,
          isOwn: chat.senderId === userDetails?.id,
        }));

        setMessages(data);
      }
    } catch (err: any) {
      setIsLoading(false);
      Toast({message: err?.message, type: 'error'});
    }
  };

  useEffect(() => {
    if (isFocused) {
      getChat();
    }
  }, [isFocused]);

  const groupMessagesByDate = useCallback(
    (data: Message[]) => {
      const groups: IFlatListData[] = [];

      // Sort messages by timestamp in descending order (newest first)
      const sortedData = [...data].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      sortedData.forEach((message, index) => {
        const messageDate = new Date(message.timestamp).toDateString();

        // Add the message first
        groups.push({
          type: 'message',
          ...message,
        } as IFlatListData);

        // If this is the last message of a date group, add the date divider
        const nextMessage = sortedData[index + 1];
        const nextMessageDate = nextMessage
          ? new Date(nextMessage.timestamp).toDateString()
          : null;

        if (messageDate !== nextMessageDate) {
          groups.push({
            type: 'date',
            id: messageDate,
            timestamp: message.timestamp,
          } as IFlatListData);
        }
      });

      setFlatListData(groups);
      setIsLoading(false);
    },
    [isTyping, messages],
  );

  const scrollToMessage = useCallback(
    (message: Message) => {
      const index = flatListData.findIndex(msg => msg.id === message._id);
      setHighLightMessageIndex(index);
      if (index !== -1) {
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }
    },
    [flatListData],
  );

  const handleDeleteMessage = () => {
    setBtnLoading(true);
    socket?.emit('message:delete', {
      request_id: route.params.id,
      messageId: showMenuOption?.message?.id,
      senderId: userDetails?.id,
    });
  };

  const renderMessage = ({item, index}: ListRenderItemInfo<IFlatListData>) => {
    if (item.type === 'date') {
      return <DateSeparator date={item.timestamp} />;
    }

    if (item?.type === 'typing') {
      return <TypingAnimation />;
    }
    return (
      <MessageBubble
        highLightMessageIndex={highLightMessageIndex!}
        message={item}
        isOwn={item.isOwn}
        onSwipeToReply={setReplyTo}
        onReplyPress={scrollToMessage}
        index={index}
        setShowMenu={setShowMenuOptions}
        isFocus={isFieldFocus}
        setHighLightMessageIndex={setHighLightMessageIndex}
      />
    );
  };

  const sendMessage = useCallback(() => {
    if (!newMessage.trim()) return;
    if (isConnected) {
      setBtnLoading(true);
      sendTypingStatus(false, route?.params?.id);
      socket?.emit('message:send', {
        message: newMessage.trim(),
        request_id: route.params.id,
        replyTo: replyTo || undefined,
        senderId: userDetails?.id,
      });
    } else {
      setisSocketReconnecting(true);
    }
  }, [newMessage]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <KeyboardAvoidingView
        style={styles.container}
        onStartShouldSetResponder={() => {
          setShowMenuOptions({visible: false, message: null});
          setHighLightMessageIndex(null);
          return false;
        }}>
        <CommonHeader
          leftIcon
          leftIconPressBack={() => navigation.goBack()}
          title="Chat"
          customRightHeaderComponent={
            showMenuOption?.visible ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 25,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    Vibration.vibrate(70);
                    Keyboard.isVisible;
                    isFieldFocus?.current?.focus();
                    setReplyTo(showMenuOption?.message);
                  }}>
                  <Icon
                    name="reply"
                    type="octicon"
                    color={appColors.dark}
                    size={25}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setNewMessage(showMenuOption?.message?.text!);
                    isFieldFocus.current?.focus();
                  }}>
                  <EditIcon width={20} height={20} />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setRbSheetOpen(true);
                    deleteRBSheetRef.current?.open();
                  }}>
                  <DeleteIcon height={25} width={25} color={appColors.dark} />
                </TouchableOpacity>
              </View>
            ) : undefined
          }
        />
        <StatusBar
          backgroundColor={
            isLoading || rbSheetOpen || isSocketReconnecting
              ? appColors.transparentBackground
              : appColors.light
          }
          barStyle={
            isLoading || rbSheetOpen || isSocketReconnecting
              ? 'light-content'
              : 'dark-content'
          }
        />
        <FlatList
          initialNumToRender={15}
          ref={flatListRef}
          onStartReached={() => {}}
          data={flatListData}
          renderItem={renderMessage}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.messagesList}
          inverted
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />

        <View style={styles.inputSection}>
          <ReplyPreview
            replyTo={replyTo}
            onCancel={() => {
              setReplyTo(null);
              Keyboard.dismiss();
            }}
            isOwn={replyTo?.isOwn!}
          />
          <View style={styles.inputContainer}>
            <TextInput
              ref={isFieldFocus}
              style={styles.input}
              value={newMessage}
              onChangeText={text => {
                setNewMessage(text);
                handleTyping();
              }}
              placeholder="Type a message..."
              multiline
            />
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.sendButton,
                !(btnLoading || newMessage.trim()?.length) && {
                  backgroundColor: appColors.placeholderColor,
                },
              ]}
              onPress={() => {
                sendMessage();
              }}
              disabled={btnLoading}>
              <Icon
                type="feather"
                name="send"
                color={appColors.light}
                size={18}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Modal visible={isLoading} animationType="fade" transparent>
          <CommonLoader />
        </Modal>
      </KeyboardAvoidingView>
      <CommonConfirmation
        titleText={'Remove this message?'}
        subText={'Are you sure do you wanna remove this transaction?'}
        handleCancelBtn={() => {
          deleteRBSheetRef.current?.close();
          setRbSheetOpen(false);
        }}
        handleOkBtn={() => handleDeleteMessage()}
        onClose={() => {
          setRbSheetOpen(false);
        }}
        ref={deleteRBSheetRef}
        height={200}
        closeOnPressBack={true}
        closeOnPressMask={true}
        draggable={true}
        customStyles={{
          container: {borderTopLeftRadius: 20, borderTopRightRadius: 20},
        }}
      />
      <Popover
        popoverStyle={{
          padding: 15,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          width: 150,
          height: 100,
        }}
        isVisible={isSocketReconnecting}>
        <View style={{gap: 10}}>
          <ActivityIndicator size={'small'} color={appColors.primary} />
          <CommonText content="Reconnecting..." />
        </View>
      </Popover>
    </GestureHandlerRootView>
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
    position: 'absolute',
    top: -12,
    width: 0,
    height: 0,
    borderLeftWidth: 25, // Base width
    borderTopWidth: 25, // Height of the triangle
    borderLeftColor: 'transparent',
  },
  ownTail: {
    right: -6,
    borderTopColor: '#DCF8C6',
    transform: [{rotate: '135deg'}],
  },
  otherTail: {
    left: -6,
    borderTopColor: '#f0f0ff',
    transform: [{rotate: '135deg'}],
  },

  timestampContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 5,
  },
  replyContainer: {
    marginBottom: 2,
    paddingVertical: 8,
    paddingHorizontal: 5,
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
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 15,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    borderTopLeftRadius: 0,
    paddingLeft: 15,
    paddingRight: 45,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: appColors.primary,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 8,
    position: 'absolute',
    right: 22,
    top: '50%',
    transform: [{translateY: -17}],
  },
  replyPreview: {
    backgroundColor: '#f0f0ff',
    padding: 5,
    paddingVertical: 5,
    minWidth: '45%',
    maxWidth: '80%',
    marginLeft: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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
    marginHorizontal: 16,
  },
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: 'gray',
    borderRadius: 4,
    marginHorizontal: 3,
  },
  timestamp: {
    fontSize: 11,
    color: '#7C7C7C',
    marginRight: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#000000',
  },
  replyText: {
    fontSize: 12,
    color: '#7C7C7C',
  },
});

export default ChatView;
