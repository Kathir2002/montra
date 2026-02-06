import {
  FlatList,
  ImageBackground,
  Modal,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { appColors } from '@shared/appColors';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import {
  NavigationProp,
  ParamListBase,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import CommonText from '@shared/components/commonText/CommonText';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import { Toast } from '@shared/ToastConfig';
import AccountService from '@services/setup/accountService';
import { paymentData, PaymentDataInterface } from '@assets/svg';
import CommonButton from '@shared/components/commonButton/CommonButton';
import { getCurrencySymbol } from '@src/lib/functions';
import { useTranslation } from 'react-i18next';
import { CustomModal } from '@shared/components/CustomModal';

const Account = () => {
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [walletData, setWalletData] = useState<any>({});
  const isFocused = useIsFocused();
  const { t } = useTranslation('account');
  useEffect(() => {
    if (isFocused) {
      getWalletData();
    }
  }, [isFocused]);

  const getWalletData = async () => {
    setIsLoading(true);
    await AccountService.getWalletList()
      .then((res: any) => {
        if (res?.success) {
          setWalletData(res);
        }
      })
      .catch(err => {
        console.log(err);

        Toast({ message: err?.response?.data?.message, type: 'error' });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const CurrentImage = paymentData[
      item?.accountType as keyof PaymentDataInterface
    ].filter(ind => {
      return item?.provider?.providerCode === ind?.nameCode;
    })[0]?.image;

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('AddNewBankAccount', {
            ...item,
            fromAccountPage: true,
          })
        }
        activeOpacity={0.5}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 15,
          borderWidth: 1,
          borderColor: appColors.formBorderColor,
          borderRadius: 8,
          padding: 10,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              backgroundColor: appColors.formBorderColor,
              padding: 10,
              borderRadius: 12,
            }}>
            {CurrentImage && <CurrentImage height={30} width={30} />}
          </View>
          <CommonText content={item?.name} bold />
        </View>
        <CommonText content={getCurrencySymbol(item?.balance)} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: appColors.light }}>
      <View style={{ flex: 1 }}>
        <ImageBackground
          resizeMode="cover"
          source={require('@assets/images/accountBg.png')}
          style={{ flex: 0.3 }}>
          <CommonHeader
            leftIconPressBack={() => navigation.goBack()}
            title={t('ACCOUNT')}
            headerBgc="transparent"
          />
          <StatusBar
            barStyle={isLoading ? 'light-content' : 'dark-content'}
            backgroundColor={
              isLoading ? appColors.transparentBackground : appColors.light
            }
          />
          <CommonText
            content={t('ACCOUNT_BALANCE')}
            style={{ textAlign: 'center' }}
            color={appColors.placeholderColor}
            size={'large'}
          />
          <CommonText
            content={
              walletData?.totalAccountBalance >= 0
                ? getCurrencySymbol(walletData?.totalAccountBalance)
                : `☹️`
            }
            style={{ textAlign: 'center' }}
            bold
            size={'appHeader'}
          />
        </ImageBackground>
        <View>
          <FlatList
            contentContainerStyle={{
              paddingHorizontal: 15,
              marginVertical: 15,
              flex: walletData?.rows?.length == 0 ? 1 : undefined,
            }}
            data={walletData?.rows}
            renderItem={renderItem}
            keyExtractor={(_, index) => index.toString()}
            ListEmptyComponent={() => (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <CommonText
                  content={t('NO_ACCOUNT_FOUND')}
                  color={appColors.placeholderColor}
                />
              </View>
            )}
          />
        </View>
        <View
          style={{
            paddingHorizontal: 15,
            position: 'absolute',
            bottom: 30,
            width: '100%',
          }}>
          <CommonButton
            title={t('ADD_NEW_WALLET')}
            onPress={() =>
              navigation.navigate('AddNewBankAccount', { fromAccountPage: true })
            }
          />
        </View>
      </View>
      <CustomModal visible={isLoading} transparent={true} animationType="fade">
        <CommonLoader />
      </CustomModal>
    </View>
  );
};

export default Account;

const styles = StyleSheet.create({});
