/**
 * @format
 */

// Import polyfills first to ensure compatibility with React 19
import './polyfills';

import { AppRegistry, Linking } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import React from 'react';
import "@src/localization/i18n"
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import {
  NavigationContainer,
} from '@react-navigation/native';

export const navigationRef = React.createRef();
const messagingInstance = getMessaging();

setBackgroundMessageHandler(messagingInstance, async remoteMessage => {
  console.log('Background message handled:', remoteMessage);
});

// Handle notification press when app is in background/quit state
notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('Background event:', type, detail);

  if (type === EventType.PRESS) {
    console.log('User pressed notification in background:', detail.notification);
    // The notification data will be picked up by getInitialNotification in App.tsx
  }
});

const AppWrapper = () => {
  return (
    <Provider store={store}>
      <NavigationContainer
        linking={{
          prefixes: ['https://montra.netlify.app/'],
          config: {
            screens: {
              SignIn: {
                path: 'signin',
              },
              SignUp: {
                path: 'signup',
              },
              EmailVerification: {
                path: 'verify-email/:email',
                parse: {
                  email: (email) => `${email}`,
                },
              },
              ResetPassword: {
                path: 'reset-password/:resetToken',
                parse: {
                  resetToken: (resetToken) => `${resetToken}`,
                },
              },
              HelpRequest_Details: {
                path: 'help-support-details/:id',
                parse: {
                  id: (id) => `${id}`,
                },
              },
              Help: {
                path: "help-center"
              },
              Security: {
                path: "profile/settings/security"
              },
              Dashboard: {
                path: "dashboard"
              }
            }
          },
          async getInitialURL() {
            // Handle app launch with deep link
            const url = await Linking.getInitialURL();
            if (url != null) {
              return url;
            }
            return null;
          },
          // Handle deep link when app is running
          subscribe(listener) {
            const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
              listener(url);
            });

            return () => {
              linkingSubscription.remove();
            };
          },
        }}
        ref={navigationRef}>
        <App />
      </NavigationContainer>
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => AppWrapper);