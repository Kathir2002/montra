import { StyleSheet, View, useWindowDimensions } from 'react-native';
import React from 'react';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { OnboardingData } from '../data/data';
import CommonText from '@shared/components/commonText/CommonText';
import { appFonts } from '@shared/appFonts';

type Props = {
  index: number;
  x: SharedValue<number>;
  item: OnboardingData;
};

const RenderItem = ({ index, x, item }: Props) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.abs(x.value),
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [0.5, 1, 0.5],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      Math.abs(x.value),
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [100, 0, 100],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale }, { translateY }],
    };
  });

  return (
    <>
      <Animated.View
        style={[styles.itemContainer, { width: SCREEN_WIDTH }, animatedStyle]}>
        <View
          style={[
            styles.animationContainer,
            {
              backgroundColor: item.animationBg,
            },
          ]}>
          <item.imageSrc height={250} width={250} />
        </View>
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <CommonText
            content={item.mainText}
            style={[styles.mainText, { color: item.textColor }]}
          />
          <CommonText
            content={item.subText}
            style={[styles.subText, { color: item.textColor }]}
          />
        </View>
      </Animated.View>
    </>
  );
};

export default RenderItem;

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 150,
  },
  mainText: {
    textAlign: 'center',
    fontSize: 20,
    marginTop: 40,
    marginBottom: 10,
    marginHorizontal: 20,
    fontFamily: appFonts.bold,
  },
  subText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 0,
    fontFamily: appFonts.medium,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  animationContainer: {
    borderRadius: 40,
    overflow: 'hidden',
  },
});
