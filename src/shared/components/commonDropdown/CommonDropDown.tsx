import {
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';

import { AnimatedDropdown, ItemTypeValue, ValueType } from './src/index';
import { appColors } from '@shared/appColors';
import { appFonts } from '@shared/appFonts';
import CommonText from '../commonText/CommonText';

type SetStateCallback<S> = (prevState: S) => S;

interface CommonDropdownInterface {
  open: boolean;
  items: ItemTypeValue[];
  setOpen: Dispatch<SetStateAction<boolean>>;
  value: ValueType;
  setValue: Dispatch<SetStateCallback<ValueType | null | any>>;
  onSelectItem: (item: ItemTypeValue) => void;
  zIndex?: number;
  disabled?: boolean;
  dropDownContainerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  selectedItemLabelStyle?: StyleProp<TextStyle>;
  listItemLabelStyle?: StyleProp<TextStyle>;
  showTickIcon?: boolean;
  selectedItemContainerStyle?: StyleProp<ViewStyle>;
  dropDownStyle?: StyleProp<ViewStyle>;
  searchable?: boolean;
  placeholder?: string;
  listEmptyText?: string;
  onPress?: () => void;
  maxHeight?: number;
}

const CommonDropDown: FC<CommonDropdownInterface> = ({
  open,
  setOpen,
  setValue,
  value,
  onSelectItem,
  zIndex,
  items,
  disabled,
  dropDownContainerStyle,
  labelStyle,
  selectedItemLabelStyle,
  showTickIcon,
  selectedItemContainerStyle,
  dropDownStyle,
  searchable,
  placeholder,
  onPress,
  listItemLabelStyle,
  listEmptyText = 'No Record Found',
  maxHeight,
}) => {
  return (
    <AnimatedDropdown
      placeholder={placeholder}
      items={items}
      open={open}
      setOpen={setOpen}
      value={value}
      setValue={setValue}
      multiple={false}
      zIndex={zIndex}
      onPress={onPress}
      onSelectItem={(item: ItemTypeValue) => {
        onSelectItem(item);
      }}
      dropDownContainerStyle={[
        commonDropDownStyle?.dropDownContainerStyle,
        dropDownContainerStyle,
      ]}
      disabled={disabled}
      maxHeight={maxHeight}
      showTickIcon={showTickIcon}
      selectedItemLabelStyle={[
        commonDropDownStyle?.selectedItemLabelStyle,
        { fontSize: 13 },
        selectedItemLabelStyle,
      ]}
      autoScroll={true}
      labelStyle={[
        commonDropDownStyle?.labelStyle,
        {
          fontSize: 13,
          color: disabled ? appColors.greyColor : '#000000',
        },
        labelStyle,
      ]}
      listItemLabelStyle={[
        commonDropDownStyle.listItemLabelStyle,
        { fontSize: 13 },
        listItemLabelStyle,
      ]}
      selectedItemContainerStyle={[
        commonDropDownStyle.selectedItemContainerStyle,
        selectedItemContainerStyle,
      ]}
      style={[commonDropDownStyle.dropDownStyle, dropDownStyle]}
      searchable={searchable}
      arrowIconStyle={
        { tintColor: appColors.placeholderColor } as StyleProp<ViewStyle>
      }
      placeholderStyle={[commonDropDownStyle.placeholderStyle, { fontSize: 13 }]}
      ListEmptyComponent={({
        listMessageTextStyle,
        ActivityIndicatorComponent,
        loading,
      }) => (
        <View
          style={{
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            padding: 10,
          }}>
          {loading ? (
            <ActivityIndicatorComponent
              size={'small'}
              color={appColors.primary}
            />
          ) : (
            <CommonText style={listMessageTextStyle} content={listEmptyText} />
          )}
        </View>
      )}
    />
  );
};

export default CommonDropDown;

const commonDropDownStyle = StyleSheet.create({
  selectedItemLabelStyle: {
    fontFamily: appFonts.bold,
  },
  selectedItemContainerStyle: {
    backgroundColor: appColors.formBorderColor,
  },
  labelStyle: {
    fontFamily: appFonts.medium,
    color: appColors?.dark,
  },

  dropDownContainerStyle: {
    borderWidth: 1,
    borderRadius: 13,
    borderColor: appColors.formBorderColor,
  },
  dropDownStyle: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 13,
    height: 50,
    borderColor: appColors.formBorderColor,
  },
  placeholderStyle: {
    color: appColors.placeholderColor,
    fontFamily: appFonts.medium,
  },
  listItemLabelStyle: {
    fontFamily: appFonts.medium,
  },
});
