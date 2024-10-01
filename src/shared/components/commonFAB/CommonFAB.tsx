import React, {useEffect} from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';

import {appColors} from '@shared/appColors';
import {updateIsFabToggleOpen} from '@store/slice/appSlice';
import IncomeIcon from '@assets/svg/income.svg';
import ExpenseIcon from '@assets/svg/expense.svg';
import TransactionIcon from '@assets/svg/transaction.svg';
import {RootState} from '@store/store';

const ICON_SIZE = 60; // Size of the icons
const TRIANGLE_HEIGHT = 150; // Height of the triangle
const TRIANGLE_BASE = 130; // Base width of the triangle

const CommonFAB = ({
  handleFirstButtonPress,
  handleSecondButtonPress,
  handleThirdButtonPress,
}: {
  handleFirstButtonPress: () => void;
  handleSecondButtonPress: () => void;
  handleThirdButtonPress: () => void;
}) => {
  const dispatch = useDispatch();
  const isToggleOpen = useSelector(
    (state: RootState) => state.auth.isFabToggleOpen,
  );
  const firstValueX = useSharedValue(0);
  const firstValueY = useSharedValue(0);
  const secondValueY = useSharedValue(0);
  const thirdValueX = useSharedValue(0);
  const thirdValueY = useSharedValue(0);
  const isOpen = useSharedValue(false);
  const progress = useDerivedValue(() =>
    isOpen.value ? withTiming(1) : withTiming(0),
  );

  useEffect(() => {
    if (!isToggleOpen) {
      firstValueX.value = withSpring(0);
      firstValueY.value = withSpring(0);
      secondValueY.value = withSpring(0);
      thirdValueX.value = withSpring(0);
      thirdValueY.value = withSpring(0);
      isOpen.value = false;
    }
  }, [isToggleOpen]);

  const handlePress = () => {
    dispatch(updateIsFabToggleOpen(!isOpen.value));
    if (isOpen.value) {
      firstValueX.value = withSpring(0);
      firstValueY.value = withSpring(0);
      secondValueY.value = withSpring(0);
      thirdValueX.value = withSpring(0);
      thirdValueY.value = withSpring(0);
    } else {
      firstValueX.value = withSpring(-TRIANGLE_BASE / 2);
      firstValueY.value = withSpring(-TRIANGLE_HEIGHT / 2);
      secondValueY.value = withSpring(-TRIANGLE_HEIGHT);
      thirdValueX.value = withSpring(TRIANGLE_BASE / 2);
      thirdValueY.value = withSpring(-TRIANGLE_HEIGHT / 2);
    }
    isOpen.value = !isOpen.value;
  };

  const firstIcon = useAnimatedStyle(() => {
    return {
      transform: [
        {translateX: firstValueX.value},
        {translateY: firstValueY.value},
      ],
    };
  });

  const secondIcon = useAnimatedStyle(() => {
    return {
      transform: [{translateY: secondValueY.value}],
    };
  });

  const thirdIcon = useAnimatedStyle(() => {
    return {
      transform: [
        {translateX: thirdValueX.value},
        {translateY: thirdValueY.value},
      ],
    };
  });
  const plusIcon = useAnimatedStyle(() => {
    return {
      transform: [{rotate: `${progress.value * 45}deg`}],
    };
  });
  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.contentContainer,
          firstIcon,
          {
            backgroundColor: appColors.incomeBg,
          },
        ]}>
        <TouchableOpacity
          onPress={() => {
            handlePress();
            handleFirstButtonPress();
          }}
          activeOpacity={0.7}
          style={styles.iconContainer}>
          <IncomeIcon style={{color: appColors.light}} height={26} width={26} />
        </TouchableOpacity>
      </Animated.View>
      <Animated.View
        style={[
          styles.contentContainer,
          secondIcon,
          {
            backgroundColor: appColors.transferBg,
          },
        ]}>
        <TouchableOpacity
          onPress={() => {
            handlePress();
            handleSecondButtonPress();
          }}
          activeOpacity={0.7}
          style={styles.iconContainer}>
          <TransactionIcon
            style={{color: appColors.light}}
            height={26}
            width={26}
          />
        </TouchableOpacity>
      </Animated.View>
      <Animated.View
        style={[
          styles.contentContainer,
          thirdIcon,
          {
            backgroundColor: appColors.expenseBg,
          },
        ]}>
        <TouchableOpacity
          onPress={() => {
            handlePress();
            handleThirdButtonPress();
          }}
          activeOpacity={0.7}
          style={styles.iconContainer}>
          <ExpenseIcon
            style={{color: appColors.light}}
            height={26}
            width={26}
          />
        </TouchableOpacity>
      </Animated.View>
      <View
        style={{
          backgroundColor: appColors.light,
          borderRadius: 50,
          width: 70,
          height: 70,
          position: 'absolute',
          top: -60,
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: appColors.formBorderColor,
          borderWidth: 1,
          elevation: 5,
        }}>
        <Pressable
          style={styles.plusIconContainer}
          onPress={() => {
            handlePress();
          }}>
          <Animated.View style={[styles.iconContainer, plusIcon]}>
            <Image source={require('./PlusIcon.png')} style={styles.icon} />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
};

export default CommonFAB;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    bottom: 5,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
  },
  contentContainer: {
    backgroundColor: appColors.primary,
    borderRadius: 50,
    position: 'absolute',
    width: ICON_SIZE,
    height: ICON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    top: -60,
  },
  iconContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  icon: {
    width: 26,
    height: 26,
  },
  plusIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: ICON_SIZE,
    height: ICON_SIZE,
    backgroundColor: appColors.primary,
    borderRadius: 40,
  },
});
