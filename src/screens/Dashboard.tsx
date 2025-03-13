import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StatusBar,
  StatusBarProps,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  NavigationProp,
  ParamListBase,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {Avatar, Icon} from '@rneui/base';
import MonthPicker, {EventTypes} from 'react-native-month-year-picker';
import {appColors} from '@shared/appColors';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '@store/store';
import CommonText from '@shared/components/commonText/CommonText';
import IncomeIcon from '@assets/svg/income.svg';
import ExpenseIcon from '@assets/svg/expense.svg';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import TransactionRenderItem from '@shared/components/TransactionRenderItem';
import TransactionService from '@services/transactionService';
import {Toast} from '@shared/ToastConfig';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import moment, {Moment, utc} from 'moment';
import NotificationIcon from '@assets/svg/notification.svg';
import LottieView from 'lottie-react-native';
import AccountService from '@services/setup/accountService';
import DashBoardBarChart from '@components/charts/DashboardBarChart';
import CommonDropDown from '@shared/components/commonDropdown/CommonDropDown';
import FinanceStory from '@components/financeReport/FinanceStory';
import {
  updateIsFabToggleOpen,
  updateIsTransactionAdded,
} from '@store/slice/appSlice';
import {getCurrencySymbol} from '@src/lib/functions';
import callPermission from '@services/permission';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {navigationStore} from '@services/setup/navigationStore';
import {useTranslation} from 'react-i18next';

export interface TransactionListInterface {
  _id: string;
  notes: string;
  document: {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileFormat: string;
  };
  amount: number;
  transactionDate: Date;
  createdAt: Date;
  description: string;
  isRepeat: boolean;
  transactionFor: string;
  frequency: {
    frequencyType: 'daily' | 'weekly' | 'monthly' | 'yearly';
    day: string;
    date: number;
    month: string;
  };
  from: {
    paymentMode: string;
    wallet: {
      walletName: string;
      id: string;
    };
  };
  to: {
    paymentMode: string;
    wallet: {walletName: string; id: string};
  };
  transactionType: 'Expense' | 'Income' | 'Transfer' | 'Budget';
  wallet: {
    walletName: string;
    id: string;
  };
  paymentMode: string;
  endAfter: string;
}

