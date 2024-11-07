import {
  FlatList,
  I18nManager,
  KeyboardAvoidingView,
  Modal,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {appColors} from '@shared/appColors';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import languageValue from '@assets/data/language.json';

import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import Arrow from '@assets/svg/Arrow.svg';
import CommonText from '@shared/components/commonText/CommonText';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '@store/store';
import CommonDropDown from '@shared/components/commonDropdown/CommonDropDown';
import {useTranslation} from 'react-i18next';
import AccountService from '@services/setup/accountService';
import {Toast} from '@shared/ToastConfig';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {updateCurrentUser} from '@store/slice/appSlice';

type SecurityType = 'FINGERPRINT' | 'PIN';

const Settings = () => {
  const {t, i18n} = useTranslation(['settings']);

  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  console.log(userDetails.securityMethod);

  const [isLoading, setIsLoading] = useState(false);
  const securityData = [
    {label: t('pin'), value: 'PIN'},
    {label: t('fingerPrint'), value: 'FINGERPRINT'},
  ];
  const dispatch = useDispatch();
  const [securityValue, setSecurityValue] = useState<'PIN' | 'FINGERPRINT'>(
    userDetails.securityMethod as SecurityType,
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  console.log(userDetails);

  const updateUserSecurityMethod = async (val: SecurityType) => {
    setIsLoading(true);
    const data = {
      securityMethod: val,
    };
    await AccountService.changeAccountPreferences(data)
      .then(async (res: any) => {
        if (res?.success) {
          setIsLoading(false);
          await AsyncStorage.setItem('securityMethod', JSON.stringify(val));
          dispatch(
            updateCurrentUser({
              email: userDetails?.email,
              id: userDetails?.id,
              name: userDetails?.name,
              picture: userDetails?.picture,
              isSetupDone: userDetails?.isSetupDone,
              currencySymbol: userDetails?.currencySymbol,
              securityMethod: val,
              currentLanguage: i18n.language,
            }),
          );
          Toast({
            message: res?.message,
            type: 'success',
          });
        }
      })
      .catch(err => {
        setIsLoading(false);
        Toast({message: err?.response?.data?.message, type: 'error'});
      });
  };

  const DropDownComponent = () => {
    return (
      <View
        style={{
          width: '40%',
        }}>
        <CommonDropDown
          dropDownStyle={{
            height: 45,
            minHeight: 45,
            width: '100%',
          }}
          dropDownContainerStyle={{
            width: '100%',
          }}
          maxHeight={150}
          zIndex={1}
          items={securityData}
          open={dropdownOpen}
          setOpen={setDropdownOpen}
          value={securityValue}
          setValue={setSecurityValue}
          onSelectItem={val => {
            updateUserSecurityMethod(val.value as SecurityType);
          }}
        />
      </View>
    );
  };

  const RightComponent = ({data}: {data?: string}) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          zIndex: -1,
        }}>
        {data && (
          <CommonText content={data} color={appColors.placeholderColor} />
        )}
        <View
          style={{
            transform: [{rotate: I18nManager.isRTL ? '180deg' : '0deg'}],
          }}>
          <Arrow height={30} width={30} stroke={appColors.primary} />
        </View>
      </View>
    );
  };

  const settingsDataArray = [
    {
      title: t('currency'),
      onPress: () =>
        navigation.navigate('Currency', {
          selectedCurrency: userDetails?.currencySymbol,
        }),
      rightContent: () => (
        <RightComponent data={userDetails?.currencySymbol!} />
      ),
    },
    {
      title: t('language'),
      onPress: () =>
        navigation.navigate('Language', {
          selectedLanguage: userDetails?.currentLanguage,
        }),
      rightContent: () => (
        <RightComponent
          data={
            languageValue.filter(
              item => item.code === userDetails?.currentLanguage,
            )[0]?.label
          }
        />
      ),
    },
    {
      title: t('notification'),
      onPress: () => navigation.navigate('Notification'),
      rightContent: () => <RightComponent />,
    },
    {
      title: t('security'),
      onPress: () => undefined,
      rightContent: () => <DropDownComponent />,
    },
    {
      title: t('about'),
      onPress: () => navigation.navigate('About'),
      rightContent: () => <RightComponent />,
    },
    {
      title: t('help'),
      onPress: () => navigation.navigate('Help'),
      rightContent: () => <RightComponent />,
    },
  ];

  const renderItem = ({
    item,
    index,
  }: {
    item: {
      title: string;
      onPress: () => void;
      rightContent?: () => React.JSX.Element;
    };
    index: number;
  }) => {
    return (
      <TouchableOpacity
        key={index}
        activeOpacity={index === 3 ? 1 : 0.5}
        style={{
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: index == 3 ? -15 : 0,
        }}
        onPress={item.onPress}>
        <CommonText content={item?.title} size={'label'} />
        {item.rightContent && item.rightContent()}
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      onStartShouldSetResponder={() => {
        setDropdownOpen(false);
        return false;
      }}
      style={{flex: 1, backgroundColor: appColors.light}}>
      <CommonHeader
        title={t('settings')}
        leftIcon
        leftIconPressBack={() => navigation.goBack()}
      />
      <StatusBar
        backgroundColor={
          isLoading ? appColors?.transparentBackground : appColors.light
        }
        barStyle={isLoading ? 'light-content' : 'dark-content'}
      />
      <FlatList
        data={settingsDataArray}
        renderItem={renderItem}
        contentContainerStyle={{paddingHorizontal: 15, zIndex: -1}}
        keyExtractor={(item, index) => index.toString()}
      />
      <Modal visible={isLoading} transparent={true} animationType="fade">
        <CommonLoader />
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default Settings;

const styles = StyleSheet.create({});
