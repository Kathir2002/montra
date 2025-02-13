import {StyleSheet, View} from 'react-native';
import React, {forwardRef} from 'react';
import CommonRBSheet, {
  RBSheetProps,
  RBSheetRef,
} from './commonRBSheet/CommonRBSheet';
import CommonText from './commonText/CommonText';
import {appColors} from '@shared/appColors';
import CommonButton from './commonButton/CommonButton';
import {useTranslation} from 'react-i18next';

interface CommonConfirmationProps extends RBSheetProps {
  onClose?: () => void;
  handleCancelBtn: () => void;
  handleOkBtn: () => void;
  titleText: string;
  subText: string;
}

const CommonConfirmation = forwardRef<RBSheetRef, CommonConfirmationProps>(
  (
    {
      onClose,
      handleCancelBtn,
      handleOkBtn,
      height = 200,
      subText,
      titleText,
      ...RBSheetProps
    },
    ref,
  ) => {
    const {t} = useTranslation('transaction');
    return (
      <CommonRBSheet
        onClose={onClose}
        ref={ref}
        height={height}
        closeOnPressBack={true}
        closeOnPressMask={true}
        draggable={true}
        {...RBSheetProps}
        customStyles={{
          container: {borderTopLeftRadius: 20, borderTopRightRadius: 20},
        }}>
        <View style={{padding: 15, gap: 10}}>
          <CommonText
            content={titleText}
            bold
            size={'large'}
            style={{textAlign: 'center'}}
          />
          <CommonText
            content={subText}
            color={appColors.placeholderColor}
            size={'label'}
            style={{textAlign: 'center', paddingHorizontal: 15}}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View style={{flex: 0.45}}>
              <CommonButton
                title={t('NO')}
                buttonType="clear"
                onPress={handleCancelBtn}
              />
            </View>
            <View style={{flex: 0.45}}>
              <CommonButton title={t('YES')} onPress={handleOkBtn} />
            </View>
          </View>
        </View>
        {RBSheetProps.children}
      </CommonRBSheet>
    );
  },
);

export default CommonConfirmation;

const styles = StyleSheet.create({});
