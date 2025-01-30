import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  GestureResponderEvent,
  Pressable,
  useWindowDimensions,
  View,
  StatusBar,
  SafeAreaView,
  Modal,
} from 'react-native';
import styles from './financeStory.styles';
import {appColors} from '@shared/appColors';
import CommonText from '@shared/components/commonText/CommonText';
import ShoppingIcon from '@assets/svg/expense/shopping.svg';
import FoodIcon from '@assets/svg/expense/food.svg';
import TransportationIcon from '@assets/svg/expense/transportation.svg';
import SalaryIcon from '@assets/svg/income/salary.svg';
import RentIcon from '@assets/svg/income/salary.svg';
import TransferIcon from '@assets/svg/transfer.svg';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import {TransactionListInterface} from '@screens/Dashboard';
import LottieView from 'lottie-react-native';
import CommonButton from '@shared/components/commonButton/CommonButton';
import {getCurrencySymbol} from '@src/lib/functions';
import TransactionService from '@services/transactionService';
import {Toast} from '@shared/ToastConfig';
import moment from 'moment';
import AccountService from '@services/setup/accountService';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import BudgetService from '@services/setup/budgetSerice';
import {useTranslation} from 'react-i18next';

interface BudgetInterface {
  _id: string;
  budget: number;
  category: string;
  isReceiveAlert: boolean;
  month: Date;
  remaining: number;
  spent: number;
  spentPercent: number;
  userId: string;
}

type StoriesItem =
  | TransactionListInterface
  | {budget: BudgetInterface[]; totalQuantity: number}
  | {quote: string; author: string}
  | undefined;

interface MonthlyReportInterface {
  maxExpenseData: TransactionListInterface;
  maxIncomeData: TransactionListInterface;
  totalExpenses: number;
  totalIncome: number;
  budgetData: {
    budget: BudgetInterface[];
    totalQuantity: number;
  };
  quote: {
    quote: string;
    author: string;
  };
}
const getIcon = (story: {transactionFor: string; transactionType: string}) => {
  if (story?.transactionType === 'Expense') {
    switch (story?.transactionFor) {
      case 'Shopping':
        return <ShoppingIcon width={20} height={20} />;
      case 'Rent':
        return <RentIcon width={20} height={20} />;
      case 'Food':
        return <FoodIcon width={20} height={20} />;
      case 'Transportation':
        return <TransportationIcon width={20} height={20} />;
      default:
        return <TransportationIcon width={20} height={20} />;
    }
  } else if (story?.transactionType === 'Income') {
    switch (story?.transactionFor) {
      case 'Salary':
        return <SalaryIcon width={20} height={20} />;
      default:
        return <TransportationIcon width={20} height={20} />;
    }
  } else {
    return <TransferIcon width={20} height={20} />;
  }
};

