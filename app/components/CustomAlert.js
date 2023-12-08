import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { styles } from '../styles/CommonStyle'; // 共通スタイル

// Alertを表示するためのHook
const CustomAlert = () => {
  const [alertProps, setAlertProps] = useState({
    visible: false,
    title: '',
    message: '',
    showCancelButton: true
  });
  const [resolveReject, setResolveReject] = useState([]);
  const [resolve, reject] = resolveReject;

  // アラートを表示する関数
  const showAlert = (title, message, showCancelButton) => {
    console.log(alertProps.showCancelButton)
    return new Promise((resolve, reject) => {

      setAlertProps({ visible: true, title, message, showCancelButton });
      setResolveReject([resolve, reject]);
    });
  };

  // 確認ボタンを押したときの処理
  const handleConfirm = () => {
    setAlertProps({ ...alertProps, visible: false });
    resolve(true);
  };

  // キャンセルボタンを押したときの処理
  const handleCancel = () => {
    setAlertProps({ ...alertProps, visible: false });
    resolve(false);
  };

  // カスタムアラートのコンポーネント
  const CustomAlertComponent = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={alertProps.visible}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalBackground}>
        <View style={styles.alertView}>
          <View style={styles.alertTitleBar}>
            <Text style={styles.alertTitle}>{alertProps.title}</Text>
          </View>
          <Text style={styles.alertMessage}>{alertProps.message}</Text>
          <View style={styles.alertButtonContainer}>
            {alertProps.showCancelButton && (
            <TouchableOpacity
              style={[styles.alertButton, styles.alertButtonCancel]}
              onPress={handleCancel}
            >
            
              <Text style={styles.alertTextCancel}>いいえ</Text>
            </TouchableOpacity>)}
            <TouchableOpacity
              style={[styles.alertButton, styles.alertButtonConfirm]}
              onPress={handleConfirm}
            >
              <Text style={styles.alertTextConfirm}>はい</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    
    </Modal>
  );

  return { showAlert, CustomAlertComponent };
};

export default CustomAlert;
