import React, { useRef, useState } from 'react';
import {
  FlatList,
  I18nManager,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { appColors } from '@shared/appColors';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import CommonText from '@shared/components/commonText/CommonText';
import { RBSheetRef } from '@shared/components/commonRBSheet/CommonRBSheet';
import LottieView from 'lottie-react-native';
import { Toast } from '@shared/ToastConfig';
import Popover from 'react-native-popover-view/dist/Popover';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import { useDispatch, useSelector } from 'react-redux';
import { updateCurrentUser } from '@store/slice/appSlice';
import { RootState } from '@store/store';
import languageValue from '@assets/data/language.json';
import { useTranslation } from 'react-i18next';
// import { RNRestart } from '@src/lib/restart';
import CommonConfirmation from '@shared/components/CommonConfirmation';
import { appFonts } from '@shared/appFonts';

import RNRestart from "../../../specs/NativeRestart"
import { CustomModal } from '@shared/components/CustomModal';

interface CurrencyData {
  label: string;
  value: string;
  code: string;
}

const Language = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation('profile');
  const rbSheetRef = useRef<RBSheetRef>(null);
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const [loading, setLoading] = useState(false);
  const [isSuccessPopoverVisible, setIsSuccessPopoverVisible] = useState(false);

  const [rbSheetOpen, setRbSheetOpen] = useState(false);

  const [currentLanguage, setCurrentLanguage] = useState<string>('');

  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const route: RouteProp<{
    params: {
      selectedLanguage: string;
    };
  }> = useRoute();

  const renderItem = ({ item, index }: { item: CurrencyData; index: number }) => {
    const isSlected = route?.params?.selectedLanguage === item.code;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          setCurrentLanguage(item.code);
          rbSheetRef.current?.open();
          setRbSheetOpen(true);
        }}
        style={{
          borderColor: isSlected
            ? appColors.transferBg
            : appColors.formBorderColor,
          borderWidth: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 15,
          paddingHorizontal: 25,
          borderRadius: 8,
          backgroundColor: isSlected ? appColors.buttonClear : appColors.light,
          gap: 15,
          flex: 1,
          elevation: 2,
        }}>
        <View>
          <CommonText
            content={item.label}
            size={'header'}
            style={{ fontFamily: isSlected ? appFonts.bold : appFonts.medium }}
            color={isSlected ? appColors.transferBg : appColors.dark}
          />
          {!isSlected && (
            <CommonText content={item?.value} color={appColors.borderColor} />
          )}
        </View>
        <View
          style={{
            height: 15,
            width: 15,
            borderRadius: 10,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {isSlected && (
            <View
              style={{
                height: 8,
                width: 8,
                borderRadius: 5,
                backgroundColor: appColors.transferBg,
              }}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const handleChangeLanguage = async () => {
    const isReloadAppNecessary = i18n.language === 'ar';
    await i18n
      .changeLanguage(currentLanguage)
      .then(async () => {
        I18nManager.forceRTL(i18n.language === 'ar');
        rbSheetRef.current?.close();
        setRbSheetOpen(false);
        setIsSuccessPopoverVisible(true);
        Vibration.vibrate(50);
        dispatch(
          updateCurrentUser({ ...userDetails, currentLanguage: currentLanguage }),
        );
        setTimeout(() => {
          setIsSuccessPopoverVisible(false);
          if (i18n.language === 'ar') {
            Platform.OS === 'android'
              ? RNRestart.restart('user_triggered')
              : navigation.goBack();
          } else {
            if (isReloadAppNecessary) {
              Platform.OS === 'android' && RNRestart.restart('user_triggered');
            }
            navigation.goBack();
          }
        }, 2000);
      })
      .catch(err => {
        Toast({ message: t('ERROR_IN_UPDATE_LANGUAGE'), type: 'error' });
        console.log('Error in updating language', err);
      });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: appColors.light }}>
      <CommonHeader
        title={t('LANGUAGE')}
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
        contentContainerStyle={{
          paddingHorizontal: 15,
          gap: 15,
          paddingBottom: 25,
        }}
        columnWrapperStyle={{ gap: 15 }}
        data={languageValue}
        renderItem={renderItem}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.01}
        keyExtractor={(_, index) => index.toString()}
      />
      <CommonConfirmation
        titleText={t('CHANGE_LANGUAGE_CONFIRMATION')}
        subText={t('CHANGE_LANGUAGE_DESCRIPTION')}
        handleCancelBtn={() => {
          rbSheetRef.current?.close();
          setRbSheetOpen(false);
        }}
        handleOkBtn={() => handleChangeLanguage()}
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
        }}>
        <LottieView
          source={require('@assets/lottie/sucess-lottie.json')}
          loop
          autoPlay
          style={{ height: 80, width: 80 }}
        />
        <CommonText
          content={t('LANGUAGE_UPDATED')}
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

export default Language;
