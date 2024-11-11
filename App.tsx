import {Alert, BackHandler, Platform, StatusBar, View} from 'react-native';
import React, {SetStateAction, useEffect, useState} from 'react';
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
import {Dispatch} from '@reduxjs/toolkit';

const App = () => {
  const isloggedin = useSelector((state: RootState) => state.auth.isLoggedIn);
  const [isGetStartedVisible, setIsGetStartedVisible] = useState<
    boolean | null
  >(null);
  const [isTransactionAdded, setIsTransactionAdded] = useState(false);
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNavigateToLogin, setIsNavigateToLogin] = useState<null | boolean>(
    null,
  );
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
              if (navigationRef?.current?.isReady)
                dispatch(updateIsLoggedin(true));
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
      .then(async (res: any) => {
        if (res?.success) {
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
          const securityValue = res?.user?.securityMethod;

          if (securityValue === 'PIN' && res?.user?.securityPin) {
            if (navigationRef?.current?.isReady)
              setTimeout(() => {
                navigationRef?.current?.navigate('PinGerneration');
              }, 1000);
          } else if (securityValue === 'FINGERPRINT') {
            setIsNavigateToLogin(false);
            handleBiometricAuth();
          }
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
      getUserDetails();
    } else {
      setIsNavigateToLogin(true);
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
                isNavigateToLogin={isNavigateToLogin}
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
