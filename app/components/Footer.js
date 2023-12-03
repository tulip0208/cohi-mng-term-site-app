/**
 * 共通_フッタ
 * 
 */
// app/components/Footer.js
import React, { useContext,useState,useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { styles } from '../styles/CommonStyle'; // 共通スタイル
import { getGlobalServerName } from '../utils/Realm';
import { useServerName } from '../hooks/useServerName';
const Footer = () => {
  const serverName = useServerName();

  useEffect(() => {
  }, []);

  return (
    <View style={styles.footerContainer}>
      <Text style={[styles.footerText, styles.serverNameText]}>
        {serverName}
      </Text>
      <Text style={[styles.footerText, styles.copyrightText]}>
        Copyright(C) JESCO All rights reserved.
      </Text>
    </View>
  );
};

export default Footer;
