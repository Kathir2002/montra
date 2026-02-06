import React from 'react';
import LottieView from 'lottie-react-native';
import LoaderLottie from '@assets/lottie/loader.json';
import { View } from 'react-native';
import { appColors } from '@shared/appColors';
const CommonLoader = () => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: appColors.transparentBackground,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000, // <—— smaller than banner

      }}>
      <LottieView
        source={LoaderLottie}
        autoPlay={true}
        loop={true}
        style={{
          width: 200,
          height: 200,
        }}
      />
    </View>
  );
};

export default CommonLoader;
