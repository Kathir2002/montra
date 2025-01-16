import {
  I18nManager,
  StyleProp,
  StyleSheet,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';
import React, {useEffect, FC} from 'react';
import Animated, {
  interpolateColor,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import {appColors} from '@shared/appColors';

export interface SwitchProps {
  inActiveColor: string;
  activeColor: string;
  onValueChange?: ((value: boolean) => Promise<void> | void) | null | undefined;
  value: boolean;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

const CommonSwitch: FC<SwitchProps> = ({
  activeColor,
  inActiveColor,
  onValueChange,
  value = false,
  style,
  disabled,
}) => {
  // value for Switch Animation
  const switchTranslate = useSharedValue(0);
  // Progress Value
  const progress = useDerivedValue(() => {
    return withTiming(value ? 22 : 0);
  });

  // useEffect for change the switchTranslate Value
  useEffect(() => {
    if (value) {
      switchTranslate.value = 25;
    } else {
      switchTranslate.value = 1;
    }
  }, [value, switchTranslate]);

  // Circle Animation
  const customSpringStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(
            I18nManager.isRTL ? -switchTranslate.value : switchTranslate.value,
            {
              mass: 1,
              damping: 15,
              stiffness: 120,
              overshootClamping: false,
              restSpeedThreshold: 0.001,
              restDisplacementThreshold: 0.001,
            },
          ),
        },
      ],
    };
  });

  // Background Color Animation
  const backgroundColorStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 22],
      [inActiveColor, activeColor],
    );
    return {
      backgroundColor,
    };
  });

  return (
    <TouchableWithoutFeedback
      disabled={disabled}
      onPress={() => {
        if (onValueChange) onValueChange(!value);
      }}>
      <Animated.View style={[styles.container, style, backgroundColorStyle]}>
        <Animated.View style={[styles.circle, customSpringStyles]} />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default CommonSwitch;

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 28,
    borderRadius: 30,
    justifyContent: 'center',
    backgroundColor: '#F2F5F7',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 30,
    backgroundColor: appColors.light,
    shadowColor: appColors.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 4,
  },
});
