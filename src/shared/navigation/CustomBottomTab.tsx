import React from 'react';
import {
  GestureResponderEvent,
  I18nManager,
  Pressable,
  StyleSheet,
  Vibration,
  View,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated, {useAnimatedStyle, withSpring} from 'react-native-reanimated';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs/lib/typescript/src/types';

import {useDispatch} from 'react-redux';
import {appColors} from '@shared/appColors';
import BottomTabIcon from './BottomTabIcon';
import {updateIsFabToggleOpen} from '@store/slice/appSlice';

const CustomBottomTab = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();

  const MARGIN = 15;
  const TAB_BAR_WIDTH = width - 2 * MARGIN;
  const TAB_WIDTH = TAB_BAR_WIDTH / state.routes.length;
  const dispatch = useDispatch();

  const translateAnimation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(
            I18nManager.isRTL
              ? -TAB_WIDTH * state.index
              : TAB_WIDTH * state.index,
          ),
        },
      ],
    };
  });

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          width: TAB_BAR_WIDTH,
          bottom: insets.bottom + 10,
        },
      ]}>
      <Animated.View
        style={[
          styles.slidingTabContainer,
          {width: TAB_WIDTH},
          translateAnimation,
        ]}>
        {state.index !== 2 && <View style={styles.slidingTab} />}
      </Animated.View>
      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = (e: GestureResponderEvent) => {
          dispatch(updateIsFabToggleOpen(false));

          if (route.name == 'Add') {
            e.preventDefault();
          } else {
            Vibration.vibrate(50);
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // The `merge: true` option makes sure that the params inside the tab screen are preserved
              navigation.navigate(route.name, {merge: true});
            }
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? {selected: true} : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={e => onPress(e)}
            onLongPress={onLongPress}
            style={{
              flex: 1,
            }}>
            <View style={[styles.contentContainer]}>
              <BottomTabIcon route={route.name} isFocused={isFocused} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

export default CustomBottomTab;

const styles = StyleSheet.create({
  tabBarContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 70,
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: appColors.primary,
  },
  slidingTabContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slidingTab: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: appColors.light,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
});
