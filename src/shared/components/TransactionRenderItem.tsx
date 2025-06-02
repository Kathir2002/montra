import React, {Dispatch, SetStateAction} from 'react';
import moment from 'moment';
import {TouchableOpacity, View} from 'react-native';

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
import {useTranslation} from 'react-i18next';

const TransactionRenderItem = ({
  item,
  navigation,
  setChartDropdownOpen,
}: {
  item: TransactionListInterface;
  navigation: any;
  setChartDropdownOpen?: Dispatch<SetStateAction<boolean>>;
}) => {
  const {t} = useTranslation('transaction');
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
          return <ShoppingIcon width={30} height={30} />;
      }
    } else if (item?.transactionType === 'Income') {
      switch (item?.transactionFor) {
        case 'Salary':
          return <SalaryIcon width={30} height={30} />;
        default:
          return <SalaryIcon width={30} height={30} />;
      }
    } else {
      return <TransferIcon width={30} height={30} />;
    }
  };

  const getPaymentIcon = (forTransfer: boolean = false) => {
    return forTransfer
      ? paymentData[item?.from?.paymentMode as keyof PaymentDataInterface]?.map(
          res => {
            if (res?.nameCode === item?.from?.wallet?.walletName) {
              return <res.image width={25} height={25} key={res.nameCode} />;
            }
            return null;
          },
        ) || null
      : paymentData[item?.paymentMode as keyof PaymentDataInterface]?.map(
          res => {
            if (res.nameCode === item.wallet?.walletName) {
              return <res.image width={25} height={25} key={res.nameCode} />;
            }
            return null;
          },
        ) || null;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => {
        if (setChartDropdownOpen) {
          setChartDropdownOpen(false);
        }
        navigation.navigate(`${item.transactionType}Details`, {id: item?._id});
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        borderWidth: 1,
        borderColor: appColors.formBorderColor,
        borderRadius: 5,
        gap: 10,
        padding: 5,
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
        <View style={{gap: 3, flex: 0.5}}>
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
        <View
          style={{
            gap: 3,
            flex: 0.5,
            flexWrap: 'wrap',
          }}>
          <CommonText
            content={`${
              item?.transactionType == 'Expense'
                ? '-'
                : item?.transactionType == 'Income'
                ? '+'
                : '-'
            } ${getCurrencySymbol(item?.amount)}`}
            color={appColors.dark}
            size={'label'}
            style={{textAlign: 'right'}}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              justifyContent: 'flex-end',
            }}>
            <CommonText
              size={'error'}
              content={item?.transactionType == 'Income' ? t('IN') : t('FROM')}
              color={appColors.placeholderColor}
            />
            {getPaymentIcon(
              item?.transactionType !== 'Transfer' ? false : true,
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TransactionRenderItem;
