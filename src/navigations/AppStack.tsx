import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  createStackNavigator,
  StackCardInterpolatedStyle,
  StackCardInterpolationProps,
} from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';
import CommonAddScreen from '@components/transactions/CommonAddScreen';
import AddNewAccount from '@components/setUpScreen/AddNewAccount';
import FinanceReport from '@components/financeReport/FinanceReport';
import CommonDetailsScreen from '@components/transactions/CommonDetailsScreen';
import BudgetDetails from '@components/budget/BudgetDetails';
import Account from '@components/setUpScreen/Account';
import Settings from '@components/profile/Settings';
import Language from '@components/profile/Language';
import Notification from '@components/profile/Notification';
import About from '@components/profile/About';
import Help from '@components/profile/Help';
import Currency from '@components/profile/Currency';
import ExportData from '@components/profile/ExportData';
import Security from '@components/profile/Security';
import {NativeEventEmitter, NativeModules, Platform, View} from 'react-native';
import {forSlideFromLeftAnimation} from '@src/lib/functions';
import EditProfile from '@components/profile/EditProfile';
import ChangePassword from '@components/profile/ChangePassword';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';

const AppStack = () => {
  const AppStack = createStackNavigator();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const AddIncome = () => {
    return <CommonAddScreen screenName="Income" />;
  };
  const AddExpense = () => {
    return <CommonAddScreen screenName="Expense" />;
  };
  const AddTransfer = () => {
    return <CommonAddScreen screenName="Transfer" />;
  };
  const AddBudget = () => {
    return <CommonAddScreen screenName="Budget" />;
  };
  const IncomeDetails = () => {
    return <CommonDetailsScreen screenName="Income" />;
  };
  const ExpenseDetails = () => {
    return <CommonDetailsScreen screenName="Expense" />;
  };
  const TransferDetails = () => {
    return <CommonDetailsScreen screenName="Transfer" />;
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      NativeModules.InitialRoute.getInitialRoute()
        .then((route: string | null) => {
          if (route) {
            handleNavigation(route);
          }
        })
        .catch((err: any) => {
          console.log('Error in handling shortcut navigation', err);
        });

      // Listen for shortcut events (app is running)
      const eventEmitter = new NativeEventEmitter(NativeModules.ShortcutModule);
      const subscription = eventEmitter.addListener('handleShortcut', event => {
        if (event.route) {
          handleNavigation(event.route);
        }
      });

      return () => {
        subscription.remove();
      };
    }
  }, []);

  const handleNavigation = (route: string) => {
    switch (route) {
      case 'expense':
        navigation.navigate('AddExpense');
        break;
      case 'income':
        navigation.navigate('AddIncome');
        break;
    }
  };

  return (
    <View style={{flex: 1}}>
      <AppStack.Navigator
        initialRouteName="BottomTab"
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: forSlideFromLeftAnimation,
        }}>
        <AppStack.Screen name="BottomTab" component={BottomTabNavigator} />
        <AppStack.Screen name="AddExpense" component={AddExpense} />
        <AppStack.Screen name="AddIncome" component={AddIncome} />
        <AppStack.Screen name="AddTransfer" component={AddTransfer} />
        <AppStack.Screen name="AddBudget" component={AddBudget} />
        <AppStack.Screen name="AddNewBankAccount" component={AddNewAccount} />
        <AppStack.Screen name="FinanceReport" component={FinanceReport} />
        <AppStack.Screen name="IncomeDetails" component={IncomeDetails} />
        <AppStack.Screen name="ExpenseDetails" component={ExpenseDetails} />
        <AppStack.Screen name="TransferDetails" component={TransferDetails} />
        <AppStack.Screen name="BudgetDetails" component={BudgetDetails} />
        <AppStack.Screen name="Account" component={Account} />
        <AppStack.Screen name="Settings" component={Settings} />
        <AppStack.Screen name="Language" component={Language} />
        <AppStack.Screen name="Notification" component={Notification} />
        <AppStack.Screen name="About" component={About} />
        <AppStack.Screen name="Help" component={Help} />
        <AppStack.Screen name="Currency" component={Currency} />
        <AppStack.Screen name="ExportData" component={ExportData} />
        <AppStack.Screen name="Security" component={Security} />
        <AppStack.Screen name="EditProfile" component={EditProfile} />
        <AppStack.Screen name="ChangePassword" component={ChangePassword} />
      </AppStack.Navigator>
    </View>
  );
};

export default AppStack;
