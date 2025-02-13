import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  Modal,
  StatusBar,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import moment from 'moment';
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';

import CommonButton from '../../shared/components/commonButton/CommonButton';
import CommonHeader from '../../shared/components/commonHeader/CommonHeader';
import CommonText from '../../shared/components/commonText/CommonText';
import DeleteIcon from '@assets/svg/delete.svg';
import ExcelIcon from '@assets/svg/fileFormats/excel.svg';
import PDFIcon from '@assets/svg/fileFormats/pdf.svg';
import WordIcon from '@assets/svg/fileFormats/word.svg';
import {appColors} from '@shared/appColors';
import {TransactionListInterface} from '@screens/Dashboard';
import {
  formatBytes,
  getCurrencySymbol,
  openFileFromUrl,
} from '@src/lib/functions';
import CommonRBSheet, {
  RBSheetRef,
} from '../../shared/components/commonRBSheet/CommonRBSheet';
import TransactionService from '@services/transactionService';
import {Toast} from '@shared/ToastConfig';
import CommonLoader from '../../shared/components/commonLoader/CommonLoader';
import {paymentData, PaymentDataInterface} from '@assets/svg';
import Popover from 'react-native-popover-view';
import LottieView from 'lottie-react-native';
import {useDispatch} from 'react-redux';
import {updateIsTransactionAdded} from '@store/slice/appSlice';
import {useTranslation} from 'react-i18next';
import CommonConfirmation from '@shared/components/CommonConfirmation';

interface PropInterface {
  id: string;
}

