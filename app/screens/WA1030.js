// app/screens/WA1030.js
import Header from '../components/Header'; // Headerコンポーネントのインポート
import Footer from '../components/Footer'; // Footerコンポーネントのインポート
import { styles } from '../styles/CommonStyle'; // 共通スタイル
import { View } from 'react-native';
import React, { useState, useEffect } from 'react';
const WA1030 = ({ }) => {

  return (
    <View style={styles.container}>
      {/* ヘッダ */}
      <Header title={"ログイン"}/>
      
      {/* フッタ */}
      <Footer />       
    </View>

  );
    
};
export default WA1030;