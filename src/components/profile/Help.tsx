import {
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  TouchableOpacity,
  Vibration,
  Image,
  Modal,
} from 'react-native';
import React, {useRef, useState} from 'react';
import * as yup from 'yup';
import {appColors} from '@shared/appColors';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import {useTranslation} from 'react-i18next';
import DocumentPicker from 'react-native-document-picker';
import Clipboard from '@react-native-clipboard/clipboard';

import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import CommonInput from '@shared/components/commonInput/CommonInput';
import {useFormik} from 'formik';
import CommonButton from '@shared/components/commonButton/CommonButton';
import CommonConfirmation from '@shared/components/CommonConfirmation';
import CommonRBSheet, {
  RBSheetRef,
} from '@shared/components/commonRBSheet/CommonRBSheet';
import Popover from 'react-native-popover-view';
import CommonText from '@shared/components/commonText/CommonText';
import LottieView from 'lottie-react-native';
import AttachmentIcon from '@assets/svg/attachment.svg';
import FileUploadRbSheet, {
  DocumentInterface,
} from '@shared/components/fileUploadRbSheet';
import CloseIcon from '@assets/svg/close.svg';
import ExcelIcon from '@assets/svg/fileFormats/excel.svg';
import PDFIcon from '@assets/svg/fileFormats/pdf.svg';
import WordIcon from '@assets/svg/fileFormats/word.svg';
import {formatBytes, openFileFromUrl} from '@src/lib/functions';
import Arrow from '@assets/svg/Arrow.svg';
import AccountService from '@services/setup/accountService';
import {Toast} from '@shared/ToastConfig';
import {Icon} from '@rneui/base';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '@store/store';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import {updateCurrentUser} from '@store/slice/appSlice';
import ContactService from '@services/contactSupportService';

