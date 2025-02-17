import {
  Alert,
  BackHandler,
  Linking,
  LogBox,
  Platform,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AuthStack from '@navigations/AuthStack';
import {RootState} from './src/store/store';
import {useDispatch, useSelector} from 'react-redux';
import AppStack from '@navigations/AppStack';
import {useNetInfo} from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';
import messaging from '@react-native-firebase/messaging';
import 'react-native-reanimated';
import FlashMessage from 'react-native-flash-message';
import notifee, {EventType} from '@notifee/react-native';
LogBox.ignoreLogs([
  '[Reanimated] Reading from `value` during component render',
]);
import CommonDataService from '@shared/commonDataServices';
import EncryptedStorage from 'react-native-encrypted-storage';
import SplashScreen from 'react-native-splash-screen';
import GetStarted from '@components/auth/getStarted/GetStarted';
import {updateCurrentUser, updateIsLoggedin} from '@store/slice/appSlice';
import AuthService from '@services/authService';

import {Toast} from '@shared/ToastConfig';
import SetUpStack from '@navigations/setupStack';
import {useTranslation} from 'react-i18next';
import {navigationRef} from './index';
import {
  MessageType,
  useNotificationChannels,
} from '@src/hooks/useNotificationChannels';
import {navigationStore} from '@services/setup/navigationStore';
import {SocketProvider} from '@src/hooks/useSocket';

const App = () => {
  useEffect(() => {
    // Handle deep link when app is opened from background
    const subscription = Linking.addEventListener('url', async ({url}) => {
      await navigationStore.setPendingDeepLink(url);
    });

    // Handle deep link when app is closed
    Linking.getInitialURL().then(async url => {
      if (url) {
        await navigationStore.setPendingDeepLink(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const isloggedin = useSelector((state: RootState) => state.auth.isLoggedIn);
  const [isGetStartedVisible, setIsGetStartedVisible] = useState<
    boolean | null
  >(null);

  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNavigateToLogin, setIsNavigateToLogin] = useState<null | boolean>(
    null,
  );
  const netInfo = useNetInfo();
  const dispatch = useDispatch();
  const {t, i18n} = useTranslation('profile');
  const modalOpen = useSelector((state: RootState) => state.auth.modalOpen);

  useEffect(() => {
    if (isloggedin && isLoading) {
      setTimeout(() => {
        SplashScreen.hide();
      }, 500);
    }
  }, [isLoading, isloggedin]);

  const handleBiometricAuth = async () => {
    try {
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
                promptMessage: t('AUTHENTICATE_TO_CONTINUE'),
              });

              if (success) {
                if (navigationRef?.current?.isReady) {
                  dispatch(updateIsLoggedin(true));
                  setIsLoading(false);
                }
              } else {
                // setIsLoading(false);
                Alert.alert(
                  t('BIOMETRIC_AUTHENTICATION_FAILED_TITLE'),
                  t('BIOMETRIC_AUTHENTICATION_FAILED'),
                  [
                    {
                      text: t('transaction:CANCEL'),
                      onPress: () => BackHandler.exitApp(),
                    },
                    {
                      text: t('profile:UNLOCK'),
                      onPress: () => handleBiometricAuth(),
                    },
                  ],
                );
              }
            } catch (error) {
              console.error('[handleBiometricAuth] Error:', error);
            }
          } else {
            Alert.alert(
              t('BIOMETRIC_NOT_SUPPORTED_TITLE'),
              t('BIOMETRUC_NOT_SUPPORTED'),
            );
          }
        })
        .catch(error => {
          console.error('Error:', error);
          Alert.alert(t('ERROR'), t('ERROR_OCCURED'));
        });
    } catch (err) {
      console.log(err);
    }
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
              phoneNumber: res?.user?.phoneNumber,
              securityMethod: res?.user?.securityMethod,
              currentLanguage: i18n.language,
              activeContactRequestCount: res?.user?.activeContactRequestCount,
              isAdmin: res?.user?.isAdmin,
            }),
          );
          const securityValue = res?.user?.securityMethod;

          if (securityValue === 'PIN') {
            setIsLoading(false);
            if (navigationRef?.current?.isReady)
              setTimeout(() => {
                SplashScreen.hide();
                navigationRef?.current?.navigate('PinGerneration');
              }, 500);
          } else if (securityValue === 'FINGERPRINT') {
            setIsNavigateToLogin(false);
            handleBiometricAuth();
          }
        }
      })
      .catch(err => {
        setIsLoading(false);
        Toast({message: err?.response?.data?.message, type: 'error'});
      })
      .finally(() => {});
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
      setTimeout(() => {
        SplashScreen.hide();
      }, 300);
    }
  };

  const {createNotificationChannels, displayNotification} =
    useNotificationChannels();

  useEffect(() => {
    const setupNotificationHandling = async () => {
      try {
        // Request permissions
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log('User notification permissions denied');
          return;
        }
        // Create initial channels
        await createNotificationChannels();

        // Handle foreground messages
        const unsubscribeForeground = messaging().onMessage(
          async remoteMessage => {
            // Convert Firebase message to our MessageType
            const message: MessageType = {
              type: (remoteMessage.data?.type as string) || 'default',
              title: remoteMessage.notification?.title || 'Notification',
              body: remoteMessage.notification?.body || '',
              data: remoteMessage.data as Record<string, string>,
            };
            console.log(message);

            // Display notification
            await displayNotification(message);
          },
        );
        // Handle notification opened app from background
        const unsubscribeBackgroundOpen = messaging().onNotificationOpenedApp(
          remoteMessage => {
            console.log('Background notification opened:', remoteMessage);
            handleNotificationPress(remoteMessage);
          },
        );

        // Check for initial notification (app opened from quit state)
        const initialNotification = await messaging().getInitialNotification();
        if (initialNotification) {
          console.log('Initial notification:', initialNotification);
          handleNotificationPress(initialNotification);
        }

        // Set up foreground event handler
        const unsubscribeForegroundEvent = notifee.onForegroundEvent(
          ({type, detail}) => {
            switch (type) {
              case EventType.PRESS:
                console.log('User pressed notification:', detail.notification);
                handleNotificationPress(detail.notification);
                break;
              case EventType.DISMISSED:
                console.log(
                  'User dismissed notification:',
                  detail.notification,
                );
                break;
            }
          },
        );

        // // Handle background/quit state notifications
        // messaging().setBackgroundMessageHandler(async remoteMessage => {
        //   const message: MessageType = {
        //     type: (remoteMessage.data?.type as string) || 'default',
        //     title: remoteMessage.notification?.title || 'Notification',
        //     body: remoteMessage.notification?.body || '',
        //     data: remoteMessage.data as Record<string, string>,
        //   };
        // });

        // Proper cleanup
        return () => {
          unsubscribeForeground();
          unsubscribeBackgroundOpen();
          unsubscribeForegroundEvent();
        };
      } catch (error) {
        console.error('Notification setup failed', error);
      }
    };

    setupNotificationHandling();
  }, [createNotificationChannels, displayNotification]);

  const handleNotificationPress = async (remoteMessage: any) => {
    if (remoteMessage?.data?.screen) {
      dispatch(updateIsLoggedin(true));
      setTimeout(() => {
        navigationRef.current.navigate(
          remoteMessage?.data?.screen,
          remoteMessage?.data?.params && {
            id: remoteMessage?.data?.params,
          },
        );
      }, 1000);
    }
  };

  return (
    <>
      <StatusBar backgroundColor={undefined} barStyle={'light-content'} />
      {
        <>
          {!isLoading && isloggedin && !userDetails.isSetupDone ? (
            <SetUpStack />
          ) : !isLoading && isloggedin ? (
            <SocketProvider
              serverUrl="http://172.17.0.111:3000"
              userId={userDetails?.id!}
              username={userDetails?.name}>
              <AppStack />
            </SocketProvider>
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
      {!modalOpen ? (
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
      ) : null}
    </>
  );
};

export default App;
