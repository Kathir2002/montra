import {Linking, StatusBar, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {appColors} from '@shared/appColors';
import CommonText from '@shared/components/commonText/CommonText';
import CommonButton from '@shared/components/commonButton/CommonButton';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import {useTranslation} from 'react-i18next';

const Setup = () => {
  const {t} = useTranslation('account');
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: appColors.light,
        paddingHorizontal: 15,
        justifyContent: 'space-evenly',
      }}>
      <StatusBar backgroundColor={appColors.light} barStyle={'dark-content'} />
      <View style={{gap: 15}}>
        <CommonText content={t('SETUP_ACCOUNT')} bold size={24} />
        <CommonText content={t('SETUP_ACCOUNT_DESCRIPTION')} size={'header'} />
      </View>
      <View
        style={{
          backgroundColor: appColors.buttonClear,
          borderWidth: 1,
          borderColor: appColors.formBorderColor,
          borderRadius: 15,
        }}>
        {/* <CommonButton
          title="Send MEssage"
          onPress={() =>
            Linking.openURL(
              'whatsapp://send?text=Hello World!&phone=+919488102864',
            )
          }
        /> */}
        <LottieView
          style={{
            height: 250,
            width: 250,
            alignSelf: 'center',
            marginVertical: 20,
          }}
          source={require('@assets/lottie/account-setup.json')}
          autoPlay
          loop
        />
      </View>
      <CommonButton
        title={t('LETS_GO')}
        onPress={() => navigation.navigate('AddNewAccount')}
      />
    </View>
  );
};

export default Setup;
