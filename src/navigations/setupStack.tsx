import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Setup from '@components/setUpScreen/Setup';
import AddNewAccount from '@components/setUpScreen/AddNewAccount';
import PinGerneration from '@components/setUpScreen/PinGerneration';

const SetUpStack = () => {
  const SetUpStack = createStackNavigator();

  return (
    <SetUpStack.Navigator
      initialRouteName="PinGerneration"
      screenOptions={{headerShown: false, animationEnabled: false}}>
      <SetUpStack.Screen name="PinGerneration" component={PinGerneration} />
      <SetUpStack.Screen name="Setup" component={Setup} />
      <SetUpStack.Screen name="AddNewAccount" component={AddNewAccount} />
    </SetUpStack.Navigator>
  );
};

export default SetUpStack;

const styles = StyleSheet.create({});
