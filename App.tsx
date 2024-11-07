import {Alert, BackHandler, Platform, StatusBar, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import AuthStack from '@navigations/AuthStack';
import {RootState} from './src/store/store';
import {useDispatch, useSelector} from 'react-redux';
import AppStack from '@navigations/AppStack';
import {useNetInfo} from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics, {
  BiometryTypes,
  FaceID,
} from 'react-native-biometrics';

import CommonDataService from '@shared/commonDataServices';
import EncryptedStorage from 'react-native-encrypted-storage';
import SplashScreen from '@components/auth/SplashScreen';
import GetStarted from '@components/auth/getStarted/GetStarted';
import {updateCurrentUser, updateIsLoggedin} from '@store/slice/appSlice';
import AuthService from '@services/authService';
import FlashMessage from 'react-native-flash-message';

import {Toast} from '@shared/ToastConfig';
import SetUpStack from '@navigations/setupStack';
import AppContext from '@shared/appContext';
import {useTranslation} from 'react-i18next';
import {navigationRef} from './index';

const App = () => {
  const isloggedin = useSelector((state: RootState) => state.auth.isLoggedIn);
  const [isGetStartedVisible, setIsGetStartedVisible] = useState<
    boolean | null
  >(null);
  const [isTransactionAdded, setIsTransactionAdded] = useState(false);
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const netInfo = useNetInfo();
  const dispatch = useDispatch();
  const {i18n} = useTranslation();

  const handleBiometricAuth = async () => {
    const rnBiometrics = new ReactNativeBiometrics({
      allowDeviceCredentials: true,
    });
    rnBiometrics
      .isSensorAvailable()
      .then(async resultObject => {
        const {available} = resultObject;
        if (available) {
          try {
            const {success, error} = await rnBiometrics.simplePrompt({
              promptMessage: 'Authenticate to continue',
            });

            if (success) {
              getUserDetails();
            } else {
              Alert.alert(
                'Authentication failed',
                'Biometric authentication failed',
                [
                  {text: 'Cancel', onPress: () => BackHandler.exitApp()},
                  {text: 'Unlock', onPress: () => handleBiometricAuth()},
                ],
              );
            }
          } catch (error) {
            console.error('[handleBiometricAuth] Error:', error);
          }
        } else {
          Alert.alert(
            'Biometrics not supported',
            'This device does not support biometric authentication.',
          );
        }
      })
      .catch(error => {
        console.error('Error:', error);
        Alert.alert(
          'Error',
          'An error occurred while checking biometrics availability.',
        );
      });
  };

  const getUserDetails = async () => {
    await AuthService.userDetails()
      .then((res: any) => {
        if (res?.success) {
          dispatch(updateIsLoggedin(true));
          dispatch(
            updateCurrentUser({
              email: res?.user?.email,
              id: res?.user?.id,
              name: res?.user?.name,
              picture: res?.user?.picture,
              isSetupDone: res?.user?.isSetupDone,
              currencySymbol: res?.user?.currency,
              securityMethod: res?.user?.securityMethod,
              currentLanguage: i18n.language,
            }),
          );
        }
      })
      .catch(err => {
        Toast({message: err?.response?.data?.message, type: 'error'});
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  //Useeffect to check the login status check function
  useEffect(() => {
    AsyncStorage.getItem('getStartedVisible')
      .then(value => {
        if (value === 'false') {
          setIsGetStartedVisible(false);
        } else {
          setIsGetStartedVisible(true);
        }
      })
      .finally(() => {
        if (netInfo?.isConnected) {
          loginStatusCheck();
        }
      });
  }, [netInfo?.isConnected]);

  const loginStatusCheck = async () => {
    const userToken = await CommonDataService.getToken();
    if (userToken) {
      await AsyncStorage.getItem('securityMethod').then(async value => {
        await AsyncStorage.getItem('pinValue').then(val => {
          const securityValue = value ? JSON.parse(value) : null;
          if (securityValue === 'PIN' && val) {
            if (navigationRef?.current?.isReady)
              navigationRef?.current?.navigate('PinGerneration1');
          } else if (securityValue === 'FINGERPRINT') {
            handleBiometricAuth();
          }
        });
      });
      // getUserDetails();
    } else {
      setIsLoading(false);
      EncryptedStorage.removeItem('login');
      dispatch(updateIsLoggedin(false));
    }
  };

  return (
    <>
      <StatusBar backgroundColor={undefined} barStyle={'light-content'} />
      {
        <>
          {isLoading && isGetStartedVisible === null ? (
            <SplashScreen />
          ) : isLoading && isGetStartedVisible === false ? (
            <SplashScreen />
          ) : !isLoading && isloggedin && !userDetails.isSetupDone ? (
            <SetUpStack />
          ) : !isLoading && isloggedin ? (
            <AppContext.Provider
              value={{isTransactionAdded, setIsTransactionAdded}}>
              <AppStack />
            </AppContext.Provider>
          ) : !isLoading && !isloggedin ? (
            <>
              <AuthStack
                isGetStartedVisible={isGetStartedVisible}
                setIsGetStartedVisible={setIsGetStartedVisible}
              />
            </>
          ) : (
            isLoading &&
            isGetStartedVisible === true && (
              <GetStarted setIsGetStartedVisible={setIsGetStartedVisible} />
            )
          )}
        </>
      }
      <FlashMessage
        duration={2000}
        position={'bottom'}
        style={{
          marginBottom: Platform.OS == 'ios' ? 30 : 20,
          marginHorizontal: 20,
          borderRadius: 10,
          paddingVertical: Platform.OS == 'ios' ? -25 : null,
        }}
      />
    </>
  );
};

export default App;