const FinanceStory = ({closeHandler}: {closeHandler: () => void}) => {
  const {t} = useTranslation('finaceReport');
  const {width} = useWindowDimensions();
  const pausedProgress = useRef(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [isLoading, setIsLoading] = useState(true);

  const [monthlyReportData, setMonthlyReportData] =
    useState<MonthlyReportInterface>();
  const navigation: NavigationProp<ParamListBase> = useNavigation();

  const expenseData = monthlyReportData?.maxExpenseData;
  const incomeData = monthlyReportData?.maxIncomeData;
  const stories = [
    expenseData,
    incomeData,
    monthlyReportData?.budgetData,
    monthlyReportData?.quote,
  ];
  const availableStories = stories.filter(
    (
      item,
    ): item is
      | {budget: BudgetInterface[]; totalQuantity: number}
      | {quote: string; author: string} => {
      if (!item) return false; // Exclude null or undefined

      if ('budget' in item && item.budget.length === 0) return false; // Exclude empty budget
      if ('quote' in item && !item.author) return false; // Exclude incomplete quotes

      return true; // Include valid items
    },
  );

  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const [isPaused, setIsPaused] = useState(false);
  const currentStory = availableStories[currentStoryIndex];
  const [wentBack, setWentBack] = useState(0);

  useEffect(() => {
    getFinanceStoryData();
  }, []);

  const getMaxTransaction = (
    transactions: TransactionListInterface[],
    type: 'Income' | 'Expense',
  ): TransactionListInterface | null => {
    const currentMonth = moment().month(); // 0-indexed (e.g., 7 for August)
    const currentYear = moment().year();

    const filteredTransactions = transactions.filter(
      t =>
        moment(t.transactionDate).year() === currentYear &&
        moment(t.transactionDate).month() === currentMonth &&
        t.transactionType === type,
    );

    if (filteredTransactions.length === 0) {
      return null;
    }

    return filteredTransactions.reduce((max, t) =>
      t.amount > max.amount ? t : max,
    );
  };

  const getFinanceStoryData = async () => {
    const data = {
      month: new Date(),
    };

    await AccountService.getAccountBalance(data)
      .then(async (res: any) => {
        if (res?.success) {
          await TransactionService.getTransactionList({
            filterByMonth: new Date(),
          }).then(async (response: any) => {
            if (response?.success) {
              await TransactionService.getQuote().then(
                async (quoteResponse: any) => {
                  if (quoteResponse?.success) {
                  }
                  const data = {filterDate: new Date()};
                  await BudgetService.getBudgetList(data)
                    .then((budgetResponse: any) => {
                      setIsLoading(false);
                      const data: BudgetInterface[] =
                        budgetResponse?.rows?.filter(
                          (budget: any) => Math.sign(budget?.remaining) === -1,
                        );
                      const maxExpense = getMaxTransaction(
                        response?.rows,
                        'Expense',
                      );
                      const maxIncome = getMaxTransaction(
                        response?.rows,
                        'Income',
                      );

                      setMonthlyReportData({
                        maxIncomeData: maxIncome!,
                        maxExpenseData: maxExpense!,
                        totalIncome: res?.balanceData?.totalIncome,
                        totalExpenses: res?.balanceData?.totalExpenses,
                        budgetData: {
                          budget: data,
                          totalQuantity: budgetResponse?.rows?.length,
                        },
                        quote: {
                          quote: quoteResponse?.quote?.quote,
                          author: quoteResponse?.quote?.author,
                        },
                      });
                    })
                    .catch(err => {
                      setIsLoading(false);
                      Toast({
                        message: err?.response?.data?.message,
                        type: 'error',
                      });
                    });
                },
              );
            }
          });
        }
      })
      .catch(err => {
        console.log(err.response?.data);
      });
  };

  /**
   * method to get the currency symbol
   * @param amount, currencyCode
   */

  const goToNextStory = () => {
    if (currentStoryIndex < availableStories.length - 1) {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3,
        useNativeDriver: false,
      }).start(() => {
        pausedProgress.current = 0;
        setCurrentStoryIndex(currentStoryIndex + 1);
        progressAnim.setValue(0);
      });
    } else {
      // setWentBack(0);
      // setCurrentStoryIndex(0);
    }
  };

  const runProgressAnimation = () => {
    // this will run the animations at the top for the story
    progressAnim.setValue(pausedProgress.current); //set the value of the progress of the story
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: (1 - pausedProgress.current) * 6000, //for how long each story currently 6 seconds
      useNativeDriver: false,
    }).start(({finished}) => {
      if (finished) {
        goToNextStory(); //once finished goes to nextStory()
      }
    });
  };

  const getProgressBarWidth = (storyIndex: number, currentIndex: number) => {
    if (currentIndex > storyIndex) {
      return '100%';
    } // this is when the Story has been viewed
    if (currentIndex === storyIndex) {
      return progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'], // this is when the story is being viewed
      });
    }
    return '0%'; // this is when the Story has not been viewed yet
  };

  const goToPreviousStory = () => {
    if (isPaused) {
      setIsPaused(false);
    }
    pausedProgress.current = 0;
    progressAnim.setValue(0);
    if (currentStoryIndex === 0) {
      setWentBack(wentBack + 1);
      runProgressAnimation();
    } else {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  const handlePressIn = () => {
    //for pause if user holds the screen
    setIsPaused(true);
  };

  const handlePressOut = () => {
    //for pause if user releases the holded screen
    setIsPaused(false);
  };

  const handleScreenTouch = (evt: GestureResponderEvent) => {
    //this function takes the width and decided where the click was pressed if left or right
    const touchX = evt.nativeEvent.locationX;
    if (touchX < width / 2) {
      goToPreviousStory();
    } else {
      goToNextStory();
    }
  };

  useEffect(() => {
    if (!isPaused) {
      runProgressAnimation();
    } else {
      progressAnim.stopAnimation(value => {
        pausedProgress.current = value;
      });
    }
  }, [currentStoryIndex, isPaused]);

  const renderStoryContent = (story: TransactionListInterface) => {
    return (
      <View
        style={{
          paddingVertical: 25,
          paddingHorizontal: 15,
        }}>
        <CommonText
          content={t('THIS_MONTH')}
          color={appColors.light}
          size={'large'}
          style={{textAlign: 'center', marginTop: 10}}
        />
        <CommonText
          style={{paddingTop: 150, textAlign: 'center'}}
          content={
            story?.transactionType == 'Expense'
              ? t('YOU_SPEND')
              : t('YOU_EARNED')
          }
          color={appColors.light}
          bold
          size={'header'}
        />
        {story?.transactionFor && (
          <CommonText
            style={{paddingVertical: 15, textAlign: 'center'}}
            content={
              currentStoryIndex == 0
                ? getCurrencySymbol(monthlyReportData?.totalExpenses!)
                : getCurrencySymbol(monthlyReportData?.totalIncome!)
            }
            color={appColors.light}
            bold
            size={'appHeader'}
          />
        )}
        {story?.transactionFor ? (
          <View
            style={{
              backgroundColor: appColors.light,
              paddingHorizontal: 30,
              paddingVertical: 20,
              borderColor: appColors.formBorderColor,
              borderWidth: 1,
              borderRadius: 15,
              gap: 10,
              marginTop: 20,
            }}>
            <View>
              <CommonText
                style={{textAlign: 'center'}}
                content={currentStoryIndex == 0 ? t('SPENDING') : t('INCOME')}
                bold
                size={'label'}
              />
            </View>
            <View
              style={{
                alignSelf: 'center',
                borderColor: appColors.formBorderColor,
                borderWidth: 1,
                borderRadius: 15,
                gap: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 15,
                paddingVertical: 5,
              }}>
              <View
                style={{
                  backgroundColor: '#FCEED4',
                  padding: 5,
                  borderRadius: 10,
                }}>
                {getIcon(story)}
              </View>
              <CommonText content={story?.transactionFor} />
            </View>
            <CommonText
              style={{textAlign: 'center'}}
              content={getCurrencySymbol(story.amount)}
              bold
              size={'header'}
            />
          </View>
        ) : (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: appColors.light,
              paddingHorizontal: 30,
              paddingVertical: 20,
              borderColor: appColors.formBorderColor,
              borderWidth: 1,
              borderRadius: 15,
              marginTop: 20,
            }}>
            <LottieView
              source={require('@assets/lottie/list-empty-lottie.json')}
              autoPlay
              loop
              style={{height: 200, width: 200}}
            />
            <CommonText
              content={getCurrencySymbol(story?.amount)}
              color={appColors.dark}
              bold
              size={'header'}
            />
          </View>
        )}
      </View>
    );
  };

  const renderBudetStory = (story: {
    budget: BudgetInterface[];
    totalQuantity: number;
  }) => {
    return (
      <View
        style={{
          paddingVertical: 25,
          flex: 1,
          paddingHorizontal: 15,
          justifyContent: 'flex-start',
        }}>
        <CommonText
          content={t('THIS_MONTH')}
          color={appColors.light}
          size={'large'}
          style={{textAlign: 'center', marginTop: 10}}
        />
        <View
          style={{
            gap: 15,
            justifyContent: 'center',
            flex: 1,
          }}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <CommonText
              content={`${story?.budget?.length} of ${story?.totalQuantity} ${t(
                'BUDGET_IS',
              )}`}
              color={appColors.light}
              size={'appHeader'}
            />
            <CommonText
              content={t('EXCEEDS_LIMIT')}
              color={appColors.light}
              size={'appHeader'}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 15,
            }}>
            {story?.budget?.map((singleStory, index) => {
              const data = {
                ...singleStory,
                transactionFor: singleStory?.category,
                transactionType: 'Expense',
              };
              return (
                <View
                  key={index}
                  style={{
                    alignSelf: 'center',
                    borderColor: appColors.formBorderColor,
                    borderWidth: 1,
                    borderRadius: 15,
                    gap: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 15,
                    paddingVertical: 8,
                    backgroundColor: appColors?.light,
                  }}>
                  <View
                    style={{
                      backgroundColor: '#FCEED4',
                      padding: 5,
                      borderRadius: 10,
                    }}>
                    {getIcon(data)}
                  </View>
                  <CommonText content={data?.transactionFor} />
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const isTransactionListInterface = (
    story: any,
  ): story is TransactionListInterface => {
    return (
      story &&
      typeof story.amount === 'number' && // Adjust based on the type of `amount`
      '_id' in story &&
      'transactionDate' in story // Add other necessary properties to validate
    );
  };

  const getCurrentStoryName = (): 'Income' | 'Expense' | 'Budget' | 'Quote' => {
    return currentStory &&
      isTransactionListInterface(currentStory) &&
      currentStory?.transactionType == 'Expense'
      ? 'Expense'
      : currentStory &&
        isTransactionListInterface(currentStory) &&
        currentStory?.transactionType == 'Income'
      ? 'Income'
      : currentStory && 'budget' in currentStory
      ? 'Budget'
      : 'Quote';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor={
          isLoading
            ? appColors?.transparentBackground
            : getCurrentStoryName() == 'Expense'
            ? appColors?.expenseBg
            : getCurrentStoryName() == 'Income'
            ? appColors?.incomeBg
            : getCurrentStoryName() == 'Budget'
            ? appColors?.transferBg
            : appColors.primary
        }
        barStyle={'light-content'}
      />
      <Pressable
        onPress={handleScreenTouch}
        onLongPress={handlePressIn}
        onPressOut={handlePressOut}
        style={({pressed}) => [
          {
            opacity: pressed ? 0.9 : 1, //when clicked shows the user screen a little dimmed for feedback
          },
          styles.container,
          {
            backgroundColor: isLoading
              ? appColors?.transparentBackground
              : getCurrentStoryName() == 'Expense'
              ? appColors?.expenseBg
              : getCurrentStoryName() == 'Income'
              ? appColors?.incomeBg
              : getCurrentStoryName() == 'Budget'
              ? appColors?.transferBg
              : appColors.primary,
          },
        ]}>
        {isLoading ? (
          <CommonLoader />
        ) : (
          <View style={styles.container}>
            <View style={styles.progressBarContainer}>
              {availableStories?.map((story, index) => (
                <View key={index} style={styles.progressBarBackground}>
                  <Animated.View
                    style={[
                      styles.progressBar,
                      {
                        width: getProgressBarWidth(index, currentStoryIndex),
                      },
                    ]}
                  />
                </View>
              ))}
            </View>
            {getCurrentStoryName() === 'Expense' ||
            getCurrentStoryName() === 'Income' ? (
              currentStory &&
              isTransactionListInterface(currentStory) &&
              renderStoryContent(currentStory)
            ) : getCurrentStoryName() === 'Budget' ? (
              currentStory &&
              'budget' in currentStory &&
              renderBudetStory(currentStory!)
            ) : (
              <View
                style={{
                  paddingHorizontal: 15,
                  marginTop: 20,
                  flex: 1,
                  justifyContent: 'space-evenly',
                }}>
                <View style={{justifyContent: 'center', gap: 10}}>
                  <CommonText
                    content={`"${
                      currentStory &&
                      'quote' in currentStory &&
                      currentStory?.quote
                    }"`}
                    color={appColors.lightBg}
                    bold
                    size={'appHeader'}
                  />
                  <CommonText
                    content={`-${
                      currentStory &&
                      'author' in currentStory &&
                      currentStory?.author
                    }`}
                    color={appColors.light}
                    size={'header'}
                  />
                </View>
                {currentStoryIndex === 0 &&
                getCurrentStoryName() === 'Quote' ? undefined : (
                  <CommonButton
                    buttonType="clear"
                    title={t('SEE_FULL_DETAIL')}
                    onPress={() => {
                      navigation.navigate('FinanceReport');
                      closeHandler();
                    }}
                  />
                )}
              </View>
            )}
          </View>
        )}
      </Pressable>
    </SafeAreaView>
  );
};

export default FinanceStory;
