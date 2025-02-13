import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {appColors} from '@shared/appColors';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import TickIcon from '@assets/svg/tick.svg';
import currencyValue from '@assets/data/currency.json';
import CommonText from '@shared/components/commonText/CommonText';
import CommonButton from '@shared/components/commonButton/CommonButton';
import CommonRBSheet, {
  RBSheetRef,
} from '@shared/components/commonRBSheet/CommonRBSheet';
import LottieView from 'lottie-react-native';
import AccountService from '@services/setup/accountService';
import {Toast} from '@shared/ToastConfig';
import Popover from 'react-native-popover-view/dist/Popover';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import {useDispatch, useSelector} from 'react-redux';
import {updateCurrentUser} from '@store/slice/appSlice';
import {RootState} from '@store/store';
import {useTranslation} from 'react-i18next';
import CommonConfirmation from '@shared/components/CommonConfirmation';

const Currency = () => {
  const {t} = useTranslation('profile');
  const rbSheetRef = useRef<RBSheetRef>(null);
  const [isLimit, setIsLimit] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);

  const [isSuccessPopoverVisible, setIsSuccessPopoverVisible] = useState(false);
  const [rbSheetOpen, setRbSheetOpen] = useState(false);
  const [currencyData, setCurrencyData] = useState<
    {code: string; name: string}[]
  >([]);
  const [currencySymbol, setCurrencySymbol] = useState<string>('');
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  useEffect(() => {
    if (isFocused) {
      const data = currencyValue.currency.slice(0, 25);
      setCurrencyData(data);
    }
  }, [isFocused]);
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const route: RouteProp<{
    params: {
      selectedCurrency: string;
    };
  }> = useRoute();

  const renderItem = ({
    item,
    index,
  }: {
    item: {
      name: string;
      code: string;
    };
    index: number;
  }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setCurrencySymbol(item.code);
          rbSheetRef.current?.open();
          setRbSheetOpen(true);
        }}
        style={{
          paddingVertical: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        activeOpacity={0.5}
        key={index}>
        <CommonText
          size={'label'}
          color={
            route?.params?.selectedCurrency === item.code
              ? appColors.primary
              : appColors.dark
          }
          content={`${item.name} (${item?.code})`}
        />
        {route?.params?.selectedCurrency === item.code && (
          <TickIcon height={20} width={20} />
        )}
      </TouchableOpacity>
    );
  };

  const handleChangeCurrency = async () => {
    setLoading(true);
    const data = {
      currency: currencySymbol,
    };

    await AccountService.changeAccountPreferences(data)
      .then((res: any) => {
        if (res?.success) {
          setLoading(false);
          rbSheetRef.current?.close();
          setRbSheetOpen(false);
          setIsSuccessPopoverVisible(true);
          Vibration.vibrate(50);
          dispatch(
            updateCurrentUser({...userDetails, currencySymbol: currencySymbol}),
          );
          setTimeout(() => {
            navigation.goBack();
            setIsSuccessPopoverVisible(false);
          }, 2000);
        }
      })
      .catch(err => {
        rbSheetRef.current?.close();
        setRbSheetOpen(false);
        setLoading(false);
        Toast({message: err?.response?.data?.message, type: 'error'});
      });
  };

  const RenderFooter = () => {
    return isLimit && currencyData?.length !== 0 ? (
      <View style={{alignItems: 'center', justifyContent: 'center'}}>
        <LottieView
          source={require('@assets/lottie/listLoader.json')}
          autoPlay
          loop
          style={{height: 50, width: 50}}
        />
      </View>
    ) : null;
  };

  return (
    <KeyboardAvoidingView style={{flex: 1, backgroundColor: appColors.light}}>
      <CommonHeader
        title={t('CURRENCY')}
        leftIcon
        leftIconPressBack={() => navigation.goBack()}
      />
      <StatusBar
        backgroundColor={
          isSuccessPopoverVisible || loading || rbSheetOpen
            ? appColors?.transparentBackground
            : appColors.light
        }
        barStyle={
          isSuccessPopoverVisible || loading || rbSheetOpen
            ? 'light-content'
            : 'dark-content'
        }
      />
      <FlatList
        initialNumToRender={25}
        onEndReached={() => {
          setIsLimit(true);
          setTimeout(() => {
            setCurrencyData(prev => {
              let temp = [...prev];
              return [
                ...temp,
                ...currencyValue.currency.slice(temp.length, temp.length + 10),
              ];
            });
            setIsLimit(false);
          }, 1000);
        }}
        contentContainerStyle={{paddingHorizontal: 15}}
        data={currencyData}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={RenderFooter}
        onEndReachedThreshold={0.01}
        keyExtractor={(_, index) => index.toString()}
      />
      <CommonConfirmation
        titleText={t('CHANGE_CURRENCY_CONFIRMATION')}
        subText={t('CHANGE_CURRENCY_DESCRIPTION')}
        handleCancelBtn={() => {
          rbSheetRef.current?.close();
          setRbSheetOpen(false);
        }}
        handleOkBtn={() => handleChangeCurrency()}
        onClose={() => {
          setRbSheetOpen(false);
        }}
        ref={rbSheetRef}
        height={200}
        onOpen={() => {
          setRbSheetOpen(true);
        }}
        closeOnPressBack={true}
        closeOnPressMask={true}
        draggable={true}
        customStyles={{
          container: {borderTopLeftRadius: 20, borderTopRightRadius: 20},
        }}
      />
      <Popover
        isVisible={isSuccessPopoverVisible}
        popoverStyle={{
          padding: 15,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
        }}>
        <LottieView
          source={require('@assets/lottie/sucess-lottie.json')}
          loop
          autoPlay
          style={{height: 80, width: 80}}
        />
        <CommonText
          content={t('CURRENCY_SYMBOL_UPDATED')}
          size={'label'}
          style={{textAlign: 'center', paddingHorizontal: 20}}
        />
      </Popover>
      <Modal visible={loading} transparent={true} animationType="fade">
        <CommonLoader />
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default Currency;

const styles = StyleSheet.create({});
