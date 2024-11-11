import React, {useEffect, useRef, useState} from 'react';
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
import {appColors} from '@shared/appColors';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import TickIcon from '@assets/svg/tick.svg';
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
import {SecurityType, updateCurrentUser} from '@store/slice/appSlice';
import {RootState} from '@store/store';
import {useTranslation} from 'react-i18next';
import ReactNativeBiometrics from 'react-native-biometrics';

const Security = () => {
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const rbSheetRef = useRef<RBSheetRef>(null);
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const [securityType, setSecurityType] = useState<SecurityType>(
    userDetails?.securityMethod!,
  );
  const [loading, setLoading] = useState(false);
  const [isSuccessPopoverVisible, setIsSuccessPopoverVisible] = useState(false);
  const securityData = [
    {label: t('Pin'), value: 'PIN'},
    {label: t('FingerPrint'), value: 'FINGERPRINT'},
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
        const {available} = resultObject;
        if (available) {
          try {
            const {success, error} = await rnBiometrics.simplePrompt({
              promptMessage: 'Activate Biometric',
            });

            if (success) {
              updateUserSecurityMethod();
            } else {
              Toast({
                message:
                  'Authentication:Biometric operation canceled by the user',
                type: 'error',
              });
            }
          } catch (error) {
            console.error('[handleBiometricAuth] Error:', error);
          }
        } else {
          Toast({
            message: 'This device does not support biometric authentication.',
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
            updateCurrentUser({...userDetails, securityMethod: securityType}),
          );
          setTimeout(() => {
            setIsSuccessPopoverVisible(false);
            navigation.goBack();
          }, 2000);
        }
      })
      .catch(err => {
        setLoading(false);
        Toast({message: err?.response?.data?.message, type: 'error'});
      });
  };

  return (
    <KeyboardAvoidingView style={{flex: 1, backgroundColor: appColors.light}}>
      <CommonHeader
        title="Security"
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
        contentContainerStyle={{paddingHorizontal: 15}}
        data={securityData}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.01}
        keyExtractor={(_, index) => index.toString()}
      />
      <CommonRBSheet
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
        }}>
        <View style={{padding: 15, gap: 10}}>
          <CommonText
            content="Change security method?"
            bold
            size={'large'}
            style={{textAlign: 'center'}}
          />
          <CommonText
            content="Are you sure do you wanna change Security method?"
            color={appColors.placeholderColor}
            size={'label'}
            style={{textAlign: 'center', paddingHorizontal: 15}}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View style={{flex: 0.45}}>
              <CommonButton
                title="No"
                buttonType="clear"
                onPress={() => {
                  rbSheetRef.current?.close();
                  setRbSheetOpen(false);
                }}
              />
            </View>
            <View style={{flex: 0.45}}>
              <CommonButton
                title="Yes"
                onPress={() => {
                  securityType == 'FINGERPRINT'
                    ? handleBiometricAuth()
                    : updateUserSecurityMethod();
                }}
              />
            </View>
          </View>
        </View>
      </CommonRBSheet>
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
          content="User Security Method updated successfully"
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

export default Security;

const styles = StyleSheet.create({});
