import {
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from 'react-native';
import React, {FC} from 'react';
import {Button, IconNode} from '@rneui/base';
import {appColors} from '@shared/appColors';
import {appFonts} from '@shared/appFonts';

interface CommonButtonInterface {
  title: string;
  onPress: ((event: GestureResponderEvent) => void) | undefined;
  buttonStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  titleStyle?: StyleProp<TextStyle>;
  buttonType?: 'solid' | 'clear' | 'outline';
  loading?: boolean;
  iconContainerStyle?: StyleProp<ViewStyle>;
  icon?: IconNode;
}

const CommonButton: FC<CommonButtonInterface> = ({
  title,
  onPress,
  buttonStyle,
  disabled,
  titleStyle,
  buttonType,
  loading,
  iconContainerStyle,
  icon,
}) => {
  return (
    <Button
      title={title}
      onPress={onPress}
      buttonStyle={[
        buttonType == 'clear'
          ? commonButtonStyle.clearButtonStyle
          : commonButtonStyle.buttonStyle,
        buttonStyle,
      ]}
      disabled={disabled}
      titleStyle={[
        {fontSize: 16},
        buttonType == 'clear'
          ? commonButtonStyle.clearTitleStyle
          : commonButtonStyle.titleStyle,
        titleStyle,
      ]}
      type={buttonType}
      loading={loading}
      icon={icon}
      iconContainerStyle={iconContainerStyle}
    />
  );
};

export default CommonButton;

const commonButtonStyle = StyleSheet.create({
  buttonStyle: {
    backgroundColor: appColors.primary,
    borderRadius: 13,
  },
  titleStyle: {
    color: appColors.light,
    textAlign: 'center',
    paddingVertical: 5,
    fontFamily: appFonts.medium,
  },
  clearButtonStyle: {
    backgroundColor: appColors.buttonClear,
    borderRadius: 13,
  },
  clearTitleStyle: {
    color: appColors.primary,
    textAlign: 'center',
    paddingVertical: 5,
    fontFamily: appFonts.medium,
  },
});
