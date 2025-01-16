import {
  Image,
  Keyboard,
  Linking,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {appColors} from '@shared/appColors';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import * as yup from 'yup';
import messaging from '@react-native-firebase/messaging';

import CommonButton from '@shared/components/commonButton/CommonButton';
import CommonText from '@shared/components/commonText/CommonText';
import CommonInput from '@shared/components/commonInput/CommonInput';
import AuthService from '@services/authService';
import CommonDataService from '@shared/commonDataServices';
import {useFormik} from 'formik';
import {Toast} from '@shared/ToastConfig';
import {KeyboardAvoidingView} from 'react-native';
import {Icon} from '@rneui/base';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '@store/store';
import {useTranslation} from 'react-i18next';
import AccountService from '@services/setup/accountService';
import EncryptedStorage from 'react-native-encrypted-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {updateCurrentUser, updateIsLoggedin} from '@store/slice/appSlice';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';

const ChangePassword = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [emailModalVisible, setEmailModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [eyeIconVisible, setEyeIconVisible] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const {t} = useTranslation('forgotPassword');
  const dispatch = useDispatch();

  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const validationSchema = yup.object().shape({
    currentPassword: yup.string().required('This field is required'),
    newPassword: yup
      .string()
      .required('This field is required')
      .min(
        8,
        'Use 8 or more characters with a mix of letters, numbers & symbols',
      )
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
        'Use 8 or more characters with a mix of letters, numbers & symbols',
      ),
    rePassword: yup
      .string()
      .oneOf([yup.ref('newPassword'), undefined], 'Passwords must match')
      .required('This field is required'),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      currentPassword: '',
      newPassword: '',
      rePassword: '',
    },
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnMount: true,
    validateOnBlur: true,
    onSubmit: () => changePassword(),
  });

  const changePassword = async () => {
    setIsLoading(true);
    const {currentPassword, newPassword, rePassword} = formik.values;
    const data = {
      currentPassword,
      newPassword,
    };
    await AccountService.changePassword(data)
      .then((res: any) => {
        setIsLoading(false);
        if (res?.success) {
          Toast({type: 'success', message: res?.message});
        }
      })
      .catch(err => {
        setIsLoading(false);
        Toast({message: err?.response?.data?.message, type: 'error'});
      });
  };

  const resetPasswordMailHandler = async () => {
    const data = {
      email: userDetails.email,
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
  };

  const logoutHandler = async () => {
    setIsLoading(true);
    try {
      const fcmToken = await messaging().getToken();

      const data = {fcmToken};
      await AccountService.logoutUser(data)
        .then(async (res: any) => {
          if (res?.success) {
            await GoogleSignin.signOut();
            // Perform additional cleanup and logout operations.
            const ASYNC_KEYS = await AsyncStorage.getAllKeys();
            await EncryptedStorage.clear();
            ASYNC_KEYS?.map(async (res: string) => {
              if (res !== 'getStartedVisible' && res !== 'securityPin') {
                await AsyncStorage.removeItem(res);
              }
            });
            dispatch(updateIsLoggedin(false));
            dispatch(updateCurrentUser({}));
            setIsLoading(false);
            navigation.navigate('SignIn');
          }
        })
        .catch(err => {
          setIsLoading(false);
          Toast({type: 'error', message: err?.response?.data?.message});
        });
    } catch (error: any) {
      setIsLoading(false);
      console.log('Google Sign-Out Error: ', error);
      Toast({message: error?.message, type: 'error'});
    }
  };

  return (
    <KeyboardAvoidingView style={{flex: 1, backgroundColor: appColors.light}}>
      <CommonHeader
        title="Change Password"
        leftIconPressBack={() => navigation.goBack()}
      />
      <StatusBar
        backgroundColor={
          isLoading ? appColors.transparentBackground : appColors.light
        }
        barStyle="dark-content"
      />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 15,
          paddingBottom: 15,
        }}>
        <CommonText content="Enter your current password and choose a new password to update your account security." />
        <View style={{marginTop: 15}}>
          <CommonInput
            secureTextEntry={!eyeIconVisible?.oldPassword}
            rightIcon={
              <TouchableOpacity
                onPress={() => {
                  setEyeIconVisible({
                    ...eyeIconVisible,
                    oldPassword: !eyeIconVisible?.oldPassword,
                  });
                }}>
                <Icon
                  name={
                    eyeIconVisible?.oldPassword
                      ? 'eye-outline'
                      : 'eye-off-outline'
                  }
                  type={'ionicon'}
                  size={20}
                />
              </TouchableOpacity>
            }
            autoCapitalize="none"
            leftIcon={{
              name: 'lock',
              type: 'feather',
              color: appColors.placeholderColor,
              size: 20,
            }}
            onBlur={formik.handleBlur('currentPassword')}
            value={formik.values.currentPassword}
            onChangeText={text => {
              formik.setFieldValue('currentPassword', text);
            }}
            placeholder="Current Password"
            error={
              formik?.errors?.currentPassword && formik.touched.currentPassword
                ? formik?.errors?.currentPassword
                : ''
            }
          />
        </View>
        <View style={{marginTop: 15}}>
          <CommonInput
            secureTextEntry={!eyeIconVisible?.newPassword}
            rightIcon={
              <TouchableOpacity
                onPress={() => {
                  setEyeIconVisible({
                    ...eyeIconVisible,
                    newPassword: !eyeIconVisible?.newPassword,
                  });
                }}>
                <Icon
                  name={
                    eyeIconVisible?.newPassword
                      ? 'eye-outline'
                      : 'eye-off-outline'
                  }
                  type={'ionicon'}
                  size={20}
                />
              </TouchableOpacity>
            }
            autoCapitalize="none"
            leftIcon={{
              name: 'lock',
              type: 'feather',
              color: appColors.placeholderColor,
              size: 20,
            }}
            onBlur={formik.handleBlur('newPassword')}
            value={formik.values.newPassword}
            onChangeText={text => {
              formik.setFieldValue('newPassword', text);
            }}
            placeholder="New Password"
            error={
              formik?.errors?.newPassword && formik.touched.newPassword
                ? formik?.errors?.newPassword
                : ''
            }
          />
        </View>
        <View style={{marginVertical: 15}}>
          <CommonInput
            secureTextEntry={!eyeIconVisible?.confirmPassword}
            rightIcon={
              <TouchableOpacity
                onPress={() => {
                  setEyeIconVisible({
                    ...eyeIconVisible,
                    confirmPassword: !eyeIconVisible?.confirmPassword,
                  });
                }}>
                <Icon
                  name={
                    eyeIconVisible?.confirmPassword
                      ? 'eye-outline'
                      : 'eye-off-outline'
                  }
                  type={'ionicon'}
                  size={20}
                />
              </TouchableOpacity>
            }
            autoCapitalize="none"
            leftIcon={{
              name: 'lock',
              type: 'feather',
              color: appColors.placeholderColor,
              size: 20,
            }}
            onBlur={formik.handleBlur('rePassword')}
            value={formik.values.rePassword}
            onChangeText={text => {
              formik.setFieldValue('rePassword', text);
            }}
            placeholder="Confirm New Password"
            error={
              formik?.errors?.rePassword && formik.touched.rePassword
                ? formik?.errors?.rePassword
                : ''
            }
          />
        </View>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <CommonText
            content="Can't remember your current password?"
            size={'medium'}
            color={appColors.error}
          />
          <TouchableOpacity
            activeOpacity={0.5}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: appColors.formBorderColor,
              borderRadius: 15,
              justifyContent: 'center',
              paddingVertical: 8,
              gap: 10,
              marginVertical: 15,
              backgroundColor: appColors.buttonClear,
            }}
            onPress={() => {
              resetPasswordMailHandler();
            }}>
            <Icon
              name="email"
              type="fontisto"
              size={25}
              color={appColors.dark}
            />
            <CommonText
              content="Send Instructions"
              color={appColors.dark}
              bold
            />
          </TouchableOpacity>
          <CommonButton
            title="Update Password"
            onPress={() => {
              formik.handleSubmit();
            }}
          />
        </View>
      </ScrollView>
      <Modal
        visible={emailModalVisible}
        animationType="fade"
        onRequestClose={() => {
          setEmailModalVisible(false);
        }}>
        <CommonHeader
          leftIconPressBack={() => setEmailModalVisible(false)}
          title=""
        />
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            backgroundColor: appColors.light,
            justifyContent: 'space-evenly',
            paddingHorizontal: 15,
            paddingBottom: 15,
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
              source={require('@assets/images/emailOnTheWay.png')}
            />
            <CommonText
              content={t('mailOnWay')}
              color={appColors.dark}
              bold
              style={{textAlign: 'center', letterSpacing: 0.5}}
              size={'header'}
            />
            <CommonText
              content={`${t('checkEmail')} ${userDetails?.email} ${t(
                'andFollowIns',
              )}`}
              size={'large'}
              style={{textAlign: 'center'}}
            />
          </View>
          <View
            style={{
              gap: 10,
            }}>
            <TouchableOpacity
              onPress={() => {
                Linking.openURL('https://gmail.app.goo.gl');
                logoutHandler();
              }}
              activeOpacity={0.5}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: appColors.formBorderColor,
                borderRadius: 15,
                justifyContent: 'center',
                paddingVertical: 8,
                gap: 10,
                marginVertical: 15,
                backgroundColor: appColors.buttonClear,
              }}>
              <Icon
                name="email"
                type="fontisto"
                size={25}
                color={appColors.dark}
              />
              <CommonText
                content="Open Email App"
                color={appColors.dark}
                bold
              />
            </TouchableOpacity>
            <CommonButton
              title={t('backToLogin')}
              onPress={() => {
                setEmailModalVisible(false);
                logoutHandler();
              }}
            />
          </View>
        </ScrollView>
      </Modal>
      <Modal visible={isLoading} animationType="fade" transparent={true}>
        <CommonLoader />
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({});
