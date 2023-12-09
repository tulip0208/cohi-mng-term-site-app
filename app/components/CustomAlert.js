/**-------------------------------------------
 * 共通_カスタム通知・確認アラート
 * 
 * ---------------------------------------------*/
// app/components/CustomAlert.js
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { styles } from '../styles/CommonStyle'; // 共通スタイル

const CustomAlert = ({ title, message, onConfirm, onCancel, showCancelButton }) => {
  return(  
    <Modal
      animationType="fade"
      transparent={true}
      visible={true}
    >
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
              onPress={onCancel}
            >
            
              <Text style={styles.alertTextCancel}>いいえ</Text>
            </TouchableOpacity>)}
            <TouchableOpacity
              style={[styles.alertButton, styles.alertButtonConfirm]}
              onPress={onConfirm}
            >
              <Text style={styles.alertTextConfirm}>はい</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    
    </Modal>
  );
};

export default CustomAlert;
