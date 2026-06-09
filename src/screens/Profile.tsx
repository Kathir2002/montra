import {
  Platform,
  ScrollView,
  StatusBarProps,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import React, { useRef, useState } from 'react';

import EncryptedStorage from 'react-native-encrypted-storage';
import EditIcon from '@assets/svg/edit.svg';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useDispatch, useSelector } from 'react-redux';
import { updateCurrentUser, updateIsFabToggleOpen, updateIsLoggedin, } from '@store/slice/appSlice';
import { NavigationProp, ParamListBase, useIsFocused, useNavigation, } from '@react-navigation/native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { RootState } from '@store/store';
import { appColors } from '@shared/appColors';
import { Toast } from '@shared/ToastConfig';
import CommonText from '@shared/components/commonText/CommonText';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import { StatusBar } from 'react-native';
import { Avatar } from '@rneui/base';
import AccountIcon from '@assets/svg/account.svg';
import SettingsIcon from '@assets/svg/settings.svg';
import LogoutIcon from '@assets/svg/logout.svg';
import DeactivateIcon from '@assets/svg/deactivate.svg';
import ExportDataIcon from '@assets/svg/export.svg';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import { RBSheetRef } from '@shared/components/commonRBSheet/CommonRBSheet';
import {
  DEV_ANDROID_CLIENTID,
  DEV_IOS_CLIENTID,
  DEV_WEB_CLIENTID,
  PROD_ANDROID_CLIENTID,
  PROD_IOS_CLIENTID,
  PROD_WEB_CLIENTID,
} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AccountService from '@services/setup/accountService';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import FinanceStory from '@components/financeReport/FinanceStory';
import { useTranslation } from 'react-i18next';
import CommonConfirmation from '@shared/components/CommonConfirmation';
import { removeAllShortcuts } from '@src/lib/shortcutHandler';
import { CustomModal } from '@shared/components/CustomModal';

