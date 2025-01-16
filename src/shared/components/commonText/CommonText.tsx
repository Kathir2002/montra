import React, {FC, useEffect, useState} from 'react';
import {
  StyleProp,
  Text,
  TextProps,
  TextStyle,
  useWindowDimensions,
} from 'react-native';
import {appFonts} from '../../appFonts';
// interface to define the expected properties
interface Props extends TextProps {
  content: string | undefined;
  size?:
    | 'medium'
    | 'error'
    | 'large'
    | 'header'
    | 'label'
    | 'appHeader'
    | number;
  bold?: true | false;
  color?: string;
  style?: TextStyle | TextStyle[] | StyleProp<TextStyle>;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
}
//common text component function
const CommonText: FC<Props> = ({
  content,
  bold,
  size,
  color,
  style,
  ellipsizeMode,
  numberOfLines,
  ...props
}) => {
  const error = 12;
  const large = 16;
  const medium = 14;
  const header = 18;
  const appHeader = 28;
  const boldFont = appFonts.bold;
  const mediumFont = appFonts.medium;

  return (
    <Text
      style={[
        {
          color: color ? color : 'black',
          fontFamily: bold ? boldFont : mediumFont,
          fontSize:
            size == 'medium'
              ? medium
              : size == 'error'
              ? error
              : size == 'large'
              ? large
              : size == 'label'
              ? medium
              : size == 'header'
              ? header
              : size == 'appHeader'
              ? appHeader
              : size,
        },
        style,
      ]}
      {...props}
      ellipsizeMode={ellipsizeMode}>
      {content}
      {props.children}
    </Text>
  );
};

export default CommonText;
