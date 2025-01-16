import {
  KeyboardAvoidingView,
  Linking,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {appColors} from '@shared/appColors';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import BackgroundTimer from 'react-native-background-timer';
import CommonText from '@shared/components/commonText/CommonText';
import {appFonts} from '@shared/appFonts';
import CommonButton from '@shared/components/commonButton/CommonButton';
import LottieView from 'lottie-react-native';
import {Toast} from '@shared/ToastConfig';
import AuthService from '@services/authService';
import OTPInput from './OTPInput';

const EmailVerification = () => {
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const [otp, setOtp] = useState(new Array(6).fill(null));
  const [remainingTime, setRemainingTime] = useState<number>(300);

  const route: RouteProp<{
    params: {
      email: string;
    };
  }> = useRoute();

  //UseEffect for updating the timer
  useEffect(() => {
    if (remainingTime > 0) {
      const interval = BackgroundTimer.setInterval(() => {
        setRemainingTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => BackgroundTimer.clearInterval(interval);
    }
  }, [remainingTime]);

  const formatTime = (time: any) => {
    const minutes = String(Math.floor(time / 60)).padStart(2, '0');
    const seconds = String(time % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const maskEmail = (email: string) => {
    const [localPart, domain] = email?.split('@');
    const length = localPart?.length;
    const maskedLocalPart = localPart?.slice(0, length - 4) + '****';
    return `${maskedLocalPart}@${domain}`;
  };

  const resendOtpHandler = async () => {
    AuthService.resendOtp({data: {email: route?.params?.email}})
      .then((res: any) => {
        if (res?.success) {
          setRemainingTime(300);
          Toast({message: res?.message, type: 'success'});
        }
      })
      .catch(err => {
        console.log('Error in resend otp', err);
      });
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: appColors.light,
      }}>
      <CommonHeader
        leftIcon={true}
        title="Email Verification"
        leftIconPressBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{flex: 1}}>
        <LottieView
          style={{
            height: 225,
            width: 225,
            alignSelf: 'center',
          }}
          source={require('@assets/lottie/TwoFA.json')}
          autoPlay
          loop
        />
        <View
          style={{
            justifyContent: 'center',
            flex: 1,
            paddingHorizontal: 15,
            top: -30,
          }}>
          <CommonText
            content="Enter Your"
            bold
            color={appColors.dark}
            size={20}
          />
          <CommonText
            content="Verification Code"
            bold
            color={appColors.dark}
            size={20}
          />
          <OTPInput otp={otp} setOtp={setOtp} />
          <CommonText
            content={formatTime(remainingTime)}
            size={'header'}
            color={appColors.primary}
            bold
          />
          <CommonText
            content={undefined}
            size={'large'}
            style={{marginVertical: 10}}>
            We send verification code to your email{' '}
            <CommonText
              content={undefined}
              onPress={() => Linking.openURL('https://gmail.app.goo.gl')}
              color={appColors.primary}
              bold>
              {maskEmail(route?.params?.email)}
            </CommonText>
            . You can check your inbox.
          </CommonText>
          {remainingTime === 0 && (
            <TouchableOpacity activeOpacity={0.5} onPress={() => {}}>
              <CommonText
                onPress={() => resendOtpHandler()}
                content="I didn’t received the code? Send again"
                style={{textDecorationLine: 'underline'}}
                color={appColors.primary}
                size={'large'}
              />
            </TouchableOpacity>
          )}
          <CommonButton
            disabled={remainingTime === 0}
            title="Verify"
            onPress={() => {
              if (otp.length === 6 && !otp.includes(null)) {
                AuthService.verifyOtp({
                  data: {otp: otp?.join(''), email: route?.params?.email},
                })
                  .then((res: any) => {
                    if (res?.success) {
                      Toast({type: 'success', message: res?.message});
                      navigation.navigate('SignIn');
                    }
                  })
                  .catch(err => {
                    Toast({
                      message: err?.response?.data?.message,
                      type: 'error',
                    });
                  });
              } else {
                Toast({message: 'Please enter otp', type: 'error'});
              }
            }}
            buttonStyle={{marginTop: 35}}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EmailVerification;
