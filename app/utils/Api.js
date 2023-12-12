/**-------------------------------------------
 * 外部IF通信 (IFAXXXX)
 * 
 * ---------------------------------------------*/

// utils/api.js
import { getInstance } from '../utils/Realm'; // realm.jsから関数をインポート
import { Alert } from 'react-native';
import axios from 'axios';
import { checkActivation,loadFromKeystore,getEncryptionKeyFromKeystore } from '../utils/KeyStore'; // KeyStoreの確認関数
import {encryptWithAES256CBC,generateDeviceUniqueKey,decryptWithAES256CBC} from '../utils/Security';
import { initializeLogFile, logUserAction, logCommunication, watchPosition, logScreen } from '../utils/Log';
import { useAlert } from '../components/AlertContext';

/************************************************
 * IFA0010_アクティベーション(端末登録)
 ************************************************/
export const IFA0010 = async (encryptedKey,secretKey) => {
  try {
    // KeyStoreからアクティベーション情報を取得
    const activationInfo = await loadFromKeystore("activationInfo");

    const realm = await getInstance()
    // realmからユーザ情報を取得
    const userInfo = await realm.objects('user')[0]
    
    // realmから設定ファイル情報を取得
    const settingsInfo = await realm.objects('settings')[0]    
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
    const response = await sendToServer(requestData,"IFA0010","端末登録");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message , code:error.code , api:error.api};
  }
};

/************************************************
 * IFA0020_ログアップロード
 ************************************************/
export const IFA0020 = async (filePath) => {
  try {
    const secretKey = await getEncryptionKeyFromKeystore(); // AES暗号化のための秘密鍵
    const realm = await getInstance()
    // const userInfo = await realm.objects('user')[0]
    // let userId = null;//★ログインから遷移した際の通信にはナシ
    // if(userInfo){
    //   userId = userInfo.userId;
    // }
    const settingsInfo = await realm.objects('settings')[0]
    const comId = await loadFromKeystore("comId")
    const trmId = await loadFromKeystore("trmId")
    const apiKey = await loadFromKeystore("apiKey")
    const trmKey = await loadFromKeystore("trmKey")
    const requestData = {
      comId: comId.comId,
      //usrId: userId,
      trmId: trmId.trmId,
      apiKey: decryptWithAES256CBC(apiKey.apiKey,secretKey), // 復号化
      trmKey: decryptWithAES256CBC(trmKey.trmKey,secretKey), // 復号化
      appTyp: 1, 
      appVer: settingsInfo.appVer,
    };

    // サーバー通信処理（Api.js内の関数を呼び出し）
    const response = await sendFileToServer(requestData,"IFA0020","ログアップロード",filePath);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message , code:error.code , api:error.api};
  }
};

/************************************************
 * IFA0030_端末チェック
 ************************************************/
export const IFA0030 = async () => {
  try {
    const secretKey = await getEncryptionKeyFromKeystore(); // AES暗号化のための秘密鍵
    const realm = await getInstance()
    const userInfo = await realm.objects('user')[0]
    const settingsInfo = await realm.objects('settings')[0]
    const comId = await loadFromKeystore("comId")
    const trmId = await loadFromKeystore("trmId")
    const apiKey = await loadFromKeystore("apiKey")
    const trmKey = await loadFromKeystore("trmKey")
    const requestData = {
      comId: comId.comId,
      usrId: userInfo.userId,
      trmId: trmId.trmId,
      apiKey: decryptWithAES256CBC(apiKey.apiKey,secretKey), // 復号化
      trmKey: decryptWithAES256CBC(trmKey.trmKey,secretKey), // 復号化
      appTyp: 1, 
      appVer: settingsInfo.appVer,
      setdt: settingsInfo.settingFileDt
    };

    // サーバー通信処理（Api.js内の関数を呼び出し）
    const response = await sendToServer(requestData,"IFA0030","端末チェック");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message , code:error.code , api:error.api};
  }
};

/************************************************
 * IFA0040_端末設定ファイル配信
 ************************************************/
export const IFA0040 = async () => {
  try {
    const secretKey = await getEncryptionKeyFromKeystore(); // AES暗号化のための秘密鍵
    const realm = await getInstance()
    const userInfo = await realm.objects('user')[0]
    const settingsInfo = await realm.objects('settings')[0]
    const comId = await loadFromKeystore("comId")
    const trmId = await loadFromKeystore("trmId")
    const apiKey = await loadFromKeystore("apiKey")
    const trmKey = await loadFromKeystore("trmKey")
    const requestData = {
      comId: comId.comId,
      usrId: userInfo.userId,
      trmId: trmId.trmId,
      apiKey: decryptWithAES256CBC(apiKey.apiKey,secretKey), // 復号化
      trmKey: decryptWithAES256CBC(trmKey.trmKey,secretKey), // 復号化
      appTyp: 1, 
      appVer: settingsInfo.appVer,
      setdate: settingsInfo.settingFileDt
    };
    // サーバー通信処理（Api.js内の関数を呼び出し）
    const response = await sendToServer(requestData,"IFA0040","端末設定ファイル配信");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message , code:error.code , api:error.api};
  }
};

