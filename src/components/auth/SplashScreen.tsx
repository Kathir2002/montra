import {StatusBar, StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import {appColors} from '@shared/appColors';
import CommonText from '@shared/components/commonText/CommonText';
import LottieView from 'lottie-react-native';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';

const SplashScreen = () => {
  // const navigation: NavigationProp<ParamListBase> = useNavigation();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: appColors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <StatusBar
        backgroundColor={appColors.primary}
        barStyle={'light-content'}
      />
      <LottieView
        style={{height: 250, width: 250}}
        source={require('@assets/lottie/splashLottie.json')}
        autoPlay
        loop
      />
      <CommonText
        style={{marginTop: -30}}
        size={'appHeader'}
        content="Montra"
        color={appColors?.light}
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({});
