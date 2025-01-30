import {
  I18nManager,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import React, {FC, useEffect, useState} from 'react';
import {Header} from '@rneui/base';
import {appColors} from '@shared/appColors';
import CommonText from '../commonText/CommonText';
import BackArrowIcon from '@assets/svg/back-arrow.svg';

interface CommonHeaderInterface {
  title: string;
  leftIconPressBack: () => void;
  leftIcon?: boolean;
  headerBgc?: string;
  theme?: 'dark' | 'light';
  customLeftHeaderComponent?: React.JSX.Element;
  customCenterHeaderComponent?: React.JSX.Element;
  customRightHeaderComponent?: React.JSX.Element;
  headerContainerStyle?: StyleProp<ViewStyle>;
}

const CommonHeader: FC<CommonHeaderInterface> = ({
  title,
  leftIconPressBack,
  leftIcon = true,
  headerBgc,
  theme = 'light',
  customLeftHeaderComponent,
  customCenterHeaderComponent,
  customRightHeaderComponent,
  headerContainerStyle,
}) => {
  const {height, width} = useWindowDimensions();
  const [resolutionRatio, setResolutionRatio] = useState(1);
  let orgHeight = 841.0909090909091;
  let orgWidth = 392.72727272727275;
  useEffect(() => {
    const ratio = (height * width) / (orgWidth * orgHeight);
    setResolutionRatio(ratio);
  }, [height, width]);
  return (
    <Header
      containerStyle={[
        {
          marginTop: 5,
          borderBottomWidth: 0,
        },
        headerContainerStyle,
      ]}
      backgroundColor={headerBgc ? headerBgc : appColors.light}
      placement="left"
      leftComponent={
        customLeftHeaderComponent ? (
          customLeftHeaderComponent
        ) : leftIcon ? (
          <TouchableOpacity
            onPress={leftIconPressBack}
            style={{
              paddingVertical: 10,
              paddingLeft: 5,
            }}>
            <View
              style={{
                transform: [{rotate: I18nManager.isRTL ? '180deg' : '0deg'}],
              }}>
              <BackArrowIcon
                height={25 * resolutionRatio}
                width={25 * resolutionRatio}
                color={theme == 'dark' ? appColors.light : appColors.dark}
              />
            </View>
          </TouchableOpacity>
        ) : undefined
      }
      leftContainerStyle={{
        alignSelf: 'center',
        justifyContent: 'center',
      }}
      centerComponent={
        customCenterHeaderComponent ? (
          customCenterHeaderComponent
        ) : (
          <CommonText
            bold
            size={'header'}
            style={{textAlign: 'center'}}
            content={title}
            color={theme == 'dark' ? appColors.light : appColors.dark}
          />
        )
      }
      centerContainerStyle={{
        alignItems: leftIcon ? 'flex-start' : 'center',
        // marginLeft: leftIcon ? 40 : 0,
        justifyContent: 'center',
      }}
      rightComponent={customRightHeaderComponent}
      rightContainerStyle={{alignSelf: 'center', justifyContent: 'center'}}
    />
  );
};

export default CommonHeader;

const styles = StyleSheet.create({});
