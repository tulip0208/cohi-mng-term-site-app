// app/components/Footer.js
import React, { useContext,useState,useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { styles } from '../styles/CommonStyle'; // 共通スタイル
import { getGlobalServerName } from '../utils/Realm';

const Footer = () => {
  const [serverName, setServerName] = useState('');

  useEffect(() => {
    let isMounted = true;  // コンポーネントのマウント状態を追跡

    const fetchServerName = async () => {
      const name = await getGlobalServerName();
      
      if (isMounted) {
        setServerName(name);
      }
    };

    fetchServerName();
    return () => {
      isMounted = false;  // コンポーネントのアンマウント時に状態を更新しないようにする
    };
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
