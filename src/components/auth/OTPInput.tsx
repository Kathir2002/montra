import {
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TextInputProps,
  View,
} from 'react-native';
import React, {Dispatch, SetStateAction, useEffect, useRef} from 'react';
import {appColors} from '@shared/appColors';
import {appFonts} from '@shared/appFonts';
interface OtpInputProps {
  otp: string[];
  setOtp: Dispatch<SetStateAction<string[]>>;
  isFromSettings?: boolean;
}
const OTPInput = (props: OtpInputProps) => {
  const {otp, setOtp, isFromSettings} = props;

  const inputs = useRef<TextInputProps & {focus: () => void}[]>([]);
  useEffect(() => {
    if (otp[0] == null && !isFromSettings) {
      inputs.current[0].focus();
    }
  }, [otp, isFromSettings]);

  const handleOtpChange = (text: string, i: number) => {
    if (/^[0-9]*$/.test(text)) {
      if (text.length == otp?.length) {
        setOtp(text.split(''));
        inputs.current[otp.length - 1].focus();
      } else {
        setOtp(prev => {
          let data = [...prev];
          data[i] = text;
          return data;
        });
      }
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      if (index > 0) {
        inputs.current[index - 1].focus();
      }
    } else {
      if (index < otp.length - 1 && /^[0-9]*$/.test(e.nativeEvent.key)) {
        inputs.current[index + 1].focus();
        const {key} = e.nativeEvent;
        handleOtpChange(key, index);
      }
    }
  };

  return (
    <View style={styles?.otpContainer}>
      {otp?.map((digit: string, index: number) => (
        <TextInput
          key={index}
          maxLength={digit ? 1 : otp.length}
          style={[
            styles?.otpInputContainerStyle,
            otp[index] ? {borderColor: appColors.primary} : null,
          ]}
          autoFocus={isFromSettings ? false : index === 0}
          keyboardType="numeric"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          onChangeText={value => handleOtpChange(value, index)}
          onKeyPress={e => handleKeyPress(e, index)}
          value={digit}
          ref={(input: TextInput) => {
            inputs.current[index] = input;
          }}
        />
      ))}
    </View>
  );
};

export default OTPInput;

const styles = StyleSheet.create({
  otpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginVertical: 20,
    justifyContent: 'center',
  },
  otpInputContainerStyle: {
    borderWidth: 1,
    height: 40,
    paddingHorizontal: 5,
    borderColor: '#ddd',
    width: 40,
    fontSize: 14,
    color: appColors.dark,
    fontFamily: appFonts.medium,
    textAlign: 'center',
    backgroundColor: appColors.formBorderColor,
    borderRadius: 25,
  },
});