const Profile = () => {
  const { t } = useTranslation('profile');
  const [isLoading, setIsLoading] = useState(false);
  const isToggleOpen = useSelector(
    (state: RootState) => state.auth.isFabToggleOpen,
  );
  const isFocused = useIsFocused();

  const devData = {
    webClientId: DEV_WEB_CLIENTID,
    // androidClientId: DEV_ANDROID_CLIENTID,
    // iosClientId: DEV_IOS_CLIENTID,
    scopes: ['profile', 'email'],
  };

  const prodData = {
    webClientId: PROD_WEB_CLIENTID,
    // androidClientId: PROD_ANDROID_CLIENTID,
    // iosClientId: PROD_IOS_CLIENTID,
    scopes: ['profile', 'email'],
  };
  GoogleSignin.configure(__DEV__ ? devData : prodData);

  const dispatch = useDispatch();
  const rbSheetRef = useRef<RBSheetRef>(null);
  const deactivateRBSheetRef = useRef<RBSheetRef>(null);
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const [isFinanceStoryVisible, setIsFinanceStoryVisible] = useState(false);
  const [rbSheetOpen, setRbSheetOpen] = useState(false);
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const messagingInstance = getMessaging();

  const logoutUser = async () => {
    await GoogleSignin.signOut();
    if (Platform.OS === 'android') {
      try {
        // Before clearing user data
        removeAllShortcuts();
        // Proceed with logout
      } catch (error) {
        console.error('Failed to remove shortcuts:', error);
      }
    }
    // Perform additional cleanup and logout operations.
    const ASYNC_KEYS = await AsyncStorage.getAllKeys();
    await EncryptedStorage.clear();
    ASYNC_KEYS?.map(async (res: string) => {
      if (res !== 'getStartedVisible') {
        await AsyncStorage.removeItem(res);
      }
    });
    dispatch(updateIsLoggedin(false));
    dispatch(updateCurrentUser({ activeContactRequestCount: 0, isAdmin: false }));
    setIsLoading(false);
  };

  const logoutHandler = async (isFromDeactivateAccount: boolean = false) => {
    setIsLoading(true);
    try {
      const fcmToken = await getToken(messagingInstance);

      const data = { fcmToken };
      if (!isFromDeactivateAccount) {
        await AccountService.logoutUser(data)
          .then(async (res: any) => {
            if (res?.success) {
              await logoutUser();
            }
          })
          .catch(err => {
            setIsLoading(false);
            Toast({ type: 'error', message: err?.response?.data?.message });
          });
      } else {
        await logoutUser();
      }
    } catch (error: any) {
      setIsLoading(false);
      console.log('Google Sign-Out Error: ', error);
      Toast({ message: error?.message, type: 'error' });
    }
  };

  const deactivateAccountHandler = async () => {
    setIsLoading(true);
    await AccountService.deactivateAccount()
      .then((res: any) => {
        if (res?.success) {
          Toast({ message: res?.message, type: 'success' });
          logoutHandler(true);
        }
      })
      .catch(err => {
        setIsLoading(false);
        Toast({ message: err?.response?.data?.message, type: 'error' });
      });
  };

  const profilePageData = [
    {
      title: t('ACCOUNT'),
      icon: <AccountIcon width={25} height={25} />,
      onPress: () => navigation.navigate('Account'),
    },
    {
      title: t('SETTINGS'),
      icon: <SettingsIcon width={25} height={25} />,
      onPress: () => navigation.navigate('Settings'),
    },
    {
      title: t('EXPORT_DATA'),
      icon: <ExportDataIcon width={25} height={25} />,
      onPress: () => navigation.navigate('ExportData'),
    },
    {
      title: t('DEACTIVATE_ACCOUNT'),
      icon: <DeactivateIcon width={25} height={25} />,
      onPress: () => {
        deactivateRBSheetRef.current?.open();
        setRbSheetOpen(true);
      },
    },
    {
      title: t('LOGOUT'),
      icon: <LogoutIcon width={25} height={25} />,
      onPress: () => {
        rbSheetRef.current?.open();
        setRbSheetOpen(true);
      },
    },
  ];

  const RenderItem = ({
    item,
    index,
  }: {
    item: {
      onPress: () => void;
      icon: React.JSX.Element;
      title: string;
    };
    index: number;
  }) => {
    return (
      <View
        style={{ flex: 1, marginTop: index == 0 ? 20 : 0, marginBottom: 20 }}
        key={index}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={item.onPress}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}>
          <View
            style={{
              backgroundColor: appColors.buttonClear,
              padding: 10,
              borderRadius: 15,
            }}>
            {item?.icon}
          </View>
          <CommonText content={item?.title} size={'large'} />
        </TouchableOpacity>
      </View>
    );
  };

  function FocusAwareStatusBar(props: StatusBarProps) {
    return isFocused ? <StatusBar {...props} /> : null;
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: '#F6F6F6',
        paddingHorizontal: 15,
        paddingBottom: 100,
      }}>
      <CommonHeader
        leftIconPressBack={() => { }}
        leftIcon={false}
        title=""
        headerBgc="#F6F6F6"
      />
      <FocusAwareStatusBar
        backgroundColor={
          rbSheetOpen || isToggleOpen || isLoading
            ? appColors.transparentBackground
            : '#F6F6F6'
        }
        barStyle={rbSheetOpen ? 'light-content' : 'dark-content'}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 20,
        }}>
        <TouchableOpacity
          onPress={() => {
            Vibration.vibrate(50)
            StatusBar.setBarStyle('light-content');
            setIsFinanceStoryVisible(true);
          }}
          activeOpacity={0.7}
          style={{
            borderColor: appColors.primary,
            padding: 2,
            borderWidth: 2,
            height: 80,
            width: 80,
            borderRadius: 55,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Avatar
            source={{ uri: userDetails.picture }}
            size={70}
            avatarStyle={{ borderRadius: 35 }}
          />
        </TouchableOpacity>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flex: 1,
          }}>
          <View style={{ gap: 5 }}>
            <CommonText
              content={t('USER_NAME')}
              color={appColors.placeholderColor}
            />
            <CommonText content={userDetails.name} bold size={'header'} />
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <EditIcon width={20} height={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{
          backgroundColor: appColors.light,
          marginTop: 50,
          borderRadius: 20,
          elevation: 2,
          paddingHorizontal: 15,
        }}>
        {profilePageData.map((item, index) => {
          return <RenderItem index={index} item={item} key={index} />;
        })}
      </View>
      <CommonConfirmation
        titleText={`${t('LOGOUT')}?`}
        subText={t('LOGOUT_CONFIRMATION')}
        handleCancelBtn={() => {
          rbSheetRef.current?.close();
          setRbSheetOpen(false);
        }}
        handleOkBtn={() => logoutHandler()}
        onClose={() => {
          setRbSheetOpen(false);
        }}
        ref={rbSheetRef}
        height={200}
        onOpen={() => {
          StatusBar.setBarStyle('light-content');
        }}
        closeOnPressBack={true}
        closeOnPressMask={true}
        draggable={true}
        customStyles={{
          container: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
        }}
      />
      <CommonConfirmation
        titleText={`${t('DEACTIVATE_ACCOUNT')}?`}
        subText={t('ACCOUNT_DEACTIVATION_CONFIRMATION')}
        handleCancelBtn={() => {
          deactivateRBSheetRef.current?.close();
          setRbSheetOpen(false);
        }}
        handleOkBtn={() => deactivateAccountHandler()}
        onClose={() => {
          setRbSheetOpen(false);
        }}
        ref={deactivateRBSheetRef}
        height={220}
        onOpen={() => {
          StatusBar.setBarStyle('light-content');
        }}
        closeOnPressBack={true}
        closeOnPressMask={true}
        draggable={true}
        customStyles={{
          container: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
        }}
      />
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
            ...StyleSheet.absoluteFill,
          }}
        />
      ) : undefined}
      <CustomModal visible={isLoading} animationType="fade" transparent={true}>
        <CommonLoader />
      </CustomModal>
      <CustomModal
        transparent={true}
        visible={isFinanceStoryVisible}
        animationType='slide'
        onRequestClose={() => setIsFinanceStoryVisible(false)}>
        <FinanceStory closeHandler={() => setIsFinanceStoryVisible(false)} />
      </CustomModal>
    </ScrollView>
  );
};

export default Profile;