const Help = () => {
  const {t} = useTranslation('profile');
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [rbSheetOpen, setRbSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessPopoverVisible, setIsSuccessPopoverVisible] = useState(false);
  const [requestId, setRequestId] = useState();
  const [document, setDocument] = useState<DocumentInterface>();
  const dirtyRBSheetRef = useRef<RBSheetRef>(null);
  const rbSheetRef = useRef<RBSheetRef>(null);
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const dispatch = useDispatch();
  const validationSchema = yup.object().shape({
    phoneNumber: yup
      .string()
      .required(t('auth:requiredMsg'))
      .matches(/^[0-9]+$/, t('INVALID_PHONE_NO'))
      .min(10, t('PHONE_NO_MIN'))
      .max(10, t('PHONE_NO_MAX')),
    subject: yup
      .string()
      .required(t('auth:requiredMsg'))
      .max(50, 'Subject must not exceed 50 characters'),
    message: yup
      .string()
      .required(t('auth:requiredMsg'))
      .max(260, 'Subject must not exceed 260 characters'),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      phoneNumber: '',
      subject: '',
      message: '',
    },
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnMount: true,
    validateOnBlur: true,
    onSubmit: () => contactFormSubmitHandler(),
  });

  const contactFormSubmitHandler = async () => {
    setIsLoading(true);
    const formData = new FormData();
    if (document) {
      formData.append('file', {
        uri: document?.url,
        type: document?.type,
        name: document?.name,
      });
    }
    formData.append('phoneNumber', formik?.values?.phoneNumber);
    formData.append('subject', formik?.values?.subject);
    formData.append('message', formik?.values?.message);
    await ContactService.addContactSupport(formData)
      .then((res: any) => {
        setIsLoading(false);
        if (res?.success) {
          setRequestId(res?.request_id);
          setIsSuccessPopoverVisible(true);
          dispatch(
            updateCurrentUser({
              ...userDetails,
              activeContactRequestCount:
                userDetails.activeContactRequestCount + 1,
            }),
          );
          Toast({message: res?.message, type: 'success'});
        }
      })
      .catch(err => {
        setIsLoading(false);
        Toast({message: err?.response?.data?.message, type: 'error'});
      });
  };

  return (
    <KeyboardAvoidingView style={{flex: 1, backgroundColor: appColors.light}}>
      <CommonHeader
        leftIcon
        title="Help Center"
        leftIconPressBack={() => navigation.goBack()}
      />
      <StatusBar
        barStyle={
          rbSheetOpen || isLoading || isSuccessPopoverVisible
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={
          rbSheetOpen || isLoading || isSuccessPopoverVisible
            ? appColors.transparentBackground
            : appColors.light
        }
      />
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('HelpRequest_List');
        }}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: appColors.buttonClear,
          marginHorizontal: 15,
          borderRadius: 10,
          paddingVertical: 10,
          justifyContent: 'space-between',
          paddingLeft: 15,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 15,
          }}>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              backgroundColor: appColors.lightBg,
              borderRadius: 8,
            }}>
            <CommonText
              content={String(userDetails?.activeContactRequestCount)}
            />
          </View>
          <CommonText content="Active Service Request" />
        </View>
        <Arrow height={30} width={30} stroke={appColors.transferBg} />
      </TouchableOpacity>
      <ScrollView
        style={{flex: 1, paddingHorizontal: 15}}
        contentContainerStyle={{flexGrow: 1, gap: 5, paddingBottom: 20}}>
        <View style={{flex: 1, justifyContent: 'center'}}>
          {/* <View
            style={{
              marginTop: 15,
            }}>
            <CommonInput
              leftIcon={{
                name: 'user-o',
                type: 'font-awesome',
                color: appColors.placeholderColor,
                size: 20,
                style: {marginLeft: 8},
              }}
              value={formik.values.name!}
              onChangeText={text => formik.setFieldValue('name', text)}
              placeholder="Full Name"
              inputContainerStyle={{
                paddingHorizontal: 0,
              }}
              onBlur={formik.handleBlur('name')}
              containerStyle={{height: 50}}
              inputStyle={{
                fontSize: 14,
              }}
              error={
                formik?.errors?.name && formik.touched.name
                  ? formik.errors?.name
                  : ''
              }
            />
          </View> */}
          {/* <View
            style={{
              marginTop: 15,
              paddingTop: formik.errors.name && formik.touched.name ? 15 : 0,
            }}>
            <CommonInput
              leftIcon={{
                name: 'email',
                type: 'fontisto',
                color: appColors.placeholderColor,
                size: 20,
                style: {marginLeft: 8},
              }}
              placeholder="Email"
              autoCapitalize="none"
              value={formik?.values?.email!}
              onChangeText={text => formik.setFieldValue('email', text)}
              inputStyle={{fontSize: 14}}
              onBlur={formik.handleBlur('email')}
              containerStyle={{height: 40}}
              inputContainerStyle={{paddingHorizontal: 0}}
              error={
                formik?.errors?.email && formik.touched.email
                  ? formik.errors?.email
                  : ''
              }
            />
          </View> */}
          <View
            style={{
              marginTop: 15,
              // paddingTop: formik.errors.email && formik.touched.email ? 25 : 0,
            }}>
            <CommonInput
              leftIcon={{
                name: 'phone',
                type: 'feather',
                color: appColors.placeholderColor,
                size: 20,
                style: {marginLeft: 8},
              }}
              keyboardType="numeric"
              value={formik?.values?.phoneNumber!}
              onChangeText={text => {
                const numericValue = text.replace(/[^0-9]/g, '');
                formik.setFieldValue('phoneNumber', numericValue);
              }}
              inputStyle={{fontSize: 14}}
              containerStyle={{height: 40}}
              placeholder="Phone Number"
              onBlur={formik.handleBlur('phoneNumber')}
              inputContainerStyle={{paddingHorizontal: 0}}
              error={
                formik?.errors?.phoneNumber && formik.touched.phoneNumber
                  ? formik.errors?.phoneNumber
                  : ''
              }
            />
          </View>
          <View
            style={{
              marginTop: 15,
              paddingTop:
                formik.errors.phoneNumber && formik.touched.phoneNumber
                  ? 25
                  : 0,
            }}>
            <CommonInput
              leftIcon={{
                name: 'mail-open-outline',
                type: 'ionicon',
                color: appColors.placeholderColor,
                size: 20,
                style: {marginLeft: 8},
              }}
              value={formik?.values?.subject!}
              onChangeText={text => {
                formik.setFieldValue('subject', text);
              }}
              inputStyle={{fontSize: 14}}
              containerStyle={{height: 40}}
              placeholder="Subject"
              onBlur={formik.handleBlur('subject')}
              inputContainerStyle={{paddingHorizontal: 0}}
              error={
                formik?.errors?.subject && formik.touched.subject
                  ? formik.errors?.subject
                  : ''
              }
            />
          </View>
          <View
            style={{
              marginTop: 15,
              paddingTop:
                formik.errors.subject && formik.touched.subject ? 25 : 0,
            }}>
            <CommonInput
              isTextArea={true}
              leftIcon={{
                name: 'message1',
                type: 'antdesign',
                color: appColors.placeholderColor,
                size: 20,
                style: {marginLeft: 8},
              }}
              numberOfLines={5}
              multiline={true}
              value={formik?.values?.message!}
              onChangeText={text => {
                formik.setFieldValue('message', text);
              }}
              inputStyle={{fontSize: 14}}
              containerStyle={{
                height: 150,
              }}
              placeholder="Message"
              onBlur={formik.handleBlur('message')}
              inputContainerStyle={{paddingHorizontal: 0, height: 150}}
              error={
                formik?.errors?.message && formik.touched.message
                  ? formik.errors?.message
                  : ''
              }
            />
          </View>
          {!document ? (
            <TouchableOpacity
              onPress={() => rbSheetRef.current?.open()}
              activeOpacity={0.7}
              style={{
                marginTop: 10,
                flexDirection: 'row',
                gap: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <AttachmentIcon height={25} width={25} />
              <CommonText
                content={t('transaction:ADD_ATTACHMENT')}
                color={appColors.placeholderColor}
                size={'medium'}
              />
            </TouchableOpacity>
          ) : document?.type?.startsWith('image/') ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onLongPress={() => {
                Vibration.vibrate(50);
                openFileFromUrl(
                  document?.url!,
                  document?.type,
                  !document?.url?.includes('https://')!,
                );
              }}>
              <Image
                resizeMode="cover"
                resizeMethod="auto"
                source={{
                  uri: document?.url,
                }}
                height={150}
                style={{
                  alignSelf: 'center',
                  borderRadius: 15,
                  resizeMode: 'cover',
                }}
                width={150}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setDocument(undefined),
                    formik?.setFieldTouched('isDocumentUpdate', false);
                }}
                style={{
                  position: 'absolute',
                  right: 95,
                  top: -8,
                  backgroundColor: appColors.transparentBackground,
                  height: 25,
                  width: 25,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <CloseIcon height={12} width={12} />
              </TouchableOpacity>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              onLongPress={() => {
                Vibration.vibrate(50);
                openFileFromUrl(
                  document?.url!,
                  document?.type,
                  !document?.url?.includes('https://')!,
                );
              }}
              style={{maxWidth: 210}}>
              <View
                style={{
                  gap: 5,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: 15,
                  borderColor: appColors.formBorderColor,
                  borderWidth: 1,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}>
                {document?.type === DocumentPicker.types.pdf ? (
                  <PDFIcon width={35} height={35} />
                ) : document?.type === 'application/msword' ||
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
                  <WordIcon width={35} height={35} />
                ) : (
                  <ExcelIcon width={35} height={35} />
                )}
                <View style={{flex: 1, gap: 5}}>
                  <CommonText
                    size={'medium'}
                    content={document?.name}
                    color={appColors.placeholderColor}
                  />
                  <CommonText
                    size={'error'}
                    content={String(formatBytes(document?.size))}
                    color={appColors.placeholderColor}
                  />
                </View>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setDocument(undefined),
                    formik?.setFieldTouched('isDocumentUpdate', false);
                }}
                style={{
                  position: 'absolute',
                  right: -10,
                  top: -8,
                  backgroundColor: appColors.transparentBackground,
                  height: 25,
                  width: 25,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <CloseIcon height={12} width={12} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        </View>
        <View>
          <CommonButton title="Submit" onPress={() => formik.handleSubmit()} />
        </View>
      </ScrollView>
      <CommonConfirmation
        titleText={t('EXIT_CONFIRM_TITLE')}
        subText={t('EXIT_MESSAGE')}
        handleCancelBtn={() => {
          dirtyRBSheetRef.current?.close();
          setRbSheetOpen(false);
        }}
        handleOkBtn={() => {
          navigation.goBack();
        }}
        onClose={() => {
          setRbSheetOpen(false);
        }}
        onOpen={() => {
          setRbSheetOpen(true);
        }}
        ref={dirtyRBSheetRef}
        height={220}
        closeOnPressBack={false}
        closeOnPressMask={false}
        draggable={true}
        dragNotClose={true}
        customStyles={{
          container: {borderTopLeftRadius: 20, borderTopRightRadius: 20},
        }}
      />
      <CommonRBSheet
        onOpen={() =>
          StatusBar.setBackgroundColor(appColors.transparentBackground)
        }
        onClose={() => StatusBar.setBackgroundColor(appColors.light)}
        ref={rbSheetRef}
        height={150}
        closeOnPressBack={true}
        closeOnPressMask={true}
        draggable={true}
        customStyles={{
          container: {borderTopLeftRadius: 20, borderTopRightRadius: 20},
        }}>
        <FileUploadRbSheet
          setDocument={setDocument}
          formik={formik}
          closeHandler={() => rbSheetRef.current?.close()}
        />
      </CommonRBSheet>
      <Popover
        onRequestClose={() => {
          setIsSuccessPopoverVisible(false);
          navigation.goBack();
        }}
        isVisible={isSuccessPopoverVisible}
        popoverStyle={{
          padding: 15,
          borderRadius: 8,
        }}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: 5,
          }}>
          <LottieView
            source={require('@assets/lottie/contact-us-success.json')}
            loop
            autoPlay
            style={{height: 80, width: 80}}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setIsSuccessPopoverVisible(false);
              navigation.goBack();
              Clipboard.setString(requestId!);
              Vibration.vibrate(100);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderWidth: 1,
              borderColor: appColors.buttonClear,
              paddingVertical: 5,
              borderRadius: 5,
              paddingHorizontal: 5,
            }}>
            <CommonText content={requestId} />
            <Icon
              type="feather"
              name="copy"
              color={appColors.primary}
              size={20}
            />
          </TouchableOpacity>
          <CommonText
            content="Thank you for reaching out! We've received your message and will respond shortly."
            size={'label'}
            style={{textAlign: 'center', paddingHorizontal: 20}}
          />
          <CommonButton
            title="Close"
            buttonType="clear"
            titleStyle={{paddingVertical: 2}}
            onPress={() => {
              setIsSuccessPopoverVisible(false);
              navigation.goBack();
            }}
          />
        </View>
      </Popover>
      <Modal visible={isLoading} animationType="fade" transparent={true}>
        <CommonLoader />
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default Help;

const styles = StyleSheet.create({});
