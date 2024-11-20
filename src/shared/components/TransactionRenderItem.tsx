import React, {Dispatch, SetStateAction} from 'react';
import moment from 'moment';
import {
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';

import {appColors} from '@shared/appColors';
import CommonText from './commonText/CommonText';
import {TransactionListInterface} from '@screens/Dashboard';
import ShoppingIcon from '@assets/svg/expense/shopping.svg';
import FoodIcon from '@assets/svg/expense/food.svg';
import TransportationIcon from '@assets/svg/expense/transportation.svg';
import SalaryIcon from '@assets/svg/income/salary.svg';
import RentIcon from '@assets/svg/income/salary.svg';
import TransferIcon from '@assets/svg/transfer.svg';
import {paymentData, PaymentDataInterface} from '@assets/svg';
import {getCurrencySymbol} from '@src/lib/functions';
import RippleButton from './commonButton/RippleButton';

const TransactionRenderItem = ({
  item,
  navigation,
  setChartDropdownOpen,
}: {
  item: TransactionListInterface;
  navigation: any;
  setChartDropdownOpen?: Dispatch<SetStateAction<boolean>>;
}) => {
  // const navigation: NavigationProp<ParamListBase> = useNavigation();

  const getIcon = () => {
    if (item?.transactionType === 'Expense') {
      switch (item?.transactionFor) {
        case 'Shopping':
          return <ShoppingIcon width={30} height={30} />;
        case 'Rent':
          return <RentIcon width={30} height={30} />;
        case 'Food':
          return <FoodIcon width={30} height={30} />;
        case 'Transportation':
          return <TransportationIcon width={30} height={30} />;
        default:
          return <TransportationIcon width={30} height={30} />;
      }
    } else if (item?.transactionType === 'Income') {
      switch (item?.transactionFor) {
        case 'Salary':
          return <SalaryIcon width={30} height={30} />;
        default:
          return <TransportationIcon width={30} height={30} />;
      }
    } else {
      return <TransferIcon width={30} height={30} />;
    }
  };

  const getPaymentIcon = (forTransfer: boolean = false) => {
    return forTransfer
      ? paymentData[item?.from?.paymentMode as keyof PaymentDataInterface]?.map(
          res => {
            if (res?.nameCode === item?.from?.wallet) {
              return <res.image width={25} height={25} key={res.nameCode} />;
            }
            return null;
          },
        ) || null
      : paymentData[item?.paymentMode as keyof PaymentDataInterface]?.map(
          res => {
            if (res.nameCode === item.wallet) {
              return <res.image width={25} height={25} key={res.nameCode} />;
            }
            return null;
          },
        ) || null;
  };

  return (
    <RippleButton
      onPress={() => {
        if (setChartDropdownOpen) {
          setChartDropdownOpen(false);
        }
        navigation.navigate(`${item.transactionType}Details`, item);
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}>
        <View
          style={{
            flex: 0.1,
            backgroundColor: '#FCEED4',
            padding: 10,
            borderRadius: 20,
          }}>
          {getIcon()}
        </View>
        <View
          style={{
            flex: 0.9,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View style={{gap: 3, flex: 0.75}}>
            <CommonText
              content={
                item?.transactionFor
                  ? item?.transactionFor
                  : item?.transactionType
              }
              color={appColors.dark}
              size={'label'}
            />
            <CommonText
              content={moment(item?.transactionDate).format('DD MMM, hh:mm A')}
              color={appColors.placeholderColor}
              size={'error'}
            />
          </View>
          <View style={{gap: 3, flex: 0.25}}>
            <CommonText
              content={`${
                item?.transactionType == 'Expense'
                  ? '-'
                  : item?.transactionType == 'Income'
                  ? '+'
                  : '-'
              } ${getCurrencySymbol(item?.amount, false)}`}
              color={appColors.dark}
              size={'label'}
            />
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
              <CommonText
                size={'error'}
                content={item?.transactionType == 'Income' ? 'In' : 'From'}
                color={appColors.placeholderColor}
              />
              {getPaymentIcon(
                item?.transactionType !== 'Transfer' ? false : true,
              )}
            </View>
          </View>
        </View>
      </View>
    </RippleButton>
  );
};

export default TransactionRenderItem;
