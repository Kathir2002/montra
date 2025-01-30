import {
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import ReactNativeBlobUtil, {
  FS,
  ReactNativeBlobUtilConfig,
} from 'react-native-blob-util';
import {appColors} from '@shared/appColors';
import CommonHeader from '@shared/components/commonHeader/CommonHeader';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import CommonText from '@shared/components/commonText/CommonText';
import CommonDropDown from '@shared/components/commonDropdown/CommonDropDown';
import CommonButton from '@shared/components/commonButton/CommonButton';
import UploadIcon from '@assets/svg/upload.svg';
import ExportImage from '@assets/svg/illustration.svg';
import {Toast} from '@shared/ToastConfig';
import {config} from '../../../environment';
import CommonDataService from '@shared/commonDataServices';
import TransactionService from '@services/transactionService';
import CommonLoader from '@shared/components/commonLoader/CommonLoader';
import {useTranslation} from 'react-i18next';

interface PayloadData {
  transactionType: string;
  fileFormat: string;
  dateRange: string;
}

const ExportData = () => {
  const {t} = useTranslation('profile');
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const [dataToExportOpen, setdataToExportOpen] = useState(false);
  const [formatOpen, setFormatOpen] = useState(false);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [dataToExportValue, setdataToExportValue] = useState('All');
  const [dateRangeValue, setDateRangeValue] = useState('30days');
  const [formatValue, setFormatValue] = useState('CSV');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const dropdownData = {
    dataDropdown: [
      {label: t('EXPORT_DATA_LABEL.TYPE.ALL'), value: 'All'},
      {label: t('EXPORT_DATA_LABEL.TYPE.EXPENSE'), value: 'Expense'},
      {label: t('EXPORT_DATA_LABEL.TYPE.INCOME'), value: 'Income'},
    ],
    dateRangeDropdownData: [
      {label: t('EXPORT_DATA_LABEL.DATE_RANGE.30dAYS'), value: '30days'},
      {label: t('EXPORT_DATA_LABEL.DATE_RANGE.60DAYS'), value: '60days'},
      {label: t('EXPORT_DATA_LABEL.DATE_RANGE.6MONTHS'), value: '6months'},
      {label: t('EXPORT_DATA_LABEL.DATE_RANGE.1YEAR'), value: '1year'},
      {label: t('EXPORT_DATA_LABEL.DATE_RANGE.LIFETIME'), value: 'lifeTime'},
    ],
    formatDropdownData: [
      {label: 'CSV', value: 'CSV'},
      {label: 'Excel', value: 'Excel'},
    ],
  };

  const generateMimeType = (fileName: string) => {
    switch (fileName.split('.')[1].toLocaleLowerCase()) {
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'csv':
        return 'text/csv';
    }
  };
  let isFetching = false;

  const exportTransactionData = async () => {
    dropdownCloseHandler();
    setLoading(true);
    if (isFetching) return;
    isFetching = true;

    const data = {
      transactionType: dataToExportValue,
      fileFormat: formatValue,
      dateRange: dateRangeValue,
    };
    await TransactionService.exportData({...data, isChecking: true})
      .then(async (res: any) => {
        if (res?.success) {
          // Directories for different platforms
          const {fs}: {fs: FS} = ReactNativeBlobUtil;
          const downloadDir = Platform.select({
            ios: fs.dirs.DocumentDir,
            android: fs.dirs.LegacyDownloadDir,
          });
          const filename = `transactions_${new Date().getTime()}.${
            formatValue === 'CSV' ? 'csv' : 'xlsx'
          }`;

          // Full path for the file
          const filePath = `${downloadDir}/${filename}`;

          // Download configuration
          const configOptions: ReactNativeBlobUtilConfig = {
            fileCache: true,
            path: filePath,
            addAndroidDownloads: {
              notification: true,
              useDownloadManager: true,
              mediaScannable: true,
              path: filePath,
              description: t('DOWNLOAD_FILE'),
              mime: generateMimeType(filename),
            },
            timeout: 20000,
          };
          const token = await CommonDataService.getToken();
          const queryString = Object.keys(data)
            .map(
              (key: string) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(
                  data[key as keyof PayloadData],
                )}`,
            )
            .join('&');
          await ReactNativeBlobUtil.config(configOptions)
            .fetch(
              'GET',
              `${config.apiUrldb}api/transaction/export-transction?${queryString}`,
              {
                'Content-Type': 'application/json',
                Accept:
                  formatValue === 'CSV'
                    ? 'text/csv'
                    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                Authorization: `Bearer ${token}`,
                'Access-Control-Allow-Origin': '*',
              },
            )
            .then(async res => {
              setLoading(false);
              setModalVisible(true);
              Toast({
                message: t('FILE_DOWNLOAD_SUCCESS'),
                type: 'success',
              });
              if (Platform.OS === 'android') {
                await ReactNativeBlobUtil.android.actionViewIntent(
                  filePath,
                  generateMimeType(filename)!,
                );
              }
              // Handle iOS
              else if (Platform.OS === 'ios') {
                if (filePath.startsWith('file://')) {
                  await Linking.openURL(filePath);
                } else {
                  await Linking.openURL(`file://${filePath}`);
                }
              }
            })
            .catch(err => {
              setLoading(false);
              Toast({
                message: t('SOMETHING_WENT_WRONG'),
                type: 'error',
              });
              console.log('Error in downloading file:', err?.message);
            });
        } else {
          setLoading(false);
          Toast({message: res?.message, type: 'error'});
        }
      })
      .catch(err => {
        setLoading(false);
        console.log('Error in exporting data:', err?.response?.data?.message);

        Toast({message: err?.response?.data?.message, type: 'error'});
      })
      .finally(() => {
        setLoading(false);
        isFetching = false;
      });
  };
  const dropdownCloseHandler = () => {
    setdataToExportOpen(false);
    setDateRangeOpen(false);
    setFormatOpen(false);
  };
  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: appColors.light}}
      onStartShouldSetResponder={() => {
        dropdownCloseHandler();
        return false;
      }}>
      <CommonHeader
        title={t('EXPORT_DATA')}
        leftIcon
        leftIconPressBack={() => navigation.goBack()}
      />
      <StatusBar
        backgroundColor={
          loading ? appColors?.transparentBackground : appColors.light
        }
        barStyle={loading ? 'light-content' : 'dark-content'}
      />
      <View style={{flex: 1, paddingHorizontal: 15}}>
        <View>
          <CommonText content={t('WHAT_WANT_TO_EXPORT')} size={'label'} />
          <CommonDropDown
            onPress={() => {
              setFormatOpen(false);
              setDateRangeOpen(false);
            }}
            items={dropdownData.dataDropdown}
            value={dataToExportValue}
            setValue={setdataToExportValue}
            onSelectItem={() => {}}
            open={dataToExportOpen}
            setOpen={setdataToExportOpen}
          />
        </View>
        <View>
          <CommonText content={t('DATE_RANGE')} size={'label'} />
          <CommonDropDown
            onPress={() => {
              setFormatOpen(false);
              setdataToExportOpen(false);
            }}
            items={dropdownData.dateRangeDropdownData}
            value={dateRangeValue}
            setValue={setDateRangeValue}
            onSelectItem={() => {}}
            open={dateRangeOpen}
            setOpen={setDateRangeOpen}
          />
        </View>
        <View>
          <CommonText content={t('FILE_FORMAT')} size={'label'} />
          <CommonDropDown
            onPress={() => {
              setdataToExportOpen(false);
              setDateRangeOpen(false);
            }}
            items={dropdownData.formatDropdownData}
            value={formatValue}
            setValue={setFormatValue}
            onSelectItem={() => {}}
            open={formatOpen}
            setOpen={setFormatOpen}
          />
        </View>
        <View
          style={{
            position: 'absolute',
            bottom: 30,
            left: 15,
            width: '100%',
          }}>
          <TouchableOpacity
            onPress={() => {
              exportTransactionData();
            }}
            activeOpacity={0.5}
            style={{
              backgroundColor: appColors.primary,
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              paddingVertical: 13,
            }}>
            <UploadIcon height={25} width={25} />
            <CommonText
              style={{
                color: appColors.light,
                textAlign: 'center',
              }}
              content={t('EXPORT')}
            />
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: appColors.light,
            alignItems: 'center',
            justifyContent: 'space-around',
            paddingHorizontal: 15,
          }}>
          <StatusBar
            backgroundColor={appColors.light}
            barStyle={'dark-content'}
          />
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flex: 0.8,
              gap: 10,
            }}>
            <ExportImage height={250} width={250} />
            <CommonText
              style={{
                flexWrap: 'wrap',
                textAlign: 'center',
              }}
              content={t('CHECK_EMAIL')}
            />
          </View>
          <View
            style={{
              flex: 0.2,
              justifyContent: 'center',
            }}>
            <CommonButton
              titleStyle={{
                width: '100%',
              }}
              onPress={() => {
                navigation.navigate('BottomTab', {screen: 'Dashboard'});
              }}
              title={t('BACK_TO_HOME')}
            />
          </View>
        </View>
      </Modal>
      <Modal visible={loading} animationType="fade" transparent={true}>
        <CommonLoader />
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ExportData;
