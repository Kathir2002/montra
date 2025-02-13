import {
  FlatList,
  I18nManager,
  KeyboardAvoidingView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
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
import {Toast} from '@shared/ToastConfig';

const Settings = () => {
  const {t} = useTranslation('profile');

  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);

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
      title: t('CURRENCY'),
      onPress: () =>
        navigation.navigate('Currency', {
          selectedCurrency: userDetails?.currencySymbol,
        }),
      rightContent: () => (
        <RightComponent data={userDetails?.currencySymbol!} />
      ),
    },
    {
      title: t('LANGUAGE'),
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
      title: t('NOTIFICATION'),
      onPress: () => navigation.navigate('Notification'),
      rightContent: () => <RightComponent />,
    },
    {
      title: t('SECURITY'),
      onPress: () => navigation.navigate('Security'),
      rightContent: () => <RightComponent />,
    },
    {
      title: t('CHANGE_PASSWORD'),
      onPress: () => navigation.navigate('ChangePassword'),
      rightContent: () => <RightComponent />,
    },
    {
      title: t('ABOUT'),
      onPress: () => navigation.navigate('About'),
      rightContent: () => <RightComponent />,
    },
    {
      title: t('HELP'),
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
        title={t('SETTINGS')}
        leftIcon
        leftIconPressBack={() => navigation.goBack()}
      />
      <StatusBar backgroundColor={appColors.light} barStyle={'dark-content'} />
      <FlatList
        data={settingsDataArray}
        renderItem={renderItem}
        contentContainerStyle={{paddingHorizontal: 15}}
        keyExtractor={(item, index) => index.toString()}
      />
    </KeyboardAvoidingView>
  );
};

export default Settings;

const styles = StyleSheet.create({});
