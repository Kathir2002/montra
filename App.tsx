import {
  Alert,
  BackHandler,
  Linking,
  LogBox,
  Platform,
  StatusBar,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { withStallion } from 'react-native-stallion';

import AuthStack from '@navigations/AuthStack';
import { RootState } from './src/store/store';
import { useDispatch, useSelector } from 'react-redux';
import AppStack from '@navigations/AppStack';
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';
import messaging from '@react-native-firebase/messaging';
import 'react-native-reanimated';
import FlashMessage from 'react-native-flash-message';
import notifee, { EventType } from '@notifee/react-native';
LogBox.ignoreLogs([
  '[Reanimated] Reading from `value` during component render',
]);
import CommonDataService from '@shared/commonDataServices';
import EncryptedStorage from 'react-native-encrypted-storage';
import SplashScreen from 'react-native-splash-screen';
import GetStarted from '@components/auth/getStarted/GetStarted';
import { updateCurrentUser, updateIsLoggedin } from '@store/slice/appSlice';
import AuthService from '@services/authService';

import { Toast } from '@shared/ToastConfig';
import SetUpStack from '@navigations/setupStack';
import { useTranslation } from 'react-i18next';
import { navigationRef } from './index';
import {
  MessageType,
  useNotificationChannels,
} from '@src/hooks/useNotificationChannels';
import { navigationStore } from '@services/setup/navigationStore';
import { SocketProvider } from '@src/hooks/useSocket';
import { config } from './environment';
import { Image } from '@rneui/base';

const App = () => {
  //UseEffect to handle deep linking url
  useEffect(() => {
    // Handle deep link when app is opened from background
    const subscription = Linking.addEventListener('url', async ({ url }) => {
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
  const [pendingNotificationData, setPendingNotificationData] =
    useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [biometricAuthInProgress, setBiometricAuthInProgress] = useState(false);
  const netInfo = useNetInfo();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation('profile');
  const modalOpen = useSelector((state: RootState) => state.auth.modalOpen);

  // Enhanced useEffect for splash screen management
  useEffect(() => {
    // Hide splash screen when app is ready to show content
    if (
      !isLoading &&
      !biometricAuthInProgress &&
      isGetStartedVisible !== null
    ) {
      const timer = setTimeout(() => {
        SplashScreen.hide();
      }, 100); // Small delay to ensure smooth transition

      return () => clearTimeout(timer);
    }
  }, [isLoading, biometricAuthInProgress, isGetStartedVisible, isloggedin]);

  // Handle pending notification after successful authentication
  useEffect(() => {
    if (isloggedin && !isLoading && pendingNotificationData) {
      handlePendingNotification();
    }
  }, [isloggedin, isLoading, pendingNotificationData]);

  const handleBiometricAuth = async (isFromNotification = false) => {
    try {
      setBiometricAuthInProgress(true);
      const rnBiometrics = new ReactNativeBiometrics({
        allowDeviceCredentials: true,
      });

      const resultObject = await rnBiometrics.isSensorAvailable();
      const { available } = resultObject;

      if (available) {
        try {
          const { success, error } = await rnBiometrics.simplePrompt({
            promptMessage: t('AUTHENTICATE_TO_CONTINUE'),
          });

          if (success) {
            // Update states in the correct order
            dispatch(updateIsLoggedin(true));
            setIsLoading(false);
            setBiometricAuthInProgress(false);
            console.log(pendingNotificationData);

            // If authentication was triggered by notification, handle it after state updates
            if (isFromNotification && pendingNotificationData) {
              // Use longer timeout to ensure navigation is ready and states are updated

              setTimeout(() => {
                handlePendingNotificationImmediate();
              }, 1000); // Increased timeout
            }
          } else {
            setBiometricAuthInProgress(false);
            // Clear pending notification if auth fails
            setPendingNotificationData(null);
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
                  onPress: () => handleBiometricAuth(isFromNotification),
                },
              ],
            );
          }
        } catch (error) {
          console.error('[handleBiometricAuth] Error:', error);
          setBiometricAuthInProgress(false);
          setIsLoading(false);
          setPendingNotificationData(null);
        }
      } else {
        setBiometricAuthInProgress(false);
        setIsLoading(false);
        setPendingNotificationData(null);
        Alert.alert(
          t('BIOMETRIC_NOT_SUPPORTED_TITLE'),
          t('BIOMETRUC_NOT_SUPPORTED'),
        );
      }
    } catch (err) {
      console.log(err);
      setBiometricAuthInProgress(false);
      setIsLoading(false);
      setPendingNotificationData(null);
    }
  };

  // Add this new function to handle immediate navigation without state dependencies
  const handlePendingNotificationImmediate = () => {
    console.log(
      'Attempting to handle pending notification:',
      pendingNotificationData,
    );

    if (pendingNotificationData?.data?.screen) {
      // Check if navigation is ready with retries
      const attemptNavigation = (retryCount = 0) => {
        if (navigationRef.current?.isReady()) {
          console.log(
            'Navigation ready, navigating to:',
            pendingNotificationData.data.screen,
          );

          try {
            navigationRef.current.navigate(
              pendingNotificationData.data.screen,
              pendingNotificationData.data.params
                ? {
                  id: pendingNotificationData.data.params,
                }
                : undefined,
            );
            setPendingNotificationData(null); // Clear after successful navigation
          } catch (error) {
            console.error('Navigation error:', error);
            setPendingNotificationData(null);
          }
        } else if (retryCount < 5) {
          // Retry navigation if not ready yet
          setTimeout(() => attemptNavigation(retryCount + 1), 500);
        } else {
          console.log('Navigation failed after 5 retries');
          setPendingNotificationData(null);
        }
      };

      attemptNavigation();
    } else {
      console.log('No valid notification data to handle');
      setPendingNotificationData(null);
    }
  };

  const handlePinAuth = (isFromNotification = false) => {
    setIsLoading(false);
    setTimeout(() => {
      if (navigationRef?.current?.isReady()) {
        navigationRef.current.navigate('PinGerneration', {
          // Pass notification data to PIN screen if needed
          pendingNotification: isFromNotification
            ? pendingNotificationData
            : null,
        });
      }
    }, 100);
  };

  const handlePendingNotification = () => {
    if (
      pendingNotificationData?.data?.screen &&
      navigationRef.current?.isReady()
    ) {
      navigationRef.current.navigate(
        pendingNotificationData.data.screen,
        pendingNotificationData.data.params && {
          id: pendingNotificationData.data.params,
        },
      );
      setPendingNotificationData(null); // Clear after handling
    }
  };

  const getUserDetails = async () => {
    try {
      const res: any = await AuthService.userDetails();

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
        const hasNotification = pendingNotificationData !== null;

        // Always check security, regardless of notification
        if (securityValue === 'PIN') {
          handlePinAuth(hasNotification);
        } else if (securityValue === 'FINGERPRINT') {
          setIsNavigateToLogin(false);
          await handleBiometricAuth(hasNotification);
        } else {
          // No security method - direct login
          setIsLoading(false);
          dispatch(updateIsLoggedin(true));

          // Handle notification after direct login
          if (hasNotification) {
            setTimeout(() => {
              handlePendingNotificationImmediate(); // Use immediate handler
            }, 1000);
          }
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      setBiometricAuthInProgress(false);
      setPendingNotificationData(null); // Clear on error
      if (navigationRef.current?.isReady()) {
        navigationRef.current.navigate('SignIn');
      }
      Toast({ message: err?.response?.data?.message, type: 'error' });
    }
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

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Is connected?', state.isConnected);
      setIsConnected(state.isConnected!);
    });

    // Unsubscribe
    return () => {
      unsubscribe();
    };
  }, []);

  const checkConnction = () => {
    NetInfo.fetch().then(state => {
      console.log('connected?', state.isConnected);
      setIsConnected(state.isConnected!);
    });
  };

  const loginStatusCheck = async () => {
    const userToken = await CommonDataService.getToken();

    if (userToken) {
      await getUserDetails();
    } else {
      setIsNavigateToLogin(true);
      setIsLoading(false);
      EncryptedStorage.removeItem('login');
      dispatch(updateIsLoggedin(false));
      // Clear any pending notifications if not logged in
      setPendingNotificationData(null);
    }
  };

  const { createNotificationChannels, displayNotification } =
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
            console.log(remoteMessage, "REMOTE MESSAGE");

            // Convert Firebase message to our MessageType
            const message: MessageType = {
              type: (remoteMessage.notification?.android?.channelId as string) || 'default',
              title: remoteMessage.notification?.title || 'Notification',
              body: remoteMessage.notification?.body || '',
              data: remoteMessage.data as Record<string, string>,
            };

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
          handleNotificationPress(initialNotification);
        }

        // Set up foreground event handler
        const unsubscribeForegroundEvent = notifee.onForegroundEvent(
          ({ type, detail }) => {
            switch (type) {
              case EventType.PRESS:
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
      console.log('Notification pressed:', remoteMessage);

      // Store notification data for later processing
      setPendingNotificationData(remoteMessage);

      // If user is already logged in, handle immediately
      if (isloggedin && !isLoading) {
        setTimeout(() => {
          handlePendingNotification();
        }, 500);
      } else {
        // If not logged in, the notification will be handled after authentication
        // The getUserDetails function will handle the notification after successful auth
        console.log('Notification stored for after authentication');
      }
    }
  };

  // Show loading screen during biometric authentication
  if (biometricAuthInProgress || (isLoading && isGetStartedVisible === null)) {
    return (
      <View style={{ flex: 1 }}>
        <Image
          source={require('./src/assets/images/ic_splash.png')}
          style={{ height: '100%', width: '100%' }}
        />
      </View>
    );
  }

  return (
    <>
      <StatusBar backgroundColor={undefined} barStyle={'light-content'} />
      {
        <>
          {!isLoading && isloggedin && !userDetails.isSetupDone ? (
            <SetUpStack />
          ) : !isLoading && isloggedin ? (
            <SocketProvider
              serverUrl={config?.apiUrldb}
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

export default withStallion(App)
