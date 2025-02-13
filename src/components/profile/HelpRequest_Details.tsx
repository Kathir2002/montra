import {
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StatusBar,
  Vibration,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {appColors} from '@shared/appColors';
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import {Toast} from '@shared/ToastConfig';
import ContactService from '@services/contactSupportService';
import CommonText from '@shared/components/commonText/CommonText';
import {RequestTicketInterface} from './HelpRequest_List';
import Clipboard from '@react-native-clipboard/clipboard';
import DocumentPicker from 'react-native-document-picker';
import {TouchableOpacity} from 'react-native';
import {Icon, Image} from '@rneui/base';
import moment from 'moment';
import CommonDropDown from '@shared/components/commonDropdown/CommonDropDown';
import ChatView from './ChatView';
import {useSelector} from 'react-redux';
import {RootState} from '@store/store';
import {formatBytes, openFileFromUrl} from '@src/lib/functions';
import ExcelIcon from '@assets/svg/fileFormats/excel.svg';
import PDFIcon from '@assets/svg/fileFormats/pdf.svg';
import WordIcon from '@assets/svg/fileFormats/word.svg';
import {useTranslation} from 'react-i18next';
import CommonButton from '@shared/components/commonButton/CommonButton';

const HelpRequest_Details = () => {
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [ticketDetails, setTicketDetails] = useState<RequestTicketInterface>();
  const {t} = useTranslation('profile');
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
  const [priorityDropdownValue, setPriorityDropdownValue] =
    useState<RequestTicketInterface['priority']>();
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [statusDropdownValue, setStatusDropdownValue] =
    useState<RequestTicketInterface['status']>();

  const priorityData = [
    {
      label: 'High Priority',
      value: 'High',
    },
    {
      label: 'Medium Priority',
      value: 'Medium',
    },
    {
      label: 'Low Priority',
      value: 'Low',
    },
  ];
  const statusData = [
    {
      label: 'New',
      value: 'New',
    },
    {
      label: 'Progress',
      value: 'Progress',
    },
    {
      label: 'Resolved',
      value: 'Resolved',
    },
  ];
  const route: RouteProp<{
    params: {
      request_id: string;
    };
  }> = useRoute();

  const getTicketDetails = async () => {
    setIsLoading(true);
    const data = {
      request_id: route?.params?.request_id,
      isAdmin: userDetails?.isAdmin,
    };

    await ContactService.getSupportDetails(data)
      .then((res: any) => {
        setIsLoading(false);
        if (res?.success) {
          setTicketDetails(res?.data);
          setPriorityDropdownValue(res?.data?.priority);
          setStatusDropdownValue(res?.data?.status);
        }
      })
      .catch(err => {
        setIsLoading(false);
        Toast({message: err?.response?.data?.message, type: 'error'});
      });
  };

  useEffect(() => {
    if (isFocused) {
      getTicketDetails();
    }
  }, [isFocused]);

  return (
    <KeyboardAvoidingView
      onStartShouldSetResponder={() => {
        setPriorityDropdownOpen(false);
        setStatusDropdownOpen(false);
        return false;
      }}
      style={{
        flex: 1,
        backgroundColor: appColors.light,
        paddingBottom: 20,
      }}>
      <View
        style={{
          backgroundColor: appColors.primary,
          paddingBottom: 15,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}>
        <CommonHeader
          theme="dark"
          headerContainerStyle={{backgroundColor: appColors.primary}}
          title="Tickets Details"
          leftIconPressBack={() => navigation.goBack()}
        />
        <StatusBar
          backgroundColor={
            isLoading ? appColors.transparentBackground : appColors.primary
          }
          barStyle={'light-content'}
        />
        <View style={{paddingHorizontal: 15, gap: 5}}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              Clipboard.setString(ticketDetails?.request_id!);
              Vibration.vibrate(100);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}>
            <CommonText
              color={appColors.light}
              content={`#${ticketDetails?.request_id}`}
            />
            <Icon
              type="feather"
              name="copy"
              color={appColors.light}
              size={20}
            />
          </TouchableOpacity>
          <CommonText
            size={'error'}
            content={moment(ticketDetails?.request_Date).format(
              'DD MMM, hh:mm A',
            )}
            color={appColors.light}
          />
        </View>
      </View>
      <ScrollView
        style={{
          flex: 1,
          paddingHorizontal: 15,
        }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 25,
        }}>
        <View style={{gap: 15}}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'space-between',
              flexDirection: 'row',
            }}>
            <View style={{flex: 0.45}}>
              <CommonDropDown
                disabled={!userDetails.isAdmin}
                placeholder="Status"
                items={statusData}
                open={statusDropdownOpen}
                setOpen={setStatusDropdownOpen}
                value={statusDropdownValue!}
                setValue={setStatusDropdownValue}
                onSelectItem={() => undefined}
                zIndex={2}
              />
            </View>
            <View style={{flex: 0.45}}>
              <CommonDropDown
                placeholder="Priority"
                disabled={!userDetails.isAdmin}
                items={priorityData}
                open={priorityDropdownOpen}
                setOpen={setPriorityDropdownOpen}
                value={priorityDropdownValue!}
                setValue={setPriorityDropdownValue}
                onSelectItem={() => undefined}
                zIndex={2}
              />
            </View>
          </View>
          <View style={{zIndex: 1, gap: 5}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              }}>
              <CommonText bold content="Name: " />
              <CommonText content={ticketDetails?.name} />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                zIndex: 1,
              }}>
              <CommonText bold content="Email: " />
              <CommonText content={ticketDetails?.email} />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                zIndex: 1,
              }}>
              <CommonText bold content="Phone Number: " />
              <CommonText content={String(ticketDetails?.phoneNumber)} />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                zIndex: 1,
              }}>
              <CommonText bold content="Subject: " />
              <CommonText content={ticketDetails?.subject} />
            </View>
          </View>
          <View
            style={{
              borderWidth: 1,
              borderRadius: 8,
              borderLeftColor: appColors.transferBg,
              borderLeftWidth: 5,
              paddingHorizontal: 10,
              paddingVertical: 5,
              zIndex: 1,
            }}>
            <CommonText bold content="Message" />
            <CommonText
              content={ticketDetails?.message}
              color={appColors.placeholderColor}
            />
          </View>
          {ticketDetails?.document?.fileUrl ? (
            <View>
              <CommonText
                content={t('transaction:ATTACHMENT')}
                color={appColors.placeholderColor}
              />
              {ticketDetails?.document?.fileFormat?.startsWith('image/') ? (
                <TouchableOpacity
                  activeOpacity={0.5}
                  onLongPress={() => {
                    openFileFromUrl(
                      ticketDetails?.document?.fileUrl,
                      ticketDetails?.document?.fileFormat,
                      false,
                    );
                    Vibration.vibrate(50);
                  }}>
                  <Image
                    resizeMode="cover"
                    resizeMethod="auto"
                    source={{
                      uri: ticketDetails?.document?.fileUrl,
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
                      ticketDetails?.document?.fileUrl,
                      ticketDetails?.document?.fileFormat,
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
                    {ticketDetails?.document?.fileFormat ===
                    DocumentPicker.types.pdf ? (
                      <PDFIcon width={35} height={35} />
                    ) : ticketDetails?.document?.fileFormat ===
                        'application/msword' ||
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
                      <WordIcon width={35} height={35} />
                    ) : (
                      <ExcelIcon width={35} height={35} />
                    )}
                    <View style={{flex: 1, gap: 5}}>
                      <CommonText
                        size={'medium'}
                        content={`${ticketDetails?.document?.fileName}.${
                          ticketDetails?.document?.fileUrl?.split('.')[
                            ticketDetails?.document?.fileUrl?.split('.')
                              ?.length - 1
                          ]
                        }`}
                        color={appColors.placeholderColor}
                      />
                      <CommonText
                        size={'error'}
                        content={String(
                          formatBytes(ticketDetails?.document?.fileSize),
                        )}
                        color={appColors.placeholderColor}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ) : undefined}
        </View>
        {userDetails?.isAdmin || ticketDetails?.replies?.length! > 0 ? (
          <View style={{flex: 1, justifyContent: 'flex-end'}}>
            <CommonButton
              title="Send Reply"
              onPress={() => {
                navigation.navigate('ChatView', {
                  id: route?.params?.request_id,
                });
              }}
              iconContainerStyle={{marginRight: 10}}
              icon={{
                type: 'feather',
                name: 'send',
                color: appColors.light,
              }}
            />
          </View>
        ) : undefined}
      </ScrollView>
      <Modal visible={isLoading} animationType="fade" transparent={true}>
        <CommonLoader />
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default HelpRequest_Details;
