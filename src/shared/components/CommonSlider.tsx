// import {StyleSheet, View, TextInput} from 'react-native';
// import React, {FC, useEffect} from 'react';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   useAnimatedProps,
//   runOnJS,
// } from 'react-native-reanimated';
// import {
//   Gesture,
//   GestureDetector,
//   GestureHandlerRootView,
// } from 'react-native-gesture-handler';
// import {appColors} from '@shared/appColors';
// import {appFonts} from '@shared/appFonts';

// export type RangeSliderOnChangeValue = ({
//   min,
//   max,
// }: {
//   min: number;
//   max: number;
// }) => void;

// export type NormalSliderOnChangeValue = (value: number) => void;

// export interface SliderInterface {
//   sliderWidth: number;
//   min: number;
//   max: number;
//   step: number;
//   thumpColor?: string;
//   sliderColor?: string;
//   disabled?: boolean;
//   defaultStartValue: number;
//   defaultEndValue?: never;
//   onValueChange: NormalSliderOnChangeValue;
// }

// const RangeSlider: FC<SliderInterface> = ({
//   sliderWidth,
//   min,
//   max,
//   step,
//   onValueChange,
//   thumpColor = appColors.primary,
//   sliderColor = appColors.dashedBorderColor,
//   defaultStartValue = min,
//   defaultEndValue = max,
//   disabled = false,
// }) => {
//   const position = useSharedValue(
//     defaultStartValue
//       ? (defaultStartValue - min) / ((max - min) / sliderWidth)
//       : 0,
//   );
//   const position2 = useSharedValue(sliderWidth);
//   const opacity = useSharedValue(0);
//   const opacity2 = useSharedValue(0);
//   const zIndex = useSharedValue(0);
//   const zIndex2 = useSharedValue(0);
//   const context = useSharedValue(0);
//   const context2 = useSharedValue(0);

//   useEffect(() => {
//     const startPos = (defaultStartValue - min) / ((max - min) / sliderWidth);
//     position.value = startPos;

//     position2.value = sliderWidth;
//   }, [defaultStartValue, defaultEndValue, min, max, sliderWidth]);

//   // Using new Gesture API
//   const pan = Gesture.Pan()
//     .onBegin(() => {
//       context.value = position.value;
//     })
//     .onUpdate(e => {
//       opacity.value = 1;
//       if (context.value + e.translationX < 0) {
//         position.value = 0;
//       } else if (context.value + e.translationX > position2.value) {
//         position.value = position2.value;
//         zIndex.value = 1;
//         zIndex2.value = 0;
//       } else {
//         position.value = context.value + e.translationX;
//       }
//     })
//     .onEnd(() => {
//       opacity.value = 0;
//       runOnJS(onValueChange as any)(
//         min +
//           Math.floor(position.value / (sliderWidth / ((max - min) / step))) *
//             step,
//       );
//     });

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{translateX: position.value}],
//     zIndex: zIndex.value,
//   }));

//   const sliderStyle = useAnimatedStyle(() => ({
//     transform: [{translateX: position.value}],
//     width: position2.value - position.value,
//   }));

//   // Add this line for Reanimated from v3.5.0
//   Animated.addWhitelistedNativeProps({text: true});

//   // A fallback no-op gesture to provide when the slider is disabled
//   const noopGesture = Gesture.Tap().enabled(false);

//   const minLabelText = useAnimatedProps(() => {
//     return {
//       text: `${
//         min +
//         Math.floor(position.value / (sliderWidth / ((max - min) / step))) * step
//       }%`,
//     };
//   });

//   const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

//   return (
//     <GestureHandlerRootView style={{marginVertical: 15}}>
//       <View style={[styles.sliderContainer, {width: sliderWidth}]}>
//         <View
//           style={[
//             styles.sliderBack,
//             {
//               width: sliderWidth,
//               backgroundColor: thumpColor,
//             },
//           ]}
//         />
//         <Animated.View
//           style={[
//             sliderStyle,
//             styles.sliderFront,
//             {backgroundColor: sliderColor},
//           ]}
//         />
//         <GestureDetector gesture={disabled ? noopGesture : pan}>
//           <Animated.View
//             hitSlop={styles.hitSlopStyle}
//             style={[
//               animatedStyle,
//               styles.thumb,
//               {borderColor: thumpColor},
//               disabled && styles.disabledThumb,
//             ]}>
//             <AnimatedTextInput
//               style={styles.labelText}
//               animatedProps={minLabelText as any}
//               editable={false}
//               defaultValue={`${
//                 min +
//                 Math.floor(
//                   position.value / (sliderWidth / ((max - min) / step)),
//                 ) *
//                   step
//               }%`}
//             />
//           </Animated.View>
//         </GestureDetector>
//       </View>
//     </GestureHandlerRootView>
//   );
// };

