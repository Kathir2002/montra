import Clipboard from '@react-native-clipboard/clipboard';
import {
  NavigationProp,
  ParamListBase,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {Avatar, Icon} from '@rneui/base';
import ContactService from '@services/contactSupportService';
import {appColors} from '@shared/appColors';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import CommonSearchBar from '@shared/components/CommonSearchBar/CommonSearchBar';
import CommonText from '@shared/components/commonText/CommonText';
import {Toast} from '@shared/ToastConfig';
import {getRelativeTime} from '@src/lib/functions';
import {RootState} from '@store/store';
import LottieView from 'lottie-react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';

export interface RequestTicketInterface {
  _id: string;
  request_id: string;
  subject: string;
  message: string;
  name: string;
  userImage?: string;
  phoneNumber: number;
  email: string;
  document: {
    fileName: string;
    fileUrl: string;
    fileFormat: string;
    fileSize: number;
  };
  status: 'New' | 'Progress' | 'Resolved';
  isActive: boolean;
  request_Date: Date;
  priority: 'High' | 'Low' | 'Medium';
  replies: {
    sender: string;
    role: 'Admin' | 'User';
    message: string;
    status?: 'sent' | 'read';
    createdAt: Date;
  }[];
}

const HelpRequest_List = () => {
  const {t} = useTranslation('finaceReport');
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [search, setSearch] = useState('');
  const isFirstRender = useRef(true);

  const [requestTickets, setRequestTickets] = useState<
    RequestTicketInterface[]
  >([]);
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);

  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isFocused = useIsFocused();

  const getRequsetList = async () => {
    await ContactService.getSupportList({
      searchText: search !== '' ? search : undefined,
      isAdmin: userDetails?.isAdmin,
    })
      .then((res: any) => {
        setIsLoading(false);
        setRefreshing(false);
        if (res?.success) {
          setRequestTickets(res?.rows);
        }
      })
      .catch(err => {
        setIsLoading(false);
        setRefreshing(false);
        Toast({message: err?.response?.data?.message, type: 'error'});
      });
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // Mark as rendered
      return; // Skip the first effect execution
    }
    if (search.trim().length > 0) {
      const searchDebounceFunction = setTimeout(() => {
        setIsLoading(true);
        getRequsetList();
      }, 1000);

      return () => clearTimeout(searchDebounceFunction);
    }
  }, [search]);

  useEffect(() => {
    if (isFocused) {
      setIsLoading(true);
      getRequsetList();
    }
  }, [isFocused]);

  const renderItem = ({
    item,
    index,
  }: {
    item: RequestTicketInterface;
    index: number;
  }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('HelpRequest_Details', {
            id: item?._id,
          });
        }}
        activeOpacity={0.7}
        style={{
          flex: 1,
          borderWidth: 1,
          borderRadius: 8,
          paddingVertical: 8,
          paddingHorizontal: 10,
          borderLeftWidth: 6,
          borderLeftColor:
            item?.priority === 'Low'
              ? appColors.priority.low
              : item.priority === 'Medium'
              ? appColors.priority.medium
              : item?.priority === 'High'
              ? appColors.priority.high
              : undefined,
          borderTopColor: appColors.borderColor,
          borderBottomColor: appColors.borderColor,
          borderRightColor: appColors.borderColor,
          marginBottom: 15,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            // gap: 15,
            flex: 1,
          }}>
          <View style={{flex: 0.15}}>
            <Avatar
              source={{uri: item?.userImage}}
              size={45}
              avatarStyle={{resizeMode: 'stretch'}}
              containerStyle={{
                backgroundColor: appColors.buttonClear,
                borderWidth: 0,
                borderColor: appColors.primary,
                alignSelf: 'center',
              }}
              rounded
            />
          </View>
          <View
            style={{
              gap: 3,
              flex: 0.5,
            }}>
            <CommonText
              color={appColors.placeholderColor}
              content={item?.name}
              size={'large'}
            />
            <CommonText
              content={item?.subject}
              color={appColors.dark}
              size={13}
            />
          </View>
          <View
            style={{
              alignItems: 'flex-end',
              gap: 5,
              justifyContent: 'flex-end',
              flex: 0.3,
            }}>
            <View
              style={{
                height: 12,
                width: 12,
                borderRadius: 10,
                backgroundColor:
                  item?.priority === 'Low'
                    ? appColors.priority.low
                    : item.priority === 'Medium'
                    ? appColors.priority.medium
                    : item?.priority === 'High'
                    ? appColors.priority.high
                    : undefined,
              }}
            />
            <CommonText
              size={'error'}
              color={appColors.greyColor}
              content={getRelativeTime(item?.request_Date)}
            />
          </View>
        </View>
        <View
          style={{
            width: '100%',
            height: 1,
            backgroundColor: '#e0e0e0',
            marginVertical: 8,
          }}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View
            style={{
              backgroundColor:
                item?.status === 'New'
                  ? appColors.status.new
                  : item.status === 'Progress'
                  ? appColors.status.progress
                  : appColors.status.resolved,
              paddingHorizontal: 5,
              paddingVertical: 3,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: appColors.formBorderColor,
              elevation: 1,
            }}>
            <CommonText
              size={'error'}
              content={
                item?.status === 'New'
                  ? t('NEW')
                  : item.status === 'Progress'
                  ? t('PROGRESS')
                  : t('RESOLVED')
              }
              color={
                item?.status === 'New'
                  ? appColors.light
                  : item.status === 'Progress'
                  ? appColors.dark
                  : appColors.light
              }
            />
          </View>
          {/* Verical Divider */}
          <View
            style={{
              height: '80%',
              width: 1,
              backgroundColor: '#e0e0e0',
              alignSelf: 'center',
            }}
          />
          <CommonText
            onPress={() => {
              Vibration.vibrate(100);
              Clipboard.setString(item?.request_id);
            }}
            size={'medium'}
            content={`#${item?.request_id}`}
          />
          {/* Verical Divider */}
          <View
            style={{
              height: '80%',
              width: 1,
              backgroundColor: '#e0e0e0',
              alignSelf: 'center',
            }}
          />
          <CommonText
            size={'medium'}
            bold
            color={
              item?.priority === 'Low'
                ? appColors.priority.low
                : item.priority === 'Medium'
                ? appColors.priority.medium
                : item?.priority === 'High'
                ? appColors.priority.high
                : undefined
            }
            content={
              item?.priority === 'Low'
                ? t('LOW')
                : item.priority === 'Medium'
                ? t('MEDIUM')
                : t('HIGH')
            }
          />
          {item?.replies?.length ? (
            <>
              <View
                style={{
                  height: '80%',
                  width: 1,
                  backgroundColor: '#e0e0e0',
                  alignSelf: 'center',
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                }}>
                <Icon
                  name="message-processing-outline"
                  type="material-community"
                  size={18}
                  color={appColors.placeholderColor}
                />
                <CommonText
                  content={String(item?.replies?.length)}
                  color={appColors.placeholderColor}
                />
              </View>
            </>
          ) : undefined}
        </View>
      </TouchableOpacity>
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    getRequsetList();
  };

  return (
    <KeyboardAvoidingView style={{flex: 1, backgroundColor: appColors.light}}>
      <View
        style={{
          backgroundColor: appColors.primary,
          paddingBottom: 35,
          borderBottomLeftRadius: 15,
          borderBottomRightRadius: 15,
        }}>
        <CommonHeader
          theme="dark"
          headerContainerStyle={{backgroundColor: appColors.primary}}
          title={t('SUPPORT_TICKETS')}
          leftIconPressBack={() => navigation.goBack()}
        />
        <StatusBar
          backgroundColor={
            isLoading ? appColors.transparentBackground : appColors.primary
          }
          barStyle={'light-content'}
        />
        <CommonText
          content={`${userDetails?.activeContactRequestCount} ${t(
            'ACTIVE_TICKETS',
          )}`}
          color={appColors.lightGrey}
          size={'large'}
          style={{marginHorizontal: 15}}
        />
      </View>
      <View style={{top: -20}}>
        <CommonSearchBar
          search={search}
          placeholder={`${t('SEARCH_TICKETS')}...`}
          setSearch={setSearch}
          searchContainerStyle={{
            marginHorizontal: 15,
            height: 50,
            backgroundColor: appColors.light,
            borderWidth: 1,
            borderColor: appColors.formBorderColor,
            borderRadius: 10,
            elevation: 2,
          }}
        />
      </View>

      <FlatList
        renderItem={renderItem}
        data={requestTickets}
        keyExtractor={(_, index) => index.toString()}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            onRefresh={onRefresh}
            colors={[appColors.primary]}
            refreshing={refreshing}
          />
        }
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <LottieView
              source={require('@assets/lottie/list-empty-lottie.json')}
              autoPlay
              loop
              style={{height: 200, width: 200}}
            />
            <CommonText
              style={{textAlign: 'center'}}
              content={t('NO_SUPPORT_TICKET_FOUNND')}
            />
          </View>
        }
        contentContainerStyle={{
          flex: requestTickets?.length === 0 ? 1 : 0,
          paddingBottom: 20,
          paddingHorizontal: 15,
          paddingTop: 15,
        }}
      />
      <Modal visible={isLoading} animationType="fade" transparent={true}>
        <CommonLoader />
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default HelpRequest_List;
