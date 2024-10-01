import {
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
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

const ExportData = () => {
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const [dataToExportOpen, setdataToExportOpen] = useState(false);
  const [formatOpen, setFormatOpen] = useState(false);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [dataToExportValue, setdataToExportValue] = useState('All');
  const [dateRangeValue, setDateRangeValue] = useState('30days');
  const [formatValue, setFormatValue] = useState('CSV');
  const [modalVisible, setModalVisible] = useState(false);
  const dropdownData = {
    dataDropdown: [
      {label: 'All', value: 'All'},
      {label: 'Expense', value: 'Expense'},
      {label: 'Income', value: 'Income'},
    ],
    dateRangeDropdownData: [
      {label: 'Last 30 days', value: '30days'},
      {label: 'Last 60 days', value: '60days'},
      {label: 'Last 6 months', value: '6months'},
      {label: 'Last 1 year', value: '1year'},
      {label: 'Lifetime', value: 'lifeTime'},
    ],
    formatDropdownData: [
      {label: 'CSV', value: 'CSV'},
      {label: 'Excel', value: 'Excel'},
    ],
  };

  return (
    <KeyboardAvoidingView style={{flex: 1, backgroundColor: appColors.light}}>
      <CommonHeader
        title="Export Data"
        leftIcon
        leftIconPressBack={() => navigation.goBack()}
      />
      <View style={{flex: 1, paddingHorizontal: 15}}>
        <View>
          <CommonText
            content="What data do your want to export?"
            size={'label'}
          />
          <CommonDropDown
            items={dropdownData.dataDropdown}
            value={dataToExportValue}
            setValue={setdataToExportValue}
            onSelectItem={() => {}}
            open={dataToExportOpen}
            setOpen={setdataToExportOpen}
          />
        </View>
        <View>
          <CommonText content="When date range?" size={'label'} />
          <CommonDropDown
            items={dropdownData.dateRangeDropdownData}
            value={dateRangeValue}
            setValue={setDateRangeValue}
            onSelectItem={() => {}}
            open={dateRangeOpen}
            setOpen={setDateRangeOpen}
          />
        </View>
        <View>
          <CommonText
            content="What format do you want to export??"
            size={'label'}
          />
          <CommonDropDown
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
              setModalVisible(true);
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
              content="Export"
            />
          </TouchableOpacity>
        </View>
      </View>
      <Modal visible={modalVisible}>
        <View
          style={{
            flex: 1,
            backgroundColor: appColors.light,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 15,
          }}>
          <ExportImage height={250} width={250} />
          <CommonText content="Check your email, we send you the financial report. In certain cases, it might take a little longer, depending on the time period and the volume of activity." />
          <CommonButton
            titleStyle={{
              width: '100%',
            }}
            onPress={() =>
              navigation.navigate('BottomTab', {screen: 'Dashboard'})
            }
            title="Back to Home"
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ExportData;

const styles = StyleSheet.create({});
