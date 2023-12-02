// Modal.js
import React from 'react';
import { Modal, View, Text, ActivityIndicator } from 'react-native';
import { styles } from '../styles/CommonStyle'; // 共通スタイル
const ProcessingModal = ({ visible, message, onClose }) => {
  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.modalMessage}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

export default ProcessingModal;
