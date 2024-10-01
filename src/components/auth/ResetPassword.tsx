import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useState} from 'react';
import {appColors} from '@shared/appColors';
import {useFormik} from 'formik';
import * as yup from 'yup';
import CommonInput from '@shared/components/commonInput/CommonInput';
import {Icon} from '@rneui/base';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import CommonButton from '@shared/components/commonButton/CommonButton';
import {encryptDetails} from '@src/lib/functions';
import AuthService from '@services/authService';
import {Toast} from '@shared/ToastConfig';

const ResetPassword = () => {
  const route: any = useRoute().params;

  const [newPasswordVisible, setNewPasswordVisible] = useState<boolean>(false);
  const [rePasswordVisible, setRePasswordVisible] = useState<boolean>(false);
  const navigation: NavigationProp<ParamListBase> = useNavigation();

  const validationSchema = yup.object().shape({
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
      newPassword: '',
      rePassword: '',
    },
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnMount: true,
    validateOnBlur: true,
    onSubmit: () => {
      AuthService.resetPassword({
        data: {newPassword: formik.values.rePassword},
        token: encryptDetails(route?.userToken)!,
      })
        .then((res: any) => {
          if (res?.success) {
            navigation.navigate('SignIn');
            Toast({message: 'Password reset successfully', type: 'success'});
          }
        })
        .catch(err => {
          console.log(err?.response);

          Toast({message: err?.data?.message, type: 'error'});
        });
    },
  });

  return (
    <KeyboardAvoidingView style={{flex: 1, backgroundColor: appColors.light}}>
      <CommonHeader
        title="Rest Password"
        leftIconPressBack={() => navigation.goBack()}
        leftIcon
      />
      <StatusBar backgroundColor={appColors.light} barStyle={'dark-content'} />
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={{flex: 1, paddingHorizontal: 15, marginTop: 30, gap: 10}}>
          <CommonInput
            placeholder="New Password"
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
            placeholder="Retype new Password"
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
            buttonStyle={{marginVertical: 10}}
            title="Continue"
            onPress={() => {
              formik.handleSubmit();
            }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({});
