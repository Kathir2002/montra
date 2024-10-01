import React, {
  Dispatch,
  FC,
  Fragment,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
  StyleSheet,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
  TextStyle,
  ScrollViewProps,
  TextProps,
  Image,
  Easing,
  useWindowDimensions,
} from 'react-native';
import ListEmpty from './ListEmpty';

import {Animated} from 'react-native';
import {appColors} from './constants';
import {appFonts} from '@shared/appFonts';

export type ValueType = string | number | boolean;

type SetStateCallback<S> = (prevState: S) => S;

export interface ActivityIndicatorComponentPropsInterface {
  size: 'small' | 'large';
  color: string;
}

export interface ListEmptyComponentPropsInterface {
  listMessageContainer: StyleProp<ViewStyle>;
  listMessageTextStyle: StyleProp<TextStyle>;
  ActivityIndicatorComponent: (
    props: ActivityIndicatorComponentPropsInterface,
  ) => JSX.Element | null;
  loading: boolean;
  message: string;
}

export type ItemTypeValue = ItemType<ValueType>;

interface ItemType<T> {
  // needs to be removed
  data?: string;
  label: string;
  value: T;
  parent?: string;
  selectable?: boolean;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  testID?: string;
}

interface DropDownSingleProps<T> {
  multiple?: false;
  onChangeValue?: (value: T | null) => void;
  onSelectItem?: (item: ItemType<T>) => void;
  setValue: Dispatch<SetStateCallback<T | null | any>>;
  value: T | null;
}

interface DropDownMultipleProps<T> {
  multiple: true;
  onChangeValue?: (value: T[] | null) => void;
  onSelectItem?: (items: ItemType<T>[]) => void;
  setValue: Dispatch<SetStateCallback<T[] | null | any>>;
  value: T[] | null;
}

interface DropdownBaseProps<T> {
  items: ItemType<T>[];
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  searchable?: boolean;
  disabled?: boolean;
  placeholder?: string;
  searchPlaceholderTextColor?: string;
  min?: number;
  max?: number;
  multipleText?: string;
  onOpen?: () => void;
  onClose?: () => void;
  maxHeight?: number;
  testID?: string;
  zIndex?: number;
  showTickIcon?: boolean;
  tickIconContainerStyle?: StyleProp<ViewStyle>;
  scrollViewProps?: ScrollViewProps;
  itemSeparator?: boolean;
  ListEmptyComponent?: (props: ListEmptyComponentPropsInterface) => JSX.Element;
  loading?: boolean;
  renderListItem?: () => JSX.Element;
  ActivityIndicatorComponent?: (
    props: ActivityIndicatorComponentPropsInterface,
  ) => JSX.Element;
  activityIndicatorSize?: 'small' | 'large';
  activityIndicatorColor?: string;
  TickIconComponent?: (props: {style: StyleProp<ViewStyle>}) => JSX.Element;
  autoScroll?: boolean;
  stickyHeader?: boolean;
  closeAfterSelecting?: boolean;
  labelProps?: TextProps;
  disabledStyle?: StyleProp<ViewStyle>;
  placeholderStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  showArrowIcon?: boolean;
  ArrowUpIconComponent?: (props: {style: StyleProp<ViewStyle>}) => JSX.Element;
  ArrowDownIconComponent?: (props: {
    style: StyleProp<ViewStyle>;
  }) => JSX.Element;
  arrowIconContainerStyle?: StyleProp<ViewStyle>;
  arrowIconStyle?: StyleProp<ViewStyle>;
  tickIconStyle?: StyleProp<ViewStyle>;
  searchContainerStyle?: StyleProp<ViewStyle>;
  searchTextInputStyle?: StyleProp<TextStyle>;
  listParentLabelStyle?: StyleProp<TextStyle>;
  disabledItemLabelStyle?: StyleProp<TextStyle>;
  listItemLabelStyle?: StyleProp<TextStyle>;
  listChildLabelStyle?: StyleProp<TextStyle>;
  selectedItemLabelStyle?: StyleProp<TextStyle>;
  dropDownContainerStyle?: StyleProp<ViewStyle>;
  listItemContainerStyle?: StyleProp<ViewStyle>;
  listParentContainerStyle?: StyleProp<ViewStyle>;
  listChildContainerStyle?: StyleProp<ViewStyle>;
  selectedItemContainerStyle?: StyleProp<ViewStyle>;
  disabledItemContainerStyle?: StyleProp<ViewStyle>;
  categorySelectable?: boolean;
  onPress?: () => void;
}

