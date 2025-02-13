import React, {FC, useState, useRef, useEffect} from 'react';
import {
  KeyboardTypeOptions,
  NativeSyntheticEvent,
  Platform,
  StyleProp,
  StyleSheet,
  TextInputFocusEventData,
  TextStyle,
  ViewStyle,
  Animated,
  NativeTouchEvent,
} from 'react-native';
import {IconNode, Input} from '@rneui/base';
import {appColors} from '@shared/appColors';
import {appFonts} from '@shared/appFonts';

interface CommonInputInterface {
  onChangeText: ((text: string) => void) | undefined;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  rightIcon?: IconNode;
  secureTextEntry?: boolean;
  error?: string;
  inputStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  maxLength?: number;
  value: string;
  editable?: boolean;
  onFocus?: () => void;
  onBlur?:
    | ((e: NativeSyntheticEvent<TextInputFocusEventData>) => void)
    | undefined;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  onPress?: ((e: NativeSyntheticEvent<NativeTouchEvent>) => void) | undefined;
  labelVisible?: boolean;
  leftIcon?: IconNode;
  numberOfLines?: number;
  multiline?: boolean;
  isTextArea?: boolean;
}

const CommonInput: FC<CommonInputInterface> = ({
  onChangeText,
  placeholder,
  keyboardType,
  rightIcon,
  secureTextEntry,
  error,
  errorStyle,
  inputContainerStyle,
  inputStyle,
  labelStyle,
  disabled,
  value,
  onBlur,
  editable,
  autoCapitalize,
  onPress,
  onFocus,
  maxLength,
  containerStyle,
  labelVisible = true,
  leftIcon,
  numberOfLines = 1,
  multiline = false,
  isTextArea = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) {
      onFocus();
    }
  };
  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  const animatedLabelStyle = {
    fontFamily: appFonts.medium,
    left: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [leftIcon ? 35 : 5, 5],
    }),
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: isTextArea ? [80, -8] : [32, -8],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 14],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [appColors.placeholderColor, appColors.dark],
    }),
  };

  return (
    <Animated.View style={{paddingTop: labelVisible ? 18 : 0}}>
      {labelVisible ? (
        <Animated.Text
          style={[CommonInputStyle.labelStyle, animatedLabelStyle, labelStyle]}>
          {placeholder}
        </Animated.Text>
      ) : undefined}
      <Input
        onPress={onPress}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        value={value}
        onChangeText={onChangeText}
        placeholder=""
        keyboardType={keyboardType}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        style={{
          textAlignVertical: isTextArea ? 'top' : undefined, // Ensures text starts from the top
        }}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        errorMessage={error ? error : undefined}
        autoCapitalize={autoCapitalize}
        placeholderTextColor={appColors.placeholderColor}
        errorStyle={[CommonInputStyle.errorStyle, {fontSize: 12}, errorStyle]}
        inputStyle={[CommonInputStyle.inputStyle, {fontSize: 14}, inputStyle]}
        labelStyle={labelStyle}
        containerStyle={[CommonInputStyle.containerStyle, containerStyle]}
        inputContainerStyle={[
          CommonInputStyle.inputContainerStyle,
          inputContainerStyle,
        ]}
        disabled={disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        editable={editable}
      />
    </Animated.View>
  );
};

export default CommonInput;

const CommonInputStyle = StyleSheet.create({
  errorStyle: {
    marginTop: 5,
    color: appColors.error,
    fontFamily: appFonts.medium,
    marginLeft: 5,
  },
  inputContainerStyle: {
    paddingHorizontal: Platform.OS === 'ios' ? 10 : 8,
    paddingStart: Platform.OS === 'ios' ? 10 : null,
    borderWidth: 1,
    borderColor: appColors.formBorderColor,
    borderRadius: 13,
    height: 50,
  },
  containerStyle: {
    paddingHorizontal: 0,
  },
  inputStyle: {
    fontFamily: appFonts.medium,
    color: appColors.dark,
  },
  labelStyle: {
    position: 'absolute',
    left: 5,
  },
});
