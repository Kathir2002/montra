import React, {useEffect, useState} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  StatusBar,
  View,
} from 'react-native';
import {appColors} from '@shared/appColors';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import {
  NavigationProp,
  ParamListBase,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import CommonText from '@shared/components/commonText/CommonText';
import AccountService from '@services/setup/accountService';
import {Toast} from '@shared/ToastConfig';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import CommonSwitch from '@shared/components/commonSwitch/Switch';
import {useTranslation} from 'react-i18next';

interface NotificationDataI {
  title: string;
  subTitle: string;
  isEnabled: boolean;
  for: 'isExpenseAlert' | 'isBudgetAlert' | 'isTipsAndArticles';
}

const Notification = () => {
  const {t} = useTranslation('profile');
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  // const notifData = ['isExpenseAlert', 'isBudgetAlert', 'isTipsAndArticles'];

  const [notificationData, setNotificationData] = useState<NotificationDataI[]>(
    [
      {
        title: t('EXPENSE_ALERT'),
        subTitle: t('EXPENSE_ALERT_SUBTITLE'),
        isEnabled: false,
        for: 'isExpenseAlert',
      },
      {
        title: t('BUDGET'),
        subTitle: t('BUDGET_ALERT_SUBTITLE'),
        isEnabled: false,
        for: 'isBudgetAlert',
      },
      {
        title: t('TIPS&TRICKS'),
        subTitle: t('TIPS_ALERT_SUBTITLE'),
        isEnabled: false,
        for: 'isTipsAndArticles',
      },
    ],
  );
  useEffect(() => {
    if (isFocused) {
      getNotificationDetails();
    }
  }, [isFocused]);
  const getNotificationDetails = async () => {
    setLoading(true);
    await AccountService.getUserNotificationPreference()
      .then((res: any) => {
        if (res?.success) {
          setLoading(false);
          setNotificationData(prev => {
            let temp = [...prev];
            temp.map(item => {
              item.isEnabled = res?.notification[item.for];
            });
            return temp;
          });
        }
      })
      .catch(err => {
        setLoading(false);
        Toast({message: err?.response?.data?.message, type: 'error'});
      });
  };

  const updateNotificationPreferences = async (
    item: NotificationDataI,
    index: number,
  ) => {
    setLoading(true);
    const data = {
      notification: {[item['for']]: !item.isEnabled},
    };
    await AccountService.changeAccountPreferences(data)
      .then((res: any) => {
        if (res?.success) {
          setLoading(false);
          setNotificationData(prev => {
            let temp = [...prev];
            temp[index].isEnabled = res?.notification[item.for];
            return temp;
          });
          Toast({
            message: t('NOTIFICATION_PREFERENCES_SUCCESS'),
            type: 'success',
          });
        }
      })
      .catch(err => {
        setLoading(false);
        Toast({message: err?.response?.data?.message, type: 'error'});
      });
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: NotificationDataI;
    index: number;
  }) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginVertical: 10,
        }}>
        <View style={{gap: 5, flex: 0.7}}>
          <CommonText content={item?.title} bold />
          <CommonText
            content={item?.subTitle}
            color={appColors.placeholderColor}
          />
        </View>
        <CommonSwitch
          activeColor={appColors.primary}
          value={item.isEnabled}
          style={{transform: [{scaleX: 0.8}, {scaleY: 0.8}]}}
          onValueChange={() => {
            updateNotificationPreferences(item, index);
          }}
          inActiveColor={appColors.placeholderColor}
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{flex: 1, backgroundColor: appColors.light}}>
      <CommonHeader
        title={'NOTIFICATION'}
        leftIcon
        leftIconPressBack={() => navigation.goBack()}
      />
      <StatusBar
        backgroundColor={
          loading ? appColors?.transparentBackground : appColors.light
        }
        barStyle={loading ? 'light-content' : 'dark-content'}
      />
      <FlatList
        initialNumToRender={25}
        contentContainerStyle={{paddingHorizontal: 15}}
        data={notificationData}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.01}
        keyExtractor={(_, index) => index.toString()}
      />

      <Modal visible={loading} transparent={true} animationType="fade">
        <CommonLoader />
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default Notification;
