import {appColors} from '@shared/appColors';
import CommonButton from '@shared/components/commonButton/CommonButton';
import CommonText from '@shared/components/commonText/CommonText';
import React, {useState} from 'react';
import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const LegalDocumentsModal = ({
  visible,
  onAccept,
  onDecline,
}: {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) => {
  const [activeTab, setActiveTab] = useState('terms');
  const [isChecked, setIsChecked] = useState(false);

  const renderTermsContent = () => (
    <View style={styles.contentContainer}>
      <CommonText
        style={styles.sectionTitle}
        bold
        size={'large'}
        content="Terms of Service"
      />
      <CommonText style={styles.sectionSubtitle} content="Key Highlights:" />
      <View style={styles.bulletContainer}>
        <CommonText
          size={'error'}
          style={styles.bulletPoint}
          content="• Responsible account management"
        />
        <CommonText
          size={'error'}
          style={styles.bulletPoint}
          content="• Protect login credentials"
        />
        <CommonText
          size={'error'}
          style={styles.bulletPoint}
          content="• Use Montra for legal financial tracking"
        />

        <CommonText
          size={'error'}
          style={styles.bulletPoint}
          content="• Understand data usage rights"
        />
      </View>
    </View>
  );

  const renderPrivacyContent = () => (
    <View style={styles.contentContainer}>
      <CommonText
        style={styles.sectionTitle}
        bold
        size={'large'}
        content="Privacy Policy"
      />
      <CommonText
        style={styles.sectionSubtitle}
        content="Data Protection Highlights:"
      />
      <View style={styles.bulletContainer}>
        <CommonText
          style={styles.bulletPoint}
          size={'error'}
          content="• Secure encryption of financial data"
        />

        <CommonText
          style={styles.bulletPoint}
          size={'error'}
          content="• No selling of personal information"
        />

        <CommonText
          style={styles.bulletPoint}
          size={'error'}
          content="• Transparent data collection"
        />
        <CommonText
          style={styles.bulletPoint}
          size={'error'}
          content="• Full user data control"
        />
      </View>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onDecline}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Tab Navigation */}
          <View style={styles.tabNavigation}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'terms' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('terms')}>
              <CommonText
                style={styles.tabText}
                bold
                content="Terms of Service"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'privacy' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('privacy')}>
              <CommonText
                style={styles.tabText}
                bold
                content="Privacy Policy"
              />
            </TouchableOpacity>
          </View>

          {/* Content Area */}
          <ScrollView style={styles.scrollView}>
            {activeTab === 'terms'
              ? renderTermsContent()
              : renderPrivacyContent()}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <CommonButton
              title="Decline"
              onPress={onDecline}
              buttonType="clear"
              buttonStyle={{paddingHorizontal: 40}}
            />
            <CommonButton
              title="Accept"
              onPress={onAccept}
              buttonStyle={{paddingHorizontal: 40}}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: appColors.transparentBackground,
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  tabNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  tabButton: {
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: appColors.primary,
  },
  tabText: {
    color: appColors.primary,
  },
  scrollView: {
    maxHeight: 300,
  },
  contentContainer: {
    padding: 10,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  sectionSubtitle: {
    marginBottom: 10,
  },
  bulletContainer: {
    paddingLeft: 10,
  },
  bulletPoint: {
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default LegalDocumentsModal;
