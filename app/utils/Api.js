/**
 * 外部IF通信 (IFAXXXX)
 * 
 */

// utils/api.js
import { getInstance } from '../utils/Realm'; // realm.jsから関数をインポート
import { Alert } from 'react-native';
import axios from 'axios';
import { checkActivation,loadFromKeystore,getEncryptionKeyFromKeystore } from '../utils/KeyStore'; // KeyStoreの確認関数
import {encryptWithAES256CBC,generateDeviceUniqueKey,decryptWithAES256CBC} from '../utils/Security';

/************************************************
 * IFA0010_アクティベーション
 ************************************************/
export const IFA0010 = async (encryptedKey,secretKey) => {
  try {
    // KeyStoreからアクティベーション情報を取得
    const activationInfo = await loadFromKeystore("activationInfo");
    const realm = await getInstance()
    // realmからユーザ情報を取得
    const userInfo = realm.objects('user')[0]
    // realmから設定ファイル情報を取得
    const settingsInfo = realm.objects('settings')[0]    
    // サーバー通信用のデータを準備
    const requestData = {
      comId: userInfo.comId,
      usrId: userInfo.usrId,
      trmId: activationInfo.trmId,
      apiKey: decryptWithAES256CBC(activationInfo.apiKey,secretKey), // 復号化
      actKey: activationInfo.actKey,
      trmKey: decryptWithAES256CBC(encryptedKey,secretKey), // 復号化
      appTyp: 1, 
      appVer: settingsInfo.appVer
    };
    // サーバー通信処理（Api.js内の関数を呼び出し）
    const responseCode = await sendToServer(requestData,"IFA0010","端末登録");
    return responseCode;
  }catch(error){
    throw new Error(`${error}`);
  }
};

/************************************************
 * IFA0030_端末チェック
 ************************************************/
export const IFA0030 = async () => {
  try {
    const secretKey = await getEncryptionKeyFromKeystore(); // AES暗号化のための秘密鍵
    const realm = await getInstance()
    const userInfo = realm.objects('user')[0]
    const settingsInfo = realm.objects('settings')[0]
    const requestData = {
      comId: await loadFromKeystore("comId"),
      usrId: userInfo.usrId,
      trmId: await loadFromKeystore("trmId"),
      apiKey: decryptWithAES256CBC(await loadFromKeystore("apiKey"),secretKey), // 復号化
      trmKey: decryptWithAES256CBC(await loadFromKeystore("trmKey"),secretKey), // 復号化
      appTyp: 1, 
      appVer: settingsInfo.appVer,
      setDt: settingsInfo.settingFileDt
    };
    // サーバー通信処理（Api.js内の関数を呼び出し）
    const responseCode = await sendToServer(requestData,"IFA0030","端末チェック");
    return responseCode;
  }catch(error){
    throw new Error(`${error}`);
  }
};

/************************************************
 * IFA0050_更新ファイル配信
 ************************************************/
export const IFA0050 = async () => {
  try {
    const secretKey = await getEncryptionKeyFromKeystore(); // AES暗号化のための秘密鍵
    const realm = await getInstance()
    const userInfo = realm.objects('user')[0]
    const settingsInfo = realm.objects('settings')[0]
    const requestData = {
      comId: await loadFromKeystore("comId"),
      usrId: userInfo.usrId,
      trmId: await loadFromKeystore("trmId"),
      apiKey: decryptWithAES256CBC(await loadFromKeystore("apiKey"),secretKey), // 復号化
      trmKey: decryptWithAES256CBC(await loadFromKeystore("trmKey"),secretKey), // 復号化
      appTyp: 1, 
      appVer: settingsInfo.appVer,
    };
    // サーバー通信処理（Api.js内の関数を呼び出し）
    const responseCode = await sendToServer(requestData,"IFA0050","更新ファイル配信");
    return responseCode;
  }catch(error){
    throw new Error(`${error}`);
  }
};

/************************************************
 * IFA0051_バージョンアップ完了報告
 ************************************************/
export const IFA0051 = async () => {
  try {
    const secretKey = await getEncryptionKeyFromKeystore(); // AES暗号化のための秘密鍵
    const realm = await getInstance()
    const userInfo = realm.objects('user')[0]
    const settingsInfo = realm.objects('settings')[0]
    const requestData = {
      comId: await loadFromKeystore("comId"),
      usrId: userInfo.usrId,
      trmId: await loadFromKeystore("trmId"),
      apiKey: decryptWithAES256CBC(await loadFromKeystore("apiKey"),secretKey), // 復号化
      trmKey: decryptWithAES256CBC(await loadFromKeystore("trmKey"),secretKey), // 復号化
      appTyp: 1, 
      appVer: settingsInfo.appVer,
      setDt: settingsInfo.settingFileDt
    };
    // サーバー通信処理（Api.js内の関数を呼び出し）
    const responseCode = await sendToServer(requestData,"IFA0051","バージョンアップ完了報告");
    return responseCode;
  }catch(error){
    throw new Error(`${error}`);
  }
};

/************************************************
 * サーバー通信を行う関数
 * @param {*} request 
 * @param {*} endpoint エンドポイント
 * @param {*} msg インターフェース名
 ************************************************/
export const sendToServer = async (requestData,endpoint,msg) => {
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
        "",messages.EA5004(msg,response.status),
        [{ text: "OK"}]//, onPress: closeModal }] // closeModalはQRScannerコンポーネントのprops
      );        
      console.error('Server returned status code ', response.status);
      throw new Error(`Server returned status code ${response.status}`);
    //【応答データ】.【ステータスコード】＝"01:異常"　の場合
    }else if(response.data && response.data.sttCd && response.data == "01"){
      Alert.alert(
        "",messages.EA5005(msg,response.status),
        [{ text: "OK"}]//, onPress: closeModal }] // closeModalはQRScannerコンポーネントのprops
      );        
      console.error('Server returned status code ', response.status);
      throw new Error(`Server returned status code ${response.data}`);
    }
    console.log(msg, " done")
    return response;

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
      throw new Error(`An error occurred during communication ${error}`);
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
    connectionURL: 'https://script.google.com/macros/s/AKfycbyCG4ubbVKiFRzDwYvV89gcJqizu64vXgULcnrnPEH_SKcvRPyX1jOnnhHLRsrXWQUdcQ/exec'//★スタブ
  };
};

