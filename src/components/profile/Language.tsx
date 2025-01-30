import React, {useRef, useState} from 'react';
import {
  FlatList,
  I18nManager,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
  RouteProp,
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
import {Toast} from '@shared/ToastConfig';
import Popover from 'react-native-popover-view/dist/Popover';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import {useDispatch, useSelector} from 'react-redux';
import {updateCurrentUser} from '@store/slice/appSlice';
import {RootState} from '@store/store';
import languageValue from '@assets/data/language.json';
import {useTranslation} from 'react-i18next';
import {RNRestart} from '@src/lib/restart';

const Language = () => {
  const dispatch = useDispatch();
  const {t, i18n} = useTranslation('profile');
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

  const renderItem = ({
    item,
    index,
  }: {
    item: {
      label: string;
      value: string;
      code: string;
    };
    index: number;
  }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setCurrentLanguage(item.code);
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
            route?.params?.selectedLanguage === item.code
              ? appColors.primary
              : appColors.dark
          }
          content={`${item.label} (${item?.code})`}
        />
        {route?.params?.selectedLanguage === item.code && (
          <TickIcon height={20} width={20} />
        )}
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
          updateCurrentUser({...userDetails, currentLanguage: currentLanguage}),
        );
        setTimeout(() => {
          setIsSuccessPopoverVisible(false);
          if (i18n.language === 'ar') {
            Platform.OS === 'android'
              ? RNRestart.restart('')
              : navigation.goBack();
          } else {
            if (isReloadAppNecessary) {
              Platform.OS === 'android' && RNRestart.restart('');
            }
            navigation.goBack();
          }
        }, 2000);
      })
      .catch(err => {
        Toast({message: t('ERROR_IN_UPDATE_LANGUAGE'), type: 'error'});
        console.log('Error in updating language', err);
      });
  };

  return (
    <KeyboardAvoidingView style={{flex: 1, backgroundColor: appColors.light}}>
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
        contentContainerStyle={{paddingHorizontal: 15}}
        data={languageValue}
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
            content={t('CHANGE_LANGUAGE_CONFIRMATION')}
            bold
            size={'large'}
            style={{textAlign: 'center'}}
          />
          <CommonText
            content={t('CHANGE_LANGUAGE_DESCRIPTION')}
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
                title={t('NO')}
                buttonType="clear"
                onPress={() => {
                  rbSheetRef.current?.close();
                  setRbSheetOpen(false);
                }}
              />
            </View>
            <View style={{flex: 0.45}}>
              <CommonButton
                title={t('YES')}
                onPress={() => handleChangeLanguage()}
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
          content={t('LANGUAGE_UPDATED')}
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

export default Language;

const styles = StyleSheet.create({});
