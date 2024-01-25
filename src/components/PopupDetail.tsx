/**-------------------------------------------
 * ポップアップ詳細画面
 * components/PopupDetail.tsx
 * ---------------------------------------------*/
import React, {ReactNode} from 'react';
import {View, ScrollView, Text, TouchableOpacity, Modal} from 'react-native';
import {styles} from '../styles/CommonStyle'; // 共通スタイル

// Propsの型をジェネリックとして定義
interface Props {
  isVisible: boolean;
  onClose: () => void;
  children: ReactNode; // 子要素
}
const PopupDetail = ({isVisible, onClose, children}: Props) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          <ScrollView
            showsVerticalScrollIndicator={true}
            style={styles.scrollViewStyle}>
            {children}
          </ScrollView>

          <TouchableOpacity
            style={[styles.button, styles.buttonSmall, styles.popupCloseButton]}
            onPress={onClose}>
            <Text style={styles.buttonText}>閉じる</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PopupDetail;
