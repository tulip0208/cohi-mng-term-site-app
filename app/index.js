// index.js
import AppNavigator from './navigation/AppNavigator';
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Realm, { encryptionKey } from './utils/Realm'; // Realmの設定をインポート
import axios from 'axios';

const App = () => {

  useEffect(() => {
    const initializeRealm = async () => {
      try {
        const realmInstance = await Realm.getInstance();
        // 初回起動時の処理
        if (realmInstance.empty) {
          // 設定ファイルをRealmに保存するロジック
        }
        // 暗号化キーをKeyStoreに保存するロジック（Android KeyStoreなどを使用）
      } catch (error) {
        console.error('Error initializing Realm', error);
      }
    };

    initializeRealm();
  }, []);
  
  return (
    <AppNavigator />
  );
}

export default App;
