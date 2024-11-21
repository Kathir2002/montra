import {
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {appColors} from '@shared/appColors';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import * as yup from 'yup';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import CommonText from '@shared/components/commonText/CommonText';
import CommonInput from '@shared/components/commonInput/CommonInput';
import {useFormik} from 'formik';
import CommonButton from '@shared/components/commonButton/CommonButton';
import {Image} from '@rneui/base';
import LottieView from 'lottie-react-native';
import AuthService from '@services/authService';
import {Toast} from '@shared/ToastConfig';
import {useTranslation} from 'react-i18next';

const ForgotPassword = () => {
  const {t} = useTranslation('forgotPassword');
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const [emailModalVisible, setEmailModalVisible] = useState<boolean>(false);

  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .label('email')
      .required(t('requiredMsg'))
      .matches(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/,
        t('validEmail'),
      ),
  });
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: '',
    },
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnMount: true,
    validateOnBlur: true,
    onSubmit: () => {
      const data = {
        email: formik.values.email,
      };
      AuthService.forgotPassword({data})
        .then((res: any) => {
          if (res?.success) {
            setEmailModalVisible(true);
          }
        })
        .catch(err => {
          Toast({message: err?.response?.data?.message, type: 'error'});
        });
    },
  });

  return (
    <KeyboardAvoidingView style={{flex: 1, backgroundColor: appColors.light}}>
      <CommonHeader
        title={t('forgotPassword')}
        leftIconPressBack={() => navigation.goBack()}
        leftIcon={true}
      />
      <ScrollView
        contentContainerStyle={{flexGrow: 1, paddingBottom: 30}}
        showsVerticalScrollIndicator={false}>
        <View style={{gap: 30, paddingHorizontal: 15}}>
          <View style={{}}>
            <LottieView
              style={{
                height: 250,
                width: 250,
                alignSelf: 'center',
                marginVertical: 20,
              }}
              source={require('@assets/lottie/forgotPassword.json')}
              autoPlay
              loop
            />
            <CommonText
              bold
              color={appColors.dark}
              style={{textAlign: 'left', lineHeight: 30}}
              size={24}
              content={t('dontworry')}
            />
          </View>
          <CommonInput
            autoCapitalize="none"
            placeholder={t('email')}
            value={formik.values.email}
            onChangeText={(text: string) => {
              formik.setFieldValue('email', text);
            }}
            error={
              formik.touched.email && formik.errors.email
                ? formik.errors.email
                : ''
            }
            onBlur={formik.handleBlur('email')}
          />
          <View style={{}}>
            <CommonButton
              title={t('continue')}
              onPress={() => formik.handleSubmit()}
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={emailModalVisible}
        animationType="fade"
        onRequestClose={() => {
          setEmailModalVisible(false);
        }}>
        <View
          style={{
            flex: 1,
            backgroundColor: appColors.light,
            justifyContent: 'space-evenly',
            paddingHorizontal: 15,
          }}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              gap: 30,
            }}>
            <Image
              style={{
                height: 210,
                width: 320,
                resizeMode: 'contain',
              }}
              source={require('../../assets/images/emailOnTheWay.png')}
            />
            <CommonText
              content={t('mailOnWay')}
              color={appColors.dark}
              bold
              style={{textAlign: 'center', letterSpacing: 0.5}}
              size={'header'}
            />
            <CommonText
              content={`${t('checkEmail')} ${formik.values.email} ${t(
                'andFollowIns',
              )}`}
              size={'large'}
              style={{textAlign: 'center'}}
            />
          </View>
          <CommonButton
            title={t('backToLogin')}
            onPress={() => {
              setEmailModalVisible(false);
              navigation.navigate('SignIn');
            }}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({});
