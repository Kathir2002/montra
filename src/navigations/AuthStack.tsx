import {StyleSheet, View} from 'react-native';
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Signin from '@components/auth/Signin';
import Signup from '@components/auth/Signup';
import ForgotPassword from '@components/auth/ForgotPassword';
import GetStarted from '@components/auth/getStarted/GetStarted';
import EmailVerification from '@components/auth/EmailVerification';
import ResetPassword from '@components/auth/ResetPassword';

const AuthStack = ({isGetStartedVisible, setIsGetStartedVisible}: any) => {
  const AuthStack = createStackNavigator();

  if (isGetStartedVisible) {
    return <GetStarted setIsGetStartedVisible={setIsGetStartedVisible} />;
  }
  return (
    <AuthStack.Navigator
      initialRouteName="SignIn"
      screenOptions={{headerShown: false, animationEnabled: false}}>
      <AuthStack.Screen name="SignIn" component={Signin} />
      <AuthStack.Screen name="SignUp" component={Signup} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPassword} />
      <AuthStack.Screen
        name="EmailVerification"
        component={EmailVerification}
      />
      <AuthStack.Screen name="ResetPassword" component={ResetPassword} />
    </AuthStack.Navigator>
  );
};

export default AuthStack;

const styles = StyleSheet.create({});