/************************************************
 * IFA0050_更新ファイル配信
 ************************************************/
export const IFA0050 = async () => {
  try {
    const secretKey = await getEncryptionKeyFromKeystore(); // AES暗号化のための秘密鍵
    const realm = await getInstance()
    const userInfo = await realm.objects('user')[0]
    const settingsInfo = await realm.objects('settings')[0]
    const comId = await loadFromKeystore("comId")
    const trmId = await loadFromKeystore("trmId")
    const apiKey = await loadFromKeystore("apiKey")
    const trmKey = await loadFromKeystore("trmKey")    
    const requestData = {
      comId: comId.comId,
      usrId: userInfo.userId,
      trmId: trmId.trmId,
      apiKey: decryptWithAES256CBC(apiKey.apiKey,secretKey), // 復号化
      trmKey: decryptWithAES256CBC(trmKey.trmKey,secretKey), // 復号化
      appTyp: 1, 
      appVer: settingsInfo.appVer,
    };
    // サーバー通信処理（Api.js内の関数を呼び出し）
    const response = await sendToServer(requestData,"IFA0050","更新ファイル配信");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message , code:error.code , api:error.api};
  }
};

/************************************************
 * IFA0051_バージョンアップ完了報告
 ************************************************/
export const IFA0051 = async () => {
  try {
    const secretKey = await getEncryptionKeyFromKeystore(); // AES暗号化のための秘密鍵
    const realm = await getInstance()
    const userInfo = await realm.objects('user')[0]
    const settingsInfo = await realm.objects('settings')[0]
    const comId = await loadFromKeystore("comId")
    const trmId = await loadFromKeystore("trmId")
    const apiKey = await loadFromKeystore("apiKey")
    const trmKey = await loadFromKeystore("trmKey")
    const requestData = {
      comId: comId.comId,
      usrId: userInfo.userId,
      trmId: trmId.trmId,
      apiKey: decryptWithAES256CBC(apiKey.apiKey,secretKey), // 復号化
      trmKey: decryptWithAES256CBC(trmKey.trmKey,secretKey), // 復号化
      appTyp: 1, 
      appVer: settingsInfo.appVer,
      setDt: settingsInfo.settingFileDt
    };
    // サーバー通信処理（Api.js内の関数を呼び出し）
    const response = await sendToServer(requestData,"IFA0051","バージョンアップ完了報告");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message , code:error.code , api:error.api};
  }
};

/************************************************
 * IFA0330_新タグ情報照会(除去土壌等) 
 ************************************************/
export const IFA0330 = async (txtNewTagId) => {
  try {
    const realm = await getInstance()
    const loginInfo = await realm.objects('login')[0]
    const requestData = {
      comId: loginInfo.comId,
      dtl: {oldTagId:txtNewTagId
        },
    };
    // サーバー通信処理（Api.js内の関数を呼び出し）
    const response = await sendToServer(requestData,"IFA0330","新タグ情報照会(除去土壌等)");
    if (response.data && response.data.sttCd && response.data.cnt == "0"){
      return { success: false, error: "zero" };
    }
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message , code:error.code , api:error.api};
  }
};

/************************************************
 * サーバー通信を行う関数
 * @param {*} request 
 * @param {*} endpoint エンドポイント
 * @param {*} msg インターフェース名
 ************************************************/
export const sendToServer = async (requestData,endpoint,msg) => {
  let URI = null;
  // 設定ファイルから接続先URLを取得
//  const settings = await getSettings();
  const settings = await getSettings(endpoint);//★スタブ用
  const BASEURL = settings.connectionURL;
  URI = BASEURL;

  // リクエスト送信前にログ記録
  await logCommunication('SEND', URI, null, JSON.stringify(requestData));

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
  let response = null;
  try{
    response = await axios(config);
  }   catch (error) {
    // エラー時にログ記録
    await logCommunication('ERROR', URI, null, error);
    if (error.code === 'ECONNABORTED') {
      // タイムアウト処理
      console.error('Communication timed out', error);
      throw new CustomError('timeout','',msg);
    } else {
      // その他の異常処理
      console.error('An error occurred during communication', error);
      throw new CustomError('error','',msg);
    }
  }
  // HTTPステータスコードが200以外の場合は異常処理
  if (response.status !== 200) {
    //const result = await showAlert("通知", messages.EA5004(msg,response.status), false);
    console.error('Server returned status code ', response.status);
    throw new CustomError('codeHttp200',response.status,msg);
  //【応答データ】.【ステータスコード】＝"01:異常"　の場合
  }else if(response.data && response.data.sttCd && response.data.sttCd == "01"){
    //const result = await showAlert("通知", messages.EA5005(msg,response.status), false);      
    console.error('Server returned status code ', response.status);
    throw new CustomError('codeRsps01',response.status,msg);
  }

  // 応答受信後にログ記録
  await logCommunication('RECV', URI, response.status, JSON.stringify(response.data));
  return response;
};

