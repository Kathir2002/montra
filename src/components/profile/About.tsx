import {Linking, ScrollView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {appColors} from '@shared/appColors';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import {Avatar, Icon} from '@rneui/base';
import CommonText from '@shared/components/commonText/CommonText';
import DeviceInfo from 'react-native-device-info';
import {useTranslation} from 'react-i18next';

const About = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const appVersion = DeviceInfo.getVersion();
  const {t} = useTranslation('finaceReport');
  const appFeatures = [
    t('EXPENSE_TRACKING'),
    t('INCOME_MANAGEMENT'),
    t('BUDGET_PLANNING'),
    t('FINACIAL_REPORTS'),
    t('EXPORT_REPORTS'),
  ];
  return (
    <View style={{flex: 1, backgroundColor: appColors.light}}>
      <CommonHeader
        leftIconPressBack={() => navigation.goBack()}
        title={t('ABOUT')}
      />
      <ScrollView
        style={{flex: 1, paddingHorizontal: 15}}
        contentContainerStyle={{gap: 15, paddingBottom: 15}}>
        {/* App logo */}
        <View style={{alignItems: 'center'}}>
          <Avatar
            source={require('../../assets/images/applogo.png')}
            size={70}
            rounded
            avatarStyle={{resizeMode: 'cover'}}
          />
          <CommonText content="Montra" bold size={'appHeader'} />
          <CommonText
            content={`${t('VERSION')} ${appVersion}`}
            color={appColors.placeholderColor}
          />
        </View>
        {/* App description */}
        <View
          style={{
            backgroundColor: appColors.formBorderColor,
            paddingVertical: 10,
            paddingHorizontal: 15,
            borderRadius: 8,
            gap: 5,
            borderWidth: 1,
            borderColor: appColors.formBorderColor,
          }}>
          <CommonText content={t('ABOUT_MONTRA')} bold size={'label'} />
          <CommonText
            content={t('MONTRA_DESCRIPTION')}
            color={appColors.placeholderColor}
          />
        </View>
        <View
          style={{
            backgroundColor: appColors.formBorderColor,
            paddingVertical: 10,
            paddingHorizontal: 15,
            borderRadius: 8,
            gap: 10,
            borderWidth: 1,
            borderColor: appColors.formBorderColor,
          }}>
          {appFeatures?.map((feature, index) => (
            <View
              key={index}
              style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 8,
                  backgroundColor: appColors.buttonClear,
                  borderRadius: 20,
                }}>
                <Icon
                  type="feather"
                  size={20}
                  name="check"
                  color={appColors.primary}
                />
              </View>
              <CommonText content={feature} size={'label'} />
            </View>
          ))}
        </View>
        <View
          style={{
            backgroundColor: appColors.formBorderColor,
            paddingVertical: 10,
            paddingHorizontal: 15,
            borderRadius: 8,
            gap: 5,
            borderWidth: 1,
            borderColor: appColors.formBorderColor,
          }}>
          <CommonText content={t('CONTACT_US')} bold size={'label'} />
          <CommonText
            content="montra.service@gmail.com"
            onPress={() => Linking.openURL('mailto:montra.service@gmail.com')}
            color={appColors.placeholderColor}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default About;

const styles = StyleSheet.create({});
