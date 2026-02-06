// CustomModal.tsx - A modal component that integrates with the NetworkBanner system
import { NetworkBannerUI, setModalOpen } from '@services/NetworkBannerManager';
import React, { useEffect } from 'react';
import { Modal, ModalProps, View, StyleSheet } from 'react-native';

interface CustomModalProps extends ModalProps {
  children: React.ReactNode;
}

export const CustomModal = ({ children, visible, ...rest }: CustomModalProps) => {

  // Notify the banner system when modal opens/closes
  useEffect(() => {
    if (visible) {
      setModalOpen(true);
    } else {
      setModalOpen(false);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      navigationBarTranslucent={true}
      statusBarTranslucent={true}
      supportedOrientations={["landscape", "landscape-left", "landscape-right", "portrait"]}
      presentationStyle='overFullScreen'
      {...rest}
    >
      {/* Container must have flex: 1 and position relative for banner to appear on top */}
      <View style={styles.container}>
        {/* Network banner - will render on top due to absolute positioning */}
        <NetworkBannerUI isInModal={true} />

        {/* Modal content */}
        {children}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative', // Ensure children can position absolutely
  },
});