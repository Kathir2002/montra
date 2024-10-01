import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  GestureResponderEvent,
  Pressable,
  useWindowDimensions,
  View,
  StatusBar,
  SafeAreaView,
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
  useRoute,
} from '@react-navigation/native';
import {TransactionListInterface} from '@screens/Dashboard';
import LottieView from 'lottie-react-native';
import CommonButton from '@shared/components/commonButton/CommonButton';
import {getCurrencySymbol} from '@src/lib/functions';

const FinanceStory = ({monthlyReportData, closeHandler}: any) => {
  const {width} = useWindowDimensions();
  const pausedProgress = useRef(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const navigation: NavigationProp<ParamListBase> = useNavigation();

  const expenseData = monthlyReportData?.maxExpenseData;
  const incomeData = monthlyReportData?.maxIncomeData;
  const stories = [expenseData, incomeData, {}];

  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const currentStory = stories[currentStoryIndex];
  const [wentBack, setWentBack] = useState(0);

  /**
   * method to get the currency symbol
   * @param amount, currencyCode
   */

  const goToNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
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
    const getIcon = () => {
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

    return (
      <View
        style={{
          paddingVertical: 25,
          paddingHorizontal: 15,
        }}>
        <CommonText
          content="This Month"
          color={appColors.light}
          size={'large'}
          style={{textAlign: 'center', marginTop: 10}}
        />
        <CommonText
          style={{paddingTop: 150, textAlign: 'center'}}
          content={
            story?.transactionType == 'Expense'
              ? 'You Spend 💸'
              : 'You Earned 💰'
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
                ? getCurrencySymbol(
                    monthlyReportData?.totalExpenses,
                    // route?.params?.monthlyReportData?.totalExpenses,
                  )
                : getCurrencySymbol(
                    monthlyReportData?.totalIncome,
                    // route?.params?.monthlyReportData?.totalIncome,
                  )
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
                content="and your biggest"
                bold
                size={'label'}
              />
              <CommonText
                style={{textAlign: 'center'}}
                content="spending is from"
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
                {getIcon()}
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor={
          currentStoryIndex === 0
            ? appColors.expenseBg
            : currentStoryIndex === 1
            ? appColors.incomeBg
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
            backgroundColor:
              currentStoryIndex === 0
                ? appColors.expenseBg
                : currentStoryIndex === 1
                ? appColors.incomeBg
                : appColors.primary,
          },
        ]}>
        <View style={styles.container}>
          <View style={styles.progressBarContainer}>
            {stories.map((story, index) => (
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
          {currentStoryIndex == 0 || currentStoryIndex == 1 ? (
            renderStoryContent(currentStory)
          ) : (
            <View style={{paddingHorizontal: 15, marginTop: 20}}>
              <CommonButton
                buttonType="clear"
                title="See the full detail"
                onPress={() => {
                  navigation.navigate('FinanceReport');
                  closeHandler();
                }}
              />
            </View>
          )}
        </View>
      </Pressable>
    </SafeAreaView>
  );
};

export default FinanceStory;
