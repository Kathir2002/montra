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
import {useSocket} from '@src/hooks/useSocket';
import {getDateLabel} from '@src/lib/functions';
import {RootState} from '@store/store';
import React, {
  useState,
  useRef,
  useCallback,
  FC,
  useEffect,
  ReactNode,
} from 'react';
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
import ReAnimated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import {useSelector} from 'react-redux';

export interface Message {
  id: string;
  text: string;
  isOwn: boolean;
  timestamp: Date;
  replyTo?: Message;
  senderId: string;
  senderName: string;
  _id?: string;
  Component?: Element;

  status?: 'sent' | 'delivered' | 'read';
}

interface IFlatListData extends Message {
  type: 'date' | 'message';
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
                  message?.status === 'read' ? appColors.transferBg : '#7C7C7C'
                }
                size={15}
              />
            ) : undefined}
          </View>
        </View>
      </Animated.View>
    </ReAnimated.View>
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
  console.log('INSIDE');

  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const animateDot = (dot: any, delay: number) => {
      dot.value = withRepeat(
        withSequence(
          withTiming(1, {duration: 300, easing: Easing.ease}),
          withTiming(0.3, {duration: 300, easing: Easing.ease}),
        ),
        -1,
        false,
      );
    };

    animateDot(dot1, 0);
    setTimeout(() => animateDot(dot2, 150), 150);
    setTimeout(() => animateDot(dot3, 300), 300);
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({opacity: dot1.value}));
  const animatedStyle2 = useAnimatedStyle(() => ({opacity: dot2.value}));
  const animatedStyle3 = useAnimatedStyle(() => ({opacity: dot3.value}));

  return (
    <View style={styles.dotContainer}>
      <ReAnimated.View style={[styles.dot, animatedStyle1]} />
      <ReAnimated.View style={[styles.dot, animatedStyle2]} />
      <ReAnimated.View style={[styles.dot, animatedStyle3]} />
    </View>
  );
};

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
  const [flatListData, setFlatListData] = useState<IFlatListData[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [highLightMessageIndex, setHighLightMessageIndex] = useState<
    number | null
  >(null);
  const route = useRoute<RouteProp<{params: {id: string}}, 'params'>>();
  // FlatList viewability config
  const viewabilityConfig = useRef({itemVisiblePercentThreshold: 50}).current;
  const {sendTypingStatus, socket} = useSocket();

  useEffect(() => {
    if (highLightMessageIndex) {
      setTimeout(() => {
        setHighLightMessageIndex(null);
      }, 1000);
    }
  }, [highLightMessageIndex]);

  // To get the user is typing or not
  useEffect(() => {
    socket?.emit('room:join', {roomId: route?.params?.id});
    socket?.on('user:typing', data => {
      setIsTyping(data?.isTyping);
      return () => socket?.emit('room:leave', {roomId: route?.params?.id});
    });
  }, [socket]);

  // UseRef to avoid unnecessary re-renders
  const onViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: {item: Message}[]}) => {
      const visibleIds = viewableItems.map(item => item.item.id);
      markAsRead(visibleIds);
    },
  ).current;

  const markAsRead = (visibleItems: string[]) => {
    setFlatListData(prevMessages =>
      prevMessages.map(msg =>
        visibleItems.includes(msg.id) ? {...msg, status: 'read'} : msg,
      ),
    );
  };

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
        data?.length > 0 ? groupMessagesByDate(data) : setIsLoading(false);
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
    [isTyping],
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
        sendTypingStatus(true, route?.params?.id);
        flatListRef.current?.scrollToIndex({index: 0, animated: true});
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        sendTypingStatus(false, route?.params?.id);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
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
        data?.length > 0 ? groupMessagesByDate(data) : setIsLoading(false);
        setNewMessage('');
        setReplyTo(null);

        setTimeout(() => {
          flatListRef.current?.scrollToIndex({index: 0, animated: true});
        }, 100);
      }
    } catch (err: any) {
      Toast({message: err?.response?.data?.message, type: 'error'});
    } finally {
      setBtnLoading(false);
    }
  };

  const renderMessage = ({item, index}: ListRenderItemInfo<IFlatListData>) => {
    // console.log(isTyping && flatListData?.length - 1 === index);
    if (isTyping && flatListData?.length - 1 === index) {
      return <TypingAnimation />;
    }
    if (item.type === 'date') {
      return <DateSeparator date={item.timestamp} />;
    }

    return (
      <MessageBubble
        highLightMessageIndex={highLightMessageIndex!}
        message={item}
        isOwn={item.isOwn}
        onSwipeToReply={setReplyTo}
        onReplyPress={scrollToMessage}
        index={index}
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
          onCancel={() => setReplyTo(null)}
          isOwn={replyTo?.isOwn!}
        />
        <View style={styles.inputContainer}>
          <TextInput
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
            onPress={sendMessage}
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