const CommonDetailsScreen = ({
  screenName,
}: {
  screenName: 'Expense' | 'Income' | 'Transfer';
}) => {
  const {t} = useTranslation('transaction');
  const route: RouteProp<{transactionDetails: PropInterface}> = useRoute();
  const dispatch = useDispatch();
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const [transactionDetails, setTransactionDetails] =
    useState<TransactionListInterface | null>(null);

  const [rbSheetOpen, setRbSheetOpen] = useState(false);
  const [isSuccessPopoverVisible, setIsSuccessPopoverVisible] = useState(false);

  const transferData = {
    fromAccount: paymentData[
      transactionDetails?.from?.paymentMode as keyof PaymentDataInterface
    ]?.filter(
      item => item?.nameCode === transactionDetails?.from?.wallet?.walletName,
    )[0].name,
    toAccount: paymentData[
      transactionDetails?.to?.paymentMode as keyof PaymentDataInterface
    ]?.filter(
      item => item?.nameCode === transactionDetails?.to?.wallet?.walletName,
    )[0].name,
    wallet: paymentData[
      transactionDetails?.paymentMode as keyof PaymentDataInterface
    ]?.filter(item => {
      return item?.nameCode === transactionDetails?.wallet?.walletName;
    })[0]?.name,
  };

  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const deleteRBSheetRef = useRef<RBSheetRef>(null);
  useEffect(() => {
    if (isFocused) {
      getTransactionDetails();
    }
  }, [isFocused]);

  const getTransactionDetails = async () => {
    await TransactionService.getTransactionDetails({id: route?.params?.id})
      .then((res: any) => {
        setTransactionDetails(res?.transaction);
        setIsLoading(false);
      })
      .catch(err => {
        setIsLoading(false);
        Toast({type: 'error', message: err?.response?.data?.message});
      });
  };

  const handleDeleteTransaction = async () => {
    setIsLoading(true);
    await TransactionService.deleteTransaction({
      transactionId: route?.params?.id,
    })
      .then((res: any) => {
        if (res?.success) {
          setIsLoading(false);
          deleteRBSheetRef.current?.close();
          setRbSheetOpen(false);
          dispatch(updateIsTransactionAdded(true));
          setIsSuccessPopoverVisible(true);
          Vibration.vibrate(50);

          setTimeout(() => {
            navigation.navigate('Transaction');
            setIsSuccessPopoverVisible(false);
          }, 2000);
        }
      })
      .catch(err => {
        deleteRBSheetRef.current?.close();
        setRbSheetOpen(false);
        setIsLoading(false);
        Toast({message: err?.response?.data?.message, type: 'error'});
      });
  };

  return (
    <View
      style={{flex: 1, backgroundColor: appColors.light, position: 'relative'}}>
      <CommonHeader
        leftIcon
        theme="dark"
        title={t('DETAIL_TRANSACTION')}
        leftIconPressBack={() => navigation.goBack()}
        headerBgc={
          screenName == 'Income'
            ? appColors.incomeBg
            : screenName == 'Expense'
            ? appColors.expenseBg
            : appColors.transferBg
        }
        customRightHeaderComponent={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setRbSheetOpen(true);
              deleteRBSheetRef.current?.open();
            }}>
            <DeleteIcon height={25} width={25} color={appColors.light} />
          </TouchableOpacity>
        }
      />
      <StatusBar
        backgroundColor={
          rbSheetOpen || isSuccessPopoverVisible || isLoading
            ? appColors.transparentBackground
            : screenName == 'Income'
            ? appColors.incomeBg
            : screenName == 'Expense'
            ? appColors.expenseBg
            : appColors.transferBg
        }
        barStyle={'light-content'}
      />
      <View
        style={{
          flex: 1,
          backgroundColor:
            screenName == 'Income'
              ? appColors.incomeBg
              : screenName == 'Expense'
              ? appColors.expenseBg
              : appColors.transferBg,
          maxHeight: 150,
          borderBottomRightRadius: 20,
          borderBottomLeftRadius: 20,
        }}>
        <View style={{alignItems: 'center', gap: 10}}>
          <CommonText
            content={getCurrencySymbol(
              transactionDetails?.amount as number,
              false,
            )}
            color={appColors.light}
            size={'appHeader'}
            bold
          />

          <CommonText
            content={transactionDetails?.notes}
            color={appColors.light}
            size={'header'}
          />
          <CommonText
            content={moment(transactionDetails?.transactionDate).format(
              'dddd D MMMM YYYY  HH:mm',
            )}
            color={appColors.lightBg}
            size={'label'}
          />
        </View>
      </View>
      <View
        style={{
          padding: 15,
          margin: 'auto',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: appColors.formBorderColor,
          top: '-8%',
          elevation: 4,
          backgroundColor: appColors.light,
          borderRadius: 20,
        }}>
        <View style={{flex: 0.2, alignItems: 'center'}}>
          <CommonText content={t('TYPE')} color={appColors.placeholderColor} />
          <CommonText bold content={transactionDetails?.transactionType} />
        </View>
        <View style={{flex: 0.35, alignItems: 'center'}}>
          <CommonText
            content={`${screenName == 'Transfer' ? t('FROM') : t('CATEGORY')}`}
            color={appColors.placeholderColor}
          />
          <CommonText
            style={{textAlign: 'center'}}
            bold
            content={`${
              screenName === 'Transfer'
                ? transferData?.fromAccount
                : transactionDetails?.transactionFor
            }`}
          />
        </View>
        <View style={{flex: 0.35, alignItems: 'center'}}>
          <CommonText
            content={`${screenName == 'Transfer' ? t('TO') : t('WALLET')}`}
            color={appColors.placeholderColor}
          />
          <CommonText
            style={{textAlign: 'center'}}
            bold
            content={`${
              screenName === 'Transfer'
                ? transferData?.toAccount
                : transferData?.wallet
            }`}
          />
        </View>
      </View>
      <View
        style={{
          marginHorizontal: 15,
          borderBottomWidth: 2,
          borderBlockColor: appColors.dashedBorderColor,
          borderStyle: 'dashed',
        }}
      />
      <View style={{flex: 1, backgroundColor: appColors.light, padding: 15}}>
        <View style={{}}>
          {transactionDetails?.description && (
            <CommonText
              content={t('DESCRIPTION')}
              color={appColors.placeholderColor}
            />
          )}
          <CommonText
            content={transactionDetails?.description}
            color={appColors.dark}
          />
        </View>
        {transactionDetails?.document ? (
          <View>
            <CommonText
              content={t('ATTACHMENT')}
              color={appColors.placeholderColor}
            />
            {transactionDetails?.document?.fileFormat?.startsWith('image/') ? (
              <TouchableOpacity
                activeOpacity={0.5}
                onLongPress={() => {
                  openFileFromUrl(
                    transactionDetails?.document?.fileUrl,
                    transactionDetails?.document?.fileFormat,
                    false,
                  );
                  Vibration.vibrate(50);
                }}>
                <Image
                  resizeMode="cover"
                  resizeMethod="auto"
                  source={{
                    uri: transactionDetails?.document?.fileUrl,
                  }}
                  height={150}
                  style={{
                    alignSelf: 'center',
                    borderRadius: 15,
                    resizeMode: 'cover',
                  }}
                  width={150}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                onLongPress={() => {
                  Vibration.vibrate(50);
                  openFileFromUrl(
                    transactionDetails?.document?.fileUrl,
                    transactionDetails?.document?.fileFormat,
                    false,
                  );
                }}
                style={{maxWidth: 210}}>
                <View
                  style={{
                    gap: 5,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: 15,
                    borderColor: appColors.formBorderColor,
                    borderWidth: 1,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                  }}>
                  {transactionDetails?.document?.fileFormat ===
                  DocumentPicker.types.pdf ? (
                    <PDFIcon width={35} height={35} />
                  ) : transactionDetails?.document?.fileFormat ===
                      'application/msword' ||
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
                    <WordIcon width={35} height={35} />
                  ) : (
                    <ExcelIcon width={35} height={35} />
                  )}
                  <View style={{flex: 1, gap: 5}}>
                    <CommonText
                      size={'medium'}
                      content={`${transactionDetails?.document?.fileName}.${
                        transactionDetails?.document?.fileUrl?.split('.')[
                          transactionDetails?.document?.fileUrl?.split('.')
                            ?.length - 1
                        ]
                      }`}
                      color={appColors.placeholderColor}
                    />
                    <CommonText
                      size={'error'}
                      content={String(
                        formatBytes(transactionDetails?.document?.fileSize),
                      )}
                      color={appColors.placeholderColor}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>
        ) : undefined}
        <View
          style={{
            position: 'absolute',
            bottom: 30,
            left: 15,
            width: '100%',
          }}>
          <CommonButton
            title={t('EDIT')}
            onPress={() =>
              navigation.navigate(`Add${screenName}`, transactionDetails!)
            }
          />
        </View>
      </View>
      <CommonConfirmation
        titleText={t('REMOVE_TRANSACTION')}
        subText={t('REMOVE_CONFIRMATION')}
        handleCancelBtn={() => {
          deleteRBSheetRef.current?.close();
          setRbSheetOpen(false);
        }}
        handleOkBtn={() => handleDeleteTransaction()}
        onClose={() => {
          setRbSheetOpen(false);
        }}
        ref={deleteRBSheetRef}
        height={200}
        closeOnPressBack={true}
        closeOnPressMask={true}
        draggable={true}
        customStyles={{
          container: {borderTopLeftRadius: 20, borderTopRightRadius: 20},
        }}
      />
      <Modal visible={isLoading} transparent animationType="fade">
        <CommonLoader />
      </Modal>
      <Popover
        isVisible={isSuccessPopoverVisible}
        popoverStyle={{
          padding: 15,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
        }}>
        <LottieView
          source={require('@assets/lottie/sucess-lottie.json')}
          loop
          autoPlay
          style={{height: 80, width: 80}}
        />
        <CommonText
          content={t('TRANSACTION_REMOVED_SUCCESS')}
          size={'label'}
          style={{textAlign: 'center', paddingHorizontal: 20}}
        />
      </Popover>
    </View>
  );
};

export default CommonDetailsScreen;
