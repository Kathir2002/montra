import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { appColors } from '@shared/appColors';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import TickIcon from '@assets/svg/tick.svg';
import CommonText from '@shared/components/commonText/CommonText';
import CommonButton from '@shared/components/commonButton/CommonButton';
import CommonRBSheet, {
  RBSheetRef,
} from '@shared/components/commonRBSheet/CommonRBSheet';
import LottieView from 'lottie-react-native';
import AccountService from '@services/setup/accountService';
import { Toast } from '@shared/ToastConfig';
import Popover from 'react-native-popover-view/dist/Popover';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import { useDispatch, useSelector } from 'react-redux';
import {
  SecurityType,
  updateCurrentUser,
  updateIsModalOpen,
} from '@store/slice/appSlice';
import { RootState } from '@store/store';
import { useTranslation } from 'react-i18next';
import ReactNativeBiometrics from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OTPInput from '@components/auth/OTPInput';
import FlashMessage from 'react-native-flash-message';
import CommonConfirmation from '@shared/components/CommonConfirmation';
import { CustomModal } from '@shared/components/CustomModal';

const Security = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation('profile');
  const rbSheetRef = useRef<RBSheetRef>(null);
  const [pin, setPin] = useState(new Array(6).fill(null));

  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const [securityType, setSecurityType] = useState<SecurityType>(
    userDetails?.securityMethod!,
  );
  const [loading, setLoading] = useState(false);
  const [isSuccessPopoverVisible, setIsSuccessPopoverVisible] = useState(false);
  const securityData = [
    { label: t('PIN'), value: 'PIN' },
    { label: t('FINGERPRINT'), value: 'FINGERPRINT' },
  ];
  const [rbSheetOpen, setRbSheetOpen] = useState(false);
  const navigation: NavigationProp<ParamListBase> = useNavigation();

  const renderItem = ({
    item,
    index,
  }: {
    item: {
      label: string;
      value: string;
    };
    index: number;
  }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setSecurityType(item?.value as SecurityType);
          rbSheetRef.current?.open();
          dispatch(updateIsModalOpen(true));
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
            userDetails.securityMethod === item.value
              ? appColors.primary
              : appColors.dark
          }
          content={`${item.label}`}
        />
        {userDetails.securityMethod === item.value && (
          <TickIcon height={20} width={20} />
        )}
      </TouchableOpacity>
    );
  };

  const handleBiometricAuth = async () => {
    const rnBiometrics = new ReactNativeBiometrics({});
    rnBiometrics
      .isSensorAvailable()
      .then(async resultObject => {
        const { available } = resultObject;
        if (available) {
          try {
            const { success, error } = await rnBiometrics.simplePrompt({
              promptMessage: t('ACTIVATE_BIOMETRIC'),
            });

            if (success) {
              updateUserSecurityMethod();
            } else {
              Toast({
                message: t('BIOMETRIC_FAILED'),
                type: 'error',
              });
            }
          } catch (error) {
            console.error('[handleBiometricAuth] Error:', error);
          }
        } else {
          Toast({
            message: t('BIOMETRUC_NOT_SUPPORTED'),
            type: 'error',
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const updateUserSecurityMethod = async () => {
    setLoading(true);
    const data = {
      securityMethod: securityType,
    };
    await AccountService.changeAccountPreferences(data)
      .then(async (res: any) => {
        if (res?.success) {
          setLoading(false);
          rbSheetRef.current?.close();
          setRbSheetOpen(false);
          setIsSuccessPopoverVisible(true);
          Vibration.vibrate(50);
          dispatch(
            updateCurrentUser({ ...userDetails, securityMethod: securityType }),
          );
          setTimeout(() => {
            setIsSuccessPopoverVisible(false);
            navigation.goBack();
          }, 2000);
        }
      })
      .catch(err => {
        setLoading(false);
        Toast({ message: err?.response?.data?.message, type: 'error' });
      });
  };

  const updateSecurityPin = async () => {
    if (pin.length === 6 && !pin.includes(null)) {
      await AsyncStorage.setItem('securityPin', JSON.stringify(pin?.join('')))
        .then(() => {
          Toast({ message: t('PIN_CHANGED_SUCCESS'), type: 'success' });
          Vibration.vibrate(100);
          navigation.goBack();
        })
        .catch(err => {
          console.log('Error in updating user PIN', err);
        });
    } else {
      Toast({ message: t('ENTER_PIN'), type: 'error' });
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: appColors.light }}>
      <CommonHeader
        title={t('SECURITY')}
        leftIcon
        leftIconPressBack={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('BottomTab', { screen: 'Dashboard' });// fallback screen
          }
        }}
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
      <View>
        <FlatList
          scrollEnabled={false}
          initialNumToRender={25}
          contentContainerStyle={{ paddingHorizontal: 15 }}
          data={securityData}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.01}
          keyExtractor={(_, index) => index.toString()}
        />
      </View>
      <View style={{ paddingHorizontal: 15, marginTop: 150 }}>
        <CommonText
          content={t('CHANGE_PIN')}
          size={'large'}
          bold
          style={{ marginBottom: 5 }}
        />
        <OTPInput otp={pin} setOtp={setPin} isFromSettings={true} />
        <CommonButton
          title={t('UPDATE')}
          onPress={updateSecurityPin}
          buttonStyle={{ marginTop: 25 }}
        />
      </View>
      <CommonConfirmation
        titleText={t('CHANGE_SECURITY_METHOD')}
        subText={t('CHANGE_SECURITY_METHOD_DESCRIPION')}
        handleCancelBtn={() => {
          dispatch(updateIsModalOpen(false));
          rbSheetRef.current?.close();
          setRbSheetOpen(false);
        }}
        handleOkBtn={() => {
          securityType == 'FINGERPRINT'
            ? handleBiometricAuth()
            : updateUserSecurityMethod();
        }}
        onClose={() => {
          setRbSheetOpen(false);
          dispatch(updateIsModalOpen(false));
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
          container: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
        }}>
        <FlashMessage
          duration={2000}
          position={'bottom'}
          style={{
            marginBottom: Platform.OS == 'ios' ? 30 : 20,
            marginHorizontal: 20,
            borderRadius: 10,
            paddingVertical: Platform.OS == 'ios' ? -25 : null,
          }}
        />
      </CommonConfirmation>
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
          style={{ height: 80, width: 80 }}
        />
        <CommonText
          content={t('SECURITY_METHOD_UPDATED')}
          size={'label'}
          style={{ textAlign: 'center', paddingHorizontal: 20 }}
        />
      </Popover>
      <CustomModal visible={loading} transparent={true} animationType="fade">
        <CommonLoader />
      </CustomModal>
    </KeyboardAvoidingView>
  );
};

export default Security;

const styles = StyleSheet.create({});
