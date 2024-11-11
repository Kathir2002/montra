import React, {useEffect, useState} from 'react';
import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
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
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import AccountService from '@services/setup/accountService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import {updateIsLoggedin} from '@store/slice/appSlice';

interface ItemType {
  id: number | string;
  value: React.JSX.Element;
}

interface Props {}

const PinGerneration = () => {
  const [pinValue, setPinValue] = useState('');
  const [isRetype, setIsRetype] = useState(false);
  const [Loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [retypePinValue, setRetypePinValue] = useState('');
  const maxPinLength = 6; // Maximum length of the PIN
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const [isPinSetupDone, setIsPinSetupDone] = useState(false);
  const isFocused = useIsFocused();
  useEffect(() => {
    AsyncStorage.getItem('securityPin').then(value => {
      if (value) {
        setIsPinSetupDone(true);
      } else {
        setIsPinSetupDone(false);
      }
    });
  }, [isFocused]);

  const userAddPinHandler = async () => {
    setLoading(true);

    if (!isPinSetupDone) {
      await AsyncStorage.setItem('securityPin', JSON.stringify(pinValue))
        .then(() => {
          setLoading(false);
          dispatch(updateIsLoggedin(true));

          navigation.navigate('Setup');
          Toast({
            message: 'Security pin generated sucessfully',
            type: 'success',
          });
        })
        .catch(() => {
          setLoading(false);
          Toast({message: 'Something went wrong', type: 'error'});
        });
    } else {
      await AsyncStorage.getItem('securityPin')
        .then(value => {
          if (value ? JSON.parse(value) : null === pinValue) {
            setLoading(false);
            dispatch(updateIsLoggedin(true));
            // Toast({
            //   message: ' sucessfully',
            //   type: 'success',
            // });
          }
        })
        .catch(() => {
          setLoading(false);
          Toast({message: 'Something went wrong', type: 'error'});
        });
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
      value: <DeleteTextIcon width={40} height={40} stroke={appColors.light} />,
    },
    {
      id: 0,
      value: <CommonText size={30} content={'0'} color={appColors.light} />,
    },
    {
      id: 'submit',
      value: <ArrowIcon width={40} height={40} stroke={appColors.light} />,
    },
  ];

  const handlePress = async (item: ItemType) => {
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
          Toast({message: 'Please enter the pin', type: 'error'});
        }
      } else if (retypePinValue?.length === maxPinLength) {
        if (retypePinValue === pinValue) {
          userAddPinHandler();
        } else {
          Toast({message: "Pin doesn't same", type: 'error'});
        }
      } else {
        Toast({message: 'Please enter the pin', type: 'error'});
      }
    } else {
      isRetype
        ? setRetypePinValue(prev => (prev + item?.id).slice(0, maxPinLength))
        : setPinValue(prev => (prev + item?.id).slice(0, maxPinLength));
    }
  };
  console.log(isPinSetupDone);

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

  return (
    <ScrollView
      contentContainerStyle={{flexGrow: 1, backgroundColor: appColors.primary}}>
      <CommonHeader
        title=""
        leftIcon={false}
        leftIconPressBack={() => {}}
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
                ? 'Ok. Re type your PIN again.'
                : 'Let’s  setup your PIN'
              : 'Enter Pin'
          }
          size={'large'}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            marginTop: 30,
          }}>
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
        </View>
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
