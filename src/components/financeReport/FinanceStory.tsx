import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  Pressable,
  useWindowDimensions,
  View,
  StatusBar,
  PanResponder,
  Dimensions,
} from 'react-native';
import styles from './financeStory.styles';
import { appColors } from '@shared/appColors';
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
import { TransactionListInterface } from '@screens/Dashboard';
import LottieView from 'lottie-react-native';
import CommonButton from '@shared/components/commonButton/CommonButton';
import { getCurrencySymbol } from '@src/lib/functions';
import TransactionService from '@services/transactionService';
import { Toast } from '@shared/ToastConfig';
import moment from 'moment';
import AccountService from '@services/setup/accountService';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import BudgetService from '@services/setup/budgetSerice';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height: screenHeight } = Dimensions.get('window');

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
  | { budget: BudgetInterface[]; totalQuantity: number }
  | { quote: string; author: string }
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

const getIcon = (story: { transactionFor: string; transactionType: string }) => {
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

const FinanceStory = ({ closeHandler }: { closeHandler: () => void }) => {
  const { t } = useTranslation('finaceReport');
  const { width } = useWindowDimensions();
  const pausedProgress = useRef(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [isLoading, setIsLoading] = useState(true);

  // Pull-to-close animation values
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

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
      | { budget: BudgetInterface[]; totalQuantity: number }
      | { quote: string; author: string } => {
      if (!item) return false;
      if ('budget' in item && item.budget.length === 0) return false;
      if ('quote' in item && !item.author) return false;
      return true;
    },
  );

  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const currentStory = availableStories[currentStoryIndex];
  const [wentBack, setWentBack] = useState(0);

  // Pan responder for pull-to-close functionality
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // // Only respond to vertical gestures that start from the top 20% of the screen
        // return (
        //   Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
        //   evt.nativeEvent.pageY < screenHeight * 0.2 &&
        //   gestureState.dy > 0
        // );
        return (
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
          gestureState.dy > 0
        );
      },
      onPanResponderGrant: () => {
        // Pause the story when starting to drag
        setIsPaused(true);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Update the translateY value based on the drag distance
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
          // Also update opacity for fade effect
          const opacityValue = Math.max(0.3, 1 - gestureState.dy / (screenHeight * 2.5));
          opacity.setValue(opacityValue);
        }
      },

      onPanResponderRelease: (evt, gestureState) => {
        // Resume the story logic only if we are NOT closing
        // (See previous advice about moving this inside the else block)

        if (gestureState.dy > 150) {
          // CLOSE ACTION
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: screenHeight,
              duration: 300,
              // IMPORTANT: Change this to false so it knows the exact JS value
              useNativeDriver: false,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              // Keep this consistent with the above
              useNativeDriver: false,
            }),
          ]).start(() => {
            closeHandler();
          });
        } else {
          // CANCEL ACTION (Snap back)
          setIsPaused(false); // Resume story here

          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              // Spring works better with native driver usually, but 
              // if it still glitches, switch this to false too.
              useNativeDriver: true,
              tension: 100,
              friction: 8,
            }),
            Animated.spring(opacity, {
              toValue: 1,
              useNativeDriver: true,
              tension: 100,
              friction: 8,
            }),
          ]).start();
        }
      },

    }),
  ).current;

  const isTransactionListInterface = (
    story: any,
  ): story is TransactionListInterface => {
    return (
      story &&
      typeof story.amount === 'number' &&
      '_id' in story &&
      'transactionDate' in story
    );
  };



  const getCurrentStoryName: 'Income' | 'Expense' | 'Budget' | 'Quote' = useMemo(() => {
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
  }, [currentStory]);

  useEffect(() => {
    getFinanceStoryData();
  }, []);


  const getMaxTransaction = (
    transactions: TransactionListInterface[],
    type: 'Income' | 'Expense',
  ): TransactionListInterface | null => {
    const currentMonth = moment().month();
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
                  const data = { filterDate: new Date() };
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
    }
  };

  const runProgressAnimation = () => {
    progressAnim.setValue(pausedProgress.current);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: (1 - pausedProgress.current) * 6000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        goToNextStory();
      }
    });
  };

  const getProgressBarWidth = (storyIndex: number, currentIndex: number) => {
    if (currentIndex > storyIndex) {
      return '100%';
    }
    if (currentIndex === storyIndex) {
      return progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
      });
    }
    return '0%';
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
    setIsPaused(true);
  };

  const handlePressOut = () => {
    setIsPaused(false);
  };

  const handleScreenTouch = (evt: GestureResponderEvent) => {
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
          style={{ textAlign: 'center', marginTop: 10 }}
        />
        <CommonText
          style={{ paddingTop: 150, textAlign: 'center' }}
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
            style={{ paddingVertical: 15, textAlign: 'center' }}
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
                style={{ textAlign: 'center' }}
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
              style={{ textAlign: 'center' }}
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
              style={{ height: 200, width: 200 }}
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
          style={{ textAlign: 'center', marginTop: 10 }}
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



  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: "transparent" }]} edges={["left"]} >
      <StatusBar barStyle={'light-content'} />
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateY }],
          opacity,
          backgroundColor: isLoading
            ? appColors?.transparentBackground
            : getCurrentStoryName == 'Expense'
              ? appColors?.expenseBg
              : getCurrentStoryName == 'Income'
                ? appColors?.incomeBg
                : getCurrentStoryName == 'Budget'
                  ? appColors?.transferBg
                  : appColors.primary,
        }}
        {...panResponder.panHandlers}>
        <Pressable
          onPress={handleScreenTouch}
          onLongPress={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.9 : 1,
            },
            styles.container,
            {
              backgroundColor: 'transparent',
            },
          ]}>
          {isLoading ? (
            <CommonLoader />
          ) : (
            <View style={styles.container}>
              {/* Pull indicator */}
              {/* <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: appColors.light,
                  borderRadius: 2,
                  alignSelf: 'center',
                  marginTop: 10,
                  opacity: 0.7,
                }}
              /> */}

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
              {getCurrentStoryName === 'Expense' ||
                getCurrentStoryName === 'Income' ? (
                currentStory &&
                isTransactionListInterface(currentStory) &&
                renderStoryContent(currentStory)
              ) : getCurrentStoryName === 'Budget' ? (
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
                  <View style={{ justifyContent: 'center', gap: 10 }}>
                    <CommonText
                      content={`"${currentStory &&
                        'quote' in currentStory &&
                        currentStory?.quote
                        }"`}
                      color={appColors.lightBg}
                      bold
                      size={'appHeader'}
                    />
                    <CommonText
                      content={`-${currentStory &&
                        'author' in currentStory &&
                        currentStory?.author
                        }`}
                      color={appColors.light}
                      size={'header'}
                    />
                  </View>
                  {currentStoryIndex === 0 &&
                    getCurrentStoryName === 'Quote' ? undefined : (
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
      </Animated.View>
    </SafeAreaView>
  );
};

export default FinanceStory;
