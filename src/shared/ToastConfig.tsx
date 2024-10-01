import React, {FC} from 'react';
import {View, TextProps} from 'react-native';
import {appFonts} from './appFonts';
import Icon from 'react-native-vector-icons/AntDesign';
import {showMessage, hideMessage} from 'react-native-flash-message';
import CommonText from './components/commonText/CommonText';

interface commonToast extends TextProps {
  message: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'default';
}

const FlashMessage: FC<commonToast> = ({type, message}) => {
  return (
    <View style={[CommonToastStyle.mainView]}>
      <View style={[CommonToastStyle.secondaryView]}>
        {type === 'default' ? null : (
          <Icon
            style={[
              CommonToastStyle.iconStyle,
              {
                color:
                  type === 'warning'
                    ? '#000000de'
                    : type === 'success'
                    ? '#ffff'
                    : type === 'error'
                    ? '#ffff'
                    : type === 'info'
                    ? '#ffff'
                    : 'white',
              },
            ]}
            name={
              type === 'warning'
                ? 'exclamationcircleo'
                : type === 'error'
                ? 'closecircleo'
                : type === 'success'
                ? 'checkcircleo'
                : 'infocirlceo'
            }
            color="white"
            size={18}
          />
        )}
        <CommonText
          content={message}
          size={'medium'}
          style={[
            CommonToastStyle.text,
            {
              color:
                type === 'warning'
                  ? '#000000de'
                  : type === 'default'
                  ? '#000000de'
                  : type === 'success'
                  ? '#ffff'
                  : type === 'error'
                  ? '#ffff'
                  : type === 'info'
                  ? '#ffff'
                  : 'white',
            },
          ]}
        />
      </View>
      <Icon
        style={[
          CommonToastStyle.cancelIcon,
          {
            color:
              type === 'warning'
                ? '#000000de'
                : type === 'default'
                ? '#000000de'
                : type === 'success'
                ? '#ffff'
                : type === 'error'
                ? '#ffff'
                : type === 'info'
                ? '#ffff'
                : 'white',
          },
        ]}
        name="close"
        color="white"
        onPress={() => {
          hideMessage();
        }}
        size={15}
      />
    </View>
  );
};

export const Toast: FC<commonToast> = ({type, message}) => {
  showMessage({
    backgroundColor:
      type === 'warning'
        ? '#ffc107'
        : type === 'success'
        ? '#2bae43'
        : type === 'error'
        ? '#f44336'
        : type === 'info'
        ? '#2196f3'
        : '#d6d8d9',
    message: '',
    renderCustomContent: () => <FlashMessage message={message} type={type} />,
    titleStyle: {marginLeft: 33, fontFamily: appFonts.bold},
  });

  return null;
};

import {Platform, StyleSheet} from 'react-native';

const CommonToastStyle = StyleSheet.create({
  mainView: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  secondaryView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS == 'ios' ? 5 : null,
  },
  text: {
    fontFamily: appFonts.bold,
    paddingHorizontal: 10,
    marginTop: 3,
    flex: 1,
    bottom: 10,
  },
  iconStyle: {
    paddingRight: 5,
    bottom: 7,
  },
  cancelIcon: {
    bottom: 7,
  },
});
