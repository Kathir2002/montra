import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {appColors} from '@shared/appColors';
import CommonText from '@shared/components/commonText/CommonText';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';

const PinGerneration = () => {
  const [pinValue, setPinValue] = useState(new Array(6).fill(null));
  const numArray = Array.from({length: 10}, (_, i) => {
    const number = (i + 1) % 10;
    return number;
  });

  const renderItem = ({item, index}: {item: number; index: number}) => {
    return (
      <View
        style={{
          marginHorizontal: 30,
          marginBottom: 20,
          flex: 1 / 3,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <CommonText size={30} content={item} color={appColors.light} />
      </View>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={{flexGrow: 1, backgroundColor: appColors.primary}}>
      <CommonHeader
        title=""
        leftIcon={false}
        leftIconPressBack={() => {}}
        headerBgc={appColors.primary}
      />
      <StatusBar backgroundColor={appColors.primary} />
      <View
        style={{
          alignItems: 'center',
          padding: 15,
          flex: 1,
        }}>
        <CommonText
          color={appColors.light}
          content="Let’s  setup your PIN"
          size={'large'}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            marginTop: 30,
          }}>
          {pinValue.map((pin, index) => {
            return (
              <View
                key={index}
                style={{
                  marginVertical: 10,
                  backgroundColor:
                    pin == null ? 'transparent' : appColors.light,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: appColors.light,
                }}
              />
            );
          })}
        </View>
      </View>
      <FlatList
        contentContainerStyle={{
          flex: 1,
          justifyContent: 'flex-end',
          paddingBottom: 30,
        }}
        data={numArray}
        scrollEnabled={false}
        numColumns={3}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </ScrollView>
  );
};

export default PinGerneration;

const styles = StyleSheet.create({});
