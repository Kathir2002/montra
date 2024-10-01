import {StyleSheet, View, TextInput} from 'react-native';
import React, {FC, useEffect} from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {appColors} from '@shared/appColors';
import {appFonts} from '@shared/appFonts';

export type RangeSliderOnChangeValue = ({
  min,
  max,
}: {
  min: number;
  max: number;
}) => void;

export type NormalSliderOnChangeValue = (value: number) => void;

export interface ZenSliderInterface {
  sliderWidth: number;
  min: number;
  max: number;
  step: number;
  thumpColor?: string;
  sliderColor?: string;
  disabled?: boolean;
  defaultStartValue: number;
  defaultEndValue?: never;
  onValueChange: NormalSliderOnChangeValue;
}

const ZenRangeSlider: FC<ZenSliderInterface> = ({
  sliderWidth,
  min,
  max,
  step,
  onValueChange,
  thumpColor = appColors.primary,
  sliderColor = appColors.dashedBorderColor,
  defaultStartValue = min,
  defaultEndValue = max,
  disabled = false,
}) => {
  const position = useSharedValue(
    defaultStartValue
      ? (defaultStartValue - min) / ((max - min) / sliderWidth)
      : 0,
  );
  const position2 = useSharedValue(sliderWidth);
  const opacity = useSharedValue(0);
  const opacity2 = useSharedValue(0);
  const zIndex = useSharedValue(0);
  const zIndex2 = useSharedValue(0);
  const context = useSharedValue(0);
  const context2 = useSharedValue(0);

  useEffect(() => {
    const startPos = (defaultStartValue - min) / ((max - min) / sliderWidth);
    position.value = startPos;

    position2.value = sliderWidth;
  }, [defaultStartValue, defaultEndValue, min, max, sliderWidth]);

  // Using new Gesture API
  const pan = Gesture.Pan()
    .onBegin(() => {
      context.value = position.value;
    })
    .onUpdate(e => {
      opacity.value = 1;
      if (context.value + e.translationX < 0) {
        position.value = 0;
      } else if (context.value + e.translationX > position2.value) {
        position.value = position2.value;
        zIndex.value = 1;
        zIndex2.value = 0;
      } else {
        position.value = context.value + e.translationX;
      }
    })
    .onEnd(() => {
      opacity.value = 0;
      runOnJS(onValueChange as any)(
        min +
          Math.floor(position.value / (sliderWidth / ((max - min) / step))) *
            step,
      );
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: position.value}],
    zIndex: zIndex.value,
  }));

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{translateX: position.value}],
    width: position2.value - position.value,
  }));

  // Add this line for Reanimated from v3.5.0
  Animated.addWhitelistedNativeProps({text: true});

  // A fallback no-op gesture to provide when the slider is disabled
  const noopGesture = Gesture.Tap().enabled(false);

  const minLabelText = useAnimatedProps(() => {
    return {
      text: `${
        min +
        Math.floor(position.value / (sliderWidth / ((max - min) / step))) * step
      }%`,
    };
  });

  const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

  return (
    <GestureHandlerRootView style={{marginVertical: 15}}>
      <View style={[styles.sliderContainer, {width: sliderWidth}]}>
        <View
          style={[
            styles.sliderBack,
            {
              width: sliderWidth,
              backgroundColor: thumpColor,
            },
          ]}
        />
        <Animated.View
          style={[
            sliderStyle,
            styles.sliderFront,
            {backgroundColor: sliderColor},
          ]}
        />
        <GestureDetector gesture={disabled ? noopGesture : pan}>
          <Animated.View
            hitSlop={styles.hitSlopStyle}
            style={[
              animatedStyle,
              styles.thumb,
              {borderColor: thumpColor},
              disabled && styles.disabledThumb,
            ]}>
            <AnimatedTextInput
              style={styles.labelText}
              animatedProps={minLabelText as any}
              editable={false}
              defaultValue={`${
                min +
                Math.floor(
                  position.value / (sliderWidth / ((max - min) / step)),
                ) *
                  step
              }%`}
            />
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
};

export default ZenRangeSlider;

const styles = StyleSheet.create({
  sliderContainer: {
    justifyContent: 'center',
    alignSelf: 'center',
  },
  sliderBack: {
    height: 10,
    borderRadius: 20,
  },
  sliderFront: {
    height: 10,
    borderRadius: 20,
    position: 'absolute',
  },
  thumb: {
    left: -20,
    // width: 45,
    // height: 25,
    elevation: 3,
    position: 'absolute',
    backgroundColor: appColors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledThumb: {
    opacity: 0.7,
  },
  labelText: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    color: appColors.light,
    fontFamily: appFonts.bold,
    fontSize: 14,
    width: '100%',
  },
  hitSlopStyle: {
    left: 40,
    right: 40,
    top: 40,
    bottom: 40,
  },
});
