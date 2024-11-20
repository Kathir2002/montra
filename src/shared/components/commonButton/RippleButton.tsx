import {appColors} from '@shared/appColors';
import React, {ReactNode, useCallback} from 'react';
import {Pressable, StyleSheet, ViewStyle} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';

interface Props {
  onPress: () => void;
  style?: ViewStyle;
  children: ReactNode;
  rippleColor?: string;
  duration?: number;
}

const RippleButton = (props: Props) => {
  const {
    onPress,
    style,
    children,
    rippleColor = 'rgba(0, 0, 0, 0.1)',
    duration = 300,
  } = props;
  // Animation values for ripple effect
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const isAnimating = useSharedValue(false);

  const resetRipple = useCallback(() => {
    // Cancel any ongoing animations
    cancelAnimation(rippleScale);
    cancelAnimation(rippleOpacity);

    // Reset to initial state
    rippleScale.value = withTiming(0, {duration: 0});
    rippleOpacity.value = withTiming(0, {duration: 0});
    isAnimating.value = false;
  }, []);

  const startRipple = useCallback(() => {
    if (isAnimating.value) return;

    isAnimating.value = true;
    rippleScale.value = 0;
    rippleOpacity.value = 1;
    buttonScale.value = withSpring(0.98);

    // Start ripple animation
    rippleScale.value = withTiming(1, {
      duration: duration,
    });
  }, [duration]);

  const handlePressIn = () => {
    startRipple();
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);

    // Only fade out the ripple when releasing
    rippleOpacity.value = withTiming(
      0,
      {
        duration: duration / 2,
      },
      finished => {
        if (finished) {
          runOnJS(resetRipple)();
        }
      },
    );
  };

  // Ripple animation style
  const rippleStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: rippleColor,
      borderRadius: 8,
      transform: [{scale: rippleScale.value}],
      opacity: rippleOpacity.value,
    };
  });

  // Button scale animation style
  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: buttonScale.value}],
    };
  });

  return (
    <Animated.View style={[styles.buttonContainer, buttonStyle, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        // onLongPress={onLongPress}
        delayLongPress={500}
        style={styles.button}>
        <Animated.View style={rippleStyle} />
        {children}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    overflow: 'hidden',
    borderRadius: 8,
  },
  button: {
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});

export default RippleButton;
