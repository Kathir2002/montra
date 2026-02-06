import React, { useEffect, useRef } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
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
import { Alert, EventSubscription, NativeEventEmitter, NativeModules, Platform, View } from 'react-native';
import { forSlideFromLeftAnimation } from '@src/lib/functions';
import EditProfile from '@components/profile/EditProfile';
import ChangePassword from '@components/profile/ChangePassword';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import HelpRequest_Details from '@components/profile/HelpRequest_Details';
import HelpRequest_List from '@components/profile/HelpRequest_List';
import ChatView from '@components/profile/ChatView';
import { addOnShortcutUsedListener, getInitialShortcutId } from '@src/lib/shortcutHandler';

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

  const listenerSubscription = useRef<null | EventSubscription>(null);

  useEffect(() => {
    const callback = (id: string) => {
      if (id) {
        handleNavigation(id);
      }
    };

    listenerSubscription.current = addOnShortcutUsedListener(callback);
    getInitialShortcutId().then(callback);

    return () => {
      listenerSubscription.current?.remove();
      listenerSubscription.current = null;
    }
  }, [])

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
    <View style={{ flex: 1, }}>
      <AppStack.Navigator
        initialRouteName="BottomTab" screenOptions={{ headerShown: false, cardStyleInterpolator: forSlideFromLeftAnimation, }}>
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
        <AppStack.Screen name="HelpRequest_List" component={HelpRequest_List} />
        <AppStack.Screen name="HelpRequest_Details" component={HelpRequest_Details} />
        <AppStack.Screen name="ChatView" component={ChatView} />
      </AppStack.Navigator>
    </View>
  );
};

export default AppStack;
