import {
  BackHandler,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import React, {
  FC,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import CommonDropDown from '@shared/components/commonDropdown/CommonDropDown';
import CommonButton from '@shared/components/commonButton/CommonButton';

import {Icon, Input} from '@rneui/base';
import {appFonts} from '@shared/appFonts';
import AttachmentIcon from '@assets/svg/attachment.svg';
import CloseIcon from '@assets/svg/close.svg';

import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import CommonSwitch from '@shared/components/commonSwitch/Switch';
import moment from 'moment';
import FileUploadRbSheet, {
  DocumentInterface,
} from '@shared/components/fileUploadRbSheet';
import ExcelIcon from '@assets/svg/fileFormats/excel.svg';
import PDFIcon from '@assets/svg/fileFormats/pdf.svg';
import WordIcon from '@assets/svg/fileFormats/word.svg';
import TransactionService from '@services/transactionService';
import {Toast} from '@shared/ToastConfig';
import CommonLoader from '../../shared/components/commonLoader/CommonLoader';
import AccountService from '@services/setup/accountService';
import TransferIcon from '@assets/svg/transfer.svg';
import {useSelector} from 'react-redux';
import {RootState} from '@store/store';
import AppContext from '@shared/appContext';
import {formatBytes, getCurrencySymbol} from '@src/lib/functions';
import {TransactionListInterface} from '@screens/Dashboard';
import {ItemTypeValue} from 'react-native-animated-dropdown-picker';
import Popover from 'react-native-popover-view';
import LottieView from 'lottie-react-native';
import CommonSlider from '../../shared/components/CommonSlider';
import BudgetService from '@services/setup/budgetSerice';

interface FormValues {
  newDropdownItem: string;
  description: string;
  notes: string;
  category: string;
  amount: string;
  wallet: string;
  endAfter: string;
  frequency: string;
  month: string;
  date: string;
  transactionDate: string;
  day: string;
  isRepeatSelected: boolean;
  from: {
    wallet: string;
    paymentMode: string;
  };
  to: {
    wallet: string;
    paymentMode: string;
  };
  paymentMode: string;
  currentScreenName: 'Expense' | 'Income' | 'Transfer' | 'Budget';
  isReceiveAlert: boolean;
  receiveAlertValue: number;
}
interface AddBudgetPayloadData {
  category: string;
  budget: number;
  month: Date;
  isReceiveAlert: boolean;
  alertValue?: number;
  budgetId?: string;
}
const CommonAddScreen: FC<{
  screenName: 'Transfer' | 'Income' | 'Expense' | 'Budget';
}> = ({screenName}) => {
  const route: RouteProp<{
    transactionDetails: TransactionListInterface & {
      budgetMonth: Date;
      budget: number;
      category: string;
      isReceiveAlert: boolean;
      alertValue: number;
    };
  }> = useRoute();

  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [dayOpen, setDayOpen] = useState(false);
  const [frequencyOpen, setFrequencyOpen] = useState(false);
  const [walletDropdownData, setWalletDropdownData] = useState([]);
  const [fromWalletDropdownData, setFromWalletDropdownData] = useState([]);
  const [toWalletDropdownData, setToWalletDropdownData] = useState([]);
  const [categoryDropdownData, setCategoryDropdownData] = useState<
    {label: string; value: string}[]
  >([]);
  const dirtyRBSheetRef = useRef<RBSheetRef>(null);
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const [isButtonLoader, setIsButtonLoader] = useState(false);
  const [isRepeactDateVisible, setIsRepeatDateVisible] = useState(false);
  const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);
  const {setIsTransactionAdded} = useContext(AppContext);
  const [isYearlyFrequencyDateVisible, setIsYearlyFrequencyDateVisible] =
    useState(false);
  const [isSuccessPopoverVisible, setIsSuccessPopoverVisible] = useState(false);
  const [dateVisible, setDateVisible] = useState(false);
  const [document, setDocument] = useState<DocumentInterface>();
  const [isLoading, setIsLoading] = useState(false);
  const rbSheetRef = useRef<RBSheetRef>(null);
  const [rbSheetOpen, setRbSheetOpen] = useState(false);
  const repeatRBSheetRef = useRef<RBSheetRef>(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      getWalletData();
    }
  }, [isFocused]);

  const getWalletData = async () => {
    setIsLoading(true);
    await AccountService.getWalletList()
      .then((res: any) => {
        if (res?.success) {
          setWalletDropdownData(
            res?.rows?.map((item: any) => ({
              label: item.provider?.providerName,
              value: item?.provider?.providerCode,
              data: item?.accountType,
            })),
          );
          setFromWalletDropdownData(
            res?.rows?.map((item: any) => ({
              label: item.provider?.providerName,
              value: item?.provider?.providerCode,
              data: item?.accountType,
            })),
          );
          setToWalletDropdownData(
            res?.rows?.map((item: any) => ({
              label: item.provider?.providerName,
              value: item?.provider?.providerCode,
              data: item?.accountType,
            })),
          );

          if (screenName === 'Transfer') {
            setIsLoading(false);
          } else {
            getCategoryData();
          }
        }
      })
      .catch(err => {
        Toast({message: err?.response?.data?.message, type: 'error'});
      });
  };

  const getCategoryData = async () => {
    await TransactionService.getTransactionCategory({
      type: screenName,
      isAdd: route?.params?.budget ? false : true,
    })
      .then((res: any) => {
        if (res?.success) {
          setIsLoading(false);
          res?.rows?.push({
            categoryName: '+ Add item',
            categoryId: 'custom',
          });

          setCategoryDropdownData(
            res?.rows?.map((item: any) => ({
              label: item.categoryName,
              value: item.categoryId,
            })),
          );
        }
      })
      .catch(err => {
        Toast({message: err?.response?.data?.message, type: 'error'});
        console.log(err);
        setIsLoading(false);
      });
  };

  const validationSchema = yup.object().shape({
    isRepeatSelected: yup.boolean(),
    isReceiveAlert: yup.boolean(),
    description: yup.string(),
    notes: yup.string().when('currentScreenName', (data, schema) => {
      if (data[0] === 'Expense' || data[0] === 'Income') {
        return schema.required('This field is required');
      }
      return schema;
    }),
    category: yup.string().when('currentScreenName', (data, schema) => {
      if (data[0] !== 'Transfer') {
        return schema.required('This field is required');
      }
      return schema;
    }),
    transactionDate: yup.date().when('currentScreenName', (data, schema) => {
      if (data[0] !== 'Budget') {
        return schema.required('Transaction date is required');
      }
      return schema;
    }),
    amount: yup
      .string()
      .matches(
        /(?:₹|USD|EUR|AUG)?[a-zA-Z]*[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?/,
        'Enter a valid amount',
      )
      .required(
        `Please Enter the ${
          screenName == 'Income'
            ? 'income'
            : screenName == 'Expense'
            ? 'expense'
            : screenName == 'Transfer'
            ? 'transfer'
            : 'budget'
        } amount`,
      ),
    wallet: yup.string().when('currentScreenName', (data, schema) => {
      if (data[0] === 'Expense' || data[0] === 'Income') {
        return schema.required('This field is required');
      }
      return schema;
    }),

    from: yup.object().when('currentScreenName', (data, schema) => {
      if (data[0] === 'Transfer') {
        return schema.required('This field is required');
      }
      return schema;
    }),
    to: yup.object().when('currentScreenName', (data, schema) => {
      if (data[0] === 'Transfer') {
        return schema.required('This field is required');
      }
      return schema;
    }),

    endAfter: yup.date().when('isRepeatSelected', (data, schema) => {
      if (data[0]) {
        return schema.required('This field is required');
      }
      return schema;
    }),
    receiveAlertValue: yup.date().when('isReceiveAlert', (data, schema) => {
      if (data[0]) {
        return schema.required('This field is required');
      }
      return schema;
    }),
    frequency: yup.string().when('isRepeatSelected', (data, schema) => {
      if (data[0]) {
        return schema.required('This field is required');
      }
      return schema;
    }),
    month: yup
      .string()
      .when(['isRepeatSelected', 'frequency'], (data, schema) => {
        if (data[0] && data[1] === 'yearly') {
          return schema.required('This field is required');
        }
        return schema;
      }),
    date: yup
      .string()
      .when(['isRepeatSelected', 'frequency'], (data, schema) => {
        if (
          (data[0] && data[1] === 'monthly') ||
          (data[0] && data[1] === 'yearly')
        ) {
          return schema.required('This field is required');
        }
        return schema;
      }),
    day: yup
      .string()
      .when(['isRepeatSelected', 'frequency'], (data, schema) => {
        if (data[0] && data[1] === 'weekly') {
          return schema.required('This field is required');
        }
        return schema;
      }),
  });

  const initialDate = useMemo(() => {
    return route?.params?.transactionDate
      ? route?.params?.transactionDate
      : new Date();
  }, []); // Initialize the date once

  const handleTransactionSubmit = async () => {
    setIsLoading(true);
    const formData = new FormData();
    if (document) {
      formData.append('file', {
        uri: document?.url,
        type: document?.type,
        name: document?.name,
      });
    }
    if (screenName !== 'Transfer') {
      formData.append('notes', formik.values.notes);
      formData.append('isRepeat', formik.values.isRepeatSelected);
      formData.append('transactionFor', formik.values.category);
    } else {
      formData.append(
        'from',
        JSON.stringify({
          wallet: formik.values.from.wallet,
          paymentMode: formik.values.from.paymentMode,
        }),
      );
      formData.append(
        'to',
        JSON.stringify({
          wallet: formik.values.to.wallet,
          paymentMode: formik.values.to.paymentMode,
        }),
      );
    }
    formData.append(
      'transactionDate',
      formik.values.transactionDate.toString(),
    );
    formData.append('paymentMode', formik.values.paymentMode);
    formData.append('wallet', formik.values.wallet);
    formData.append('amount', stringToFloatHandler(formik.values.amount));
    formData.append('type', screenName);
    if (formik.values.description !== '') {
      formData.append('description', formik.values.description);
    }
    if (formik.values.isRepeatSelected) {
      // Construct the frequency object
      const frequency: {
        day?: string;
        date?: string;
        month?: string;
        frequencyType: string;
      } = {
        frequencyType: formik.values.frequency,
      };
      if (formik.values.frequency === 'weekly') {
        frequency.day = formik.values.day;
      } else if (formik.values.frequency === 'monthly') {
        frequency.date = formik.values.date;
      } else if (formik.values.frequency === 'yearly') {
        frequency.date = formik.values.date;
        frequency.month = formik.values.month;
      }
      formData.append(
        'endAfter',
        new Date(formik.values.endAfter).toISOString(),
      );
      formData.append('frequency', JSON.stringify(frequency));
    }

    TransactionService.addTransaction(formData)
      .then((res: any) => {
        if (res?.success) {
          setIsSuccessPopoverVisible(true);
          Vibration.vibrate(50);
          setIsTransactionAdded(true);
          setTimeout(() => {
            setIsSuccessPopoverVisible(false);
            Toast({message: res?.message, type: 'success'});
            navigation.navigate('BottomTab', {screen: 'Transaction'});
          }, 2000);
        } else {
          Toast({message: res?.message, type: 'error'});
        }
        setIsLoading(false);
      })
      .catch(err => {
        Toast({message: err?.response?.data?.message, type: 'error'});
        console.log(err.response?.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const updateTransaction = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('id', route?.params?._id);
    if (document) {
      formData.append('file', {
        uri: document?.url,
        type: document?.type,
        name: document?.name,
      });
    }
    if (screenName !== 'Transfer') {
      formData.append('notes', formik.values.notes);
      formData.append('isRepeat', formik.values.isRepeatSelected);
      formData.append('transactionFor', formik.values.category);
    } else {
      formData.append(
        'from',
        JSON.stringify({
          wallet: formik.values.from.wallet,
          paymentMode: formik.values.from.paymentMode,
        }),
      );
      formData.append(
        'to',
        JSON.stringify({
          wallet: formik.values.to.wallet,
          paymentMode: formik.values.to.paymentMode,
        }),
      );
    }
    formData.append(
      'transactionDate',
      formik.values.transactionDate.toString(),
    );
    formData.append('paymentMode', formik.values.paymentMode);
    formData.append('wallet', formik.values.wallet);
    formData.append('amount', stringToFloatHandler(formik.values.amount));
    formData.append('type', screenName);
    if (formik.values.description !== '') {
      formData.append('description', formik.values.description);
    }
    if (formik.values.isRepeatSelected) {
      // Construct the frequency object
      const frequency: {
        day?: string;
        date?: string;
        month?: string;
        frequencyType: string;
      } = {
        frequencyType: formik.values.frequency,
      };
      if (formik.values.frequency === 'weekly') {
        frequency.day = formik.values.day;
      } else if (formik.values.frequency === 'monthly') {
        frequency.date = formik.values.date;
      } else if (formik.values.frequency === 'yearly') {
        frequency.date = formik.values.date;
        frequency.month = formik.values.month;
      }
      formData.append(
        'endAfter',
        new Date(formik.values.endAfter).toISOString(),
      );
      formData.append('frequency', JSON.stringify(frequency));
    }
    TransactionService.updateTransaction(formData)
      .then((res: any) => {
        if (res?.success) {
          Vibration.vibrate(50);
          setIsSuccessPopoverVisible(true);
          setIsTransactionAdded(true);
          setTimeout(() => {
            navigation.navigate('BottomTab', {screen: 'Transaction'});
            Toast({message: res?.message, type: 'success'});
            setIsSuccessPopoverVisible(false);
          }, 2000);
        } else {
          Toast({message: res?.message, type: 'error'});
        }
        setIsLoading(false);
      })
      .catch(err => {
        Toast({message: err?.response?.data?.message, type: 'error'});
        console.log(err.response);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const addBudgetHandler = async () => {
    setIsLoading(true);
    const data: AddBudgetPayloadData = {
      category: formik.values?.category,
      budget: stringToFloatHandler(formik?.values?.amount),
      month: new Date(route?.params?.budgetMonth),
      isReceiveAlert: formik.values.isReceiveAlert,
    };
    if (formik.values.isReceiveAlert) {
      data['alertValue'] = formik.values.receiveAlertValue;
    }
    await BudgetService.addBudget(data)
      .then((res: any) => {
        if (res?.success) {
          Vibration.vibrate(50);
          setIsLoading(false);
          setIsSuccessPopoverVisible(true);
          setTimeout(() => {
            navigation.navigate('BottomTab', {screen: 'Budget'});
            Toast({message: res?.message, type: 'success'});
            setIsSuccessPopoverVisible(false);
          }, 2000);
        }
      })
      .catch(err => {
        Toast({message: err?.response?.data?.message, type: 'error'});
        setIsLoading(false);
      });
  };

  const updateBudgetHandler = async () => {
    setIsLoading(true);
    const data: AddBudgetPayloadData = {
      category: formik.values?.category,
      budget: stringToFloatHandler(formik?.values?.amount),
      month: new Date(route?.params?.budgetMonth),
      isReceiveAlert: formik.values.isReceiveAlert,
      budgetId: route?.params._id,
    };
    if (formik.values.isReceiveAlert) {
      data['alertValue'] = formik.values.receiveAlertValue;
    }
    await BudgetService.updateBudget(data)
      .then((res: any) => {
        if (res?.success) {
          Vibration.vibrate(50);
          setIsSuccessPopoverVisible(true);
          setIsTransactionAdded(true);
          setTimeout(() => {
            navigation.navigate('Budget');
            Toast({message: res?.message, type: 'success'});
            setIsSuccessPopoverVisible(false);
          }, 2000);
        }
      })
      .catch(err => {
        setIsLoading(false);
        Toast({message: err?.response?.data?.message, type: 'error'});
      });
  };

  const formik = useFormik<FormValues>({
    enableReinitialize: true,
    initialValues: {
      newDropdownItem: '',
      description: route?.params?.description ? route?.params?.description : '',
      notes: route?.params?.notes ? route?.params?.notes : '',
      category:
        screenName === 'Budget'
          ? route?.params?.category
            ? route?.params?.category
            : ''
          : route?.params?.transactionFor
          ? route?.params?.transactionFor
          : '',
      amount: route?.params?.amount
        ? getCurrencySymbol(Number(route?.params?.amount))
        : screenName === 'Budget'
        ? route?.params?.budget
          ? getCurrencySymbol(Number(route?.params?.budget))
          : ''
        : '',
      wallet: route?.params?.wallet ? route?.params?.wallet : '',
      endAfter: route?.params?.endAfter ? route?.params?.endAfter : '',
      frequency: route?.params?.frequency?.frequencyType
        ? route?.params?.frequency?.frequencyType
        : '',
      month: route?.params?.frequency?.month
        ? route?.params?.frequency?.month
        : '',
      date: route?.params?.frequency?.date
        ? String(route?.params?.frequency?.date)
        : '',
      day: route?.params?.frequency?.day ? route?.params?.frequency?.day : '',
      from: {
        wallet: route?.params?.from?.wallet ? route?.params?.from?.wallet : '',
        paymentMode: route?.params?.from?.paymentMode
          ? route?.params?.from?.paymentMode
          : '',
      },
      to: {
        wallet: route?.params?.to?.wallet ? route?.params?.to?.wallet : '',
        paymentMode: route?.params?.to?.paymentMode
          ? route?.params?.to?.paymentMode
          : '',
      },
      isRepeatSelected: route?.params?.frequency?.frequencyType ? true : false,
      currentScreenName: route?.params?.transactionType
        ? route?.params?.transactionType
        : screenName,
      paymentMode: route?.params?.paymentMode ? route?.params?.paymentMode : '',
      transactionDate: route?.params?.transactionDate
        ? String(route?.params?.transactionDate)
        : '',
      isReceiveAlert: route?.params?.isReceiveAlert ? true : false,
      receiveAlertValue: route?.params?.alertValue
        ? route?.params?.alertValue
        : 80,
    },
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnMount: true,
    validateOnBlur: true,
    onSubmit: () => {
      if (screenName == 'Budget') {
        route?.params?.budget ? updateBudgetHandler() : addBudgetHandler();
      } else {
        route?.params?.amount ? updateTransaction() : handleTransactionSubmit();
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
  }, [formik.dirty, document]);

  // Custom function to handle the back button press
  const handleBackPress = () => {
    if (formik.dirty || document) {
      dirtyRBSheetRef.current?.open();
      return true;
    } else {
      return false;
    }
  };

  /**
   * function to change the amount format
   * @param amount
   * @returns number
   */
  const stringToFloatHandler = (amount: any) => {
    const stringWithoutCurrencySymbol = amount?.replace(/[^0-9.-]/g, '');
    const valueWithoutFormatting = parseFloat(stringWithoutCurrencySymbol);
    return valueWithoutFormatting;
  };

  /**
   * method to get the currency symbol
   * @param amount, currencyCode
   */
  const getCurrencySymbolFormat = (amount: any) => {
    if (formik?.values?.amount) {
      let valueWithoutFormatting = stringToFloatHandler(amount);
      formik.setFieldValue(
        'amount',
        getCurrencySymbol(Number(valueWithoutFormatting)),
      );
    }
  };

  const endAfterOnChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (event.type === 'set') {
      setIsRepeatDateVisible(false);
      formik.setFieldTouched('endAfter', true);
      formik.setFieldValue('endAfter', selectedDate);
    } else {
      setIsRepeatDateVisible(false);
    }
  };
  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'set') {
      setDateVisible(false);
      formik.setFieldValue('transactionDate', selectedDate);
    } else {
      setDateVisible(false);
    }
  };

  const dates = Array.from({length: 31}, (_, i) => {
    const date = i + 1;
    return {label: date.toString(), value: date.toString()};
  });

  const days = [
    {label: 'Sunday', value: 0},
    {label: 'Monday', value: 1},
    {label: 'Tuesday', value: 2},
    {label: 'Wednesday', value: 3},
    {label: 'Thursday', value: 4},
    {label: 'Friday', value: 5},
    {label: 'Saturday', value: 6},
  ];

  const isFieldValid = (fieldName: keyof FormValues) => {
    console.log(formik.errors[fieldName], formik.touched[fieldName], fieldName);

    return !formik.errors[fieldName] && formik.touched[fieldName];
  };

  const rbSheetNextHandler = async () => {
    if (formik.values.frequency == '') {
      repeatRBSheetRef.current?.close();
      setRbSheetOpen(false);
      formik.setFieldValue('isRepeatSelected', false);
    } else {
      formik.validateField('endAfter');
      if (formik.values.frequency == 'weekly') {
        formik.validateField('day');
      } else if (formik.values.frequency == 'monthly') {
        formik.validateField('date');
      } else if (formik.values.frequency == 'yearly') {
        formik.validateField('date');
        formik.validateField('month');
      }

      if (
        (formik.values.frequency == 'daily' && isFieldValid('endAfter')) ||
        (formik.values.frequency == 'weekly' &&
          isFieldValid('day') &&
          isFieldValid('endAfter')) ||
        (formik.values.frequency == 'monthly' &&
          isFieldValid('endAfter') &&
          isFieldValid('date')) ||
        (formik.values.frequency == 'yearly' &&
          isFieldValid('endAfter') &&
          isFieldValid('date') &&
          isFieldValid('month'))
      ) {
        repeatRBSheetRef.current?.close();
        setRbSheetOpen(false);
      }
    }
  };
  const dropdownCloseHandler = () => {
    setFrequencyOpen(false);
    setFromOpen(false);
    setToOpen(false);
    setWalletOpen(false);
    setDateOpen(false);
    setDayOpen(false);
  };

  const handleAddNewDropdownItem = async () => {
    setIsButtonLoader(true);
    const data = {
      type: screenName,
      categoryName: formik?.values?.newDropdownItem,
      categoryId: formik?.values?.newDropdownItem,
    };
    await TransactionService.addTransactionCategory(data)
      .then((res: any) => {
        if (res?.success) {
          formik.setFieldValue('newDropdownItem', '');
          formik.setFieldValue('categoryId', '');
          Toast({message: res?.message, type: 'success'});
          setCategoryDropdownData(
            res?.category?.map((item: any) => ({
              label: item.categoryName,
              value: item.categoryId,
            })),
          );
          setIsButtonLoader(false);
          setIsAddPopoverOpen(false);
        }
      })
      .catch(err => {
        setIsButtonLoader(false);
        setIsAddPopoverOpen(false);
        console.log('Error in adding new transaction category', err);
        Toast({message: err?.message, type: 'error'});
      });
  };
  return (
    <KeyboardAvoidingView
      onStartShouldSetResponder={() => {
        setCategoryOpen(false);
        setWalletOpen(false);
        setFromOpen(false);
        setToOpen(false);

        return false;
      }}
      style={{
        flex: 1,
        backgroundColor: appColors.light,
      }}>
      <View
        style={{
          backgroundColor:
            screenName == 'Income'
              ? appColors.incomeBg
              : screenName == 'Expense'
              ? appColors.expenseBg
              : screenName === 'Transfer'
              ? appColors.transferBg
              : appColors.primary,
          flex: 1,
          justifyContent: 'space-between',
        }}>
        <CommonHeader
          headerBgc={
            screenName == 'Income'
              ? appColors.incomeBg
              : screenName == 'Expense'
              ? appColors.expenseBg
              : screenName === 'Transfer'
              ? appColors.transferBg
              : appColors.primary
          }
          title={
            screenName == 'Budget'
              ? `${route?.params?.budget ? 'Edit' : 'Create'} Budget`
              : screenName
          }
          leftIconPressBack={() => {
            formik.dirty || document
              ? dirtyRBSheetRef.current?.open()
              : navigation.goBack();
          }}
          theme={'dark'}
        />
        <StatusBar
          backgroundColor={
            rbSheetOpen ||
            isSuccessPopoverVisible ||
            isLoading ||
            isAddPopoverOpen
              ? appColors.transparentBackground
              : screenName == 'Income'
              ? appColors.incomeBg
              : screenName == 'Expense'
              ? appColors.expenseBg
              : screenName === 'Transfer'
              ? appColors.transferBg
              : appColors.primary
          }
          barStyle={'light-content'}
        />
        <View>
          <View style={{paddingHorizontal: 15}}>
            <CommonText
              content={
                screenName == 'Budget'
                  ? 'How much do yo want to spend?'
                  : 'How much?'
              }
              color={appColors.lightGrey}
              size={'header'}
            />
            <Input
              onPress={dropdownCloseHandler}
              inputContainerStyle={{
                borderBottomWidth: 0,
              }}
              containerStyle={{paddingHorizontal: 0}}
              placeholder={getCurrencySymbol(0)}
              placeholderTextColor={appColors.light}
              style={{
                color: appColors.light,
                fontSize: 32,
                fontFamily: appFonts.bold,
              }}
              value={formik.values.amount}
              onBlur={() => {
                formik.setFieldTouched('amount', true);
                if (
                  (formik.values.amount?.length >= 2 &&
                    (formik.values.amount?.charAt(0) !== '.' ||
                      !isNaN(Number(formik.values.amount?.charAt(1))))) ||
                  formik.values.amount?.charAt(0) !== '.'
                ) {
                  getCurrencySymbolFormat(formik?.values?.amount);
                }
              }}
              onChangeText={(text: string) => {
                const cleanedText = text?.replace(/[^0-9.]/g, '');
                formik.setFieldValue('amount', cleanedText);
              }}
              keyboardType="numeric"
            />
          </View>
          <View
            style={{
              maxHeight: 450,
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
              }}>
              {screenName === 'Transfer' ? (
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <View
                    style={{
                      flex: 0.455,
                      paddingTop:
                        (formik.errors.wallet && formik.touched.wallet) ||
                        (formik.errors.description &&
                          formik.touched.description)
                          ? 5
                          : 0,
                    }}>
                    <CommonDropDown
                      items={fromWalletDropdownData}
                      placeholder="From"
                      open={fromOpen}
                      setOpen={setFromOpen}
                      zIndex={4}
                      onPress={() => {
                        setToOpen(false);
                      }}
                      value={formik.values.from.wallet}
                      setValue={() => undefined}
                      onSelectItem={val => {
                        formik.setFieldValue('from', {
                          wallet: val.value,
                          paymentMode: val.data,
                        });
                        setToWalletDropdownData(prev => {
                          return prev?.filter(
                            (item: ItemTypeValue) => item?.value !== val?.value,
                          );
                        });
                      }}
                    />
                    {formik.errors.from && formik.touched.from ? (
                      <CommonText
                        style={{marginTop: 5, marginLeft: 5}}
                        content={formik.errors.from.wallet}
                        color={appColors.error}
                        size={'error'}
                      />
                    ) : undefined}
                  </View>
                  <View
                    style={{
                      backgroundColor: appColors.light,
                      borderWidth: 1,
                      borderColor: appColors.formBorderColor,
                      padding: 8,
                      borderRadius: 40,
                      position: 'absolute',
                      left: 157,
                      bottom: 15,
                      zIndex: 1,
                    }}>
                    <TransferIcon height={28} width={28} />
                  </View>
                  <View
                    style={{
                      flex: 0.455,
                      paddingTop:
                        (formik.errors.wallet && formik.touched.wallet) ||
                        (formik.errors.description &&
                          formik.touched.description)
                          ? 5
                          : 0,
                    }}>
                    <CommonDropDown
                      items={toWalletDropdownData}
                      placeholder="To"
                      open={toOpen}
                      setOpen={setToOpen}
                      zIndex={4}
                      onPress={() => {
                        setFromOpen(false);
                      }}
                      value={formik.values.to.wallet}
                      setValue={() => undefined}
                      onSelectItem={val => {
                        formik.setFieldValue('to', {
                          wallet: val.value,
                          paymentMode: val.data,
                        });
                        setFromWalletDropdownData(prev => {
                          return prev?.filter(
                            (item: ItemTypeValue) => item?.value !== val?.value,
                          );
                        });
                      }}
                    />
                    {formik.errors.to && formik.touched.to ? (
                      <CommonText
                        style={{marginTop: 5, marginLeft: 5}}
                        content={formik.errors.to.wallet}
                        color={appColors.error}
                        size={'error'}
                      />
                    ) : undefined}
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    paddingTop:
                      (formik.errors.category && formik.touched.category) ||
                      (formik.errors.description && formik.touched.description)
                        ? 5
                        : 0,
                  }}>
                  <CommonDropDown
                    items={categoryDropdownData}
                    placeholder="Category"
                    open={categoryOpen}
                    setOpen={setCategoryOpen}
                    zIndex={4}
                    value={formik.values.category}
                    setValue={() => undefined}
                    onSelectItem={val => {
                      if (val?.value == 'custom') {
                        setIsAddPopoverOpen(true);
                      } else {
                        formik.setFieldValue('category', val.value);
                      }
                    }}
                  />
                  {formik.errors.category && formik.touched.category ? (
                    <CommonText
                      style={{
                        marginLeft: 5,
                        marginBottom: formik.touched.description ? 5 : 0,
                      }}
                      content={formik.errors.category}
                      color={appColors.error}
                      size={'error'}
                    />
                  ) : undefined}
                </View>
              )}
              {screenName !== 'Budget' && (
                <View>
                  <CommonInput
                    onPress={dropdownCloseHandler}
                    placeholder="Notes"
                    value={formik.values.notes}
                    error={
                      formik.errors.notes && formik.touched.notes
                        ? formik.errors.notes
                        : undefined
                    }
                    onChangeText={(text: string) => {
                      formik.setFieldValue('notes', text);
                    }}
                  />
                  <CommonInput
                    onPress={dropdownCloseHandler}
                    placeholder="Description"
                    value={formik.values.description}
                    error={
                      formik.errors.description && formik.touched.description
                        ? formik.errors.description
                        : undefined
                    }
                    onChangeText={(text: string) => {
                      formik.setFieldValue('description', text);
                    }}
                  />
                  {screenName !== 'Transfer' ? (
                    <View
                      style={{
                        paddingTop:
                          (formik.errors.wallet && formik.touched.wallet) ||
                          (formik.errors.description &&
                            formik.touched.description)
                            ? 5
                            : 0,
                      }}>
                      <CommonDropDown
                        items={walletDropdownData}
                        placeholder="Wallet"
                        open={walletOpen}
                        setOpen={setWalletOpen}
                        zIndex={4}
                        value={formik.values.wallet}
                        setValue={() => undefined}
                        onSelectItem={val => {
                          formik.setFieldValue('wallet', val.value);
                          formik.setFieldValue('paymentMode', val.data);
                        }}
                      />
                      {formik.errors.wallet && formik.touched.wallet ? (
                        <CommonText
                          style={{marginTop: 5, marginLeft: 5}}
                          content={formik.errors.wallet}
                          color={appColors.error}
                          size={'error'}
                        />
                      ) : undefined}
                    </View>
                  ) : undefined}

                  <CommonInput
                    onPress={dropdownCloseHandler}
                    placeholder="Date"
                    value={
                      formik.values.transactionDate !== ''
                        ? moment(formik.values.transactionDate).format(
                            'DD MMM YYYY',
                          )
                        : ''
                    }
                    editable={false}
                    error={
                      formik.errors.transactionDate &&
                      formik.touched.transactionDate
                        ? formik.errors.transactionDate
                        : ''
                    }
                    onChangeText={undefined}
                    rightIcon={
                      <TouchableOpacity
                        onPress={() => {
                          setDateVisible(true);
                        }}>
                        <Icon
                          name={'calendar'}
                          type={'entypo'}
                          size={20}
                          color={appColors.dark}
                        />
                      </TouchableOpacity>
                    }
                  />
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
                        content="Add attachment"
                        color={appColors.placeholderColor}
                        size={'medium'}
                      />
                    </TouchableOpacity>
                  ) : document?.type == 'image/jpeg' ? (
                    <View>
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
                          setDocument(undefined);
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
                    </View>
                  ) : (
                    <View style={{width: 200}}>
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
                        {document?.type == 'application/pdf' ? (
                          <PDFIcon width={35} height={35} />
                        ) : document?.type == 'application/msword' ? (
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
                          setDocument(undefined);
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
                    </View>
                  )}
                  {screenName !== 'Transfer' ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 10,
                      }}>
                      <View>
                        <CommonText size={'medium'} bold content="Repeat" />
                        <CommonText
                          size={'medium'}
                          content={`Repeat transaction${
                            formik.values.isRepeatSelected
                              ? ', set your own time'
                              : ''
                          }`}
                          color={appColors.placeholderColor}
                        />
                      </View>
                      <CommonSwitch
                        activeColor={appColors.primary}
                        value={formik.values.isRepeatSelected}
                        style={{transform: [{scaleX: 0.8}, {scaleY: 0.8}]}}
                        onValueChange={() => {
                          if (formik.values.isRepeatSelected) {
                            formik.setFieldValue('isRepeatSelected', false);
                            formik.setFieldValue('month', '');
                            formik.setFieldValue('endAfter', '');
                            formik.setFieldValue('day', '');
                            formik.setFieldValue('date', '');
                            formik.setFieldValue('frequency', '');
                          } else {
                            repeatRBSheetRef.current?.open();
                            setRbSheetOpen(true);
                            formik.setFieldValue('isRepeatSelected', true);
                          }
                        }}
                        inActiveColor={appColors.placeholderColor}
                      />
                    </View>
                  ) : undefined}
                  {formik.values.isRepeatSelected ? (
                    <View
                      style={{
                        marginTop: 15,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <View>
                        <CommonText
                          content="Frequency"
                          bold
                          color={appColors.dark}
                        />
                        <CommonText
                          content={undefined}
                          color={appColors.placeholderColor}>
                          {formik.values.frequency}
                          {formik.values.frequency == 'daily' ? '' : ' - '}
                          {formik.values.frequency === 'yearly' ? (
                            <CommonText
                              color={appColors.placeholderColor}
                              content={moment()
                                .month(Number(formik.values.month) - 1)
                                .date(Number(formik.values.date))
                                .format('MMM, Do')}
                            />
                          ) : formik.values.frequency == 'monthly' ? (
                            <CommonText
                              content={moment()
                                .date(Number(formik.values.date))
                                .format('Do')}
                              color={appColors.placeholderColor}
                            />
                          ) : formik.values.frequency == 'weekly' ? (
                            <CommonText
                              color={appColors.placeholderColor}
                              content={days[formik.values.day as any]?.label}
                            />
                          ) : undefined}
                        </CommonText>
                      </View>
                      <View>
                        <CommonText
                          content="End After"
                          bold
                          color={appColors.dark}
                        />
                        <CommonText
                          content={moment(formik.values.endAfter).format(
                            'D MMMM YYYY',
                          )}
                          color={appColors.placeholderColor}
                        />
                      </View>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          formik.setFieldTouched('endAfter', true);
                          if (formik.values.frequency === 'weekly') {
                            formik.setFieldTouched('day', true);
                            formik.setFieldValue(
                              'month',
                              formik.initialValues.month,
                            );
                            formik.setFieldValue(
                              'date',
                              formik.initialValues.date,
                            );
                          } else if (formik.values.frequency === 'monthly') {
                            formik.setFieldTouched('date', true);
                            formik.setFieldValue(
                              'day',
                              formik.initialValues.day,
                            );
                            formik.setFieldValue(
                              'month',
                              formik.initialValues.month,
                            );
                          } else if (formik.values?.frequency === 'yearly') {
                            formik.setFieldTouched('month', true);
                            formik.setFieldTouched('date', true);
                            formik.setFieldValue(
                              'day',
                              formik.initialValues.day,
                            );
                          }
                          repeatRBSheetRef.current?.open();
                          setRbSheetOpen(true);
                        }}
                        style={{
                          backgroundColor: appColors.buttonClear,
                          paddingVertical: 5,
                          borderRadius: 15,
                          paddingHorizontal: 10,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <CommonText content="Edit" color={appColors.primary} />
                      </TouchableOpacity>
                    </View>
                  ) : undefined}
                </View>
              )}
              {screenName == 'Budget' && (
                <View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <View style={{flex: 0.7, gap: 5}}>
                      <CommonText bold content="Receive Alert" />
                      <CommonText
                        color={appColors.placeholderColor}
                        style={{textAlign: 'justify'}}
                        content="Receive alert when it reaches some point."
                      />
                    </View>
                    <CommonSwitch
                      inActiveColor={appColors.placeholderColor}
                      activeColor={appColors.primary}
                      onValueChange={() => {
                        if (formik?.values?.isReceiveAlert) {
                          formik.setFieldValue('isReceiveAlert', false);
                        } else {
                          formik.setFieldValue('isReceiveAlert', true);
                        }
                      }}
                      value={formik?.values?.isReceiveAlert}
                      style={{
                        transform: [{scaleX: 0.8}, {scaleY: 0.8}],
                      }}
                    />
                  </View>
                  {formik?.values?.isReceiveAlert && (
                    <CommonSlider
                      min={0}
                      max={100}
                      defaultStartValue={
                        route?.params?.alertValue
                          ? route?.params?.alertValue
                          : 80
                      }
                      step={10}
                      sliderWidth={Dimensions.get('window').width - 60}
                      onValueChange={val => {
                        formik.setFieldValue('receiveAlertValue', val);
                      }}
                    />
                  )}
                </View>
              )}
              <View style={{zIndex: -1, paddingVertical: 10}}>
                <CommonButton
                  onPress={() => {
                    if (formik.errors.amount) {
                      Toast({message: formik.errors.amount, type: 'error'});
                    }
                    if (
                      (formik.values.amount?.length >= 2 &&
                        (formik.values.amount?.charAt(0) !== '.' ||
                          !isNaN(Number(formik.values.amount?.charAt(1))))) ||
                      formik.values.amount?.charAt(0) !== '.'
                    ) {
                      getCurrencySymbolFormat(formik?.values?.amount);
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
                  title={
                    route?.params?.amount || route?.params?.budget
                      ? 'Update'
                      : 'Continue'
                  }
                  buttonStyle={{marginVertical: 20}}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
      <CommonRBSheet
        onOpen={() =>
          StatusBar.setBackgroundColor(appColors.transparentBackground)
        }
        onClose={() =>
          StatusBar.setBackgroundColor(
            screenName == 'Income'
              ? appColors.incomeBg
              : screenName == 'Expense'
              ? appColors.expenseBg
              : appColors.transferBg,
          )
        }
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
          closeHandler={() => rbSheetRef.current?.close()}
        />
      </CommonRBSheet>
      <CommonRBSheet
        onClose={() => {
          setRbSheetOpen(false);
          setDateOpen(false);
          setDayOpen(false);
          setFrequencyOpen(false);
          setCategoryOpen(false);
          setDateOpen(false);
        }}
        ref={repeatRBSheetRef}
        height={300}
        closeOnPressBack={formik.isValid || !formik.dirty ? true : false}
        closeOnPressMask={formik.isValid || !formik.dirty ? true : false}
        draggable={true}
        dragNotClose={true}
        customStyles={{
          container: {borderTopLeftRadius: 20, borderTopRightRadius: 20},
        }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 15,
            paddingTop: 10,
            paddingBottom: 20,
            flexGrow: 1,
            backgroundColor: appColors.light,
          }}>
          <View
            style={{
              paddingTop:
                (formik.errors.category && formik.touched.category) ||
                (formik.errors.description && formik.touched.description)
                  ? 5
                  : 0,
            }}>
            <CommonDropDown
              maxHeight={150}
              items={[
                {
                  label: 'Daily',
                  value: 'daily',
                },
                {
                  label: 'Weekly',
                  value: 'weekly',
                },
                {
                  label: 'Monthly',
                  value: 'monthly',
                },
                {
                  label: 'Yearly',
                  value: 'yearly',
                },
              ]}
              placeholder="Frequency"
              open={frequencyOpen}
              setOpen={setFrequencyOpen}
              onPress={() => {
                setDateOpen(false);
                setDayOpen(false);
                formik.setFieldTouched('day', true);
              }}
              zIndex={4}
              value={formik.values.frequency}
              setValue={() => undefined}
              onSelectItem={val => {
                formik.setFieldValue('frequency', val.value);
              }}
            />
            {formik.errors.frequency && formik.touched.frequency ? (
              <CommonText
                style={{
                  marginLeft: 5,
                }}
                content={formik.errors.frequency}
                color={appColors.error}
                size={'error'}
              />
            ) : undefined}
          </View>
          <View
            style={{
              marginBottom:
                (formik.errors.date && formik.touched.date) ||
                (formik.errors.day && formik.touched.day) ||
                (formik.errors.month && formik.touched.month)
                  ? 10
                  : 0,
            }}>
            {formik.values.frequency == 'yearly' && (
              <CommonInput
                onPress={dropdownCloseHandler}
                placeholder="Month, Date"
                value={
                  formik.values.month !== ''
                    ? moment()
                        .month(Number(formik.values.month) - 1)
                        .date(Number(formik.values?.date))
                        .format('MMM, Do')
                    : ''
                }
                editable={false}
                error={
                  formik.errors.date && formik.touched.date
                    ? formik.errors.date
                    : ''
                }
                onChangeText={undefined}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => {
                      setIsYearlyFrequencyDateVisible(true);
                    }}>
                    <Icon
                      name={'calendar'}
                      type={'entypo'}
                      size={20}
                      color={appColors.dark}
                    />
                  </TouchableOpacity>
                }
              />
            )}
            {formik.values.frequency == 'monthly' && (
              <View>
                <CommonDropDown
                  maxHeight={150}
                  dropDownStyle={{width: '100%'}}
                  dropDownContainerStyle={{width: '100%'}}
                  items={dates}
                  placeholder="Date"
                  open={dateOpen}
                  onPress={() => {
                    setDayOpen(false);
                    setFrequencyOpen(false);
                    formik.setFieldTouched('date', true);
                  }}
                  setOpen={setDateOpen}
                  zIndex={4}
                  value={formik.values.date}
                  setValue={() => undefined}
                  onSelectItem={val => {
                    formik.setFieldValue('date', val.value);
                  }}
                />
                {formik.errors.date && formik.touched.date ? (
                  <CommonText
                    style={{
                      marginLeft: 5,
                      marginTop: -10,
                    }}
                    content={formik.errors.date}
                    color={appColors.error}
                    size={'error'}
                  />
                ) : undefined}
              </View>
            )}
            {formik.values.frequency == 'weekly' && (
              <View
                style={{
                  width:
                    formik.values.frequency == 'weekly' ? '100%' : undefined,
                  paddingTop:
                    (formik.errors.category && formik.touched.category) ||
                    (formik.errors.description && formik.touched.description)
                      ? 5
                      : 0,
                }}>
                <CommonDropDown
                  maxHeight={150}
                  dropDownStyle={{width: '100%'}}
                  dropDownContainerStyle={{width: '100%'}}
                  items={days}
                  placeholder="Day"
                  open={dayOpen}
                  setOpen={setDayOpen}
                  onPress={() => {
                    setDateOpen(false);
                    setFrequencyOpen(false);
                    formik.setFieldTouched('day', true);
                  }}
                  zIndex={4}
                  value={formik.values.day}
                  setValue={() => undefined}
                  onSelectItem={val => {
                    formik.setFieldValue('day', val.value);
                  }}
                />
                {formik.errors.day && formik.touched.day ? (
                  <CommonText
                    style={{
                      marginLeft: 5,
                      marginTop: -10,
                    }}
                    content={formik.errors.day}
                    color={appColors.error}
                    size={'error'}
                  />
                ) : undefined}
              </View>
            )}
          </View>

          <CommonInput
            onPress={dropdownCloseHandler}
            placeholder="End After"
            value={
              formik.values.endAfter !== ''
                ? moment(formik.values.endAfter).format('DD MMM YYYY')
                : ''
            }
            editable={false}
            error={
              formik.errors.endAfter && formik.touched.endAfter
                ? formik.errors.endAfter
                : ''
            }
            onChangeText={undefined}
            rightIcon={
              <TouchableOpacity
                onPress={() => {
                  setIsRepeatDateVisible(true);
                }}>
                <Icon
                  name={'calendar'}
                  type={'entypo'}
                  size={20}
                  color={appColors.dark}
                />
              </TouchableOpacity>
            }
          />
          {isRepeactDateVisible ? (
            <DateTimePicker
              value={
                formik?.values?.endAfter
                  ? new Date(formik.values.endAfter)
                  : initialDate
              }
              mode={'date'}
              is24Hour={true}
              positiveButton={{label: 'OK', textColor: appColors.primary}}
              negativeButton={{label: 'Cancel', textColor: appColors.primary}}
              minimumDate={initialDate}
              display="calendar"
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) =>
                endAfterOnChange(event, selectedDate)
              }
            />
          ) : undefined}
          {isYearlyFrequencyDateVisible ? (
            <DateTimePicker
              value={initialDate}
              mode={'date'}
              is24Hour={true}
              positiveButton={{label: 'OK', textColor: appColors.primary}}
              negativeButton={{label: 'Cancel', textColor: appColors.primary}}
              minimumDate={initialDate}
              display="calendar"
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                if (event.type === 'set') {
                  setIsYearlyFrequencyDateVisible(false);
                  formik.setFieldTouched('month', true);
                  formik.setFieldTouched('date', true);
                  formik.setFieldValue('date', selectedDate?.getDate());
                  formik.setFieldValue(
                    'month',
                    (selectedDate?.getMonth() as number) + 1,
                  );
                } else {
                  setIsYearlyFrequencyDateVisible(false);
                }
              }}
            />
          ) : undefined}
          <CommonButton
            title="Next"
            onPress={() => {
              formik.setFieldValue('isRepeatSelected', true);
              rbSheetNextHandler();
            }}
          />
        </ScrollView>
      </CommonRBSheet>
      <Modal visible={isLoading} transparent={true} animationType="fade">
        <CommonLoader />
      </Modal>
      {dateVisible ? (
        <DateTimePicker
          value={initialDate}
          mode={'date'}
          is24Hour={true}
          positiveButton={{label: 'OK', textColor: appColors.primary}}
          negativeButton={{label: 'Cancel', textColor: appColors.primary}}
          maximumDate={initialDate}
          display="calendar"
          onChange={(event: DateTimePickerEvent, selectedDate?: Date) =>
            onChange(event, selectedDate)
          }
        />
      ) : undefined}
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
                  setRbSheetOpen(false);
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
          content={
            route?.params?.amount
              ? 'Transaction has been successfully updated'
              : 'Transaction has been successfully added'
          }
          size={'label'}
          style={{textAlign: 'center', paddingHorizontal: 20}}
        />
      </Popover>
      <Popover
        popoverStyle={{
          borderRadius: 8,
          width: 350,
          paddingBottom: 15,
        }}
        isVisible={isAddPopoverOpen}>
        <View
          style={{
            backgroundColor: appColors.buttonClear,
            padding: 10,
          }}>
          <CommonText content="Add New Item" />
        </View>

        <ScrollView
          contentContainerStyle={{paddingHorizontal: 15, paddingTop: 15}}>
          <CommonInput
            value={formik.values.newDropdownItem}
            placeholder="Category"
            onChangeText={text => formik.setFieldValue('newDropdownItem', text)}
            onBlur={formik.handleBlur('newDropdownItem')}
            error={
              formik.touched.newDropdownItem &&
              formik.values.newDropdownItem == ''
                ? 'This field is required'
                : undefined
            }
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 10,
            }}>
            <CommonButton
              buttonStyle={{width: 80, height: 45}}
              buttonType="clear"
              title="Cancel"
              onPress={() => {
                setIsAddPopoverOpen(false);
                formik.setFieldValue('newDropdownItem', '');
              }}
            />
            <CommonButton
              title="Add"
              loading={isButtonLoader}
              buttonStyle={{width: 80, height: 45}}
              onPress={() => handleAddNewDropdownItem()}
            />
          </View>
        </ScrollView>
      </Popover>
    </KeyboardAvoidingView>
  );
};

export default CommonAddScreen;
