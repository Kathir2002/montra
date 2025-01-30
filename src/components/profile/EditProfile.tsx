import {
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import * as yup from 'yup';
import React, {useEffect, useRef, useState} from 'react';
import {appColors} from '@shared/appColors';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import {RootState} from '@store/store';
import {useDispatch, useSelector} from 'react-redux';
import {Avatar} from '@rneui/base';
import CommonText from '@shared/components/commonText/CommonText';
import CommonInput from '@shared/components/commonInput/CommonInput';
import {useFormik} from 'formik';
import {appFonts} from '@shared/appFonts';
import CommonRBSheet, {
  RBSheetRef,
} from '@shared/components/commonRBSheet/CommonRBSheet';
import FileUploadRbSheet, {
  DocumentInterface,
} from '@shared/components/fileUploadRbSheet';
import CommonButton from '@shared/components/commonButton/CommonButton';
import {useTranslation} from 'react-i18next';
import AccountService from '@services/setup/accountService';
import {Toast} from '@shared/ToastConfig';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import {updateCurrentUser} from '@store/slice/appSlice';
import EditIcon from '@assets/svg/change-profile.svg';

const EditProfile = () => {
  const dispatch = useDispatch();
  const {t} = useTranslation('profile');
  const dirtyRBSheetRef = useRef<RBSheetRef>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const rbSheetRef = useRef<RBSheetRef>(null);
  const [image, setImage] = useState<DocumentInterface>();
  const [rbSheetOpen, setRbSheetOpen] = useState(false);
  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .label('name')
      .required(t('auth:requiredMsg'))
      .matches(/^[a-zA-Z ]+$/, t('auth:validName')),
    email: yup.string().email().required(),
    phoneNumber: yup
      .string()
      .matches(/^[0-9]+$/, t('INVALID_PHONE_NO'))
      .min(10, t('PHONE_NO_MIN'))
      .max(10, t('PHONE_NO_MAX')),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: userDetails?.name,
      email: userDetails?.email,
      phoneNumber: userDetails?.phoneNumber ?? '',
    },
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnMount: true,
    validateOnBlur: true,
    onSubmit: () => {
      if (!formik.dirty && !image?.url) {
        Toast({type: 'error', message: t('NO_CHANGES')});
      } else {
        updateUserDetails();
      }
    },
  });

  // useEffect to handle the native back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => backHandler.remove();
  }, [formik.dirty, image]);

  // Custom function to handle the back button press
  const handleBackPress = () => {
    if (formik.dirty || image) {
      dirtyRBSheetRef.current?.open();
      return true;
    } else {
      return false;
    }
  };

  const updateUserDetails = async () => {
    setIsLoading(true);
    const formData = new FormData();
    if (image) {
      formData.append('file', {
        uri: image?.url,
        type: image?.type,
        name: image?.name,
      });
    }
    formData.append('name', formik?.values?.name);
    if (formik.values.phoneNumber?.length === 10) {
      formData.append('phoneNumber', formik?.values?.phoneNumber);
    }
    await AccountService?.updateUserDetails(formData)
      .then((res: any) => {
        setIsLoading(false);
        if (res?.success) {
          Vibration.vibrate(50);
          dispatch(
            updateCurrentUser({
              ...userDetails,
              name: res?.data?.name,
              picture: res?.data?.picture,
              phoneNumber: res?.data?.phoneNumber,
            }),
          );
          navigation.goBack();
          Toast({message: res?.message, type: 'success'});
        }
      })
      .catch(err => {
        console.log(err);

        setIsLoading(false);
        Toast({message: err?.response?.data?.message, type: 'error'});
      });
  };

  return (
    <KeyboardAvoidingView style={{flex: 1, backgroundColor: appColors.light}}>
      <CommonHeader
        title={t('EDIT_PROFILE')}
        leftIconPressBack={() => {
          formik.dirty || image
            ? dirtyRBSheetRef.current?.open()
            : navigation.goBack();
        }}
      />
      <StatusBar
        backgroundColor={
          isLoading || rbSheetOpen
            ? appColors.transparentBackground
            : appColors.light
        }
        barStyle={'dark-content'}
      />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 15,
          gap: 5,
          paddingBottom: 20,
        }}>
        <View style={{flex: 1}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
            }}>
            <View
              style={{
                position: 'relative',
                alignSelf: 'center',
                // overflow: 'hidden',
              }}>
              <TouchableOpacity
                onPress={() => {
                  rbSheetRef.current?.open();
                }}
                activeOpacity={0.7}
                style={{
                  borderColor: appColors.primary,
                  padding: 2,
                  borderWidth: 2,
                  height: 80,
                  width: 80,
                  borderRadius: 55,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Avatar
                  source={{uri: image ? image?.url : userDetails.picture}}
                  size={70}
                  avatarStyle={{borderRadius: 35}}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  rbSheetRef?.current?.open();
                }}
                style={{
                  position: 'absolute',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: appColors?.primary,
                  height: 32,
                  width: 32,
                  borderRadius: 20,
                  bottom: 0,
                  right: -10,
                }}>
                <EditIcon height={17} width={17} fill={appColors.light} />
              </TouchableOpacity>
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
              }}>
              <CommonText
                content={t('USER_NAME')}
                color={appColors.placeholderColor}
              />
              <CommonInput
                leftIcon={{
                  name: 'user-o',
                  type: 'font-awesome',
                  color: appColors.placeholderColor,
                  size: 20,
                }}
                labelVisible={false}
                value={formik.values.name!}
                onChangeText={text => formik.setFieldValue('name', text)}
                placeholder=""
                inputContainerStyle={{
                  borderWidth: 0,
                  borderBottomWidth: 1,
                  height: 50,
                  paddingHorizontal: 0,
                }}
                containerStyle={{height: 50}}
                inputStyle={{
                  fontSize: 18,
                  fontFamily: appFonts.bold,
                }}
              />
            </View>
          </View>
          <View style={{marginVertical: 15}}>
            <CommonText
              content={t('auth:EMAIL')}
              color={appColors.placeholderColor}
            />
            <CommonInput
              leftIcon={{
                name: 'email',
                type: 'fontisto',
                color: appColors.placeholderColor,
                size: 20,
                style: {marginLeft: 8},
              }}
              disabled={true}
              editable={false}
              labelVisible={false}
              value={formik?.values?.email!}
              onChangeText={text => formik.setFieldValue('email', text)}
              inputStyle={{fontSize: 14}}
              containerStyle={{height: 40}}
              inputContainerStyle={{height: 40, paddingHorizontal: 0}}
            />
          </View>
          <View style={{marginVertical: 15}}>
            <CommonText
              content={t('PHONE_NO')}
              color={appColors.placeholderColor}
            />
            <CommonInput
              leftIcon={{
                name: 'phone',
                type: 'feather',
                color: appColors.placeholderColor,
                size: 20,
                style: {marginLeft: 8},
              }}
              keyboardType="numeric"
              labelVisible={false}
              value={formik?.values?.phoneNumber!}
              onChangeText={text => {
                const numericValue = text.replace(/[^0-9]/g, '');
                formik.setFieldValue('phoneNumber', numericValue);
              }}
              inputStyle={{fontSize: 14}}
              containerStyle={{height: 40}}
              placeholder=""
              onBlur={formik.handleBlur('phoneNumber')}
              inputContainerStyle={{height: 40, paddingHorizontal: 0}}
              error={
                formik?.errors?.phoneNumber && formik.touched.phoneNumber
                  ? formik.errors?.phoneNumber
                  : ''
              }
            />
          </View>
        </View>
        <View style={{flex: 0.1}}>
          <CommonButton
            title={t('UPDATE_PROFILE')}
            onPress={() => {
              formik.handleSubmit();
            }}
          />
        </View>
      </ScrollView>
      <CommonRBSheet
        onOpen={() =>
          StatusBar.setBackgroundColor(appColors.transparentBackground)
        }
        onClose={() => {
          StatusBar.setBackgroundColor(appColors.light);
        }}
        ref={rbSheetRef}
        height={150}
        closeOnPressBack={true}
        closeOnPressMask={true}
        draggable={true}
        customStyles={{
          container: {borderTopLeftRadius: 20, borderTopRightRadius: 20},
        }}>
        <FileUploadRbSheet
          isUploadDocumentVisible={false}
          setDocument={setImage}
          closeHandler={() => rbSheetRef.current?.close()}
        />
      </CommonRBSheet>
      <Modal visible={isLoading} transparent={true} animationType="fade">
        <CommonLoader />
      </Modal>
      <CommonRBSheet
        onClose={() => {
          setRbSheetOpen(false);
        }}
        onOpen={() => {
          setRbSheetOpen(true);
        }}
        ref={dirtyRBSheetRef}
        height={200}
        closeOnPressBack={false}
        closeOnPressMask={false}
        draggable={true}
        dragNotClose={true}
        customStyles={{
          container: {borderTopLeftRadius: 20, borderTopRightRadius: 20},
        }}>
        <View style={{padding: 15, gap: 10}}>
          <CommonText
            content={t('transaction:EXIT_CONFIRM_TITLE')}
            bold
            size={'large'}
            style={{textAlign: 'center'}}
          />
          <CommonText
            content={t('transaction:EXIT_MESSAGE')}
            color={appColors.placeholderColor}
            size={'label'}
            style={{textAlign: 'center', paddingHorizontal: 15}}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View style={{flex: 0.45}}>
              <CommonButton
                title={t('NO')}
                buttonType="clear"
                onPress={() => {
                  dirtyRBSheetRef.current?.close();
                  setRbSheetOpen(false);
                }}
              />
            </View>
            <View style={{flex: 0.45}}>
              <CommonButton
                title={t('YES')}
                onPress={() => {
                  dirtyRBSheetRef.current?.close();
                  setRbSheetOpen(false);
                  navigation.goBack();
                }}
              />
            </View>
          </View>
        </View>
      </CommonRBSheet>
    </KeyboardAvoidingView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({});
