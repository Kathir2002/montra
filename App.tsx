import {
  Alert,
  LogBox,
  Platform,
  StatusBar,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { withStallion } from 'react-native-stallion';

import AuthStack from '@navigations/AuthStack';
import { RootState } from './src/store/store';
import { useDispatch, useSelector } from 'react-redux';
import AppStack from '@navigations/AppStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';
import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  requestPermission,
} from '@react-native-firebase/messaging';
import 'react-native-reanimated';
import FlashMessage from 'react-native-flash-message';
import notifee, { EventType } from '@notifee/react-native';
LogBox.ignoreLogs(['[Reanimated] Reading from `value` during component render']);
import CommonDataService from '@shared/commonDataServices';
import EncryptedStorage from 'react-native-encrypted-storage';
import BootSplash from 'react-native-bootsplash';
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
import { SocketProvider } from '@src/hooks/useSocket';
import { config } from './environment';
import { Image } from '@rneui/base';
import NativeHardExit from './specs/NativeHardExit';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NetworkBannerListener } from '@services/NetworkBannerManager';

const messagingInstance = getMessaging();

const App = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation('profile');

  // store selectors
  const isloggedin = useSelector((state: RootState) => state.auth.isLoggedIn);
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const modalOpen = useSelector((state: RootState) => state.auth.modalOpen);

  // local state
  const [isGetStartedVisible, setIsGetStartedVisible] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNavigateToLogin, setIsNavigateToLogin] = useState<null | boolean>(null);
  const [pendingNotificationData, setPendingNotificationData] = useState<any>(null);
  const [biometricAuthInProgress, setBiometricAuthInProgress] = useState(false);

  // if we need to navigate to an auth route (e.g. PinGeneration) before login completes
  // store it here so navigation can be attempted only when navigationRef is ready
  const [pendingAuthRoute, setPendingAuthRoute] = useState<{ screen: string; params?: any } | null>(null);

  // nav retry refs to avoid stale closures and control attempts
  const navRetry = useRef({ attempts: 0 });
  const authNavRetry = useRef({ attempts: 0 });

  // Notification channels hook (your implementation)
  const { createNotificationChannels, displayNotification } = useNotificationChannels();

  // ---------------------- Splash hide logic ----------------------
  useEffect(() => {
    if (!isLoading && !biometricAuthInProgress && isGetStartedVisible !== null) {
      const timer = setTimeout(async () => {
        try {
          await BootSplash.hide({ fade: true });
        } catch (e) { }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoading, biometricAuthInProgress, isGetStartedVisible, isloggedin]);

  // ---------------------- Init on app start ----------------------
  useEffect(() => {
    const init = async () => {
      const value = await AsyncStorage.getItem('getStartedVisible');
      setIsGetStartedVisible(value === 'false' ? false : true);

      // run login check once
      loginStatusCheck();
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginStatusCheck = async () => {
    const userToken = await CommonDataService.getToken();

    if (userToken) {
      // await getUserDetails();
      await AsyncStorage.getItem('securityMethod').then(async (value) => {
        const securityValue = JSON.parse(value)
        const hasNotification = pendingNotificationData !== null;
        // NOTE: do NOT perform deep-link navigation from inside biometric/pin handlers.
        // Instead: set flags/route and let the centralized navigation handler perform the navigation
        if (securityValue?.method === 'PIN') {
          // set up to show PIN screen (we will attempt navigation safely via pendingAuthRoute)
          setPendingAuthRoute({
            screen: 'PinGerneration',
            params: hasNotification ? { pendingNotification: pendingNotificationData } : undefined,
          });
          setTimeout(() => {
            setIsLoading(false)
          }, 100)
        } else if (securityValue?.method === 'FINGERPRINT') {
          // attempt biometric then set login state; do not navigate from biometric handler
          setIsNavigateToLogin(false);
          await handleBiometricAuth(hasNotification, securityValue?.userName);
        } else {
          // no security — direct login
          setIsLoading(false);
          dispatch(updateIsLoggedin(true));

          // if there is a pending notification, let central handler navigate after nav ready
          if (hasNotification) {
            // do nothing here — central navigation handler (below) will handle it based on pendingNotificationData
          }
        }

      })
        .catch((err) => {
          setBiometricAuthInProgress(false);
          setPendingNotificationData(null); // Clear on error
        })

    }
    else {
      setIsNavigateToLogin(true);
      setIsLoading(false);
      try {
        await EncryptedStorage.removeItem('login');
      } catch (e) { }
      dispatch(updateIsLoggedin(false));
      // Clear any pending notification while not logged in
      setPendingNotificationData(null);
      setIsNavigateToLogin(null);
    }
  };

  // ---------------------- Get user details + security handling ----------------------
  const getUserDetails = async () => {
    try {
      const res: any = await AuthService.userDetails();
      const value = await AsyncStorage.getItem('securityMethod')
      const securityValue = value && JSON.parse(value)
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
            securityMethod: securityValue?.method,
            currentLanguage: i18n.language,
            activeContactRequestCount: res?.user?.activeContactRequestCount,
            isAdmin: res?.user?.isAdmin,
          }),
        );


      } else {
        throw new Error('User details fetch failed');
      }
    } catch (err: any) {
      setIsLoading(false);
      try {
        if (navigationRef.current?.isReady()) {
          navigationRef.current.navigate('SignIn');
        }
      } catch (e) { }
      Toast({ message: err?.response?.data?.message, type: 'error' });
    }
  };

  // ---------------------- Biometric auth ----------------------
  const handleBiometricAuth = async (isFromNotification = false, name?: string) => {
    try {
      setBiometricAuthInProgress(true);
      const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

      const resultObject = await rnBiometrics.isSensorAvailable();
      const { available } = resultObject;

      if (!available) {
        setBiometricAuthInProgress(false);
        setIsLoading(false);
        setPendingNotificationData(null);
        Alert.alert(t('BIOMETRIC_NOT_SUPPORTED_TITLE'), t('BIOMETRUC_NOT_SUPPORTED'));
        return;
      }

      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: `${t('HELLO')}, ${userDetails?.name ?? name}`,
      });

      if (success) {
        // mark logged in and clear flags; do NOT navigate from here
        await getUserDetails()
        dispatch(updateIsLoggedin(true));
        setIsLoading(false);
        setIsNavigateToLogin(null);
        setBiometricAuthInProgress(false);
        // pendingNotificationData is kept — central nav effect will pick it up
      } else {
        setBiometricAuthInProgress(false);
        setPendingNotificationData(null);
        Alert.alert(
          t('BIOMETRIC_AUTHENTICATION_FAILED_TITLE'),
          t('BIOMETRIC_AUTHENTICATION_FAILED'),
          [
            {
              text: t('transaction:CANCEL'),
              onPress: () => NativeHardExit?.hardExit(),
            },
            {
              text: t('profile:UNLOCK'),
              onPress: () => handleBiometricAuth(isFromNotification, name),
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
  };

  // ---------------------- Notification setup ----------------------
  useEffect(() => {
    const setupNotificationHandling = async () => {
      try {
        const authStatus = await requestPermission(messagingInstance);
        const enabled =
          authStatus === AuthorizationStatus.AUTHORIZED ||
          authStatus === AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log('User notification permissions denied');
          return;
        }

        await createNotificationChannels();

        // Foreground messages: display with your helper
        const unsubscribeForeground = onMessage(messagingInstance, async (remoteMessage) => {
          console.log(remoteMessage, 'REMOTE MESSAGE');

          const message: MessageType = {
            type: (remoteMessage.notification?.android?.channelId as string) || 'default',
            title: remoteMessage.notification?.title || 'Notification',
            body: remoteMessage.notification?.body || '',
            data: (remoteMessage.data as Record<string, string>) || {},
          };

          await displayNotification(message);
        });

        // Background opened
        const unsubscribeBackgroundOpen = onNotificationOpenedApp(messagingInstance, (remoteMessage) => {
          console.log('Background notification opened:', remoteMessage);
          handleNotificationPress(remoteMessage);
        });

        // Quit state (killed -> tapped)
        const initialNotification = await getInitialNotification(messagingInstance);
        if (initialNotification) {
          handleNotificationPress(initialNotification);
        }

        // notifee foreground press
        const unsubscribeForegroundEvent = notifee.onForegroundEvent(({ type, detail }) => {
          switch (type) {
            case EventType.PRESS:
              handleNotificationPress(detail.notification);
              break;
            case EventType.DISMISSED:
              // no-op
              break;
          }
        });

        // cleanup
        return () => {
          try {
            unsubscribeForeground && unsubscribeForeground();
            unsubscribeBackgroundOpen && unsubscribeBackgroundOpen();
            unsubscribeForegroundEvent && unsubscribeForegroundEvent();
          } catch (e) { }
        };
      } catch (error) {
        console.error('Notification setup failed', error);
      }
    };

    setupNotificationHandling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createNotificationChannels, displayNotification]);

  // ---------------------- Notification press handler ----------------------
  const handleNotificationPress = async (remoteMessage: any) => {
    if (remoteMessage?.data?.screen) {
      console.log('Notification pressed:', remoteMessage);
      // store it to be processed later (after login/navigation ready)
      setPendingNotificationData(remoteMessage);

      // If already logged in and not loading, central handler will run quickly.
      // We keep older behavior of attempting immediate handling when ready:
      if (isloggedin && !isLoading) {
        // attempt safe navigation (centralized handler will also pick up)
        // small timeout to let navigation mount if it's just being prepared
        setTimeout(() => {
          // central handler will attempt; this call is just a hint
          // avoid duplicating navigation here
          // (do not call navigationRef.navigate here directly)
        }, 500);
      } else {
        console.log('Notification stored for after authentication');
      }
    }
  };

  // ---------------------- Centralized safe navigation for pendingNotificationData ----------------------
  // This effect attempts to navigate to the screen in pendingNotificationData only when:
  // - there is pendingNotificationData
  // - user is logged in
  // - navigationRef is ready
  // Retries up to N times with a delay to handle mount timing.
  useEffect(() => {
    if (!pendingNotificationData || !isloggedin || isLoading) return;

    navRetry.current.attempts = 0;

    const attemptNavigation = () => {
      navRetry.current.attempts += 1;

      const navReady =
        !!navigationRef.current && typeof navigationRef.current.isReady === 'function'
          ? navigationRef.current.isReady()
          : !!navigationRef.current;

      if (navReady) {
        try {
          const data = pendingNotificationData.data || pendingNotificationData;
          if (data?.screen) {
            const params = data?.params ? { id: data.params } : undefined;
            navigationRef.current?.navigate(data.screen, params);
            setPendingNotificationData(null);
            return;
          }
        } catch (err) {
          console.error('Navigation attempt error:', err);
          // keep trying until attempts exhausted
        }
      }

      if (navRetry.current.attempts < 10) {
        setTimeout(attemptNavigation, 300);
      } else {
        console.log('Navigation failed after retries for pendingNotificationData');
        setPendingNotificationData(null);
      }
    };

    attemptNavigation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingNotificationData, isloggedin, isLoading]);

  // ---------------------- Centralized safe navigation for pendingAuthRoute ----------------------
  // This handles navigation to authentication routes (PinGeneration) that we requested earlier.
  useEffect(() => {
    if (!pendingAuthRoute) return;
    authNavRetry.current.attempts = 0;

    const attemptAuthNav = () => {
      authNavRetry.current.attempts += 1;

      const navReady =
        !!navigationRef.current && typeof navigationRef.current.isReady === 'function'
          ? navigationRef.current.isReady()
          : !!navigationRef.current;

      if (navReady) {
        try {
          navigationRef.current?.navigate(pendingAuthRoute.screen, pendingAuthRoute.params);
          setPendingAuthRoute(null);
          return;
        } catch (err) {
          console.error('Auth navigation attempt error:', err);
        }
      }

      if (authNavRetry.current.attempts < 10) {
        setTimeout(attemptAuthNav, 300);
      } else {
        console.log('Navigation to auth route failed after retries:', pendingAuthRoute.screen);
        setPendingAuthRoute(null);
      }
    };

    attemptAuthNav();
  }, [pendingAuthRoute]);

  // ---------------------- Splash hide on load end ----------------------
  // useEffect(() => {
  //   if (!isLoading) {
  //     try {
  //       BootSplash.hide({ fade: true }).catch(() => { });
  //     } catch (e) { }
  //   }
  // }, [isLoading]);

  // ---------------------- UI: splash while biometric/auth in progress ----------------------
  if (biometricAuthInProgress || (isLoading && isGetStartedVisible === null)) {
    return (
      <View style={{ flex: 1 }}>
        <Image source={require('./src/assets/images/ic_splash.png')} style={{ height: '100%', width: '100%' }} />
      </View>
    );
  }

  // ---------------------- Render main app stacks ----------------------
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <StatusBar backgroundColor={undefined} barStyle={'light-content'} />
      {/* Global network listener - renders banner when NO modal is open */}
      <NetworkBannerListener />
      {
        <>
          {!isLoading && isloggedin && !userDetails.isSetupDone ? (
            <SetUpStack />
          ) : !isLoading && isloggedin ? (
            <SocketProvider serverUrl={config?.apiUrldb} userId={userDetails?.id!} username={userDetails?.name}>
              <AppStack />
            </SocketProvider>
          ) : !isLoading && !isloggedin ? (
            <AuthStack isNavigateToLogin={isNavigateToLogin} isGetStartedVisible={isGetStartedVisible} setIsGetStartedVisible={setIsGetStartedVisible} />
          ) : (
            isLoading &&
            isGetStartedVisible === true && <GetStarted setIsGetStartedVisible={setIsGetStartedVisible} />
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
            paddingVertical: Platform.OS == 'ios' ? -25 : undefined,
          }}
        />
      ) : null}
    </SafeAreaProvider>
  );
};

export default withStallion(App);
