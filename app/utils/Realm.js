// utils/Realm.js
import React, { useState } from 'react';
import Realm from 'realm';
import { settingsSchema,loginSchema,userSchema } from './Schemas'; // 仮のスキーマファイル
import { generateEncryptionKey, getEncryptionKeyFromKeystore, storeEncryptionKeyInKeystore } from './Security'; // 仮のセキュリティ関数
import RNFS from 'react-native-fs';
const realmPath = `${RNFS.DocumentDirectoryPath}/app.realm`;

// 設定データが含まれるJSONファイルのパスを指定します
const bundledSettingsPath = require('../../assets/data/settings.json'); // アプリのバンドルに含まれるJSONファイルへのパス

let encryptionKey = null;// 暗号化キーをグローバルで保持
let realm = null; //realmインスタンス
let settings = null; //設定ファイル
let globalServerName = ''; // グローバル変数としてserverNameを定義
let realmConfig = null;
// アプリ起動時のRealmの設定を行う関数
const setupRealm = async () => {
  try {
    // keyStoreからkeyを取得する
    encryptionKey=await getEncryptionKeyFromKeystore();
    // 初回起動時の処理
    if (!encryptionKey) {
      console.log('setupRealm firstTime');
      encryptionKey = await generateEncryptionKey();
      await storeEncryptionKeyInKeystore(encryptionKey);
    }
    //console.log('key length:', encryptionKey.length , '  key: ',encryptionKey);

    // Realmの初期設定
    realmConfig = {
      path: realmPath,//'/data/app.realm',//パーミッションエラーとなる
      schema: [settingsSchema,loginSchema,userSchema],
      encryptionKey: encryptionKey
    };
    // Realmインスタンスを開く
    realm = await Realm.open(realmConfig);

    //設定ファイルが0件の場合
    settings = realm.objects('settings'); // 'settings'はスキーマ名
    // 設定データがまだ存在しない場合は挿入する
    if (settings.length === 0) {
      console.log('setupRealm settings');
      const bundledSettings = bundledSettingsPath; // requireによってインポートされた設定データ

      realm.write(() => {
        realm.create('settings', {
          id: 1, // プライマリーキーとしてのID
          ...bundledSettings, // スプレッド構文で他のフィールドを展開
        });
      });
    }
    globalServerName = settings[0].serverName; // serverNameをグローバル変数に保存

  } catch (error) {
    console.error('Error setting up Realm:', error);
  } finally {
    // // データベースを閉じる
    // if (realm) {
    //   realm.close();
    // }
  }
  
};

// アプリ起動時に実行される関数
const onAppLaunch = async () => {
  // realm初期設定
  await setupRealm();

};

// インスタンス取得関数
export const getInstance = async () => {
  if (!realm) {
    realm = await Realm.open({
      realmConfig
    });
  }
  return realm;
};

// Realm データベースファイルを削除する関数
const deleteRealmFile = async () => {
  const realmPath = `${RNFS.DocumentDirectoryPath}/app.realm`;

  try {
    // ファイルが存在するか確認
    const fileExists = await RNFS.exists(realmPath);
    if (fileExists) {
      // ファイルが存在する場合、削除
      await RNFS.unlink(realmPath);
      console.log('Realm database file deleted successfully.');
    } else {
      console.log('Realm database file does not exist.');
    }
  } catch (error) {
    console.error('Error deleting Realm database file:', error);
  }
};

export default {
  getInstance,
  encryptionKey,
  settings,
};

export { onAppLaunch };
export const getGlobalServerName = async () => globalServerName; // グローバル変数からserverNameを取得する関数