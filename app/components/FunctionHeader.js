/**-------------------------------------------
 * 共通_機能・アプリ種別ヘッダ
 * 
 * ---------------------------------------------*/
// app/components/FunctionHeader.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { styles } from '../styles/CommonStyle'; // 共通スタイル

const FunctionHeader = ({appType,viewTitle,functionTitle}) => {
  return (
    <View style={styles.functionHeaderContainer}>
      <Text style={styles.functionHeaderLeft}>{appType}</Text>
      <Text style={styles.functionHeaderMiddle}>{viewTitle}</Text>
      <Text style={styles.functionHeaderRight}>{functionTitle}</Text>
    </View>
  );
};

export default FunctionHeader;
