import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  StatusBar,
  StatusBarProps,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import {RootState} from '@store/store';
import {appColors} from '@shared/appColors';
import {useDispatch, useSelector} from 'react-redux';
import {updateIsFabToggleOpen} from '@store/slice/appSlice';
import CommonText from '@shared/components/commonText/CommonText';
import MonthPicker, {EventTypes} from 'react-native-month-year-picker';
import moment from 'moment';
import {Icon} from '@rneui/base';
import Arrow from '@assets/svg/Arrow.svg';
import WarningIcon from '@assets/svg/warning.svg';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import {
  NavigationProp,
  ParamListBase,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import BudgetService from '@services/setup/budgetSerice';
import {Toast} from '@shared/ToastConfig';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import {generateUniqueColors, getCurrencySymbol} from '@src/lib/functions';

const Budget = () => {
  const dispatch = useDispatch();
  const isToggleOpen = useSelector(
    (state: RootState) => state.auth.isFabToggleOpen,
  );
  const isFocused = useIsFocused();
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [budget, setBudget] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date());
  const onValueChange = (event: EventTypes, newDate: Date) => {
    setShow(false);
    if (newDate) {
      setFilterDate(newDate);
    }
  };

  useEffect(() => {
    if (isFocused) {
      getBudgetList();
    }
  }, [isFocused, filterDate]);

  const getBudgetList = async () => {
    setIsLoading(true);
    const data = {filterDate};
    await BudgetService.getBudgetList(data)
      .then((res: any) => {
        if (res?.success) {
          setIsLoading(false);
          const colors = generateUniqueColors(res?.rows?.length);
          setBudget(
            res?.rows?.map((item: any, index: number) => {
              item.color = colors[index];
              return item;
            }),
          );
        }
      })
      .catch(err => {
        setIsLoading(false);
        console.log('Error in getting budget list');
        Toast({message: err?.response?.data?.message, type: 'error'});
      });
  };

  //method to go previous date
  const handlePreviousButton = () => {
    const prevDate = new Date(filterDate);
    prevDate.setMonth(filterDate.getMonth() - 1);
    setFilterDate(prevDate);
  };

  //method to change date to next date
  const handleNextButton = () => {
    const nextDate = new Date(filterDate);
    nextDate.setMonth(filterDate.getMonth() + 1);
    setFilterDate(nextDate);
  };

  const renderItem = ({item, index}: any) => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (filterDate.getMonth() >= new Date().getMonth()) {
            navigation.navigate('BudgetDetails', item);
          }
        }}
        activeOpacity={0.5}
        key={index}
        style={{
          flex: 1,
          padding: 15,
          gap: 8,
          borderWidth: 1,
          borderColor: appColors.formBorderColor,
          borderRadius: 10,
          backgroundColor: appColors.light,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 5,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
            }}>
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: item?.color,
                borderRadius: 8,
              }}
            />
            <CommonText content={item?.category} />
          </View>
          {Math.sign(item?.remaining) == -1 && (
            <WarningIcon height={20} width={20} color={appColors?.error} />
          )}
        </View>

        <CommonText
          content={`Remaining ${
            Math.sign(item?.remaining) == -1
              ? getCurrencySymbol(0)
              : getCurrencySymbol(item?.remaining)
          }`}
          bold
          size={'large'}
        />
        <View
          style={{
            backgroundColor: appColors?.formBorderColor,
            height: 10,
            borderRadius: 5,
          }}>
          <View
            style={{
              backgroundColor: item?.color,
              height: 10,
              borderRadius: 5,
              width: `${item?.spentPercent}%`,
            }}
          />
        </View>
        <CommonText
          content={`${getCurrencySymbol(item?.spent)} of ${getCurrencySymbol(
            item?.budget,
          )}`}
          color={appColors.placeholderColor}
        />
        {item?.spent > item?.budget && (
          <CommonText
            color={appColors.error}
            content="You’ve exceed the limit!"
            size={'error'}
          />
        )}
      </TouchableOpacity>
    );
  };

  function FocusAwareStatusBar(props: StatusBarProps) {
    return isFocused ? <StatusBar {...props} /> : null;
  }

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: appColors.light,
      }}>
      <View
        style={{
          backgroundColor: appColors.primary,
          flex: 1,
        }}>
        <FocusAwareStatusBar
          barStyle={'light-content'}
          backgroundColor={
            isLoading || isToggleOpen
              ? appColors.transparentBackground
              : appColors.primary
          }
        />
        <CommonHeader
          title=""
          leftIcon={false}
          headerBgc={appColors.primary}
          leftIconPressBack={() => {}}
        />
        <View style={{paddingHorizontal: 15, paddingBottom: 20}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity
              hitSlop={{bottom: 20, top: 20, left: 20, right: 20}}
              onPress={() => handlePreviousButton()}
              style={{transform: [{rotate: '180deg'}]}}>
              <Arrow stroke={appColors.light} height={35} width={35} />
            </TouchableOpacity>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <CommonText
                color={appColors.light}
                size={'large'}
                bold
                content={moment(filterDate).format('MMMM')}
              />
              <Icon
                onPress={() => setShow(true)}
                name="calendar-month"
                type="material"
                size={25}
                color={appColors.light}
              />
            </View>
            <TouchableOpacity
              hitSlop={{bottom: 20, top: 20, left: 20, right: 20}}
              onPress={() => handleNextButton()}>
              <Arrow stroke={appColors.light} height={35} width={35} />
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            backgroundColor: appColors.light,
            padding: 15,
            paddingBottom: 120,
          }}>
          {filterDate.getMonth() >= new Date().getMonth() && (
            <TouchableOpacity
              activeOpacity={0.5}
              style={{
                padding: 5,
                borderColor: appColors.formBorderColor,
                borderWidth: 1,
                marginLeft: 'auto',
                borderRadius: 8,
                backgroundColor: appColors.buttonClear,
                marginBottom: 10,
              }}
              onPress={() =>
                navigation.navigate('AddBudget', {
                  budgetMonth: String(filterDate),
                })
              }>
              <Icon
                name="plus"
                type="feather"
                size={25}
                color={appColors.primary}
              />
            </TouchableOpacity>
          )}

          <FlatList
            data={budget}
            renderItem={renderItem}
            keyExtractor={(_, index) => index.toString()}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flex: budget?.length === 0 ? 1 : undefined,
              gap: 10,
            }}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <CommonText
                  style={{textAlign: 'center', paddingHorizontal: 30}}
                  content="You don’t have a budget. Let’s make one so you in control."
                />
              </View>
            }
          />
        </View>
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
      {show && (
        <MonthPicker onChange={onValueChange} value={filterDate} locale="en" />
      )}
      <Modal animationType="fade" visible={isLoading} transparent={true}>
        <CommonLoader />
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default Budget;

const styles = StyleSheet.create({});
