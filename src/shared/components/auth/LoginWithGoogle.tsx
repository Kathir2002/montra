import React, {Dispatch, SetStateAction} from 'react';
import {
  NativeModules,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useDispatch} from 'react-redux';
import AuthService from '@services/authService';
import CommonDataService from '@shared/commonDataServices';
import {updateCurrentUser, updateIsLoggedin} from '@store/slice/appSlice';
import {appColors} from '@shared/appColors';
import CommonText from '../commonText/CommonText';
import GoogleLogo from '@assets/svg/googleLogo.svg';
import {useTranslation} from 'react-i18next';
import {Toast} from '@shared/ToastConfig';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

interface LoginWithGoogleProps {
  buttonText: string;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

const LoginWithGoogle = (props: LoginWithGoogleProps) => {
  const {buttonText, setIsLoading} = props;
  const {i18n} = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const getDeviceDetails = async () => {
    const platform = DeviceInfo.getSystemName(); // e.g., "iOS" or "Android"
    const deviceModel = DeviceInfo.getModel(); // e.g., "iPhone 13"
    const osVersion = DeviceInfo.getSystemVersion(); // e.g., "16.0"
    const appVersion = DeviceInfo.getVersion(); // e.g., "1.0.0"
    const appId = DeviceInfo.getBundleId(); // e.g., "com.example.app"
    const manufacturer = await DeviceInfo.getManufacturer(); // e.g., "Apple" or "Samsung"
    const fcmToken = await messaging().getToken();

    return {
      platform,
      deviceModel,
      osVersion,
      appVersion,
      appId,
      manufacturer,
      fcmToken,
    };
  };

  const loginWithGoogleHandler = async () => {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Get the users ID token
      const getToken = await GoogleSignin.signIn();

      if (getToken?.idToken) {
        setIsLoading(true);
        const data = await getDeviceDetails();

        await AuthService.signinWithGoogle({
          data,
          token: getToken.idToken,
        })
          .then(async (res: any) => {
            if (res?.success) {
              if (Platform.OS === 'android') {
                try {
                  // After successful login API call
                  await NativeModules.ShortcutModule.createShortcuts();
                } catch (error) {
                  console.error('Failed to create shortcuts:', error);
                }
              }
              await CommonDataService.setToken(res?.token);

              dispatch(
                updateCurrentUser({
                  email: res?.user?.email,
                  id: res?.user?.id,
                  name: res?.user?.name,
                  picture: res?.user?.picture,
                  isSetupDone: res?.user?.isSetupDone,
                  currencySymbol: res?.user?.currency,
                  currentLanguage: i18n.language,
                  securityMethod: res?.user?.securityMethod,
                  phoneNumber: res?.user?.phoneNumber,
                  activeContactRequestCount:
                    res?.user?.activeContactRequestCount,
                  isAdmin: res?.user?.isAdmin,
                }),
              );
              setIsLoading(false);
              await AsyncStorage.getItem('securityPin').then(value => {
                if (value === null) {
                  navigation.navigate('PinGerneration');
                } else {
                  dispatch(updateIsLoggedin(true));
                }
              });
            }
          })
          .catch(err => {
            console.log(
              'Error in signin with google',
              err?.response?.data?.message,
            );
            Toast({message: err?.response?.data?.message, type: 'error'});
            setIsLoading(false);
          });
      }
    } catch (error: any) {
      Toast({message: error?.message, type: 'error'});
    }
  };
  return (
    <TouchableOpacity
      onPress={() => loginWithGoogleHandler()}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: appColors.formBorderColor,
        borderRadius: 13,
        gap: 5,
        marginVertical: 5,
      }}>
      <GoogleLogo height={30} width={30} />
      <CommonText
        style={{paddingVertical: 10, textAlign: 'center'}}
        bold
        content={buttonText}
      />
    </TouchableOpacity>
  );
};

export default LoginWithGoogle;

const styles = StyleSheet.create({});
