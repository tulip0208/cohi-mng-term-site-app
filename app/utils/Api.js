// utils/api.js
import { getEncryptionKeyFromKeystore,saveToKeystore,clearKeyStore,loadFromKeystore } from '../utils/KeyStore'; 
import { getInstance } from '../utils/Realm'; // realm.jsから関数をインポート
import { Alert } from 'react-native';
import axios from 'axios';

/************************************************
 * サーバー通信を行う関数
 * @param {*} request 
 * @param {*} endpoint エンドポイント
 ************************************************/
export const sendToServer = async (requestData,endpoint) => {
  try {
    // 設定ファイルから接続先URLを取得
    const settings = await getSettings();
    const BASEURL = settings.connectionURL;
    const URI = BASEURL// + endpoint;//★エンドポイント使うかわからないので保留
    // Axiosリクエストの設定
    const config = {
      method: 'post',
      url: URI,
      data: JSON.stringify(requestData), // 通信を行うインターフェース内容
      timeout: 30000, // タイムアウト時間を30秒で指定
      validateStatus: function (status) {
        return status >= 100 && status <= 599; // 全てのHTTPステータスコードを例外としない
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
        // 'Content-Type': 'multipart/form-data' // ログファイル送信時
      }
    };

    // Axiosでサーバー通信を行う
    const response = await axios(config);

    // HTTPステータスコードが200以外の場合は異常処理
    if (response.status !== 200) {
      Alert.alert(
        "",messages.EA5004("端末登録",response.status),
        [{ text: "OK"}]//, onPress: closeModal }] // closeModalはQRScannerコンポーネントのprops
      );        
      console.error('Server returned status code ', response.status);
      throw new Error(`Server returned status code ${response.status}`);
    ////【応答データ】.【ステータスコード】＝"01:異常"　の場合//★不明なので保留
    // }else if(response.data === "01"){//??
    //   Alert.alert(
    //     "",messages.EA5005("端末登録",response.status),
    //     [{ text: "OK"}]//, onPress: closeModal }] // closeModalはQRScannerコンポーネントのprops
    //   );        
    //   console.error('Server returned status code ', response.status);
    //   throw new Error(`Server returned status code ${response.data}`);
    }
    return response.status;

  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      // タイムアウト処理
      Alert.alert(
        "",messages.EA5003(""),
        [{ text: "OK"}]//, onPress: closeModal }] // closeModalはQRScannerコンポーネントのprops
      );      
      console.error('Communication timed out', error);
      throw new Error(`Communication timed out ${error}`);
    } else {
      // その他の異常処理
      console.error('An error occurred during communication', error);
    }
  }
};

/************************************************
 * 設定ファイルの読み込み関数
 * @returns 
 ************************************************/
const getSettings = async () => {
  const realm = await getInstance()
  const settingsInfo = realm.objects('settings')[0]

  return {
    //connectionURL: settingsInfo.serverUrl,
    connectionURL: 'https://script.google.com/macros/s/AKfycbxzKXbU2sJt-Ias_dLJLZAZTkSasjcHfIw17-2dzUqm4uFIYS5yKBuRSE-5vG7rDyG0Xw/exec'//★スタブ
  };
};

