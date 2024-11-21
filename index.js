/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import React from 'react';
import "@src/localization/i18n"
import messaging from '@react-native-firebase/messaging';

import {
  NavigationContainer,
} from '@react-navigation/native';

export const navigationRef = React.createRef();
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message handled:', remoteMessage);
});
const AppWrapper = () => {
  return (
    <Provider store={store}>
      <NavigationContainer
        linking={{
          prefixes: ['https://montra-hero.onrender.com/'],
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
                path: 'reset-password/:userToken',
                parse: {
                  userToken: (userToken) => `${userToken}`,
                },
              },
            },
          },
        }}
        ref={navigationRef}>
        <App />
      </NavigationContainer>
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => AppWrapper);
