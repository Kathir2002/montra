import {
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import * as yup from 'yup';
import React, {useEffect, useState} from 'react';
import {appColors} from '@shared/appColors';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import CommonInput from '@shared/components/commonInput/CommonInput';
import {useFormik} from 'formik';
import CommonButton from '@shared/components/commonButton/CommonButton';
import CommonText from '@shared/components/commonText/CommonText';
import CommonCheckBox from '@shared/components/commonCheckbox/CustomCheckBox';
import {Icon} from '@rneui/base';
import {Toast} from '@shared/ToastConfig';
import AuthService from '@services/authService';
import LoginWithGoogle from '@shared/components/auth/LoginWithGoogle';
import {useTranslation} from 'react-i18next';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';

const SignUp = () => {
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const {t} = useTranslation('auth');
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .label('email')
      .required(t('requiredMsg'))
      .matches(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/,
        t('validEmail'),
      ),
    name: yup
      .string()
      .label('name')
      .required(t('requiredMsg'))
      .matches(/^[a-zA-Z ]+$/, t('validName')),
    password: yup
      .string()
      .required(t('requiredMsg'))
      .min(8, t('validPassord'))
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
        t('validPassord'),
      ),
    terms: yup.boolean().isTrue(t('acceptTC')).required(t('requiredMsg')),
  });
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: '',
      name: '',
      password: '',
      terms: false,
    },
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnMount: true,
    validateOnBlur: true,
    onSubmit: () => {
      const data = {
        email: formik.values.email,
        password: formik.values.password,
        name: formik.values.name,
      };
      AuthService.signup({data})
        .then((res: any) => {
          if (res?.success) {
            navigation.navigate('EmailVerification', {
              email: formik.values.email,
            });
          }
        })
        .catch(err => {
          Toast({message: err?.response?.data?.message, type: 'error'});
        });
    },
  });

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: appColors.light,
      }}>
      <CommonHeader
        title={t('signup')}
        leftIconPressBack={() => navigation.goBack()}
        leftIcon
      />
      <StatusBar
        backgroundColor={
          isLoading ? appColors.transparentBackground : appColors.light
        }
        barStyle={'dark-content'}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
        }}>
        <View
          style={{
            gap: 10,
            flex: 1,
            paddingHorizontal: 15,
            marginTop: 20,
          }}>
          <CommonInput
            leftIcon={{
              name: 'user-o',
              type: 'font-awesome',
              color: appColors.placeholderColor,
              size: 20,
            }}
            placeholder={t('name')}
            value={formik.values.name}
            onChangeText={(text: string) => {
              formik.setFieldValue('name', text);
            }}
            error={
              formik.touched.name && formik.errors.name
                ? formik.errors.name
                : ''
            }
            onBlur={formik.handleBlur('name')}
          />
          <CommonInput
            leftIcon={{
              name: 'email',
              type: 'fontisto',
              color: appColors.placeholderColor,
              size: 20,
            }}
            autoCapitalize="none"
            placeholder={t('EMAIL')}
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
          <CommonInput
            leftIcon={{
              name: 'lock',
              type: 'feather',
              color: appColors.placeholderColor,
              size: 20,
            }}
            placeholder={t('password')}
            autoCapitalize="none"
            secureTextEntry={!passwordVisible}
            value={formik.values.password}
            onChangeText={(text: string) => {
              formik.setFieldValue('password', text);
            }}
            rightIcon={
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}>
                <Icon
                  name={passwordVisible ? 'eye-outline' : 'eye-off-outline'}
                  type={'ionicon'}
                  size={20}
                />
              </TouchableOpacity>
            }
            error={
              formik.touched.password && formik.errors.password
                ? formik.errors.password
                : ''
            }
            onBlur={formik.handleBlur('password')}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <TouchableWithoutFeedback
              hitSlop={{
                bottom: 20,
                left: 20,
                right: 20,
                top: 20,
              }}
              onPress={() => {
                formik.setFieldValue('terms', !formik.values.terms);
              }}>
              <View>
                <CommonCheckBox
                  width={30}
                  height={30}
                  checked={formik.values.terms}
                  checkMarkColor={appColors.light}
                  checkedBorderColor={appColors.primary}
                  unCheckedBorderColor={appColors.placeholderColor}
                  checkedBackgroundColor={appColors.primary}
                  unCheckedBackgroundColor={'#E8EDE7'}
                />
              </View>
            </TouchableWithoutFeedback>
            <View style={{flex: 1, marginLeft: 5}}>
              <CommonText style={{color: appColors.dark}} content={undefined}>
                {t('bySigningUp')}{' '}
                <CommonText
                  content={undefined}
                  style={{color: appColors.primary}}>
                  {t('termsAndConditions')}
                </CommonText>
              </CommonText>
            </View>
          </View>
          <View style={{gap: 15, marginVertical: 15}}>
            <CommonButton
              title={t('signup')}
              onPress={() => {
                if (formik.errors.terms) {
                  Toast({message: formik.errors.terms, type: 'error'});
                }
                formik.handleSubmit();
              }}
            />
            <CommonText
              content={t('orWith')}
              style={{textAlign: 'center'}}
              color={appColors.placeholderColor}
            />
            {/* Signup with Google */}
            <LoginWithGoogle
              setIsLoading={setIsLoading}
              buttonText={t('signupGoogle')}
            />
            <CommonText
              content={undefined}
              style={{color: appColors.placeholderColor, textAlign: 'center'}}
              size={'medium'}>
              {t('alreadyHaveAccount')}{' '}
              <CommonText
                onPress={() => navigation.navigate('SignIn')}
                content={undefined}
                style={{
                  color: appColors.primary,
                  textDecorationLine: 'underline',
                }}>
                {t('login')}
              </CommonText>
            </CommonText>
          </View>
        </View>
      </ScrollView>
      <Modal visible={isLoading} animationType="fade" transparent={true}>
        <CommonLoader />
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default SignUp;

const styles = StyleSheet.create({});
