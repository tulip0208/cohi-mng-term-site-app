/**-------------------------------------------
 * 共通_ヘッダ
 * 
 * ---------------------------------------------*/
// app/components/Header.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { styles } from '../styles/CommonStyle'; // 共通スタイル

const Header = ({title}) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>
        {title}
      </Text>
    </View>
  );
};

export default Header;
