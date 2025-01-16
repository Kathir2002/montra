import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StatusBarProps,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {appColors} from '@shared/appColors';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {Icon} from '@rneui/base';
import LottieView from 'lottie-react-native';
import CommonText from '@shared/components/commonText/CommonText';
import PieChartIcon from '@assets/svg/pieChart.svg';
import LineChartIcon from '@assets/svg/lineChart.svg';
import FinanceLineChart from '../charts/FinanceLineChart';
import FinancePieChart from '../charts/FinancePieChart';
import TransactionService from '@services/transactionService';
import {Toast} from '@shared/ToastConfig';
import {TransactionListInterface} from '@screens/Dashboard';
import TransactionRenderItem from '@shared/components/TransactionRenderItem';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import SortIcon from '@assets/svg/sort.svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import AccountService from '@services/setup/accountService';
import MonthPicker, {EventTypes} from 'react-native-month-year-picker';
import moment from 'moment';
import {generateUniqueColors, getCurrencySymbol} from '@src/lib/functions';

interface PieChartDataInterface {
  name: string;
  value: number;
  itemStyle: {color: string};
}
const FinanceReport = () => {
  const isFocused = useIsFocused();
  const transactionTypes = ['Expense', 'Income'];
  const rotationValue = useSharedValue(0);
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const [selectedChart, setSelectedChart] = useState<'Line' | 'Pie'>('Line');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [show, setShow] = useState(false);
  const [monthlyBalanceData, setMonthlyBalanceData] = useState<{
    totalIncome: number;
    totalExpense: number;
  }>({totalExpense: 0, totalIncome: 0});

  const [transactionDetails, setTransactionDetails] = useState<
    TransactionListInterface[]
  >([]);
  const [chartData, setChartData] = useState<{
    lineChart: {date: Date; amount: number}[];
    pieChart: PieChartDataInterface[];
  }>({
    lineChart: [],
    pieChart: [],
  });
  const [filterData, setFilterData] = useState<{
    filterBy: string;
    sortBy: string;
    category: string[];
    filterByMonth: Date;
  }>({
    filterBy: 'Expense',
    sortBy: 'Highest',
    category: [],
    filterByMonth: new Date(),
  });

  useEffect(() => {
    if (isFocused) {
      getTransactionList();
    }
  }, [isFocused, filterData]);

  const groupAndFormatDataWithUniqueColors = (
    data: TransactionListInterface[],
  ) => {
    const grouped = data.reduce((acc: any, item) => {
      if (!acc[item.transactionFor]) {
        acc[item.transactionFor] = 0;
      }
      acc[item.transactionFor] += item.amount;
      return acc;
    }, {});

    const transactionForKeys = Object.keys(grouped);
    const colors = generateUniqueColors(transactionForKeys.length);

    return transactionForKeys.map((key, index) => ({
      name: key,
      value: grouped[key],
      itemStyle: {
        color: colors[index], // Assign unique color
      },
    }));
  };

  const getTransactionList = async () => {
    setIsLoading(true);
    await TransactionService.getTransactionList(filterData)
      .then(async (res: any) => {
        if (res?.success) {
          setTransactionDetails(res?.rows);

          const lineChart = res?.rows?.map((item: TransactionListInterface) => {
            return {
              date: new Date(item.transactionDate),
              amount: item.amount,
            };
          });

          const pieChart = groupAndFormatDataWithUniqueColors(res?.rows);

          setChartData({
            lineChart,
            pieChart,
          });

          const data = {
            month: filterData.filterByMonth,
          };
          await AccountService.getAccountBalance(data)
            .then((response: any) => {
              if (response.success) {
                setMonthlyBalanceData({
                  totalIncome: response?.balanceData?.totalIncome,
                  totalExpense: response?.balanceData?.totalExpenses,
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

  const onRefresh = () => {
    setRefreshing(true);
    getTransactionList();
  };

  function FocusAwareStatusBar(props: StatusBarProps) {
    return isFocused ? <StatusBar {...props} /> : null;
  }

  const CategoryRenderItem = ({
    item,
    index,
  }: {
    item: PieChartDataInterface;
    index: number;
  }) => {
    return (
      <View
        key={index}
        style={{
          marginVertical: 15,
          borderWidth: 1,
          borderColor: appColors.formBorderColor,
          borderRadius: 5,
          gap: 10,
          padding: 5,
        }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              borderColor: appColors.formBorderColor,
              borderWidth: 1,
              borderRadius: 20,
              padding: 5,
            }}>
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: item?.itemStyle?.color,
                borderRadius: 8,
              }}
            />
            <CommonText
              content={item?.name}
              color={appColors.dark}
              size={'label'}
            />
          </View>
          <CommonText
            style={{}}
            content={`${
              filterData?.filterBy == 'Expense' ? '-' : '+'
            } ${getCurrencySymbol(item?.value)}`}
            bold
            size={'large'}
            color={
              filterData?.filterBy == 'Expense'
                ? appColors.expenseBg
                : appColors.incomeBg
            }
          />
        </View>
        <View
          style={{
            backgroundColor: appColors?.formBorderColor,
            height: 10,
            borderRadius: 5,
          }}>
          <View
            style={{
              backgroundColor: item?.itemStyle?.color,
              height: 10,
              borderRadius: 5,
              width: `${
                (item?.value /
                  (filterData.filterBy == 'Expense'
                    ? monthlyBalanceData.totalExpense
                    : monthlyBalanceData.totalIncome)) *
                100
              }%`,
            }}
          />
        </View>
      </View>
    );
  };

  const onValueChange = (event: EventTypes, newDate: Date) => {
    setShow(false);
    if (newDate) {
      setFilterData(prev => ({...prev, filterByMonth: newDate}));
    }
  };

  const convertToMonthYear = (dateString: Date) => {
    const date = moment(dateString, 'M/YYYY');
    return date.format('MMM, YYYY');
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{rotateZ: `${rotationValue.value}deg`}],
    };
  });

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: appColors.light,
      }}>
      <CommonHeader
        title="Financial Report"
        leftIconPressBack={() => navigation.goBack()}
      />
      <FocusAwareStatusBar
        barStyle={'dark-content'}
        backgroundColor={
          isLoading ? appColors.transparentBackground : undefined
        }
      />
      <ScrollView
        scrollEnabled
        refreshControl={
          <RefreshControl
            onRefresh={onRefresh}
            colors={[appColors.primary]}
            refreshing={refreshing}
          />
        }
        contentContainerStyle={{paddingHorizontal: 15, flexGrow: 1}}>
        <View style={{flex: 1}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity
              onPress={() => setShow(true)}
              activeOpacity={0.7}
              style={{
                padding: 5,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                borderWidth: 1,
                borderColor: appColors.formBorderColor,
                borderRadius: 15,
              }}>
              <Icon
                type="octicon"
                name={'chevron-down'}
                size={20}
                color={appColors.primary}
              />
              <CommonText
                size={'large'}
                content={convertToMonthYear(filterData.filterByMonth)}
                bold
              />
            </TouchableOpacity>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: appColors.formBorderColor,
                borderRadius: 10,
              }}>
              <TouchableOpacity
                hitSlop={{bottom: 20, top: 20, left: 20, right: 20}}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedChart('Line');
                }}
                style={{
                  borderTopLeftRadius: 10,
                  borderBottomLeftRadius: 10,
                  padding: 8,
                  backgroundColor:
                    selectedChart == 'Line'
                      ? appColors.primary
                      : appColors.light,
                }}>
                <LineChartIcon
                  height={30}
                  width={30}
                  color={
                    selectedChart == 'Line'
                      ? appColors.light
                      : appColors.primary
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedChart('Pie');
                }}
                style={{
                  borderTopRightRadius: 10,
                  borderBottomRightRadius: 10,
                  padding: 8,
                  backgroundColor:
                    selectedChart == 'Pie'
                      ? appColors.primary
                      : appColors.light,
                }}>
                <PieChartIcon
                  height={30}
                  width={30}
                  color={
                    selectedChart == 'Pie' ? appColors.light : appColors.primary
                  }
                />
              </TouchableOpacity>
            </View>
          </View>

          {selectedChart == 'Line' ? (
            <View>
              <CommonText
                content={getCurrencySymbol(
                  filterData?.filterBy == 'Expense'
                    ? monthlyBalanceData?.totalExpense
                    : monthlyBalanceData?.totalIncome,
                )}
                bold
                size={'header'}
              />
              <FinanceLineChart
                chartData={chartData?.lineChart?.sort(
                  (a, b) =>
                    Number(moment(a?.date)?.format('YYYYMMDD')) -
                    Number(moment(b?.date)?.format('YYYYMMDD')),
                )}
              />
            </View>
          ) : (
            <View>
              <FinancePieChart
                chartData={chartData?.pieChart}
                transactionType={filterData?.filterBy}
                totalTransaction={monthlyBalanceData}
              />
            </View>
          )}
          <View
            style={{
              marginVertical: 15,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: appColors.buttonClear,
              borderWidth: 1,
              borderRadius: 20,
              borderColor: appColors.formBorderColor,
              justifyContent: 'center',
            }}>
            {transactionTypes.map((item, index) => (
              <TouchableOpacity
                onPress={() => {
                  setFilterData(prev => ({...prev, filterBy: item}));
                }}
                activeOpacity={0.7}
                key={index}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderRadius: 20,
                  borderColor:
                    filterData?.filterBy === item
                      ? appColors.primary
                      : appColors.formBorderColor,
                  paddingHorizontal: 15,
                  backgroundColor:
                    filterData.filterBy === item
                      ? appColors.primary
                      : undefined,
                }}>
                <CommonText
                  size={'large'}
                  content={item}
                  style={{textAlign: 'center'}}
                  bold
                  color={
                    filterData.filterBy === item
                      ? appColors.lightBg
                      : appColors.primary
                  }
                />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              setFilterData(prev => {
                let temp = {...prev};
                if (temp.sortBy == 'Highest') {
                  temp.sortBy = 'Lowest';
                  rotationValue.value = withTiming(180, {
                    duration: 500,
                  });
                } else {
                  temp.sortBy = 'Highest';
                  rotationValue.value = withTiming(0, {
                    duration: 500,
                  });
                }
                return temp;
              });
            }}
            style={{
              padding: 5,
              borderWidth: 1,
              borderColor: appColors.formBorderColor,
              marginLeft: 'auto',
              borderRadius: 8,
            }}>
            <Animated.View style={animatedStyle}>
              <SortIcon width={25} height={25} />
            </Animated.View>
          </TouchableOpacity>
          <FlatList<any>
            renderItem={
              selectedChart === 'Pie'
                ? CategoryRenderItem
                : ({item}) => (
                    <TransactionRenderItem
                      item={item}
                      navigation={navigation}
                    />
                  )
            }
            data={
              selectedChart === 'Pie' ? chartData?.pieChart : transactionDetails
            }
            keyExtractor={(_, index) => index.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
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
              paddingBottom: 15,
            }}
          />
        </View>
      </ScrollView>
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
    </KeyboardAvoidingView>
  );
};

export default FinanceReport;
