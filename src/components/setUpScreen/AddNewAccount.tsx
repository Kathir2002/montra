import {
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  useWindowDimensions,
  Vibration,
  View,
} from 'react-native';
import {paymentData, PaymentDataInterface, PaymentType} from '@assets/svg';

import React, {useContext, useEffect, useRef, useState} from 'react';
import {appColors} from '@shared/appColors';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import * as yup from 'yup';
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import CommonRBSheet, {
  RBSheetRef,
} from '@shared/components/commonRBSheet/CommonRBSheet';
import CommonText from '@shared/components/commonText/CommonText';
import CommonInput from '@shared/components/commonInput/CommonInput';
import {useFormik} from 'formik';
import CommonButton from '@shared/components/commonButton/CommonButton';

import {Divider, Input} from '@rneui/base';
import {appFonts} from '@shared/appFonts';

import LottieView from 'lottie-react-native';
import CommonDropDown from '@shared/components/commonDropdown/CommonDropDown';
import MoreIcon from '@assets/svg/more.svg';
import {Toast} from '@shared/ToastConfig';
import {useDispatch, useSelector} from 'react-redux';
import {updateCurrentUser} from '@store/slice/appSlice';
import {RootState} from '@store/store';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import AccountService from '@services/setup/accountService';
import AppContext from '@shared/appContext';
import DeleteIcon from '@assets/svg/delete.svg';
import Popover from 'react-native-popover-view/dist/Popover';
import {getCurrencySymbol} from '@src/lib/functions';

interface AccountRouteProps {
  provider: {
    providerName: string;
    providerCode: string;
  };
  balance: string;
  name: string;
  accountType: string;
  _id: string;
  fromAccountPage: boolean;
}

