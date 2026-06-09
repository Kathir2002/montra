import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  Animated,
  PanResponder,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  View,
  StyleSheet,
  ViewStyle,
  ModalProps,
  KeyboardAvoidingViewProps,
  StyleProp,
} from 'react-native';
import { CustomModal } from '../CustomModal';

export interface RBSheetRef {
  open: () => void;
  close: () => void;
}

export interface RBSheetProps {
  testID?: string;
  height?: number;
  openDuration?: number;
  closeDuration?: number;
  closeOnPressMask?: boolean;
  closeOnPressBack?: boolean;
  draggable?: boolean;
  dragNotClose?: boolean;
  dragOnContent?: boolean;
  useNativeDriver?: boolean;
  customModalProps?: ModalProps;
  customAvoidingViewProps?: KeyboardAvoidingViewProps;
  onOpen?: () => void;
  onClose?: () => void;
  children?: React.ReactNode;
  customStyles?: {
    wrapper?: StyleProp<ViewStyle>;
    container?: StyleProp<ViewStyle>;
    draggableIcon?: StyleProp<ViewStyle>;
  };
}

// Creating the CommonRBSheet component
const CommonRBSheet = forwardRef<RBSheetRef, RBSheetProps>(
  (
    {
      testID,
      height = 260,
      openDuration = 300,
      closeDuration = 200,
      closeOnPressMask = true,
      closeOnPressBack = false,
      draggable = false,
      dragOnContent = false,
      dragNotClose = false,
      useNativeDriver = false,
      customStyles = {},
      customModalProps = {},
      customAvoidingViewProps = {},
      onOpen = null,
      onClose = null,
      children = <View />,
    },
    ref,
  ) => {
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const animatedHeight = useRef(new Animated.Value(0)).current;
    const pan = useRef(new Animated.ValueXY()).current;

    useImperativeHandle(ref, () => ({
      open: () => handleSetVisible(true),
      close: () => handleSetVisible(false),
    }));

    const createPanResponder = () => {
      return PanResponder.create({
        onStartShouldSetPanResponder: () => draggable,

        onMoveShouldSetPanResponder: (e, gestureState) =>
          draggable && dragOnContent && gestureState.dy > 0,

        onPanResponderMove: (e, gestureState) => {
          gestureState.dy > 0 &&
            Animated.event([null, { dy: pan.y }], { useNativeDriver })(
              e,
              gestureState,
            );
        },

        onPanResponderRelease: (e, gestureState) => {
          if (gestureState.dy > 100) {
            handleSetVisible(false);
          } else {
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver,
            }).start();
          }
        },
      });
    };

    const panResponder = useRef(createPanResponder()).current;

    const handleSetVisible = (visible: boolean) => {
      if (visible) {
        setModalVisible(visible);
        if (typeof onOpen === 'function') {
          onOpen();
        }
        Animated.timing(animatedHeight, {
          useNativeDriver,
          toValue: height,
          duration: openDuration,
        }).start();
      } else {
        Animated.timing(animatedHeight, {
          useNativeDriver,
          toValue: 0,
          duration: closeDuration,
        }).start(() => {
          setModalVisible(visible);
          pan.setValue({ x: 0, y: 0 });
          if (typeof onClose === 'function') {
            onClose();
          }
        });
      }
    };

    return (
      <CustomModal
        testID={testID}
        transparent
        visible={modalVisible}
        onRequestClose={
          closeOnPressBack ? () => handleSetVisible(false) : undefined
        }
        {...customModalProps}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.wrapper, customStyles.wrapper]}
          {...customAvoidingViewProps}>
          <TouchableOpacity
            style={styles.mask}
            activeOpacity={1}
            onPress={
              closeOnPressMask ? () => handleSetVisible(false) : undefined
            }
          />
          <Animated.View
            {...(dragOnContent && !dragNotClose && panResponder.panHandlers)}
            style={[
              styles.container,
              { height: animatedHeight },
              { transform: pan.getTranslateTransform() },
              customStyles.container,
            ]}>
            {draggable && (
              <View
                {...(!dragOnContent &&
                  !dragNotClose &&
                  panResponder.panHandlers)}
                style={styles.draggableContainer}>
                <View
                  style={[styles.draggableIcon, customStyles.draggableIcon]}
                />
              </View>
            )}
            {children}
          </Animated.View>
        </KeyboardAvoidingView>
      </CustomModal>
    );
  },
);

export default CommonRBSheet;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#00000077',
  },
  mask: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    backgroundColor: '#fff',
    width: '100%',
    height: 0,
    overflow: 'hidden',
  },
  draggableContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  draggableIcon: {
    width: 35,
    height: 5,
    borderRadius: 5,
    margin: 10,
    backgroundColor: '#ccc',
  },
});
