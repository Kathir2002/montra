import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  BackHandler,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { appColors } from '@shared/appColors';
import { useFormik } from 'formik';
import * as yup from 'yup';
import CommonInput from '@shared/components/commonInput/CommonInput';
import { Icon } from '@rneui/base';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import {
  CommonActions,
  NavigationProp,
  ParamListBase,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import CommonButton from '@shared/components/commonButton/CommonButton';
import AuthService from '@services/authService';
import { Toast } from '@shared/ToastConfig';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import { useTranslation } from 'react-i18next';
import { CustomModal } from '@shared/components/CustomModal';

const ResetPassword = () => {
  const route: any = useRoute().params;
  const { t } = useTranslation('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState<boolean>(false);
  const [rePasswordVisible, setRePasswordVisible] = useState<boolean>(false);
  const navigation: NavigationProp<ParamListBase> = useNavigation();

  useEffect(() => {
    // Add back button handler
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    // Cleanup
    return () => backHandler.remove();
  }, [navigation]);

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    } else {
      // If there's no screen to go back to, reset to home screen
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'SignIn' }], // Replace 'Home' with your default screen
        }),
      );
      return true;
    }
  };

  const validationSchema = yup.object().shape({
    newPassword: yup
      .string()
      .required(t('requiredMsg'))
      .min(8, t('validPassord'))
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
        t('validPassord'),
      ),
    rePassword: yup
      .string()
      .oneOf([yup.ref('newPassword'), undefined], t('PASSWORD_MUST_MATCH'))
      .required(t('requiredMsg')),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      newPassword: '',
      rePassword: '',
    },
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnMount: true,
    validateOnBlur: true,
    onSubmit: async () => {
      setIsLoading(true);
      console.log(route?.resetToken, "route?.resetToken");

      await AuthService.resetPassword({
        data: { newPassword: formik.values.rePassword, token: route?.resetToken }
      })
        .then((res: any) => {
          setIsLoading(false);
          if (res?.success) {
            navigation.navigate('SignIn');
            Toast({ message: t('PASSWORD_RESET_SUCCESS'), type: 'success' });
          }
        })
        .catch(err => {
          setIsLoading(false);
          console.log(err?.response?.data);

          Toast({ message: err?.response?.data?.message, type: 'error' });
        });
    },
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: appColors.light }}>
      <CommonHeader
        title={t('RESET_PASSWORD')}
        leftIconPressBack={() => handleBackPress()}
        leftIcon
      />
      <StatusBar backgroundColor={appColors.light} barStyle={'dark-content'} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 15, marginTop: 30, gap: 10 }}>
          <CommonInput
            leftIcon={{
              name: 'lock',
              type: 'feather',
              color: appColors.placeholderColor,
              size: 20,
            }}
            placeholder={t('NEW_PASSWORD')}
            autoCapitalize="none"
            secureTextEntry={!newPasswordVisible}
            value={formik.values.newPassword}
            onChangeText={(text: string) => {
              formik.setFieldValue('newPassword', text);
            }}
            rightIcon={
              <TouchableOpacity
                onPress={() => setNewPasswordVisible(!newPasswordVisible)}>
                <Icon
                  name={newPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                  type={'ionicon'}
                  size={20}
                />
              </TouchableOpacity>
            }
            error={
              formik.touched.newPassword && formik.errors.newPassword
                ? formik.errors.newPassword
                : ''
            }
            onBlur={formik.handleBlur('newPassword')}
          />
          <CommonInput
            leftIcon={{
              name: 'lock',
              type: 'feather',
              color: appColors.placeholderColor,
              size: 20,
            }}
            placeholder={t('CONFIRM_NEW_PASSWORD')}
            autoCapitalize="none"
            secureTextEntry={!rePasswordVisible}
            value={formik.values.rePassword}
            onChangeText={(text: string) => {
              formik.setFieldValue('rePassword', text);
            }}
            rightIcon={
              <TouchableOpacity
                onPress={() => setRePasswordVisible(!rePasswordVisible)}>
                <Icon
                  name={rePasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                  type={'ionicon'}
                  size={20}
                />
              </TouchableOpacity>
            }
            error={
              formik.touched.rePassword && formik.errors.rePassword
                ? formik.errors.rePassword
                : ''
            }
            onBlur={formik.handleBlur('rePassword')}
          />
          <CommonButton
            buttonStyle={{ marginVertical: 10 }}
            title={t('CONTINUE')}
            onPress={() => {
              formik.handleSubmit();
            }}
          />
        </View>
      </ScrollView>
      <CustomModal visible={isLoading} animationType="fade" transparent={true}>
        <CommonLoader />
      </CustomModal>
    </KeyboardAvoidingView>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({});
