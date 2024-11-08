import React, {Dispatch, SetStateAction} from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
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

interface LoginWithGoogleProps {
  buttonText: string;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

const LoginWithGoogle = (props: LoginWithGoogleProps) => {
  const {buttonText, setIsLoading} = props;
  const {i18n} = useTranslation();
  const dispatch = useDispatch();

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
        AuthService.signinWithGoogle({data: {}, token: getToken.idToken})
          .then((res: any) => {
            if (res?.success) {
              CommonDataService.setToken(res?.token);
              dispatch(updateIsLoggedin(true));
              dispatch(
                updateCurrentUser({
                  email: res?.user?.email,
                  id: res?.user?.id,
                  name: res?.user?.name,
                  picture: res?.user?.picture,
                  isSetupDone: res?.user?.isSetupDone,
                  currencySymbol: res?.user?.currency,
                  currentLanguage: i18n.language,
                }),
                setIsLoading(false),
              );
            }
          })
          .catch(err => {
            console.log('Error in signin with google', err?.response?.data);
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
