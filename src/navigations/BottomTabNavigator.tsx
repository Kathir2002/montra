import React from 'react';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import Dashboard from '@screens/Dashboard';
import Transaction from '@screens/Transactions';
import Budget from '@screens/Budget';
import Profile from '@screens/Profile';
import CustomBottomTab from '@shared/navigation/CustomBottomTab';

export type BottomTabParamList = {
  Dashboard: undefined;
  Transaction: undefined;
  Budget: undefined;
  Profile: undefined;
  Add: undefined;
};

const CustomBottomTabs = (props: BottomTabBarProps) => {
  return <CustomBottomTab {...props} />;
};

const FABComponent = () => undefined;

const BottomTabNavigator = () => {
  const Tab = createBottomTabNavigator<BottomTabParamList>();

  return (
    <Tab.Navigator
      tabBar={CustomBottomTabs}
      screenOptions={{headerShown: false, tabBarHideOnKeyboard: true}}>
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Transaction" component={Transaction} />
      <Tab.Screen name="Add" component={FABComponent} />
      <Tab.Screen name="Budget" component={Budget} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