type DropdownInterface<T> = (
  | DropDownSingleProps<T>
  | DropDownMultipleProps<T>
) &
  DropdownBaseProps<T>;

const DropdownPicker: FC<DropdownInterface<ValueType>> = ({
  items = [],
  open,
  setOpen,
  value = null,
  setValue,
  searchable,
  onSelectItem,
  disabled = false,
  placeholder = null,
  multiple,
  searchPlaceholderTextColor = appColors.placeholderColor,
  min = null,
  max = null,
  multipleText,
  onOpen = () => {},
  onClose = () => {},
  maxHeight = 200,
  showTickIcon = true,
  tickIconContainerStyle,
  testID,
  TickIconComponent,
  scrollViewProps = {
    showsHorizontalScrollIndicator: false,
    showsVerticalScrollIndicator: false,
    scrollEnabled: true,
    nestedScrollEnabled: true,
  },
  loading = false,
  zIndex = 5000,
  itemSeparator,
  ListEmptyComponent = null,
  renderListItem = null,
  ActivityIndicatorComponent = null,
  activityIndicatorColor,
  stickyHeader = false,
  activityIndicatorSize,
  autoScroll = true,
  closeAfterSelecting = true,
  labelProps = {},
  disabledStyle = {},
  placeholderStyle = {},
  containerStyle = {},
  style = {},
  textStyle = {},
  labelStyle = {},
  ArrowUpIconComponent = null,
  ArrowDownIconComponent = null,
  showArrowIcon = true,
  arrowIconContainerStyle = {},
  arrowIconStyle = {},
  tickIconStyle = {},
  searchContainerStyle = {},
  searchTextInputStyle = {},
  dropDownContainerStyle = {},
  listItemContainerStyle = {},
  listItemLabelStyle = {},
  listChildContainerStyle = {},
  listParentContainerStyle = {},
  listChildLabelStyle = {},
  listParentLabelStyle = {},
  selectedItemContainerStyle = {},
  selectedItemLabelStyle = {},
  disabledItemContainerStyle = {},
  disabledItemLabelStyle = {},
  categorySelectable = true,
  onPress,
}) => {
  const [searchText, setSearchText] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (open && autoScroll) {
      let index: number = -1;
      if (multiple) {
        Array.isArray(value) &&
          value?.length &&
          value?.find((valueItem: ValueType) => {
            index = items?.findIndex(item => item.value === valueItem);
          });
      } else {
        index = sortedItems?.findIndex(
          (item: ItemTypeValue) => item.value === value,
        );
      }
      scrollToItem(index);
    }
  }, [open]);

  const scrollToItem = (index: number) => {
    const itemHeight = 40;
    const yPosition = index * itemHeight;
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({y: yPosition, animated: true});
    }
  };

  /**
   * onPressClose.
   */
  const onPressClose = useCallback(() => {
    setOpen(false);
    setSearchText('');
    onClose();
    setIsFocused(false);
  }, [setOpen, onClose]);

  /**
   * The value.
   * @returns {string|object|null}}
   */
  const _value = useMemo(() => {
    if (multiple) {
      if (value === null) return [];
      return [...new Set(value as ValueType[])];
    }

    return value;
  }, [value, multiple]);

  /**
   * The sorted items.
   * @returns {object}
   */
  const sortedItems = useMemo(() => {
    const sortedItems: ItemTypeValue[] = items.filter(
      (item: ItemTypeValue) =>
        item?.parent === undefined || item?.parent === null,
    );
    const children = items.filter(
      (item: ItemTypeValue) =>
        item?.parent !== undefined && item?.parent !== null,
    );

    children.forEach(child => {
      const index: number = sortedItems.findIndex(
        (item: ItemTypeValue) =>
          item?.parent === child?.parent || item?.value === child?.parent,
      );

      if (index > -1) {
        sortedItems.splice(index + 1, 0, child);
      }
    });

    return sortedItems;
  }, [items]);

  /**
   * The items.
   * @returns {object}
   */
  const _items = useMemo(() => {
    if (searchText.length === 0) {
      return sortedItems;
    } else {
      const values: ValueType[] = [];

      let results = sortedItems.filter((item: ItemTypeValue) => {
        const label = String(item?.label).toLowerCase();

        if (label.includes(searchText.toLowerCase())) {
          values.push(item?.value);
          return true;
        }

        return false;
      });

      results.forEach((item: ItemTypeValue, index: number) => {
        if (
          item?.parent === undefined ||
          item?.parent === null ||
          values.includes(item?.parent)
        )
          return;

        const parent = sortedItems?.find(
          (x: ItemTypeValue) => x?.value === item?.parent,
        );
        values.push(item?.parent);

        results.splice(index, 0, parent!);
      });

      return results;
    }
  }, [sortedItems, searchText]);

  /**
   * Indicates whether the value is null.
   * @returns {boolean}
   */
  const isNull: boolean = useMemo(() => {
    if (
      _value === null ||
      _value === '' ||
      (Array.isArray(_value) && _value.length === 0)
    ) {
      return true;
    }

    return sortedItems.length === 0;
  }, [_items, _value]);

  /**
   * Get the selected item.
   * @returns {object}
   */
  const getSelectedItem = useCallback(() => {
    if (multiple) return _value;

    if (isNull) return null;

    try {
      return _items.find((item: ItemTypeValue) => {
        return item?.value === _value;
      });
    } catch (e) {
      return null;
    }
  }, [_value, isNull, multiple]);

  const _multipleText = useMemo(
    () => multipleText ?? 'Selected Items Count:',
    [multipleText],
  );

  /**
   * Get the label of the selected item.
   * @param {string|null} fallback
   * @returns {string}
   */

  const getLabel = useCallback(
    (fallback: string | null = null) => {
      const item: any = getSelectedItem();

      if (multiple)
        if (item.length > 0) {
          let mtext: any = _multipleText;

          if (typeof mtext !== 'string') {
            mtext = mtext?.item?.length ?? mtext.n;
          }

          return mtext + ' ' + item?.length;
        } else {
          return fallback;
        }

      try {
        return item.label;
      } catch (e) {
        console.log(e);

        return fallback;
      }
    },
    [getSelectedItem, multiple, _multipleText],
  );

  /**
   * The placeholder.
   * @returns {string}
   */
  const _placeholder: string = useMemo(
    () => '',

    [placeholder],
  );

  /**
   * The label of the selected item / placeholder.
   */
  const _selectedItemLabel = useMemo(
    () => getLabel(_placeholder),
    [getLabel, _placeholder],
  );

  /**
   * The ActivityIndicatorComponent.
   * @returns {JSX.Element}
   */
  const _ActivityIndicatorComponent = useCallback(() => {
    let Component;
    if (ActivityIndicatorComponent !== null)
      Component = ActivityIndicatorComponent;
    else Component = ActivityIndicator;

    if (Component) {
      return (
        <Component
          size={activityIndicatorSize ? activityIndicatorSize : 'small'}
          color={
            activityIndicatorColor ? activityIndicatorColor : appColors.primary
          }
        />
      );
    } else {
      return null;
    }
  }, [
    ActivityIndicatorComponent,
    activityIndicatorSize,
    activityIndicatorColor,
  ]);

  const onPressItem = useCallback(
    (
      item: ItemTypeValue,
      parent: string | null | undefined,
      selectable: boolean,
    ) => {
      if (parent === null && !categorySelectable && selectable !== true) {
        return;
      }

      if (multiple) {
        setValue((state: ValueType[]) => {
          let _state = state !== null && state !== undefined ? [...state] : [];
          if (_state.includes(item?.value)) {
            // Remove the value
            if (min && Number.isInteger(min) && min >= _state.length) {
              return state;
            }
            const index = _state.findIndex(x => x === item?.value);
            _state.splice(index, 1);
          } else {
            // Add the value
            if (max && Number.isInteger(max) && max <= _state.length) {
              return state;
            }
            _state.push(item?.value);
          }
          onSelectItem && onSelectItem(_state as any);
          return _state;
        });
      } else {
        setValue(item?.value as any);
        onSelectItem && onSelectItem(item);
        if (closeAfterSelecting) {
          onPressClose();
        }
      }
    },
    [setValue, multiple, min, max, onSelectItem, multiple],
  );

  const RenderItem = ({
    item,
    isSelected,
    parent,
    disabled,
    selectable = true,
    labelStyle,
    containerStyle,
    testID,
  }: {
    item: ItemType<ValueType>;
    isSelected: boolean;
    parent?: string | null;
    selectable?: boolean;
    disabled?: boolean;
    labelStyle?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    testID?: string;
  }) => {
    /**
     * The tick icon component.
     * @returns {JSX.Element}
     */
    const _TickIconComponent = useCallback(() => {
      if (!showTickIcon) return null;

      let Component;
      if (TickIconComponent && TickIconComponent !== null)
        Component = (
          <TickIconComponent style={[styles.tickIcon, tickIconStyle]} />
        );
      else
        Component = (
          <Image
            source={require('./assets/tick.png')}
            style={[styles.tickIcon, tickIconStyle] as any}
          />
        );

      return isSelected ? (
        <View style={[styles.tickIconContainer, tickIconContainerStyle]}>
          {Component}
        </View>
      ) : undefined;
    }, [TickIconComponent, isSelected, showTickIcon]);

    return (
      <TouchableOpacity
        testID={testID}
        onPress={() => onPressItem(item, parent, selectable)}
        disabled={selectable == false || disabled}
        style={[
          styles.listItemContainer,
          containerStyle,
          listItemContainerStyle,
          parent != null
            ? [styles.listChildContainer, listChildContainerStyle]
            : [styles.listParentContainer, listParentContainerStyle],
          isSelected && [
            styles.selectedItemContainer,
            selectedItemContainerStyle,
          ],
          disabled && disabledItemContainerStyle,
        ]}
        activeOpacity={0.5}>
        <Text
          style={[
            {
              color: isSelected ? appColors.primary : appColors.dark,
              flex: 1,
              fontSize: 14,
            },
            parent != null
              ? [styles.listchildLabel, listChildLabelStyle]
              : [styles.listParentLabel, listParentLabelStyle],
            labelStyle,
            listItemLabelStyle,
            isSelected && [styles.selectedItemLabel, selectedItemLabelStyle],
            disabled && disabledItemLabelStyle,
          ]}>
          {item?.label}
        </Text>
        {_TickIconComponent()}
      </TouchableOpacity>
    );
  };

  /**
   * The arrow component.
   * @returns {JSX.Element}
   */
  const _ArrowComponent = useMemo(() => {
    if (!showArrowIcon) return null;

    let Component;
    if (open && ArrowUpIconComponent !== null)
      Component = (
        <ArrowUpIconComponent style={[styles.arrowIcon, arrowIconStyle]} />
      );
    else if (!open && ArrowDownIconComponent !== null)
      Component = (
        <ArrowDownIconComponent style={[styles.arrowIcon, arrowIconStyle]} />
      );
    else
      Component = (
        <Image
          source={require('./assets/arrow-down.png')}
          style={
            [
              {transform: [{rotate: open ? '180deg' : '0deg'}]},
              styles.arrowIcon,
              tickIconStyle,
            ] as any
          }
        />
      );

    return (
      <View style={[styles.arrowIconContainer, arrowIconContainerStyle]}>
        {Component}
      </View>
    );
  }, [showArrowIcon, open, ArrowUpIconComponent, ArrowDownIconComponent]);

  /**
   * The indices of all parent items.
   * @returns {object}
   */
  const stickyHeaderIndices = useMemo(() => {
    const stickyHeaderIndices: number[] = [];
    if (stickyHeader) {
      const parents = sortedItems.filter(
        (item: ItemTypeValue) =>
          item?.parent === undefined || item?.parent === null,
      );
      parents.forEach((parent: ItemTypeValue) => {
        const index = sortedItems.findIndex(
          (item: ItemTypeValue) => item?.value === parent?.value,
        );
        if (index > -1) stickyHeaderIndices.push(index);
      });
    }

    return stickyHeaderIndices;
  }, [stickyHeader, sortedItems]);
  /**
   * The ListEmptyComponent.
   * @returns {JSX.Element}
   */
  const _ListEmptyComponent = useCallback(() => {
    let Component;
    const message = 'No Record Found';

    if (ListEmptyComponent !== null) Component = ListEmptyComponent;
    else Component = ListEmpty;

    return (
      <Component
        listMessageContainer={styles.listMessageContainer}
        listMessageTextStyle={styles.listMessageText}
        ActivityIndicatorComponent={_ActivityIndicatorComponent}
        loading={loading}
        message={message}
      />
    );
  }, [ListEmptyComponent, _ActivityIndicatorComponent, loading]);

  /**
   * The renderItem component.
   * @returns {JSX.Element}
   */
  const RenderItemComponent = useMemo(() => {
    return renderListItem !== null ? renderListItem : RenderItem;
  }, [renderListItem]);

  const __renderListItem = useCallback(
    (item: ItemTypeValue) => {
      let isSelected: boolean;
      if (multiple) {
        isSelected =
          _value !== null &&
          Array.isArray(_value) &&
          _value?.includes(item?.value);
      } else {
        isSelected = _value === item?.value;
      }

      return (
        <RenderItemComponent
          item={item}
          parent={item?.parent ?? null}
          isSelected={isSelected}
          selectable={item?.selectable ?? true}
          disabled={item?.disabled ?? false}
          testID={testID}
          labelStyle={item?.labelStyle ?? {}}
          containerStyle={item?.containerStyle ?? {}}
        />
      );
    },
    [RenderItemComponent, _value, multiple, onPressItem],
  );

  useEffect(() => {
    if (!open) setIsFocused(false);
  }, [open]);

  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value || value === 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  useEffect(() => {
    Animated.timing(animatedheight, {
      toValue: open ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [open]);

  useEffect(() => {
    Animated.timing(animatedRotationValue, {
      toValue: isFocused ? 1 : 0,
      duration: 250,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
  };
  const handleBlur = () => {
    setIsFocused(false);
  };

  const {height, width} = useWindowDimensions();
  const [resolutionRatio, setResolutionRatio] = useState(1);
  let orgHeight = 841.0909090909091;
  let orgWidth = 392.72727272727275;
  useEffect(() => {
    const ratio = (height * width) / (orgWidth * orgHeight);
    setResolutionRatio(ratio);
  }, [height, width]);

  const animatedIsFocused = useRef(new Animated.Value(0)).current;
  const animatedheight = useRef(new Animated.Value(0)).current;
  const animatedRotationValue = useRef(new Animated.Value(0)).current;

  const animatedMaxHeightStyle = {
    maxHeight: animatedheight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, maxHeight],
    }),
  };
  const animatedLabelStyle = {
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [30, -10],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [14 * resolutionRatio, 14 * resolutionRatio],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [appColors.placeholderColor, appColors.dark],
    }),
  };

  const arrowRotateStyle = {
    transform: [
      {
        rotate: animatedRotationValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['30deg', '90deg'],
        }),
      },
    ],
  };

  return (
    <View style={{paddingVertical: 15}}>
      <Animated.Text style={[styles.labelStyle, animatedLabelStyle]}>
        {placeholder}
      </Animated.Text>
      <View style={[styles.container, containerStyle]}>
        <TouchableOpacity
          testID={testID}
          disabled={disabled}
          activeOpacity={0.7}
          onPress={() => {
            isFocused ? handleBlur() : handleFocus();
            onPress && onPress();
            setOpen(!open);
            if (open) onClose();
            else onOpen();
          }}
          style={[
            styles.style,
            {
              borderBottomRightRadius: open ? 0 : 8,
              borderBottomLeftRadius: open ? 0 : 8,
              borderBottomWidth: open ? 0 : 1,
            },
            style,
            disabled && disabledStyle,
          ]}>
          <Text
            style={[
              styles.label,
              textStyle,
              !isNull && labelStyle,
              isNull && placeholderStyle,
            ]}
            {...labelProps}>
            {_selectedItemLabel}
          </Text>
          {_ArrowComponent}
        </TouchableOpacity>

        {/* {open && ( */}
        <Animated.View
          style={[
            styles.dropDownContainer,
            {
              zIndex: zIndex,
              borderTopWidth: open ? 1 : 0,
              borderBottomWidth: open ? 1 : 0,
            },
            animatedMaxHeightStyle,
            dropDownContainerStyle,
          ]}>
          <View
            style={[
              styles.searchContainer,
              searchContainerStyle,
              !searchable && {flexDirection: 'row-reverse'},
            ]}>
            {searchable && (
              <TextInput
                value={searchText}
                placeholder="Search"
                placeholderTextColor={searchPlaceholderTextColor}
                style={[styles.searchTextInput, searchTextInputStyle]}
                onChangeText={(val: string) => {
                  setSearchText(val);
                }}
              />
            )}
          </View>
          <ScrollView
            stickyHeaderIndices={stickyHeaderIndices}
            ref={scrollViewRef}
            {...scrollViewProps}>
            {_items.map(
              (item: {label: string; value: ValueType}, index: number) => {
                return (
                  <Fragment key={index}>
                    {index > 0 && itemSeparator ? (
                      <View style={styles.itemSeparator} />
                    ) : undefined}
                    {__renderListItem(item)}
                  </Fragment>
                );
              },
            )}
            {_items?.length === 0 ? _ListEmptyComponent() : undefined}
          </ScrollView>
        </Animated.View>
        {/* )} */}
      </View>
    </View>
  );
};

