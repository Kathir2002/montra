import {
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import * as yup from 'yup';
import React, {useEffect, useRef, useState} from 'react';
import {appColors} from '@shared/appColors';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import CommonInput from '@shared/components/commonInput/CommonInput';
import {useFormik} from 'formik';
import CommonButton from '@shared/components/commonButton/CommonButton';
import CommonText from '@shared/components/commonText/CommonText';
import {useDispatch} from 'react-redux';
import {Icon} from '@rneui/base';
import {
  DEV_ANDROID_CLIENTID,
  DEV_IOS_CLIENTID,
  DEV_WEB_CLIENTID,
  PROD_ANDROID_CLIENTID,
  PROD_IOS_CLIENTID,
  PROD_WEB_CLIENTID,
} from '@env';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import AuthService from '@services/authService';
import CommonDataService from '@shared/commonDataServices';
import {updateCurrentUser, updateIsLoggedin} from '@store/slice/appSlice';
import {Toast} from '@shared/ToastConfig';
import LoginWithGoogle from '@shared/components/auth/LoginWithGoogle';
import Rive, {Alignment, Fit, RiveRef} from 'rive-react-native';
import {useTranslation} from 'react-i18next';

const Signin = () => {
  const dispatch = useDispatch();

  const riveRef = useRef<RiveRef>(null);
  const {t, i18n} = useTranslation(['signin']);
  const [btnLoader, setBtnLoader] = useState(false);
  const navigation: NavigationProp<ParamListBase> = useNavigation();

  const devData = {
    webClientId: DEV_WEB_CLIENTID,
    androidClientId: DEV_ANDROID_CLIENTID,
    iosClientId: DEV_IOS_CLIENTID,
    scopes: ['profile', 'email'],
  };

  const prodData = {
    webClientId: PROD_WEB_CLIENTID,
    androidClientId: PROD_ANDROID_CLIENTID,
    iosClientId: PROD_IOS_CLIENTID,
    scopes: ['profile', 'email'],
  };

  useEffect(() => {
    GoogleSignin.configure(__DEV__ ? devData : prodData);
  }, []);

  const handleSignin = async () => {
    setBtnLoader(true);
    const data = {
      email: formik.values.email,
      password: formik.values.password,
    };
    AuthService.signin({data})
      .then((res: any) => {
        if (res?.success) {
          setBtnLoader(false);
          CommonDataService.setToken(res?.token);
          riveRef.current?.setInputState('Login Machine', 'trigSuccess', true);
          setTimeout(() => {
            dispatch(updateIsLoggedin(true));
            dispatch(
              updateCurrentUser({
                email: res?.user?.email,
                id: res?.user?.id,
                name: res?.user?.name,
                picture: res?.user?.picture,
                isSetupDone: res?.user?.isSetupDone,
                currencySymbol: res?.user?.currency,
                currentLanguage: i18n.language,
              }),
            );
          }, 1000);
        }
      })
      .catch(err => {
        setBtnLoader(false);
        Toast({message: err?.response?.data?.message, type: 'error'});
        console.log('Error in signin', err);
      });
  };

  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .label('email')
      .required(t('requiredMsg'))
      .matches(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/,
        t('validEmail'),
      ),
    password: yup.string().label('password').required(t('requiredMsg')),
  });
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnMount: true,
    validateOnBlur: true,
    onSubmit: () => handleSignin(),
  });

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: appColors.light,
      }}>
      <StatusBar backgroundColor={appColors.light} barStyle={'dark-content'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 40,
        }}>
        <View
          style={{
            gap: 10,
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: 15,
          }}>
          <Rive
            ref={riveRef}
            resourceName={'login_teddy'}
            artboardName="Teddy"
            style={{
              width: Dimensions.get('window').width - 30,
              height: 300,
              alignSelf: 'center',
              marginBottom: 20,
            }}
            animationName={'idle'}
            fit={Fit.FitHeight}
            autoplay={true}
            alignment={Alignment.Center}
            stateMachineName="Login Machine"
          />
          <CommonInput
            placeholder={t('email')}
            autoCapitalize="none"
            onFocus={() => {
              riveRef.current?.setInputState(
                'Login Machine',
                'isHandsUp',
                false,
              );
              riveRef.current?.setInputState(
                'Login Machine',
                'isChecking',
                true,
              );
            }}
            value={formik.values.email}
            onChangeText={(text: string) => {
              formik.setFieldValue('email', text);
            }}
            error={
              formik.touched.email && formik.errors.email
                ? formik.errors.email
                : ''
            }
            onBlur={() => {
              formik.handleBlur('email');
              riveRef.current?.setInputState(
                'Login Machine',
                'isChecking',
                false,
              );
            }}
          />
          <CommonInput
            onFocus={() => {
              riveRef.current?.setInputState(
                'Login Machine',
                'isHandsUp',
                true,
              );
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
                onPress={() => {
                  setPasswordVisible(!passwordVisible);
                  if (passwordVisible) {
                    riveRef.current?.setInputState(
                      'Login Machine',
                      'isPicking',
                      false,
                    );
                  } else {
                    riveRef.current?.setInputState(
                      'Login Machine',
                      'isPicking',
                      true,
                    );
                  }
                }}>
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
            onBlur={() => {
              // riveRef.current?.setInputState(
              //   'Login Machine',
              //   'isHandsUp',
              //   false,
              // );
              formik.handleBlur('password');
            }}
          />
          <View style={{gap: 15}}>
            <CommonButton
              loading={btnLoader}
              title={t('login')}
              onPress={() => {
                if (formik.errors) {
                  riveRef.current?.setInputState(
                    'Login Machine',
                    'trigFail',
                    true,
                  );
                }
                formik.handleSubmit();
              }}
            />
            <CommonText
              content={t('orWith')}
              style={{textAlign: 'center'}}
              color={appColors.placeholderColor}
            />
            {/* Login with google button */}
            <LoginWithGoogle buttonText={t('loginGoogle')} />
            <CommonText
              onPress={() => navigation.navigate('ForgotPassword')}
              content={t('forgotPassword')}
              size={'large'}
              color={appColors.primary}
              style={{textAlign: 'center'}}
            />
            <CommonText
              content={undefined}
              style={{color: appColors.placeholderColor, textAlign: 'center'}}
              size={'medium'}>
              {t('dontHaveAccount')}
              <CommonText
                onPress={() => navigation.navigate('SignUp')}
                content={undefined}
                style={{
                  color: appColors.primary,
                  textDecorationLine: 'underline',
                }}>
                {t('signup')}
              </CommonText>
            </CommonText>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signin;

const styles = StyleSheet.create({});
