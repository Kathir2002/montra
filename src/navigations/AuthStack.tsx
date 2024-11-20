import {Alert, BackHandler, StyleSheet, View} from 'react-native';
import React, {Dispatch, SetStateAction, useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Signin from '@components/auth/Signin';
import Signup from '@components/auth/Signup';
import ForgotPassword from '@components/auth/ForgotPassword';
import GetStarted from '@components/auth/getStarted/GetStarted';
import EmailVerification from '@components/auth/EmailVerification';
import ResetPassword from '@components/auth/ResetPassword';
import PinGerneration from '@components/setUpScreen/PinGerneration';
import {appColors} from '@shared/appColors';
import SplashScreen from '@components/auth/SplashScreen';
import ReactNativeBiometrics from 'react-native-biometrics';
import {useDispatch} from 'react-redux';
import {updateIsLoggedin} from '@store/slice/appSlice';
import {forSlideFromLeftAnimation} from '@src/lib/functions';

const AuthStack = ({
  isGetStartedVisible,
  setIsGetStartedVisible,
  isNavigateToLogin,
}: {
  isGetStartedVisible: boolean | null;
  setIsGetStartedVisible: Dispatch<SetStateAction<boolean | null>>;
  isNavigateToLogin: boolean | null;
}) => {
  const AuthStack = createStackNavigator();
  const dispatch = useDispatch();
  const handleBiometricAuth = async () => {
    const rnBiometrics = new ReactNativeBiometrics({
      allowDeviceCredentials: true,
    });
    rnBiometrics
      .isSensorAvailable()
      .then(async resultObject => {
        const {available} = resultObject;
        if (available) {
          try {
            const {success, error} = await rnBiometrics.simplePrompt({
              promptMessage: 'Authenticate to continue',
            });

            if (success) {
              dispatch(updateIsLoggedin(true));
            } else {
              Alert.alert(
                'Authentication failed',
                'Biometric authentication failed',
                [
                  {text: 'Cancel', onPress: () => BackHandler.exitApp()},
                  {text: 'Unlock', onPress: () => handleBiometricAuth()},
                ],
              );
            }
          } catch (error) {
            console.error('[handleBiometricAuth] Error:', error);
          }
        } else {
          Alert.alert(
            'Biometrics not supported',
            'This device does not support biometric authentication.',
          );
        }
      })
      .catch(error => {
        console.error('Error:', error);
        Alert.alert(
          'Error',
          'An error occurred while checking biometrics availability.',
        );
      });
  };

  if (isGetStartedVisible) {
    return <GetStarted setIsGetStartedVisible={setIsGetStartedVisible} />;
  }

  return (
    <AuthStack.Navigator
      initialRouteName={
        isNavigateToLogin
          ? 'SignIn'
          : isNavigateToLogin === null
          ? 'PinGerneration'
          : 'EmptyScreen'
      }
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: forSlideFromLeftAnimation,
      }}>
      <AuthStack.Screen name="SignIn" component={Signin} />
      <AuthStack.Screen name="SignUp" component={Signup} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPassword} />
      <AuthStack.Screen
        name="EmailVerification"
        component={EmailVerification}
      />
      <AuthStack.Screen name="ResetPassword" component={ResetPassword} />
      <AuthStack.Screen name="PinGerneration" component={PinGerneration} />
      <AuthStack.Screen name="EmptyScreen" component={SplashScreen} />
    </AuthStack.Navigator>
  );
};

export default AuthStack;

const styles = StyleSheet.create({});
