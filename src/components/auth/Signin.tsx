import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  NativeModules,
  Platform,
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
import {
  ConfigureParams,
  GoogleSignin,
} from '@react-native-google-signin/google-signin';
import AuthService from '@services/authService';
import CommonDataService from '@shared/commonDataServices';
import {updateCurrentUser, updateIsLoggedin} from '@store/slice/appSlice';
import {Toast} from '@shared/ToastConfig';
import LoginWithGoogle from '@shared/components/auth/LoginWithGoogle';
import Rive, {Alignment, Fit, RiveRef} from 'rive-react-native';
import {useTranslation} from 'react-i18next';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';

const Signin = () => {
  const dispatch = useDispatch();

  const riveRef = useRef<RiveRef>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {t, i18n} = useTranslation(['signin']);
  const [btnLoader, setBtnLoader] = useState(false);
  const navigation: NavigationProp<ParamListBase> = useNavigation();

  const getDeviceDetails = async () => {
    const platform = DeviceInfo.getSystemName(); // e.g., "iOS" or "Android"
    const deviceModel = DeviceInfo.getModel(); // e.g., "iPhone 13"
    const osVersion = DeviceInfo.getSystemVersion(); // e.g., "16.0"
    const appVersion = DeviceInfo.getVersion(); // e.g., "1.0.0"
    const appId = DeviceInfo.getBundleId(); // e.g., "com.example.app"
    const manufacturer = await DeviceInfo.getManufacturer(); // e.g., "Apple" or "Samsung"
    const fcmToken = await messaging().getToken();

    return {
      platform,
      deviceModel,
      osVersion,
      appVersion,
      appId,
      manufacturer,
      fcmToken,
    };
  };
  const devData: ConfigureParams = {
    webClientId: DEV_WEB_CLIENTID,
    // androidClientId: DEV_ANDROID_CLIENTID,
    iosClientId: DEV_IOS_CLIENTID,
    scopes: ['profile', 'email'],
  };

  const prodData: ConfigureParams = {
    webClientId: PROD_WEB_CLIENTID,
    // androidClientId: PROD_ANDROID_CLIENTID,
    iosClientId: PROD_IOS_CLIENTID,
    scopes: ['profile', 'email'],
  };

  useEffect(() => {
    GoogleSignin.configure(__DEV__ ? devData : prodData);
  }, []);

  const handleSignin = async () => {
    setBtnLoader(true);
    const deviceInfo = await getDeviceDetails();
    const data = {
      email: formik.values.email,
      password: formik.values.password,
      ...deviceInfo,
    };

    await AuthService.signin({data})
      .then(async (res: any) => {
        if (res?.success) {
          if (Platform.OS === 'android') {
            try {
              // After successful login API call
              await NativeModules.ShortcutModule.createShortcuts();
            } catch (error) {
              console.error('Failed to create shortcuts:', error);
            }
          }
          setBtnLoader(false);
          riveRef.current?.setInputState('Login Machine', 'trigSuccess', true);
          CommonDataService.setToken(res?.token);
          dispatch(
            updateCurrentUser({
              email: res?.user?.email,
              id: res?.user?.id,
              name: res?.user?.name,
              picture: res?.user?.picture,
              isSetupDone: res?.user?.isSetupDone,
              currencySymbol: res?.user?.currency,
              currentLanguage: i18n.language,
              securityMethod: res?.user?.securityMethod,
              phoneNumber: res?.user?.phoneNumber,
            }),
          );
          await AsyncStorage.getItem('securityPin').then(value => {
            if (value === null) {
              navigation.navigate('PinGerneration');
            } else {
              setTimeout(() => {
                dispatch(updateIsLoggedin(true));
              }, 1000);
            }
          });
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
      <CommonHeader title="" leftIconPressBack={() => {}} leftIcon={false} />
      <StatusBar
        backgroundColor={isLoading ? appColors.transferBg : appColors.light}
        barStyle={isLoading ? 'light-content' : 'dark-content'}
      />
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
            leftIcon={{
              name: 'email',
              type: 'fontisto',
              color: appColors.placeholderColor,
              size: 20,
            }}
            placeholder={t('email')}
            autoCapitalize="none"
            onFocus={() => {
              if (passwordVisible) {
                riveRef.current?.setInputState(
                  'Login Machine',
                  'isPicking',
                  false,
                );
              }
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
            leftIcon={{
              name: 'lock',
              type: 'feather',
              color: appColors.placeholderColor,
              size: 20,
            }}
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
            <LoginWithGoogle
              setIsLoading={setIsLoading}
              buttonText={t('loginGoogle')}
            />
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
      <Modal visible={isLoading} animationType="fade" transparent={true}>
        <CommonLoader />
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default Signin;

const styles = StyleSheet.create({});