const AddNewAccount = () => {
  const route: RouteProp<{
    params: AccountRouteProps;
  }> = useRoute();

  // const route = {
  //   params: {
  //     provider: {
  //       providerName: 'Axis Bank',
  //       providerCode: 'axisBank',
  //     },
  //     balance: '2000',
  //     name: 'test name',
  //     accountType: 'Bank',
  //     _id: 'test',
  //   },
  // };

  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const [setupModalVisible, setSetupModalVisible] = useState(false);
  const [paymentDataList, setPaymentDataList] = useState({...paymentData});
  const [open, setOpen] = useState(false);
  const [isSuccessPopoverVisible, setIsSuccessPopoverVisible] = useState(false);
  const {setIsTransactionAdded} = useContext(AppContext);
  const dirtyRBSheetRef = useRef<RBSheetRef>(null);
  const deleteRBSheetRef = useRef<RBSheetRef>(null);

  const [isLoading, setIsLoading] = useState(false);
  const rbSheetRef = useRef<RBSheetRef>(null);
  const dispatch = useDispatch();
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);

  const validationSchema = yup.object().shape({
    name: yup.string().required('This field is required'),
    accountBalance: yup
      .string()
      .matches(
        /(?:₹|USD|EUR|AUG)?[a-zA-Z]*[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?/,
        'Enter a valid accountBalance',
      )
      .required('Enter account balance to continue'),
    accountType: yup
      .string()
      .label('accountType')
      .required('This field is required'),
    provider: yup.object().required('This field is required'),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      accountBalance: route?.params?.balance
        ? getCurrencySymbol(Number(route?.params?.balance))
        : '',
      name: route?.params?.name ? route?.params?.name : '',
      accountType: route?.params?.accountType ? route?.params?.accountType : '',
      provider: {
        providerName: route?.params?.provider?.providerName
          ? route?.params?.provider?.providerName
          : '',
        providerCode: route?.params?.provider?.providerCode
          ? route?.params?.provider?.providerCode
          : '',
      },
    },
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnMount: true,
    validateOnBlur: true,
    onSubmit: () =>
      route?.params?.accountType ? updateBankAccount() : addNewBankAccount(),
  });

  // useEffect to handle the native back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => backHandler.remove();
  }, [formik.dirty]);

  // Custom function to handle the back button press
  const handleBackPress = () => {
    if (formik.dirty) {
      dirtyRBSheetRef.current?.open();
      return true;
    } else {
      return false;
    }
  };

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      getWalletData();
    }
  }, [isFocused]);

  function isInputDirty(name: string) {
    let boolean =
      formik.getFieldMeta(name).value ===
      formik.getFieldMeta(name).initialValue;
    return !boolean;
  }

  const getWalletData = async () => {
    setIsLoading(true);
    await AccountService.getWalletList()
      .then((res: any) => {
        if (res?.success) {
          if (!route?.params?.accountType) {
            setPaymentDataList(prev => {
              res?.rows?.forEach((account: any) => {
                const {accountType, provider} = account;
                if (prev[accountType as keyof PaymentDataInterface]) {
                  prev[accountType as keyof PaymentDataInterface] = prev[
                    accountType as keyof PaymentDataInterface
                  ].filter(item => item.nameCode !== provider.providerCode);
                }
              });
              return prev;
            });
          }
        }
      })
      .catch(err => {
        console.log('Error in geting wallet list data', err?.response?.data);
        Toast({message: err?.response?.data?.message, type: 'error'});
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  /**
   * function to change the accountBalance format
   * @param accountBalance
   * @returns number
   */
  const stringToFloatHandler = (accountBalance: any) => {
    const stringWithoutCurrencySymbol = accountBalance?.replace(
      /[^0-9.-]/g,
      '',
    );
    const valueWithoutFormatting = parseFloat(stringWithoutCurrencySymbol);
    return valueWithoutFormatting;
  };

  /**
   * method to get the currency symbol
   * @param accountBalance, currencyCode
   */
  const getCurrencySymbolFormat = (accountBalance: any) => {
    if (formik?.values?.accountBalance) {
      let valueWithoutFormatting = stringToFloatHandler(accountBalance);
      formik.setFieldValue(
        'accountBalance',
        getCurrencySymbol(Number(valueWithoutFormatting)),
      );
    }
  };

  const addNewBankAccount = async () => {
    if (formik.values.provider.providerCode === '') {
      Toast({message: 'Please select a bank account', type: 'error'});
      return;
    }
    setIsLoading(true);
    const data = {
      balance: stringToFloatHandler(formik.values.accountBalance),
      provider: formik.values.provider,
      name: formik.values.name,
      accountType: formik.values.accountType,
    };
    await AccountService.addAccount(data)
      .then((res: any) => {
        if (res?.success) {
          Toast({message: res?.message, type: 'success'});
          setSetupModalVisible(true);
          setIsTransactionAdded(true);
          Vibration.vibrate(50);
          setTimeout(() => {
            dispatch(updateCurrentUser({...userDetails, isSetupDone: true}));
            setSetupModalVisible(false);
            route?.params?.fromAccountPage
              ? navigation.navigate('Account')
              : navigation.navigate('BottomTab', {screen: 'Dashboard'});
          }, 2000);
        }
      })
      .catch(err => {
        Toast({message: err?.response?.data?.message, type: 'error'});
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const updateBankAccount = async () => {
    if (formik.values.provider.providerCode === '') {
      Toast({message: 'Please select a bank account', type: 'error'});
      return;
    }
    setIsLoading(true);
    const data = {
      walletId: route?.params?._id,
      balance: isInputDirty('accountBalance')
        ? stringToFloatHandler(formik.values.accountBalance)
        : undefined,
      provider: isInputDirty('provider') ? formik.values.provider : undefined,
      name: isInputDirty('name') ? formik.values.name : undefined,
      accountType: isInputDirty('accountType')
        ? formik.values.accountType
        : undefined,
    };
    await AccountService.updateAccount(data)
      .then((res: any) => {
        if (res?.success) {
          Toast({message: res?.message, type: 'success'});
          setSetupModalVisible(true);
          setIsTransactionAdded(true);
          Vibration.vibrate(50);
          setTimeout(() => {
            setSetupModalVisible(false);
            route?.params?.fromAccountPage
              ? navigation.navigate('Account')
              : navigation.navigate('BottomTab', {screen: 'Dashboard'});
          }, 2000);
        }
      })
      .catch(err => {
        Toast({message: err?.response?.data?.message, type: 'error'});
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handlePress = (name: string, nameCode: string) => {
    const {provider} = formik.values;
    if (provider.providerCode === nameCode) {
      formik.setFieldValue('provider', {
        providerName: '',
        providerCode: '',
      });
    } else {
      formik.setFieldValue('provider', {
        providerName: name,
        providerCode: nameCode,
      });
      rbSheetRef.current?.close();
    }
  };

  const handleDeleteBankAccount = async () => {
    setIsLoading(true);
    const data = {
      bankAccountId: route?.params?._id,
      wallet: route?.params?.provider?.providerCode,
    };
    await AccountService.deleteWallet(data)
      .then((res: any) => {
        if (res?.success) {
          setIsLoading(false);
          deleteRBSheetRef.current?.close();
          setIsSuccessPopoverVisible(true);
          setIsTransactionAdded(true);
          Vibration.vibrate(50);
          setTimeout(() => {
            navigation.navigate('Account');
            setIsSuccessPopoverVisible(false);
          }, 2000);
        }
      })
      .catch(err => {
        deleteRBSheetRef.current?.close();
        setIsLoading(false);
        Toast({message: err?.response?.data?.message, type: 'error'});
      });
  };

  const displayedBanks =
    paymentDataList[formik.values.accountType as keyof PaymentDataInterface]
      ?.length > 8
      ? paymentDataList[
          formik.values.accountType as keyof PaymentDataInterface
        ]?.slice(0, 7)
      : paymentDataList[
          formik.values.accountType as keyof PaymentDataInterface
        ];

  displayedBanks?.length === 7
    ? displayedBanks?.splice(7, 0, {
        name: 'See More',
        nameCode: 'seeMore',
        image: MoreIcon,
      })
    : displayedBanks;
  return (
    <KeyboardAvoidingView
      onStartShouldSetResponder={() => {
        setOpen(false);
        return false;
      }}
      style={{
        flex: 1,
        backgroundColor: appColors.light,
      }}>
      <View
        style={{
          backgroundColor: appColors.primary,
          flex: 1,
          justifyContent: 'space-between',
        }}>
        <CommonHeader
          headerBgc={appColors.primary}
          title={`${route?.params?.accountType ? 'Edit' : 'Add New'} Wallet`}
          leftIconPressBack={() => {
            formik.dirty
              ? dirtyRBSheetRef.current?.open()
              : navigation.goBack();
          }}
          theme={'dark'}
          customRightHeaderComponent={
            route?.params?.accountType ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  deleteRBSheetRef.current?.open();
                }}>
                <DeleteIcon height={25} width={25} color={appColors.light} />
              </TouchableOpacity>
            ) : undefined
          }
        />
        <StatusBar
          backgroundColor={
            isSuccessPopoverVisible || isLoading
              ? appColors?.transparentBackground
              : appColors.primary
          }
          barStyle={'light-content'}
        />
        <View>
          <View style={{paddingHorizontal: 15}}>
            <CommonText
              content="Account Balance?"
              color={appColors.lightGrey}
              size={'header'}
            />
            <Input
              inputContainerStyle={{
                borderBottomWidth: 0,
              }}
              containerStyle={{paddingHorizontal: 0}}
              placeholder="₹00.0"
              placeholderTextColor={appColors.light}
              style={{
                color: appColors.light,
                fontSize: 32,
                fontFamily: appFonts.bold,
              }}
              value={String(formik.values.accountBalance)}
              onBlur={() => {
                formik.setFieldTouched('accountBalance', true);
                if (
                  (formik.values.accountBalance?.length >= 2 &&
                    (formik.values.accountBalance?.charAt(0) !== '.' ||
                      !isNaN(
                        Number(formik.values.accountBalance?.charAt(1)),
                      ))) ||
                  formik.values.accountBalance?.charAt(0) !== '.'
                ) {
                  getCurrencySymbolFormat(formik?.values?.accountBalance);
                }
              }}
              onChangeText={(text: string) => {
                formik.setFieldValue('accountBalance', text);
              }}
              keyboardType="numeric"
            />
          </View>
          <View
            style={{
              maxHeight: 350,
              backgroundColor: appColors.light,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
            }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              scrollEnabled
              nestedScrollEnabled
              contentContainerStyle={{
                flexGrow: 1,
                padding: 15,
                paddingTop: 20,
                paddingBottom: 30,
              }}>
              <View>
                <CommonInput
                  placeholder="Name"
                  value={formik.values.name}
                  error={
                    formik.errors.name && formik.touched.name
                      ? formik.errors.name
                      : undefined
                  }
                  onChangeText={(text: string) => {
                    formik.setFieldValue('name', text);
                  }}
                />
                <View
                  style={{
                    paddingTop:
                      (formik.errors.accountType &&
                        formik.touched.accountType) ||
                      (formik.errors.name && formik.touched.name)
                        ? 5
                        : 0,
                  }}>
                  <CommonDropDown
                    maxHeight={150}
                    items={[
                      {label: 'UPI', value: 'UPI'},
                      {label: 'Bank', value: 'Bank'},
                      {label: 'Pay Later', value: 'PayLater'},
                      {label: 'Cash', value: 'Cash'},
                    ]}
                    placeholder="Account Type"
                    open={open}
                    setOpen={setOpen}
                    zIndex={4}
                    value={formik.values.accountType}
                    setValue={() => undefined}
                    onSelectItem={val => {
                      formik.setFieldValue('accountType', val.value);
                    }}
                  />
                  {formik.errors.accountType && formik.touched.accountType ? (
                    <CommonText
                      style={{marginTop: 5, marginLeft: 5}}
                      content={formik.errors.accountType}
                      color={appColors.error}
                      size={'error'}
                    />
                  ) : undefined}
                </View>
                <View style={{zIndex: -1, paddingVertical: 10}}>
                  {formik.values.accountType !== '' ? (
                    <View>
                      <CommonText bold content={formik.values.accountType} />
                      <View
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          gap: 15,
                          marginVertical: 10,
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                        {displayedBanks?.map(
                          (item: PaymentType, index: number) => {
                            return (
                              <TouchableOpacity
                                activeOpacity={0.7}
                                key={index}
                                onPress={() => {
                                  index === 7
                                    ? rbSheetRef?.current?.open()
                                    : handlePress(item.name, item?.nameCode);
                                }}
                                style={{
                                  backgroundColor:
                                    formik.values.provider?.providerCode ===
                                    item?.nameCode
                                      ? appColors.buttonClear
                                      : appColors.formBorderColor,
                                  paddingHorizontal: 15,
                                  paddingVertical: 5,
                                  borderRadius: 8,
                                  borderWidth: 1,
                                  borderColor:
                                    formik.values.provider?.providerCode ===
                                    item?.nameCode
                                      ? appColors.primary
                                      : appColors.formBorderColor,
                                  elevation: 2,
                                }}>
                                <item.image height={45} width={45} />
                              </TouchableOpacity>
                            );
                          },
                        )}
                      </View>
                      {formik.errors.provider && formik.touched.provider ? (
                        <CommonText
                          content={formik.errors.provider as string}
                          color={appColors.error}
                          size={'error'}
                        />
                      ) : undefined}
                    </View>
                  ) : undefined}
                  <CommonButton
                    onPress={() => {
                      if (formik.errors.accountBalance) {
                        Toast({
                          message: formik.errors.accountBalance,
                          type: 'error',
                        });
                      }
                      if (
                        (formik.values.accountBalance?.length >= 2 &&
                          (formik.values.accountBalance?.charAt(0) !== '.' ||
                            !isNaN(
                              Number(formik.values.accountBalance?.charAt(1)),
                            ))) ||
                        formik.values.accountBalance?.charAt(0) !== '.'
                      ) {
                        getCurrencySymbolFormat(formik?.values?.accountBalance);
                      }

                      if (formik.dirty) {
                        formik.handleSubmit();
                      } else {
                        Toast({
                          message: "You don't have any changes to save!",
                          type: 'error',
                        });
                      }
                    }}
                    title={route?.params?.accountType ? 'Update' : 'Continue'}
                    buttonStyle={{marginVertical: 20}}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
      <Modal
        visible={setupModalVisible}
        animationType="fade"
        onRequestClose={() => setSetupModalVisible(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: appColors.light,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <LottieView
            source={require('@assets/lottie/sucess-lottie.json')}
            autoPlay
            loop
            style={{
              height: 150,
              width: 150,
            }}
          />
          <CommonText content="You are set!" color={appColors.dark} size={24} />
        </View>
      </Modal>
      <CommonRBSheet
        onOpen={() =>
          StatusBar.setBackgroundColor(appColors.transparentBackground)
        }
        onClose={() => StatusBar.setBackgroundColor(appColors.primary)}
        ref={rbSheetRef}
        height={300}
        closeOnPressBack={true}
        closeOnPressMask={true}
        draggable={true}
        customStyles={{
          container: {borderTopLeftRadius: 20, borderTopRightRadius: 20},
        }}>
        <CommonText
          content={formik.values.accountType}
          bold
          color={appColors.primary}
          size={'header'}
          style={{alignSelf: 'center'}}
        />
        <Divider style={{marginVertical: 5}} />
        <ScrollView contentContainerStyle={{paddingBottom: 20}}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 15,
              marginVertical: 10,
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 15,
            }}>
            {paymentDataList[
              formik.values.accountType as keyof PaymentDataInterface
            ]?.map((item: PaymentType, index: number) => {
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  key={index}
                  onPress={() => {
                    handlePress(item.name, item?.nameCode);
                  }}
                  style={{
                    backgroundColor:
                      formik.values.provider?.providerCode?.includes(
                        item?.nameCode,
                      )
                        ? appColors.buttonClear
                        : appColors.formBorderColor,
                    paddingHorizontal: 15,
                    paddingVertical: 5,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: formik.values.provider?.providerCode.includes(
                      item?.nameCode,
                    )
                      ? appColors.primary
                      : appColors.formBorderColor,
                    elevation: 2,
                  }}>
                  <item.image height={45} width={45} />
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </CommonRBSheet>
      <Modal visible={isLoading} transparent={true} animationType="fade">
        <CommonLoader />
      </Modal>
      <CommonRBSheet
        onClose={() => {
          StatusBar.setBackgroundColor(appColors.primary);
        }}
        onOpen={() =>
          StatusBar.setBackgroundColor(appColors.transparentBackground)
        }
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
            content="Exit from the Page?"
            bold
            size={'large'}
            style={{textAlign: 'center'}}
          />
          <CommonText
            content="You have unsaved changes..! Are you sure want to leave this page?"
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
                title="No"
                buttonType="clear"
                onPress={() => {
                  dirtyRBSheetRef.current?.close();
                }}
              />
            </View>
            <View style={{flex: 0.45}}>
              <CommonButton
                title="Yes"
                onPress={() => {
                  navigation.goBack();
                }}
              />
            </View>
          </View>
        </View>
      </CommonRBSheet>
      <CommonRBSheet
        onOpen={() => {
          StatusBar.setBackgroundColor(appColors.transparentBackground);
        }}
        onClose={() => {
          StatusBar.setBackgroundColor(appColors.primary);
        }}
        ref={deleteRBSheetRef}
        height={200}
        closeOnPressBack={true}
        closeOnPressMask={true}
        draggable={true}
        customStyles={{
          container: {borderTopLeftRadius: 20, borderTopRightRadius: 20},
        }}>
        <View style={{padding: 15, gap: 10}}>
          <CommonText
            content="Remove this wallet?"
            bold
            size={'large'}
            style={{textAlign: 'center'}}
          />
          <CommonText
            content="Are you sure do you wanna remove this wallet?"
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
                title="No"
                buttonType="clear"
                onPress={() => {
                  deleteRBSheetRef.current?.close();
                }}
              />
            </View>
            <View style={{flex: 0.45}}>
              <CommonButton title="Yes" onPress={handleDeleteBankAccount} />
            </View>
          </View>
        </View>
      </CommonRBSheet>
      <Popover
        isVisible={isSuccessPopoverVisible}
        popoverStyle={{
          padding: 15,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
        }}>
        <LottieView
          source={require('@assets/lottie/sucess-lottie.json')}
          loop
          autoPlay
          style={{height: 80, width: 80}}
        />
        <CommonText
          content="Wallet has been successfully removed"
          size={'label'}
          style={{textAlign: 'center', paddingHorizontal: 20}}
        />
      </Popover>
    </KeyboardAvoidingView>
  );
};

export default AddNewAccount;
