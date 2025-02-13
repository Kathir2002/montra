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
    <CommonText
      style={styles.dateText}
      bold
      color={'#8E8E93'}
      content={getDateLabel(date)}
    />
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
  // FlatList viewability config
  const viewabilityConfig = useRef({itemVisiblePercentThreshold: 50}).current;

  // UseRef to avoid unnecessary re-renders
  const onViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: {item: Message}[]}) => {
      const visibleIds = viewableItems.map(item => item.item.id);
      markAsRead(visibleIds);
    },
  ).current;

  const markAsRead = (visibleItems: string[]) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        visibleItems.includes(msg.id) ? {...msg, isRead: true} : msg,
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
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
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
    // width: 12,
    // height: 12,
    position: 'absolute',
    top: -12,
    // zIndex: 1,
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
    padding: 15,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
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
    marginHorizontal: 16,
  },
});

export default ChatView;
