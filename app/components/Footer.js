// app/components/Footer.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { styles } from '../styles/CommonStyle'; // 共通スタイル

const Footer = () => {
  return (
    <View style={styles.footerContainer}>
      <Text style={styles.footerText}>
        Copyright(C) JESCO All rights reserved.
      </Text>
    </View>
  );
};

export default Footer;
