/**-------------------------------------------
 * 共通_カスタム通知・確認アラート
 * components/CustomAlert.tsx
 * ---------------------------------------------*/
import React from 'react';
import {Modal, View, Text, TouchableOpacity} from 'react-native';
import {styles} from '../styles/CommonStyle'; // 共通スタイル

interface Props {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  showCancelButton: boolean;
}

const CustomAlert = ({
  title,
  message,
  onConfirm,
  onCancel,
  showCancelButton,
}: Props) => {
  return (
    <Modal animationType="fade" transparent={true} visible={true}>
      <View style={styles.modalBackground}>
        <View style={styles.alertView}>
          <View style={styles.alertTitleBar}>
            <Text style={styles.alertTitle}>{title}</Text>
          </View>
          <Text style={styles.alertMessage}>{message}</Text>
          <View style={styles.alertButtonContainer}>
            {showCancelButton && (
              <TouchableOpacity
                style={[styles.alertButton, styles.alertButtonCancel]}
                onPress={onCancel}>
                <Text style={styles.alertTextCancel}>いいえ</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.alertButton, styles.alertButtonConfirm]}
              onPress={onConfirm}>
              <Text style={styles.alertTextConfirm}>はい</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;
