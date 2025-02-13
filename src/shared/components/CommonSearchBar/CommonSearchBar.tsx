import {Icon, IconProps} from '@rneui/base';
import {appColors} from '@shared/appColors';
import {appFonts} from '@shared/appFonts';
import React, {Dispatch, FC, SetStateAction} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';

export interface SearchBarTypes {
  search: string;
  searchContainerStyle?: StyleProp<ViewStyle>;
  searchInputStyle?: StyleProp<TextStyle>;
  placeholder: string;
  onCancel?: () => void;
  clearIcon?: IconProps;
  searchIcon?: IconProps;
  disabled?: boolean;
  leftIconContainerStyle?: StyleProp<ViewStyle>;
  rightIconContainerStyle?: StyleProp<ViewStyle>;
  placeholderTextColor?: string;
  testID?: string;
  showLeftIcon?: boolean;
  setSearch: Dispatch<SetStateAction<string>>;
}

const CommonSearchBar: FC<SearchBarTypes> = ({
  search,
  searchContainerStyle,
  searchInputStyle,
  placeholder,
  onCancel,
  clearIcon,
  searchIcon,
  disabled,
  leftIconContainerStyle,
  rightIconContainerStyle,
  placeholderTextColor,
  testID,
  showLeftIcon = true,
  setSearch,
}) => {
  return (
    <View style={[styles.container, searchContainerStyle]}>
      {searchIcon || showLeftIcon ? (
        <View style={leftIconContainerStyle}>
          <Icon
            type={searchIcon?.type ? searchIcon?.type : 'material'}
            name={searchIcon?.name ? searchIcon?.name : 'search'}
            size={searchIcon?.size ? searchIcon.size : 20}
            color={searchIcon?.color ? searchIcon?.color : appColors.greyColor}
          />
        </View>
      ) : undefined}
      <TextInput
        editable={!disabled}
        selectTextOnFocus={false}
        testID={testID}
        style={[styles.input, searchInputStyle]}
        placeholder={placeholder ? placeholder : 'Search...'}
        placeholderTextColor={
          placeholderTextColor ? placeholderTextColor : '#8e8e8e'
        }
        value={search}
        onChangeText={searchText => {
          setSearch(searchText);
        }}
        returnKeyType="search"
      />
      {search ? (
        <TouchableOpacity
          style={rightIconContainerStyle}
          onPress={() => {
            if (onCancel) {
              onCancel();
            } else setSearch('');
          }}>
          {clearIcon?.name ? (
            <Icon
              type={clearIcon.type}
              color={clearIcon.color}
              name={clearIcon.name}
              size={clearIcon.size}
            />
          ) : (
            <Icon
              name="clear"
              type="material"
              size={20}
              color="#8e8e8e"
              style={styles.icon}
            />
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 7,
    paddingHorizontal: 5,
    height: 40,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: appColors.dark,
    paddingLeft: 5,
    fontFamily: appFonts.medium,
  },
  icon: {
    marginHorizontal: 5,
  },
});

export default CommonSearchBar;
