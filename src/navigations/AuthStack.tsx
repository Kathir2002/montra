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
import SplashScreen from '@components/auth/SplashScreen';

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
      screenOptions={{headerShown: false, animationEnabled: false}}>
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
