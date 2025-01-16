import React from 'react';
import {View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  withTiming,
  useDerivedValue,
  interpolateColor,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface CheckboxProps {
  width: number;
  height: number;
  checked: boolean;
  checkMarkColor: string;
  checkedBorderColor: string;
  unCheckedBorderColor: string;
  checkedBackgroundColor: string;
  unCheckedBackgroundColor: string;
}

const AnimatedCheckbox: React.FC<CheckboxProps> = ({
  width,
  height,
  checked,
  checkMarkColor,
  checkedBorderColor,
  unCheckedBorderColor,
  checkedBackgroundColor,
  unCheckedBackgroundColor,
}) => {
  const progress = useDerivedValue(() => {
    return withTiming(checked ? 1 : 0, {
      duration: 200,
    });
  });

  const roundedRectPath = `
    M 4 2
    h 16
    a 2 2 0 0 1 2 2
    v 16
    a 2 2 0 0 1 -2 2
    h -16
    a 2 2 0 0 1 -2 -2
    v -16
    a 2 2 0 0 1 2 -2
    z
  `;

  const boxAnimatedProps = useAnimatedProps(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [unCheckedBackgroundColor, checkedBackgroundColor],
    );
    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      [unCheckedBorderColor, checkedBorderColor],
    );

    return {
      fill: backgroundColor,
      stroke: borderColor,
    };
  });

  const checkMarkAnimatedProps = useAnimatedProps(() => {
    return {
      opacity: progress.value,
      strokeDashoffset: 24 - progress.value * 24,
    };
  });

  return (
    <View
      style={{
        backgroundColor: 'transparent',
      }}>
      <Svg width={width} height={height} viewBox="0 0 24 24">
        <AnimatedPath
          animatedProps={boxAnimatedProps}
          d={roundedRectPath}
          strokeWidth={1.5}
        />
        <AnimatedPath
          animatedProps={checkMarkAnimatedProps}
          d="M 7 12 l 3.5 3.5 l 6.5 -6.5"
          fill="none"
          stroke={checkMarkColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={24}
        />
      </Svg>
    </View>
  );
};

export default React.memo(AnimatedCheckbox);
