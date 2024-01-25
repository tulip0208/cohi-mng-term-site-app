/**-------------------------------------------
 * 共通_ヘッダ
 * components/Header.tsx
 * ---------------------------------------------*/
import React from 'react';
import {View, Text} from 'react-native';
import {styles} from '../styles/CommonStyle'; // 共通スタイル
interface Props {
  title: string;
}
const Header = ({title}: Props) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );
};

export default Header;