// export default RangeSlider;

// const styles = StyleSheet.create({
//   sliderContainer: {
//     justifyContent: 'center',
//     alignSelf: 'center',
//   },
//   sliderBack: {
//     height: 10,
//     borderRadius: 20,
//   },
//   sliderFront: {
//     height: 10,
//     borderRadius: 20,
//     position: 'absolute',
//   },
//   thumb: {
//     left: -20,
//     // width: 45,
//     // height: 25,
//     elevation: 3,
//     position: 'absolute',
//     backgroundColor: appColors.primary,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   disabledThumb: {
//     opacity: 0.7,
//   },
//   labelText: {
//     paddingHorizontal: 5,
//     paddingVertical: 3,
//     color: appColors.light,
//     fontFamily: appFonts.bold,
//     fontSize: 14,
//     width: '100%',
//   },
//   hitSlopStyle: {
//     left: 40,
//     right: 40,
//     top: 40,
//     bottom: 40,
//   },
// });

import React, { FC } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, PanGestureHandler } from 'react-native-gesture-handler';
import { appColors } from '@shared/appColors';
import { appFonts } from '@shared/appFonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export type NormalSliderOnChangeValue = (value: number) => void;

export interface SliderInterface {
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
const AnimatedSlider: FC<SliderInterface> = ({
  sliderWidth = SCREEN_WIDTH - 80,
  min = 0,
  max = 100,
  step = 10,
  onValueChange,
  thumpColor = appColors.primary,
  sliderColor = appColors.dashedBorderColor,
  defaultStartValue = min,
  disabled = false,
}) => {
  const KNOB_WIDTH = 45;
  const MAX_TRANSLATION = sliderWidth - KNOB_WIDTH;

  const initialPosition =
    ((defaultStartValue - min) / (max - min)) * MAX_TRANSLATION;
  const translateX = useSharedValue(initialPosition);

  const snapToStep = (position: number) => {
    'worklet';
    const percentage = position / MAX_TRANSLATION;
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.min(Math.max(steppedValue, min), max);
  };

  const valueToPosition = (value: number) => {
    'worklet';
    return ((value - min) / (max - min)) * MAX_TRANSLATION;
  };

  // Derive the display text value
  const displayValue = useDerivedValue(() => {
    const value = snapToStep(translateX.value);
    return `${Math.round(value)}%`;
  });

  useAnimatedReaction(
    () => snapToStep(translateX.value),
    (value, prevValue) => {
      if (value !== prevValue && onValueChange) {
        runOnJS(onValueChange)(value);
      }
    },
    [min, max, step],
  );
  const startX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .onBegin(() => {
      if (disabled) return;
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      if (disabled) return;

      let newValue = startX.value + event.translationX;
      newValue = Math.min(Math.max(newValue, 0), MAX_TRANSLATION);

      translateX.value = newValue;
    })
    .onEnd(() => {
      if (disabled) return;

      const snappedValue = snapToStep(translateX.value);
      translateX.value = withSpring(valueToPosition(snappedValue), {
        damping: 15,
        stiffness: 150,
      });
    });


  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: disabled ? 0.5 : 1,
  }));

  const activeTrackStyle = useAnimatedStyle(() => ({
    width: translateX.value + KNOB_WIDTH / 2,
    opacity: disabled ? 0.5 : 1,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: disabled ? 0.5 : 1,
  }));

  const AnimatedTextContent = useDerivedValue(() => {
    return `${snapToStep(translateX.value)}%`;
  });

  return (
    <View style={[styles.container, { width: sliderWidth }]}>
      <View style={[styles.track, { backgroundColor: sliderColor }]}>
        <Animated.View
          style={[
            styles.activeTrack,
            { backgroundColor: thumpColor },
            activeTrackStyle,
          ]}
        />
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.knob,
            {
              // width: KNOB_WIDTH,
              // height: KNOB_HEIGHT,
              backgroundColor: thumpColor,
            },
            knobStyle,
          ]}>
          <Animated.Text style={[styles.valueText, animatedTextStyle]}>
            {displayValue?.value}
          </Animated.Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 10,
    borderRadius: 20,
  },
  activeTrack: {
    height: 10,
    borderRadius: 20,
  },
  knob: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    paddingVertical: 2,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  valueText: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    color: appColors.light,
    fontFamily: appFonts.bold,
    fontSize: 12,
    width: '100%',
  },
});

export default AnimatedSlider;
