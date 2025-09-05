import React, {useEffect, useState} from 'react';
import {
  BackHandler,
  FlatList,
  I18nManager,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import {appColors} from '@shared/appColors';
import CommonText from '@shared/components/commonText/CommonText';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import ArrowIcon from '@assets/svg/submit-arrow.svg';
import DeleteTextIcon from '@assets/svg/delete-text.svg';
import {Toast} from '@shared/ToastConfig';
import {
  NavigationProp,
  ParamListBase,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch, useSelector} from 'react-redux';
import {updateIsLoggedin} from '@store/slice/appSlice';
import {RootState} from '@store/store';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {useTranslation} from 'react-i18next';

interface ItemType {
  id: number | string;
  value: React.JSX.Element;
}

const PinGerneration = () => {
  // Shared value for shake animation
  const shakeValue = useSharedValue(0);
  const [pinValue, setPinValue] = useState('');
  const [isRetype, setIsRetype] = useState(false);
  const [Loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const [retypePinValue, setRetypePinValue] = useState('');
  const maxPinLength = 6; // Maximum length of the PIN
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [isPinSetupDone, setIsPinSetupDone] = useState(false);
  const isFocused = useIsFocused();
  const {t} = useTranslation('auth');

  useEffect(() => {
    AsyncStorage.getItem('securityPin').then(value => {
      if (value) {
        setIsPinSetupDone(true);
      } else {
        setIsPinSetupDone(false);
      }
    });
  }, [isFocused]);

  // useEffect to handle the native back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => backHandler.remove();
  }, []);

  const handleBackPress = () => {
    BackHandler.exitApp();
    return true;
  };

  const userAddPinHandler = async () => {
    setLoading(true);

    if (!isPinSetupDone) {
      await AsyncStorage.setItem('securityPin', JSON.stringify(pinValue))
        .then(() => {
          setLoading(false);
          dispatch(updateIsLoggedin(true));
          if (!userDetails.isSetupDone) {
            navigation.navigate('Setup');
          }
          Toast({
            message: t('SECURITY_PIN_GENERATED'),
            type: 'success',
          });
        })
        .catch(() => {
          setLoading(false);
          Toast({message: t('SOMETHING_WENT_WRONG'), type: 'error'});
        });
    } else {
      if (pinValue.length === maxPinLength) {
        await AsyncStorage.getItem('securityPin')
          .then(value => {
            const savedPin = value ? JSON.parse(value) : null;

            if (savedPin === pinValue) {
              setLoading(false);
              dispatch(updateIsLoggedin(true));
            } else {
              triggerShakeAnimation();
              setPinValue('');
              Toast({
                message: t('WRONG_PIN'),
                type: 'error',
              });
            }
          })
          .catch(() => {
            setLoading(false);
            Toast({message: t('SOMETHING_WENT_WRONG'), type: 'error'});
          });
      } else {
        triggerShakeAnimation();
        Toast({message: t('PIN_REQUIRED'), type: 'error'});
      }
    }
  };

  const data = [
    {
      id: 1,
      value: <CommonText size={30} content={'1'} color={appColors.light} />,
    },
    {
      id: 2,
      value: <CommonText size={30} content={'2'} color={appColors.light} />,
    },
    {
      id: 3,
      value: <CommonText size={30} content={'3'} color={appColors.light} />,
    },
    {
      id: 4,
      value: <CommonText size={30} content={'4'} color={appColors.light} />,
    },
    {
      id: 5,
      value: <CommonText size={30} content={'5'} color={appColors.light} />,
    },
    {
      id: 6,
      value: <CommonText size={30} content={'6'} color={appColors.light} />,
    },
    {
      id: 7,
      value: <CommonText size={30} content={'7'} color={appColors.light} />,
    },
    {
      id: 8,
      value: <CommonText size={30} content={'8'} color={appColors.light} />,
    },
    {
      id: 9,
      value: <CommonText size={30} content={'9'} color={appColors.light} />,
    },
    {
      id: 'delete',
      value: (
        <View
          style={{
            transform: [{rotate: I18nManager.isRTL ? '180deg' : '0deg'}],
          }}>
          <DeleteTextIcon width={40} height={40} stroke={appColors.light} />
        </View>
      ),
    },
    {
      id: 0,
      value: <CommonText size={30} content={'0'} color={appColors.light} />,
    },
    {
      id: 'submit',
      value: (
        <View
          style={{
            transform: [{rotate: I18nManager.isRTL ? '180deg' : '0deg'}],
          }}>
          <ArrowIcon width={40} height={40} stroke={appColors.light} />
        </View>
      ),
    },
  ];

  const handlePress = async (item: ItemType) => {
    Vibration.vibrate(50);

    if (item?.id == 'delete') {
      isRetype
        ? setRetypePinValue(prev => prev.slice(0, -1))
        : setPinValue(prev => prev.slice(0, -1));
    } else if (item?.id == 'submit') {
      if (isPinSetupDone) {
        userAddPinHandler();
      } else if (!isRetype) {
        if (pinValue?.length === maxPinLength) {
          setIsRetype(true);
        } else {
          Toast({message: t('PIN_REQUIRED'), type: 'error'});
        }
      } else if (retypePinValue?.length === maxPinLength) {
        if (retypePinValue === pinValue) {
          userAddPinHandler();
        } else {
          triggerShakeAnimation();
          setRetypePinValue('');
          Toast({message: t('PIN_DOESNT_MATCH'), type: 'error'});
        }
      } else {
        Toast({message: t('PIN_REQUIRED'), type: 'error'});
      }
    } else {
      isRetype
        ? setRetypePinValue(prev => (prev + item?.id).slice(0, maxPinLength))
        : setPinValue(prev => (prev + item?.id).slice(0, maxPinLength));
    }
  };

  const renderItem = ({item, index}: {item: ItemType; index: number}) => {
    return (
      <TouchableOpacity
        hitSlop={{bottom: 25, left: 25, right: 25, top: 25}}
        onPress={() => handlePress(item)}
        activeOpacity={0.5}
        style={{
          marginHorizontal: 30,
          marginBottom: 20,
          flex: 1 / 3,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {item.value}
      </TouchableOpacity>
    );
  };

  // Animation style for container
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: shakeValue.value}],
    };
  });
  const triggerShakeAnimation = () => {
    shakeValue.value = withSequence(
      withTiming(-20, {duration: 100}),
      withSpring(0, {
        damping: 8,
        mass: 0.5,
        stiffness: 1000,
        restDisplacementThreshold: 0.1,
      }),
    );
  };

  return (
    <ScrollView
      contentContainerStyle={{flexGrow: 1, backgroundColor: appColors.primary}}>
      <CommonHeader
        title=""
        leftIcon={isRetype}
        theme='dark'
        leftIconPressBack={() => {
          if(isRetype) {
            setIsRetype(false)
            setPinValue("")
            setRetypePinValue("")
          }
        }}
        headerBgc={appColors.primary}
      />
      <StatusBar backgroundColor={appColors.primary} />
      <View
        style={{
          alignItems: 'center',
          padding: 15,
          flex: 1,
        }}>
        <CommonText
          color={appColors.light}
          content={
            !isPinSetupDone
              ? isRetype
                ? t('RETYPE_PIN')
                : t('SETUP_YOUR_PIN')
              : t('ENTER_PIN')
          }
          size={'large'}
        />
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              marginTop: 30,
            },
            animatedStyle,
          ]}>
          {Array.from({length: maxPinLength}).map((pin, index) => {
            return (
              <View
                key={index}
                style={{
                  marginVertical: 10,
                  backgroundColor:
                    index <
                    (isRetype ? retypePinValue?.length : pinValue?.length)
                      ? appColors.light
                      : 'transparent',
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: appColors.light,
                }}
              />
            );
          })}
        </Animated.View>
      </View>
      <FlatList
        contentContainerStyle={{
          flex: 1,
          justifyContent: 'flex-end',
          paddingBottom: 30,
        }}
        data={data}
        scrollEnabled={false}
        numColumns={3}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </ScrollView>
  );
};

export default PinGerneration;

const styles = StyleSheet.create({});
