import {
  FlatList,
  Modal,
  StatusBar,
  StatusBarProps,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import {RootState} from '@store/store';
import {appColors} from '@shared/appColors';
import {useDispatch, useSelector} from 'react-redux';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import CommonText from '@shared/components/commonText/CommonText';
import ArrowRightIcon from '@assets/svg/arrow-right.svg';
import FilterIcon from '@assets/svg/filter.svg';

import CommonRBSheet, {
  RBSheetRef,
} from '@shared/components/commonRBSheet/CommonRBSheet';
import CommonButton from '@shared/components/commonButton/CommonButton';
import Popover from 'react-native-popover-view';
import moment, {max} from 'moment';
import TransactionService from '@services/transactionService';
import {Toast} from '@shared/ToastConfig';
import {
  NavigationProp,
  ParamListBase,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import TransactionRenderItem from '@shared/components/TransactionRenderItem';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import {TransactionListInterface} from './Dashboard';
import {Icon} from '@rneui/base';
import MonthPicker, {EventTypes} from 'react-native-month-year-picker';
import LottieView from 'lottie-react-native';
import {RefreshControl} from 'react-native';
import AccountService from '@services/setup/accountService';
import FinanceStory from '@components/financeReport/FinanceStory';
import {updateIsFabToggleOpen} from '@store/slice/appSlice';

const Transaction = () => {
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const flatListRef = useRef<FlatList>(null);
  const rbSheetRef = useRef<RBSheetRef>(null);
  const CONTENT_OFFSET_THRESHOLD = 100;
  const navigation: NavigationProp<ParamListBase> = useNavigation();

  const transactionTypes = ['Income', 'Expense', 'Transfer'];
  const sortTypes = ['Highest', 'Lowest', 'Newest', 'Oldest'];
  const categoryData = [
    'Salary',
    'Interest',
    'Dividend',
    'Rent',
    'Shopping',
    'Transportation',
    'Food',
  ];

  const isToggleOpen = useSelector(
    (state: RootState) => state.auth.isFabToggleOpen,
  );
  const [show, setShow] = useState(false);
  const [isFinanceStoryVisible, setIsFinanceStoryVisible] = useState(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filterData, setFilterData] = useState<{
    filterBy: string;
    sortBy: string;
    category: string[];
    filterByMonth: Date;
  }>({
    filterBy: '',
    sortBy: '',
    category: [],
    filterByMonth: new Date(),
  });
  const [rBSheetOpen, setRBSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<
    TransactionListInterface[]
  >([]);
  const [contentVerticalOffset, setContentVerticalOffset] = useState(0);
  const [monthlyReportData, setMonthlyReportData] = useState({});

  useEffect(() => {
    if (isFocused) {
      setIsLoading(true);
      getTransactionList();
    }
  }, [isFocused, filterData.filterByMonth]);

  const convertToMonthYear = (dateString: string) => {
    const date = moment(dateString, 'M/YYYY');
    return date.format('MMM, YYYY');
  };

  const currentMonth = (date: Date) => {
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const year = date.getFullYear();
    return `${month}/${year}`;
  };

  const onRefresh = () => {
    setRefreshing(true);
    getTransactionList();
  };
  const onValueChange = (event: EventTypes, newDate: Date) => {
    setShow(false);
    if (newDate) {
      setFilterData(prev => ({...prev, filterByMonth: newDate}));
    }
  };

  const getMaxTransaction = (
    transactions: TransactionListInterface[],
    type: 'Income' | 'Expense',
  ) => {
    const currentMonth = moment().month(); // 0-indexed (e.g., 7 for August)
    const currentYear = moment().year();
    return transactions
      .filter(
        t =>
          moment(t.transactionDate).year() === currentYear &&
          moment(t.transactionDate).month() === currentMonth &&
          t.transactionType === type,
      )
      .reduce((max, t) => (t.amount > max.amount ? t : max), {amount: 0});
  };

  const getTransactionList = async () => {
    await TransactionService.getTransactionList(filterData)
      .then(async (res: any) => {
        if (res?.success) {
          setTransactionDetails(res?.rows);
          const data = {
            month: new Date(),
          };
          await AccountService.getAccountBalance(data)
            .then((response: any) => {
              if (response?.success) {
                const maxExpense = getMaxTransaction(res?.rows, 'Expense');
                const maxIncome = getMaxTransaction(res?.rows, 'Income');

                setMonthlyReportData({
                  maxIncomeData: maxIncome,
                  maxExpenseData: maxExpense,
                  totalIncome: response?.balanceData?.totalIncome,
                  totalExpenses: response?.balanceData?.totalExpenses,
                });
                setIsLoading(false);
                setRefreshing(false);
              }
            })
            .catch(error => {
              setIsLoading(false);
              setRefreshing(false);
            });
        }
      })
      .catch(err => {
        console.log(err.response?.data?.message);
        Toast({message: err?.response?.data?.message, type: 'error'});
      });
  };

  const FocusAwareStatusBar = (props: StatusBarProps) => {
    return isFocused ? <StatusBar {...props} /> : null;
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: appColors.light,
        paddingHorizontal: 15,
      }}>
      <CommonHeader
        leftIconPressBack={() => {}}
        customRightHeaderComponent={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setRBSheetOpen(true);
              rbSheetRef.current?.open();
            }}>
            <FilterIcon width={25} height={25} />
            {(filterData.category.length > 0 ||
              filterData?.filterBy !== '' ||
              filterData?.sortBy !== '') && (
              <View
                style={{
                  borderRadius: 15,
                  backgroundColor: appColors.primary,
                  height: 22,
                  width: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                }}>
                <CommonText
                  content={String(
                    filterData?.category?.length +
                      (filterData.filterBy !== '' ? 1 : 0) +
                      (filterData?.sortBy !== '' ? 1 : 0),
                  )}
                  size={'error'}
                  color={appColors.light}
                />
              </View>
            )}
          </TouchableOpacity>
        }
        title=""
        customLeftHeaderComponent={
          <TouchableOpacity
            onPress={() => setShow(true)}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              borderRadius: 15,
              borderColor: appColors.formBorderColor,
              borderWidth: 1,
              padding: 5,
            }}>
            <Icon
              name="chevron-down"
              type="feather"
              size={20}
              color={appColors.primary}
            />
            <CommonText
              size={'large'}
              content={convertToMonthYear(
                currentMonth(filterData.filterByMonth) as string,
              )}
            />
          </TouchableOpacity>
        }
      />
      <FocusAwareStatusBar
        backgroundColor={
          isToggleOpen || rBSheetOpen || isLoading
            ? appColors.transparentBackground
            : appColors.light
        }
        barStyle={isToggleOpen ? 'light-content' : 'dark-content'}
      />
      <TouchableOpacity
        onPress={() => {
          StatusBar.setBarStyle('light-content');
          setIsFinanceStoryVisible(true);
        }}
        activeOpacity={0.7}
        style={{
          backgroundColor: appColors.buttonClear,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 10,
          paddingHorizontal: 15,
          borderRadius: 10,
        }}>
        <CommonText
          content="See your financial report"
          color={appColors.primary}
        />
        <ArrowRightIcon height={15} width={15} />
      </TouchableOpacity>
      <FlatList
        renderItem={({item, index}) => (
          <TransactionRenderItem item={item} navigation={navigation} />
        )}
        data={transactionDetails}
        keyExtractor={(_, index) => index.toString()}
        scrollEnabled={true}
        ref={flatListRef}
        showsVerticalScrollIndicator={false}
        onScroll={event => {
          setContentVerticalOffset(event.nativeEvent.contentOffset.y);
        }}
        refreshControl={
          <RefreshControl
            onRefresh={onRefresh}
            colors={[appColors.primary]}
            refreshing={refreshing}
          />
        }
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
              content="No Transaction Found!"
            />
          </View>
        }
        contentContainerStyle={{
          flex: transactionDetails.length === 0 ? 1 : 0,
          paddingBottom: 100,
          // paddingTop: 20,
        }}
      />
      {isToggleOpen ? (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          onStartShouldSetResponder={() => {
            dispatch(updateIsFabToggleOpen(false));
            return false;
          }}
          style={{
            backgroundColor: appColors.transparentBackground,
            ...StyleSheet.absoluteFillObject,
          }}
        />
      ) : undefined}
      <CommonRBSheet
        onClose={() => setRBSheetOpen(false)}
        ref={rbSheetRef}
        height={350}
        closeOnPressBack={true}
        closeOnPressMask={true}
        draggable={true}
        customStyles={{
          container: {borderTopLeftRadius: 20, borderTopRightRadius: 20},
        }}>
        <View
          style={{
            flex: 1,
            backgroundColor: appColors.light,
            padding: 15,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <CommonText content="Filter Transaction" bold />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setFilterData({
                  filterBy: '',
                  sortBy: '',
                  category: [],
                  filterByMonth: new Date(),
                });
              }}
              style={{
                backgroundColor: appColors.buttonClear,
                paddingVertical: 5,
                borderRadius: 15,
                paddingHorizontal: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <CommonText content="Reset" color={appColors.primary} />
            </TouchableOpacity>
          </View>
          <View style={{marginVertical: 10}}>
            <CommonText content="Filter By" bold />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 10,
              }}>
              {transactionTypes.map((item, index) => {
                return (
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => {
                      setFilterData(prev => ({...prev, filterBy: item}));
                    }}
                    activeOpacity={0.7}
                    key={index}
                    style={{
                      borderWidth: 1,
                      borderRadius: 30,
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                      backgroundColor:
                        filterData.filterBy === item
                          ? appColors.formBorderColor
                          : appColors.light,
                      borderColor: appColors.formBorderColor,
                    }}>
                    <CommonText
                      content={item}
                      color={
                        filterData.filterBy === item
                          ? appColors.primary
                          : appColors.dark
                      }
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          {/* Sort By */}
          <View>
            <CommonText content="Sort By" bold />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 10,
              }}>
              {sortTypes.map((item, index) => {
                return (
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => {
                      setFilterData(prev => ({...prev, sortBy: item}));
                    }}
                    activeOpacity={0.7}
                    key={index}
                    style={{
                      borderWidth: 1,
                      borderRadius: 30,
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                      backgroundColor:
                        filterData.sortBy === item
                          ? appColors.formBorderColor
                          : appColors.light,
                      borderColor: appColors.formBorderColor,
                    }}>
                    <CommonText
                      content={item}
                      color={
                        filterData.sortBy === item
                          ? appColors.primary
                          : appColors.dark
                      }
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          {/* Category */}
          <View style={{marginVertical: 10}}>
            <CommonText content="Category" bold />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 10,
              }}>
              <CommonText content="Choose Category" />
              <Popover
                from={
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 5,
                    }}>
                    <CommonText
                      content={`${filterData.category.length} Selected`}
                      color={appColors.placeholderColor}
                    />
                    <ArrowRightIcon height={13} width={13} />
                  </TouchableOpacity>
                }>
                <View>
                  {categoryData?.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      accessibilityRole="button"
                      onPress={() => {
                        if (!filterData.category.includes(item)) {
                          setFilterData(prev => ({
                            ...prev,
                            category: [...prev.category, item],
                          }));
                        } else {
                          setFilterData(prev => {
                            let data = {...prev};
                            data.category.splice(
                              data.category.indexOf(item),
                              1,
                            );
                            return data;
                          });
                        }
                      }}
                      activeOpacity={0.7}
                      style={{
                        borderWidth: 1,
                        borderRadius: 30,
                        paddingVertical: 5,
                        paddingHorizontal: 10,
                        backgroundColor: filterData.category.includes(item)
                          ? appColors.formBorderColor
                          : appColors.light,
                        borderColor: appColors.formBorderColor,
                      }}>
                      <CommonText
                        content={item}
                        color={
                          filterData.category.includes(item)
                            ? appColors.primary
                            : appColors.dark
                        }
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </Popover>
            </View>
          </View>
          <CommonButton
            title="Apply"
            onPress={() => {
              setRBSheetOpen(false);
              rbSheetRef.current?.close();
              getTransactionList();
            }}
          />
        </View>
      </CommonRBSheet>
      <Modal visible={isLoading} transparent animationType="fade">
        <CommonLoader />
      </Modal>
      {show && (
        <MonthPicker
          onChange={onValueChange}
          value={filterData.filterByMonth}
          minimumDate={new Date(2000, 0)}
          maximumDate={new Date(new Date())}
          locale="en"
        />
      )}
      {contentVerticalOffset > CONTENT_OFFSET_THRESHOLD && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={{
            position: 'absolute',
            bottom: 100,
            right: 20,
            backgroundColor: appColors.buttonClear,
            borderWidth: 1,
            borderColor: appColors.formBorderColor,
            padding: 5,
            borderRadius: 30,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <TouchableOpacity
            onPress={() => {
              flatListRef?.current?.scrollToOffset({offset: 0, animated: true});
            }}>
            <Icon
              name="keyboard-double-arrow-up"
              type="material"
              size={30}
              color={appColors.primary}
            />
          </TouchableOpacity>
        </Animated.View>
      )}
      <Modal
        visible={isFinanceStoryVisible}
        onRequestClose={() => setIsFinanceStoryVisible(false)}>
        <FinanceStory
          closeHandler={() => setIsFinanceStoryVisible(false)}
          monthlyReportData={monthlyReportData}
        />
      </Modal>
    </View>
  );
};

export default Transaction;