export default DropdownPicker;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  style: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: appColors.formBorderColor,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  label: {
    flex: 1,
    color: appColors.dark,
  },
  arrowIcon: {
    width: 20,
    height: 20,
    tintColor: appColors.placeholderColor,
  },
  tickIcon: {
    width: 20,
    height: 20,
    tintColor: appColors.primary,
  },
  dropDownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: appColors.light,
    borderRadius: 8,
    borderColor: appColors.formBorderColor,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    width: '100%',
    overflow: 'hidden',
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: appColors.light,
    paddingHorizontal: 10,
    height: 40,
  },
  arrowIconContainer: {
    marginLeft: 10,
  },
  tickIconContainer: {
    marginLeft: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchTextInput: {
    flexGrow: 1,
    flexShrink: 1,
    margin: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomColor: appColors.formBorderColor,
    borderBottomWidth: 1,
    color: appColors.dark,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: appColors.dark,
  },
  listMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  listMessageText: {
    flexGrow: 1,
    textAlign: 'center',
    paddingVertical: 5,
    color: appColors.dark,
  },
  listChildContainer: {
    paddingLeft: 40,
  },
  listParentContainer: {},
  listParentLabel: {},
  selectedItemContainer: {},
  selectedItemLabel: {},
  listchildLabel: {},
  labelStyle: {
    position: 'absolute',
    left: 5,
    fontFamily: appFonts.medium,
  },
});
