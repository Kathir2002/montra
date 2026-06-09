import { Pressable, StyleSheet } from 'react-native';
import React, { Dispatch, SetStateAction } from 'react';
import Animated, {
  Extrapolation,
  SharedValue,
  clamp,
  interpolate,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { OnboardingData } from '../data/data';
import Arrow from '@assets/svg/Arrow.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef } from '../../../../../../index';

type Props = {
  x: SharedValue<number>;
  screenWidth: number;
  data: OnboardingData[];
  currentIndex: number;
  setIsGetStartedVisible: Dispatch<SetStateAction<boolean | null>>;
};

const RADIUS = 100;

const Button = ({
  x,
  screenWidth,
  data,
  currentIndex,
  setIsGetStartedVisible,
}: Props) => {
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  const animatedOpacityButton = useAnimatedStyle(() => {
    const opacity = interpolate(
      Math.abs(x.value % screenWidth),
      [0, 40],
      [1, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
    };
  });

  return (
    <AnimatedPressable
      style={[styles.button, animatedOpacityButton]}
      onPress={async () => {
        if (Math.abs(x.value) % screenWidth === 0) {
          const clampValue = clamp(
            Math.abs(x.value) + screenWidth,
            0,
            2 * screenWidth,
          );
          x.value = withTiming(-clampValue, { duration: 1000 });
        }
        if (currentIndex === 2) {
          if (navigationRef?.current) {
            await AsyncStorage.setItem(
              'getStartedVisible',
              JSON.stringify(false),
            );
            await AsyncStorage.setItem(
              'isPushNotification',
              JSON.stringify(false),
            );
            setIsGetStartedVisible(false);
            // navigationRef?.current?.navigate('SignIn');
          }
        }
      }}>
      <Arrow
        stroke={data[currentIndex]?.backgroundColor}
        width={40}
        height={40}
      />
    </AnimatedPressable>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    zIndex: 9999999,
    position: 'absolute',
    width: RADIUS,
    height: RADIUS,
    borderRadius: RADIUS,
    bottom: 100,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