/************************************************
 * サーバー通信を行う関数(ファイル送信)
 * @param {*} request 
 * @param {*} endpoint エンドポイント
 * @param {*} msg インターフェース名
 ************************************************/
export const sendFileToServer = async (requestData,endpoint,msg,filePath) => {
  let URI = null;
  const formData = new FormData();
  formData.append('file', {
    uri: `file://${filePath}`,
    type: 'multipart/form-data',
    name: filePath.split('/').pop(),
  });
  // JSONデータをFormDataに追加
  for (const key in requestData) {
    formData.append(key, requestData[key]);
  }
  // 設定ファイルから接続先URLを取得
  const settings = await getSettings();
  const BASEURL = settings.connectionURL;
  URI = BASEURL;

  // リクエスト送信前にログ記録
  await logCommunication('SEND', URI, null, `${JSON.stringify(requestData)} filePath:${filePath}`);

    // Axiosリクエストの設定
  const config = {
    method: 'post',
    url: URI,
    data: formData, // 通信を行うインターフェース内容
    timeout: 30000, // タイムアウト時間を30秒で指定
    validateStatus: function (status) {
      return status >= 100 && status <= 599; // 全てのHTTPステータスコードを例外としない
    },
    headers: {
      'Content-Type': 'multipart/form-data' // ログファイル送信時
    }
  };

  // Axiosでサーバー通信を行う
  let response = null
  try {
    response = await axios(config);
  }catch(error){
    // エラー時にログ記録
    await logCommunication('ERROR', URI, null, error);
    if (error.code === 'ECONNABORTED') {
      // タイムアウト処理
      //const result = await showAlert("通知", messages.EA5003(""), false);
      console.error('Communication timed out', error);
      throw new CustomError('timeout','',msg);
    } else {
      // その他の異常処理
      console.error('An error occurred during communication', error);
      throw new Error(error);
    }
  }
  // HTTPステータスコードが200以外の場合は異常処理
  if (response.status !== 200) {
    //const result = await showAlert("通知", messages.EA5004(msg,response.status), false);      
    console.error('Server returned status code ', response.status);
    throw new CustomError('codeHttp200',response.status,msg);
  //【応答データ】.【ステータスコード】＝"01:異常"　の場合
  }else if(response.data && response.data.sttCd && response.data.sttCd == "01"){
    //const result = await showAlert("通知", messages.EA5005(msg,response.status), false);       
    console.error('Server returned status code ', response.status);
    throw new CustomError('codeRsps01',response.status,msg);
  }

  // 応答受信後にログ記録
  await logCommunication('RECV', URI, response.status, JSON.stringify(response.data));
  return response;

};


/************************************************
 * 設定ファイルの読み込み関数
 * @returns 
 ************************************************/
//const getSettings = async () => {
const getSettings = async (endpoint) => {//★スタブ用
  const realm = await getInstance()
  const settingsInfo = realm.objects('settings')[0]
  
  //★スタブここから
  if(endpoint==="IFA0330"){
    return {
      connectionURL: 'https://script.google.com/macros/s/AKfycbyUWY3kButqFcIJmLnWoCjq1PKApfD_K9qYZw5Pc5UNSKbOFzcFEDjqhWhPlawNp3PT/exec'
    }
  }else if(endpoint===""){
    return {
      connectionURL: 'https://script.google.com/macros/s/AKfycbyCG4ubbVKiFRzDwYvV89gcJqizu64vXgULcnrnPEH_SKcvRPyX1jOnnhHLRsrXWQUdcQ/exec'
    }
  }else{
    return {
      connectionURL: 'https://script.google.com/macros/s/AKfycbyCG4ubbVKiFRzDwYvV89gcJqizu64vXgULcnrnPEH_SKcvRPyX1jOnnhHLRsrXWQUdcQ/exec'
    }
  }
  //★スタブここまで

  // return {
  //   connectionURL: settingsInfo.serverUrl,
  // };
};

/************************************************
 * カスタムエラークラス
 * @returns 
 ************************************************/
class CustomError extends Error {
  constructor(message, code, api) {
    super(message);
    this.code = code;
    this.api = api;
  }
}
