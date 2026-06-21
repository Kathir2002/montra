import {
  KeyboardAvoidingView,
  Modal,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Vibration,
  View,
} from 'react-native';
import React, { useRef, useState } from 'react';
import { appColors } from '@shared/appColors';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import DeleteIcon from '@assets/svg/delete.svg';
import ShoppingIcon from '@assets/svg/expense/shopping.svg';
import FoodIcon from '@assets/svg/expense/food.svg';
import TransportationIcon from '@assets/svg/expense/transportation.svg';
import RentIcon from '@assets/svg/income/salary.svg';
import WarningIcon from '@assets/svg/warning.svg';

import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import Popover from 'react-native-popover-view';
import LottieView from 'lottie-react-native';
import CommonText from '@shared/components/commonText/CommonText';
import CommonButton from '@shared/components/commonButton/CommonButton';
import {
  RBSheetRef,
} from '@shared/components/commonRBSheet/CommonRBSheet';
import BudgetService from '@services/setup/budgetSerice';
import { Toast } from '@shared/ToastConfig';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import { getCurrencySymbol } from '@src/lib/functions';
import { useTranslation } from 'react-i18next';
import CommonConfirmation from '@shared/components/CommonConfirmation';
import { CustomModal } from '@shared/components/CustomModal';

const BudgetDetails = () => {
  const { t } = useTranslation('transaction');
  const { width, height } = useWindowDimensions()

  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const route: RouteProp<{
    params: {
      category: string;
      remaining: number;
      color: string;
      budget: number;
      spent: number;
      spentPercent: number;
      _id: string;
    };
  }> = useRoute();
  const [rbSheetOpen, setRbSheetOpen] = useState(false);
  const deleteRBSheetRef = useRef<RBSheetRef>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessPopoverVisible, setIsSuccessPopoverVisible] = useState(false);

  const getIcon = () => {
    switch (route?.params?.category) {
      case 'Shopping':
        return <ShoppingIcon width={25} height={25} />;
      case 'Rent':
        return <RentIcon width={25} height={25} />;
      case 'Food':
        return <FoodIcon width={25} height={25} />;
      case 'Transportation':
        return <TransportationIcon width={25} height={25} />;
      default:
        return <TransportationIcon width={25} height={25} />;
    }
  };
  const handleDeleteBudget = async () => {
    setIsLoading(true);
    await BudgetService.deleteBudget({
      budgetId: route?.params?._id,
    })
      .then((res: any) => {
        if (res?.success) {
          setIsLoading(false);
          deleteRBSheetRef.current?.close();
          setRbSheetOpen(false);

          setIsSuccessPopoverVisible(true);
          Vibration.vibrate(50);
          setTimeout(() => {
            navigation.navigate('Budget');
            setIsSuccessPopoverVisible(false);
          }, 1000);
        }
      })
      .catch(err => {
        deleteRBSheetRef.current?.close();
        setRbSheetOpen(false);
        setIsLoading(false);
        Toast({ message: err?.response?.data?.message, type: 'error' });
      });
  };
  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: appColors.light,
      }}>
      <CommonHeader
        leftIconPressBack={() => navigation.goBack()}
        title={t('BUDGET_DETAILS')}
        customRightHeaderComponent={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setRbSheetOpen(true);
              deleteRBSheetRef.current?.open();
            }}>
            <DeleteIcon height={25} width={25} color={appColors.dark} />
          </TouchableOpacity>
        }
      />
      <StatusBar
        barStyle={'dark-content'}
        backgroundColor={
          rbSheetOpen || isLoading || isSuccessPopoverVisible
            ? appColors.transparentBackground
            : appColors?.light
        }
      />
      <View style={{ flex: 1, paddingHorizontal: 15, gap: 10 }}>
        <View
          style={{
            alignSelf: 'center',
            borderColor: appColors.formBorderColor,
            borderWidth: 1,
            borderRadius: 15,
            gap: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 15,
            paddingVertical: 15,
          }}>
          <View
            style={{
              backgroundColor: '#FCEED4',
              padding: 5,
              borderRadius: 10,
            }}>
            {getIcon()}
          </View>
          <CommonText content={route?.params?.category} size={'large'} bold />
        </View>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 15,
          }}>
          <CommonText content={t('REMAINING')} bold size={'header'} />
          <CommonText
            content={
              Math.sign(route?.params?.remaining) == -1
                ? getCurrencySymbol(0)
                : getCurrencySymbol(route?.params?.remaining)
            }
            size={'appHeader'}
            bold
          />
        </View>
        <View
          style={{
            backgroundColor: appColors?.formBorderColor,
            height: 10,
            borderRadius: 5,
          }}>
          <View
            style={{
              backgroundColor: route?.params?.color,
              height: 10,
              borderRadius: 5,
              width: `${route?.params?.spentPercent}%`,
            }}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginVertical: 10,
          }}>
          <View style={{ gap: 3 }}>
            <CommonText
              color={appColors.placeholderColor}
              size={'large'}
              content={t('SPENT')}
            />
            <CommonText
              size={'label'}
              bold
              content={getCurrencySymbol(route?.params?.spent)}
            />
          </View>
          <View style={{ gap: 3 }}>
            <CommonText
              color={appColors.placeholderColor}
              size={'large'}
              content={t('BUDGET')}
            />
            <CommonText
              size={'label'}
              bold
              content={getCurrencySymbol(route?.params?.budget)}
            />
          </View>
        </View>
        <View
          style={{
            position: 'absolute',
            bottom: 30,
            left: 15,
            width: '100%',
          }}>
          <CommonButton
            title={t('EDIT')}
            onPress={() => navigation.navigate(`AddBudget`, route.params)}
          />
        </View>
        {Math.sign(route?.params?.remaining) === -1 && (
          <View
            style={{
              alignSelf: 'center',
              backgroundColor: appColors.error,
              paddingVertical: 8,
              borderRadius: 20,
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              alignItems: 'center',
              width: 250,
            }}>
            <WarningIcon height={25} width={25} color={appColors?.light} />
            <CommonText content={t('LIMIT_EXCEED')} color={appColors.light} />
          </View>
        )}
      </View>
      <CustomModal visible={isLoading} transparent animationType="fade">
        <CommonLoader />
      </CustomModal>
      <CommonConfirmation
        titleText={t('REMOVE_BUDGET')}
        subText={t('REMOVE_BUDGET_DESCRIPTION')}
        handleCancelBtn={() => {
          deleteRBSheetRef.current?.close();
          setRbSheetOpen(false);
        }}
        handleOkBtn={() => handleDeleteBudget()}
        onClose={() => {
          setRbSheetOpen(false);
        }}
        ref={deleteRBSheetRef}
        height={200}
        closeOnPressBack={true}
        closeOnPressMask={true}
        draggable={true}
        customStyles={{
          container: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
        }}
      />

      <Popover
        isVisible={isSuccessPopoverVisible}
        popoverStyle={{
          padding: 15,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          width: width > height ? width * 0.7 : width * 0.9,

        }}>
        <LottieView
          source={require('@assets/lottie/sucess-lottie.json')}
          loop
          autoPlay
          style={{ height: 80, width: 80 }}
        />
        <CommonText
          content={t("TRANSACTION_REMOVED_SUCCESS")}
          size={'label'}
          style={{ textAlign: 'center', paddingHorizontal: 20 }}
        />
      </Popover>
    </KeyboardAvoidingView>
  );
};

export default BudgetDetails;

const styles = StyleSheet.create({});
