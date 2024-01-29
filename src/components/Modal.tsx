/**-------------------------------------------
 * モーダル画面
 * components/Modal.tsx
 * ---------------------------------------------*/
import React from 'react';
import {Modal, View, Text, ActivityIndicator} from 'react-native';
import {styles} from '../styles/CommonStyle'; // 共通スタイル

interface Props {
  visible: boolean;
  message: string;
  onClose: () => void;
}
const ProcessingModal = ({visible, message, onClose}: Props) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
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
