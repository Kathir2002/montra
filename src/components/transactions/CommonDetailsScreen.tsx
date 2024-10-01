import React, {useContext, useRef, useState} from 'react';
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
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import CommonButton from '../../shared/components/commonButton/CommonButton';
import CommonHeader from '../../shared/components/commonHeader/CommonHeader';
import CommonText from '../../shared/components/commonText/CommonText';
import DeleteIcon from '@assets/svg/delete.svg';
import ExcelIcon from '@assets/svg/fileFormats/excel.svg';
import PDFIcon from '@assets/svg/fileFormats/pdf.svg';
import WordIcon from '@assets/svg/fileFormats/word.svg';
import {appColors} from '@shared/appColors';
import {TransactionListInterface} from '@screens/Dashboard';
import {formatBytes, getCurrencySymbol} from '@src/lib/functions';
import CommonRBSheet, {
  RBSheetRef,
} from '../../shared/components/commonRBSheet/CommonRBSheet';
import TransactionService from '@services/transactionService';
import {Toast} from '@shared/ToastConfig';
import CommonLoader from '../../shared/components/commonLoader/CommonLoader';
import AppContext from '@shared/appContext';
import {paymentData, PaymentDataInterface} from '@assets/svg';
import Popover from 'react-native-popover-view';
import LottieView from 'lottie-react-native';

const CommonDetailsScreen = ({
  screenName,
}: {
  screenName: 'Expense' | 'Income' | 'Transfer';
}) => {
  const route: RouteProp<{transactionDetails: TransactionListInterface}> =
    useRoute();
  const {setIsTransactionAdded} = useContext(AppContext);
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const [rbSheetOpen, setRbSheetOpen] = useState(false);
  const [isSuccessPopoverVisible, setIsSuccessPopoverVisible] = useState(false);

  const transferData = {
    fromAccount: paymentData[
      route.params?.from?.paymentMode as keyof PaymentDataInterface
    ]?.filter(item => item?.nameCode === route?.params?.from?.wallet)[0].name,
    toAccount: paymentData[
      route.params?.to?.paymentMode as keyof PaymentDataInterface
    ]?.filter(item => item?.nameCode === route?.params?.to?.wallet)[0].name,
    wallet: paymentData[
      route.params?.paymentMode as keyof PaymentDataInterface
    ]?.filter(item => item?.nameCode === route?.params?.wallet)[0]?.name,
  };

  const [openDocumentViewPanel, setOpenDocumentViewPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const deleteRBSheetRef = useRef<RBSheetRef>(null);

  const handleDeleteTransaction = async () => {
    setIsLoading(true);
    await TransactionService.deleteTransaction({
      transactionId: route?.params?._id,
    })
      .then((res: any) => {
        if (res?.success) {
          setIsLoading(false);
          deleteRBSheetRef.current?.close();
          setRbSheetOpen(false);
          setIsSuccessPopoverVisible(true);
          setIsTransactionAdded(true);
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
        title="Detail Transaction"
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
          rbSheetOpen || isSuccessPopoverVisible
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
            content={getCurrencySymbol(route?.params?.amount, false)}
            color={appColors.light}
            size={'appHeader'}
            bold
          />

          <CommonText
            content={route?.params?.notes}
            color={appColors.light}
            size={'header'}
          />
          <CommonText
            content={moment(route?.params?.transactionDate).format(
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
          <CommonText content="Type" color={appColors.placeholderColor} />
          <CommonText bold content={route.params.transactionType} />
        </View>
        <View style={{flex: 0.35, alignItems: 'center'}}>
          <CommonText
            content={`${screenName == 'Transfer' ? 'From' : 'Category'}`}
            color={appColors.placeholderColor}
          />
          <CommonText
            style={{textAlign: 'center'}}
            bold
            content={`${
              screenName === 'Transfer'
                ? transferData?.fromAccount
                : route.params?.transactionFor
            }`}
          />
        </View>
        <View style={{flex: 0.35, alignItems: 'center'}}>
          <CommonText
            content={`${screenName == 'Transfer' ? 'To' : 'Wallet'}`}
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
          <CommonText
            content={'Description'}
            color={appColors.placeholderColor}
          />
          <CommonText
            content={route.params.description}
            color={appColors.dark}
          />
        </View>
        {route?.params?.document ? (
          <View>
            <CommonText
              content="Attachment"
              color={appColors.placeholderColor}
            />
            {route?.params?.document?.fileFormat == 'image/jpeg' ? (
              <TouchableOpacity
                activeOpacity={0.5}
                onLongPress={() => {
                  setOpenDocumentViewPanel(true);
                  Vibration.vibrate(50);
                }}>
                <Image
                  resizeMode="cover"
                  resizeMethod="auto"
                  source={{
                    uri: route.params?.document?.fileUrl,
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
              <View style={{width: 200}}>
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
                  {route?.params?.document?.fileFormat == 'application/pdf' ? (
                    <PDFIcon width={35} height={35} />
                  ) : route?.params?.document?.fileFormat ==
                    'application/msword' ? (
                    <WordIcon width={35} height={35} />
                  ) : (
                    <ExcelIcon width={35} height={35} />
                  )}
                  <View style={{flex: 1, gap: 5}}>
                    <CommonText
                      size={'medium'}
                      content={route?.params?.document?.fileName}
                      color={appColors.placeholderColor}
                    />
                    <CommonText
                      size={'error'}
                      content={String(
                        formatBytes(route?.params?.document?.fileSize),
                      )}
                      color={appColors.placeholderColor}
                    />
                  </View>
                </View>
              </View>
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
            title="Edit"
            onPress={() =>
              navigation.navigate(`Add${screenName}`, route.params)
            }
          />
        </View>
      </View>
      <CommonRBSheet
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
        }}>
        <View style={{padding: 15, gap: 10}}>
          <CommonText
            content="Remove this transaction?"
            bold
            size={'large'}
            style={{textAlign: 'center'}}
          />
          <CommonText
            content="Are you sure do you wanna remove this transaction?"
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
                title="No"
                buttonType="clear"
                onPress={() => {
                  deleteRBSheetRef.current?.close();
                  setRbSheetOpen(false);
                }}
              />
            </View>
            <View style={{flex: 0.45}}>
              <CommonButton title="Yes" onPress={handleDeleteTransaction} />
            </View>
          </View>
        </View>
      </CommonRBSheet>
      <Modal visible={isLoading} transparent animationType="fade">
        <CommonLoader />
      </Modal>
      <Modal
        visible={openDocumentViewPanel}
        animationType="fade"
        onRequestClose={() => setOpenDocumentViewPanel(false)}></Modal>
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
          content="Transaction has been successfully removed"
          size={'label'}
          style={{textAlign: 'center', paddingHorizontal: 20}}
        />
      </Popover>
    </View>
  );
};

export default CommonDetailsScreen;
