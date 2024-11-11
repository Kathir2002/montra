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
import React, {useState} from 'react';
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
import {useSelector} from 'react-redux';
import {RootState} from '@store/store';
import {useTranslation} from 'react-i18next';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';

const Settings = () => {
  const {t, i18n} = useTranslation(['settings']);

  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);

  const [isLoading, setIsLoading] = useState(false);
  const securityData = [
    {label: t('pin'), value: 'PIN'},
    {label: t('fingerPrint'), value: 'FINGERPRINT'},
  ];

  const RightComponent = ({data}: {data?: string}) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
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
      onPress: () => navigation.navigate('Security'),
      rightContent: () => <RightComponent />,
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
        activeOpacity={0.5}
        style={{
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        onPress={item.onPress}>
        <CommonText content={item?.title} size={'label'} />
        {item.rightContent && item.rightContent()}
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView style={{flex: 1, backgroundColor: appColors.light}}>
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
        contentContainerStyle={{paddingHorizontal: 15}}
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
