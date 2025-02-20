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
  Animated,
  PanResponder,
  Keyboard,
  ListRenderItemInfo,
  StatusBar,
  Modal,
  Vibration,
  TouchableWithoutFeedback,
} from 'react-native';
import ReAnimated, {FadeIn, FadeOut} from 'react-native-reanimated';
import {useSelector} from 'react-redux';
import {RBSheetRef} from '@shared/components/commonRBSheet/CommonRBSheet';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {Pressable} from 'react-native';
import CommonConfirmation from '@shared/components/CommonConfirmation';

export interface Message {
  id: string;
  text: string;
  isOwn: boolean;
  timestamp: Date;
  replyTo?: Message;
  senderId: string;
  senderName: string;
  _id?: string;
  status?: 'sent' | 'read';
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

const MessageBubble: FC<MessageBubbleProps> = ({
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
        Keyboard.isVisible;
        isFocus?.current?.focus();
        onSwipeToReply(message);
      }
      Animated.spring(pan, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    },
  });

  return (
    <Pressable
      onPress={() => {
        setShowMenu({visible: false, message: null});
        setHighLightMessageIndex(null);
      }}
      style={{width: '100%'}}
      onLongPress={() => {
        setShowMenu({visible: true, message: message});
        setHighLightMessageIndex(index);
        Vibration.vibrate(70);
      }}>
      <ReAnimated.View
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
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.bubbleContainer,
            isOwn ? styles.ownMessageContainer : styles.otherMessageContainer,
            {transform: [{translateX: pan}], zIndex: -10},
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
                onPress={() => onReplyPress(message?.replyTo!)}>
                <View
                  style={[
                    styles.replyBar,
                    {backgroundColor: isOwn ? 'blue' : 'green'},
                  ]}
                />
                <View style={styles.replyContent}>
                  <CommonText
                    color={isOwn ? 'blue' : 'green'}
                    size="error"
                    numberOfLines={1}
                    ellipsizeMode="clip"
                    content={isOwn ? 'You' : message.replyTo.senderName}
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
              content={message?.text}
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
              {isOwn ? (
                <Icon
                  name={
                    message?.status === 'sent'
                      ? 'checkmark-outline'
                      : 'checkmark-done-outline'
                  }
                  type="ionicon"
                  color={
                    message?.status === 'read'
                      ? appColors.transferBg
                      : '#7C7C7C'
                  }
                  size={15}
                />
              ) : undefined}
            </View>
          </View>
        </Animated.View>
      </ReAnimated.View>
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
  const route = useRoute<RouteProp<{params: {id: string}}, 'params'>>();
  // FlatList viewability config
  const viewabilityConfig = useRef({itemVisiblePercentThreshold: 50}).current;
  const {sendTypingStatus, socket, joinRoom, leaveRoom} = useSocket();

  useEffect(() => {
    if (highLightMessageIndex && !showMenuOption?.message?.id) {
      setTimeout(() => {
        setHighLightMessageIndex(null);
      }, 1000);
    }
  }, [highLightMessageIndex]);

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
                status: 'sent',
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

      // groupMessagesByDate(data);
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
    const handleReceiveMessageStatus = (message: IFlatListData) => {
      // console.log(message, userDetails?.name);

      setFlatListData(prev => [
        {
          ...message,

          type: 'message',
        },
        ...prev,
      ]);
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
        setMessages(prev =>
          prev.filter(item => item.id !== message?.messageId),
        );
        // setFlatListData(prev => {
        //   let skipNext = false;
        //   return prev.filter((item, index, array) => {
        //     if (skipNext) {
        //       skipNext = false;
        //       return false; // Skip the next item if flagged
        //     }
        //     if (item.id === message.messageId) {
        //       if (array[index + 1]?.type === 'date') {
        //         skipNext = true; // Mark the next item to be skipped
        //       }
        //       return false; // Remove current item
        //     }
        //     return true; // Keep other items
        //   });
        // });
      }
    };

    socket.on('user:typing', handleTyping);
    socket?.on('message:receive', handleReceiveMessage); // Listen for incoming messages
    // socket?.on('message:status', handleReceiveMessageStatus);
    socket?.on('message:deleteStatus', handleMessageDeleteStatus);
    return () => {
      socket.off('user:typing', handleTyping); // Cleanup the listener
      socket?.off('message:receive', handleReceiveMessage);
      // socket?.off('message:status', handleReceiveMessageStatus);
      socket?.off('message:deleteStatus', handleMessageDeleteStatus);
      leaveRoom(route?.params?.id);
    };
  }, [socket, route?.params?.id]); // Ensure effect runs only when `socket` or `roomId` changes

  // UseRef to avoid unnecessary re-renders
  const onViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: {item: IFlatListData}[]}) => {
      const visibleIds = viewableItems?.map(item => {
        if (
          !item?.item?.isOwn &&
          item?.item?.status !== 'read' &&
          item?.item?.type === 'message'
        )
          return item?.item?.id;
      });
      const ids = visibleIds.filter(visibleId => visibleId !== undefined);
      markAsRead(ids);
    },
  ).current;

  const markAsRead = (visibleItems: string[]) => {
    socket?.emit('message:status', {
      request_id: route?.params?.id,
      messageIds: visibleItems,
      senderId: userDetails?.id,
    });
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

  const onScrollToIndexFailed = useCallback(
    (info: {
      index: number;
      highestMeasuredFrameIndex: number;
      averageItemLength: number;
    }) => {
      setTimeout(() => {
        // flatListRef.current?.scrollToIndex({
        //   index: info.index,
        //   animated: true,
        //   viewPosition: 0.5,
        // });
      }, 500);
    },
    [],
  );

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        sendTypingStatus(true, route?.params?.id);
        flatListData.length > 0
          ? flatListRef.current?.scrollToIndex({index: 0, animated: true})
          : undefined;
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        isFieldFocus.current?.blur();
        sendTypingStatus(false, route?.params?.id);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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
    setBtnLoading(true);
    sendTypingStatus(false, route?.params?.id);
    socket?.emit('message:send', {
      message: newMessage.trim(),
      request_id: route.params.id,
      replyTo: replyTo || undefined,
      senderId: userDetails?.id,
    });
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
                    Vibration.vibrate(50);
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
            isLoading || rbSheetOpen
              ? appColors.transparentBackground
              : appColors.light
          }
          barStyle={isLoading || rbSheetOpen ? 'light-content' : 'dark-content'}
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
          onScrollToIndexFailed={onScrollToIndexFailed}
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
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              multiline
            />
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.sendButton,
                !(btnLoading || newMessage?.length) && {
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
    top: 4,
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
});

export default ChatView;