const Dashboard = () => {
  useEffect(() => {
    checkPendingDeepLink();
  }, []);
  const {t} = useTranslation('transaction');

  const checkPendingDeepLink = async () => {
    const pendingUrl = await navigationStore.getPendingDeepLink();
    if (pendingUrl) {
      handleDeepLink(pendingUrl);
    }
  };

  const handleDeepLink = (url: string) => {
    try {
      // Remove the scheme from the URL
      const path = url.replace(/.*?:\/\//g, '');

      const screen = path?.split('montra.netlify.app')[1];
      // Navigate based on the screen path
      switch (screen) {
        case '/profile/settings/security':
          navigation.navigate('Security');
          break;
        case '/help-center':
          navigation.navigate('Help');
          break;
        default:
          console.log(`Unknown deep link path: ${screen}`);
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  };

  // Set Monday as the first day of the week
  moment.updateLocale('en', {
    week: {
      dow: 1, // Monday is the first day of the week
    },
  });

  const splitMonthIntoWeeks = (startDate: Moment, endDate: Moment) => {
    const weeks = [];
    let startOfWeek = moment(startDate).startOf('week');
    let endOfWeek = moment(startOfWeek).endOf('week');

    while (startOfWeek.isBefore(endDate)) {
      // Adjust the start and end of the week to fit within the month's range
      const weekStart = moment.max(startOfWeek, moment(startDate));
      const weekEnd = moment.min(endOfWeek, moment(endDate));

      weeks.push({
        label: `${t('WEEK')} ${weeks.length + 1}: ${weekStart.format(
          'MMM D',
        )} - ${weekEnd.format('MMM D')}`,
        value: `start:${weekStart},end:${weekEnd}`,
      });

      // Move to the next week
      startOfWeek.add(1, 'week');
      endOfWeek = moment(startOfWeek).endOf('week');
    }
    return weeks;
  };
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const [accountBalanceData, setAccountBalanceData] = useState<any>({});
  const [chartDropdownOpen, setChartDropdownOpen] = useState(false);
  const [isUpdated, setIsUpdated] = useState(true);
  const [filterData, setFilterData] = useState<{
    filterMonth: Date;
  }>({filterMonth: new Date()});

  const monthFirstdate = moment(filterData.filterMonth).startOf('month');
  const monthLastdate = moment(filterData.filterMonth).endOf('month');

  const monthRange = splitMonthIntoWeeks(monthFirstdate, monthLastdate);

  const [chartDropdownData, setChartDropdownData] =
    useState<{label: string; value: string}[]>(monthRange);

  useEffect(() => {
    if (isFocused) {
      setChartDropdownData(monthRange);
    }
  }, [filterData.filterMonth]);

  const getChartDropdownValue = (): string => {
    const currentMoment = moment();
    const calculatedStartOfWeek = currentMoment.clone().startOf('week');
    const calculatedEndOfWeek = currentMoment.clone().endOf('week');
    const startOfMonth = currentMoment.clone().startOf('month');
    const endOfMonth = currentMoment.clone().endOf('month');

    let startOfWeek = calculatedStartOfWeek.isBefore(startOfMonth)
      ? startOfMonth
      : calculatedStartOfWeek;

    let endOfWeek = calculatedEndOfWeek.isAfter(endOfMonth)
      ? endOfMonth
      : calculatedEndOfWeek;
    return `start:${startOfWeek.toString()},end:${endOfWeek.toString()}`;
  };

  const [chartDropdownValue, setChartDropdownvalue] = useState(() => {
    const dropdownValue = getChartDropdownValue();
    return dropdownValue;
  });

  const navigation: NavigationProp<ParamListBase> = useNavigation();

  const isToggleOpen = useSelector(
    (state: RootState) => state.auth.isFabToggleOpen,
  );

  const [isLoading, setIsLoading] = useState(false);

  const [show, setShow] = useState(false);
  const [isFinanceStoryVisible, setIsFinanceStoryVisible] = useState(false);

  const [transactionDetails, setTransactionDetails] = useState<
    TransactionListInterface[]
  >([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const isTransactionAdded = useSelector(
    (state: RootState) => state.auth.isTransactionAdded,
  );
  const days = {Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0};

  // useEffect which is used to initialize the service call functionality
  useEffect(() => {
    if (isFocused) {
      if (isUpdated && chartDropdownValue) {
        accountBalance(true);
      } else {
        accountBalance();
      }
    }
  }, [filterData.filterMonth, chartDropdownValue]);

  // useEffect which is used to initialize the service call when the transaction entry is modified
  useEffect(() => {
    if (isFocused && isTransactionAdded) {
      accountBalance();
    }
  }, [isFocused]);

  const accountBalance = (isChartDropdownValueUpdated = false) => {
    setIsLoading(true);
    setIsUpdated(false);
    if (!isChartDropdownValueUpdated) {
      if (!moment(filterData.filterMonth).isSame(moment(), 'month')) {
        setChartDropdownvalue(monthRange[0]?.value);
        getAccountBalance(monthRange[0]?.value);
      } else {
        const dropdownValue = getChartDropdownValue();
        setChartDropdownvalue(() => {
          return dropdownValue;
        });
        getAccountBalance(dropdownValue);
      }
    } else {
      getAccountBalance(chartDropdownValue);
    }
  };

  // Function which is used to handle notification
  const handlePushNotification = async () => {
    const isPushNotificationEnabled: string | null = await AsyncStorage.getItem(
      'isPushNotification',
    );
    const data = JSON.parse(isPushNotificationEnabled!);
    if (Platform.OS == 'android') {
      const version: number = Number(await Platform.constants?.Release);
      if (version > 12 && !data) {
        callPermission('PUSH_NOTIFICATION')
          .then(res => {})
          .catch(async err => {
            await AsyncStorage.setItem(
              'isPushNotification',
              JSON.stringify(true),
            );
            console.log(err, 'Promise Handler');
          });
      }
    }
  };

  const onValueChange = (event: EventTypes, newDate: Date) => {
    setShow(false);
    if (newDate) {
      setFilterData(prev => ({...prev, filterMonth: newDate}));
    }
  };

  const convertToMonthYear = (dateString: Date) => {
    const date = moment(dateString, 'M/YYYY');
    return date.format('MMM, YYYY');
  };

  const getAccountBalance = async (dataDrop: any) => {
    const data = {
      month: filterData.filterMonth,
    };

    await AccountService.getAccountBalance(data)
      .then(async (res: any) => {
        if (res?.success) {
          setAccountBalanceData(res?.balanceData);
          const data = {
            transactionType: 'Expense',
            weekStartDate: dataDrop.split(',')[0].split('start:')[1],
            weekEndDate: dataDrop.split(',')[1].split('end:')[1],
          };

          await AccountService.getWeeklyTransactions(data).then(
            async (item: any) => {
              handlePushNotification();
              if (item?.success) {
                if (item?.transactionData?.length > 0) {
                  item?.transactionData.forEach(
                    (item: {totalAmount: number; day: string}) => {
                      days[item.day as keyof typeof days] = item?.totalAmount;
                    },
                  );
                  setChartData(Object.values(days));
                } else {
                  setChartData(new Array(7).fill(0));
                }
                await TransactionService.getTransactionList({
                  filterByMonth: filterData.filterMonth,
                })
                  .then((response: any) => {
                    if (response?.success) {
                      setTransactionDetails(response?.rows);
                      dispatch(updateIsTransactionAdded(false));
                    }

                    setIsLoading(false);
                    setRefreshing(false);
                  })
                  .catch(err => {
                    setIsLoading(false);
                    setRefreshing(false);
                    dispatch(updateIsTransactionAdded(false));

                    Toast({
                      message: err?.response?.data?.message,
                      type: 'error',
                    });
                  });
              }
            },
          );
        }
      })
      .catch(err => {
        console.log(err.response?.data);
      });
  };

  const onRefresh = () => {
    setRefreshing(true);
    getAccountBalance(chartDropdownValue);
  };

  const HeaderComponent = () => {
    return (
      <View style={{flex: 1}}>
        {accountBalanceData?.balance >= 0 ? (
          <View>
            <CommonText
              style={{textAlign: 'center'}}
              color={appColors.placeholderColor}
              content={t('ACCOUNT_BALANCE')}
            />
            <CommonText
              bold
              content={getCurrencySymbol(accountBalanceData?.balance, false)}
              color={appColors.dark}
              size={22}
              style={{textAlign: 'center'}}
            />
          </View>
        ) : (
          <View>
            <CommonText
              bold
              content={t('ADD_WALLET_DETAILS')}
              color={appColors.dark}
              size={'large'}
              style={{textAlign: 'center'}}
            />
            <CommonText
              bold
              content={'🤑'}
              color={appColors.dark}
              size={'appHeader'}
              style={{textAlign: 'center'}}
            />
          </View>
        )}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginVertical: 10,
            marginBottom: 20,
          }}>
          <Pressable
            style={{
              backgroundColor: appColors.incomeBg,
              paddingHorizontal: 20,
              paddingVertical: 15,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 15,
            }}>
            <View
              style={{
                padding: 8,
                backgroundColor: appColors.lightBg,
                borderRadius: 15,
              }}>
              <IncomeIcon
                style={{color: appColors.incomeBg}}
                height={30}
                width={30}
              />
            </View>
            <View>
              <CommonText content={t('INCOME')} color={appColors.light} />
              <CommonText
                content={getCurrencySymbol(
                  accountBalanceData?.totalIncome,
                  false,
                )}
                bold
                color={appColors.light}
              />
            </View>
          </Pressable>
          <Pressable
            style={{
              backgroundColor: appColors.expenseBg,
              paddingHorizontal: 20,
              paddingVertical: 15,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 15,
            }}>
            <View
              style={{
                padding: 8,
                backgroundColor: appColors.lightBg,
                borderRadius: 15,
              }}>
              <ExpenseIcon
                style={{color: appColors.expenseBg}}
                height={30}
                width={30}
              />
            </View>
            <View>
              <CommonText content={t('EXPENSE')} color={appColors.light} />
              <CommonText
                content={getCurrencySymbol(
                  accountBalanceData?.totalExpenses,
                  false,
                )}
                bold
                color={appColors.light}
              />
            </View>
          </Pressable>
        </View>
        <View style={{flex: 1}}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <CommonText
              content={t('SPEND_FREQUENCY')}
              color={appColors.dark}
              size={'large'}
              bold
            />

            <View style={{width: '55%'}}>
              <CommonDropDown
                dropDownStyle={{
                  height: 45,
                  minHeight: 45,
                  width: '100%',
                }}
                dropDownContainerStyle={{width: '100%'}}
                placeholder=""
                maxHeight={150}
                zIndex={14}
                items={chartDropdownData as any}
                open={chartDropdownOpen}
                setOpen={setChartDropdownOpen}
                value={chartDropdownValue}
                setValue={setChartDropdownvalue}
                onSelectItem={val => {
                  setIsUpdated(true);
                }}
              />
            </View>
          </View>
          <View style={{minHeight: 250, zIndex: 3}}>
            <DashBoardBarChart chartData={chartData} />
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 20,
          }}>
          <CommonText bold size={'large'} content={t('RECENT_TRANSACTION')} />
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('BottomTab', {screen: 'Transaction'})
            }
            activeOpacity={0.7}
            style={{
              backgroundColor: appColors.buttonClear,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
            }}>
            <CommonText color={appColors.primary} content={t('SEE_ALL')} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  function FocusAwareStatusBar(props: StatusBarProps) {
    return isFocused ? <StatusBar {...props} /> : null;
  }

  return (
    <KeyboardAvoidingView
      onStartShouldSetResponder={() => {
        setChartDropdownOpen(false);
        return false;
      }}
      style={{flex: 1, backgroundColor: appColors.light}}>
      <CommonHeader
        leftIcon
        leftIconPressBack={() => {}}
        title=""
        customLeftHeaderComponent={
          <TouchableOpacity
            onPress={() => {
              StatusBar.setBarStyle('light-content');
              setIsFinanceStoryVisible(true);
            }}
            activeOpacity={0.7}
            style={{
              borderColor: appColors.primary,
              padding: 2,
              borderWidth: 2,
              height: 50,
              width: 50,
              borderRadius: 25,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Avatar
              source={{uri: userDetails.picture}}
              size={40}
              avatarStyle={{borderRadius: 25}}
            />
          </TouchableOpacity>
        }
        customCenterHeaderComponent={
          <TouchableOpacity
            onPress={() => {
              setShow(true);
              setChartDropdownOpen(false);
            }}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
            }}>
            <Icon
              name="chevron-down"
              type="feather"
              size={25}
              color={appColors.primary}
            />
            <CommonText
              size={'large'}
              content={convertToMonthYear(filterData.filterMonth)}
              bold
            />
          </TouchableOpacity>
        }
        // customRightHeaderComponent={
        //   <TouchableOpacity activeOpacity={0.7} onPress={() => {}}>
        //     <NotificationIcon height={30} width={30} />
        //   </TouchableOpacity>
        // }
      />

      <FocusAwareStatusBar
        barStyle={isToggleOpen ? 'light-content' : 'dark-content'}
        backgroundColor={
          isToggleOpen || isLoading
            ? appColors.transparentBackground
            : appColors.light
        }
      />
      <View>
        <FlatList
          style={{paddingHorizontal: 15}}
          ListHeaderComponent={HeaderComponent}
          renderItem={({item}) => (
            <TransactionRenderItem item={item} navigation={navigation} />
          )}
          refreshControl={
            <RefreshControl
              onRefresh={onRefresh}
              colors={[appColors.primary]}
              refreshing={refreshing}
            />
          }
          data={transactionDetails.slice(0, 7)}
          keyExtractor={(_, index) => index.toString()}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <LottieView
                source={require('@assets/lottie/list-empty-lottie.json')}
                autoPlay
                loop
                style={{height: 200, width: 200}}
              />
              <CommonText
                style={{textAlign: 'center'}}
                content={t('TRANSACTION_EMPTY')}
              />
            </View>
          }
          contentContainerStyle={{
            paddingBottom: 250,
          }}
        />
      </View>

      {isToggleOpen ? (
        <Animated.View
          onStartShouldSetResponder={() => {
            dispatch(updateIsFabToggleOpen(false));
            return false;
          }}
          entering={FadeIn}
          exiting={FadeOut}
          style={{
            backgroundColor: appColors.transparentBackground,
            ...StyleSheet.absoluteFillObject,
          }}
        />
      ) : undefined}
      <Modal visible={isLoading} transparent animationType="fade">
        <CommonLoader />
      </Modal>
      {show && (
        <MonthPicker
          onChange={onValueChange}
          value={filterData.filterMonth}
          minimumDate={new Date(2000, 0)}
          maximumDate={new Date(new Date())}
          locale="en"
        />
      )}
      <Modal
        visible={isFinanceStoryVisible}
        onRequestClose={() => setIsFinanceStoryVisible(false)}>
        <FinanceStory closeHandler={() => setIsFinanceStoryVisible(false)} />
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default Dashboard;
