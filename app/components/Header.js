// app/components/Header.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { styles } from '../styles/CommonStyle'; // 共通スタイル

const Header = () => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>
        端末登録
      </Text>
    </View>
  );
};

export default Header;
