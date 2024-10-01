import React from 'react';
import {View} from 'react-native';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';

import {appColors} from '@shared/appColors';
import CommonFAB from '@shared/components/commonFAB/CommonFAB';
import DashboardIcon from '@assets/svg/navigationIcons/dashboard.svg';
import ProfileIcon from '@assets/svg/navigationIcons/profile.svg';
import BudgetIcon from '@assets/svg/navigationIcons/budget.svg';
import TransactionIcon from '@assets/svg/navigationIcons/transaction.svg';

interface Props {
  route: string;
  isFocused: boolean;
}

const BottomTabIcon = ({route, isFocused}: Props) => {
  const renderIcon = (route: string, isFocused: boolean) => {
    let height: number = 30;
    let width: number = 30;
    const navigation: NavigationProp<ParamListBase> = useNavigation();
    switch (route) {
      case 'Dashboard':
        return (
          <DashboardIcon
            width={width}
            height={height}
            style={{color: isFocused ? appColors.primary : appColors.light}}
          />
        );
      case 'Transaction':
        return (
          <TransactionIcon
            width={width}
            height={height}
            style={{color: isFocused ? appColors.primary : appColors.light}}
          />
        );
      case 'Budget':
        return (
          <BudgetIcon
            width={width}
            style={{color: isFocused ? appColors.primary : appColors.light}}
            height={height}
          />
        );
      case 'Profile':
        return (
          <ProfileIcon
            width={width}
            style={{color: isFocused ? appColors.primary : appColors.light}}
            height={height}
          />
        );
      case 'Add':
        return (
          <CommonFAB
            handleFirstButtonPress={() => {
              navigation.navigate('AddIncome');
            }}
            handleSecondButtonPress={() => {
              navigation.navigate('AddTransfer');
            }}
            handleThirdButtonPress={() => {
              navigation.navigate('AddExpense');
            }}
          />
        );

      default:
        break;
    }
  };

  return <View>{renderIcon(route, isFocused)}</View>;
};

export default BottomTabIcon;
