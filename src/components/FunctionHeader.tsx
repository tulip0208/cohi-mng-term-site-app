/**-------------------------------------------
 * 共通_機能・アプリ種別ヘッダ
 * components/FunctionHeader.tsx
 * ---------------------------------------------*/
import React from 'react';
import {View, Text} from 'react-native';
import {styles} from '../styles/CommonStyle'; // 共通スタイル

interface Props {
  appType: string;
  viewTitle: string;
  functionTitle: string;
}
const FunctionHeader = ({appType, viewTitle, functionTitle}: Props) => {
  return (
    <View style={styles.functionHeaderContainer}>
      <Text style={styles.functionHeaderLeft}>{appType}</Text>
      <Text style={styles.functionHeaderMiddle}>{viewTitle}</Text>
      <Text style={styles.functionHeaderRight}>{functionTitle}</Text>
    </View>
  );
};

export default FunctionHeader;
