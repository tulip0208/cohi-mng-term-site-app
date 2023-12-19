/**-------------------------------------------
 * 外部IF通信 (IFAXXXX)
 * utils/api.tsx
 * ---------------------------------------------*/
import { getInstance } from './Realm'; // realm.jsから関数をインポート
import axios,{ AxiosError }  from 'axios';
import { loadFromKeystore,getEncryptionKeyFromKeystore } from './KeyStore'; // KeyStoreの確認関数
import { decryptWithAES256CBC,encodeStringToBase64Binary} from './Security';
import { logCommunication} from './Log';
import { AxiosResponse,ApiResponse,IFA0030Response,IFA0330Response, ActivationInfo, Settings, ComId, TrmId, ApiKey, TrmKey, User, Login } from '../types/type';
import { Buffer } from 'buffer';
/************************************************
 * IFA0010_アクティベーション(端末登録)
 ************************************************/
export const IFA0010 = async (encryptedKey:string,secretKey:Uint8Array) : Promise<ApiResponse<null>> => {
  try {
    // KeyStoreからアクティベーション情報を取得
    const activationInfo = await loadFromKeystore("activationInfo") as ActivationInfo;
  
    const realm = getInstance()
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
    const res = await sendToServer(requestData,"IFA0010","端末登録");
    return { success: true, data: null };
  } catch (error) {
    const e = error as CustomError;
    return { success: false, error: e.message, status:e.status, code:e.code, api:e.api};
  }
};

/************************************************
 * IFA0020_ログアップロード
 ************************************************/
export const IFA0020 = async (filePath:string) : Promise<ApiResponse<null>> => {
  try {
    const secretKey = await getEncryptionKeyFromKeystore(); // AES暗号化のための秘密鍵
    const realm = getInstance()
    const settingsInfo = realm.objects('settings')[0];
    const comId = await loadFromKeystore("comId") as ComId
    const trmId = await loadFromKeystore("trmId") as TrmId
    const apiKey = await loadFromKeystore("apiKey") as ApiKey
    const trmKey = await loadFromKeystore("trmKey") as TrmKey
    const requestData = {
      comId: comId.comId,
      trmId: trmId.trmId,
      apiKey: decryptWithAES256CBC(apiKey.apiKey,secretKey), // 復号化
      trmKey: decryptWithAES256CBC(trmKey.trmKey,secretKey), // 復号化
      appTyp: 1, 
      appVer: settingsInfo.appVer,
    };

    // サーバー通信処理（Api.js内の関数を呼び出し）
    const res = await sendFileToServer(requestData,"IFA0020","ログアップロード",filePath);
    return { success: true, data: null };
  } catch (error) {
    const e = error as CustomError;
    return { success: false, error: e.message, status:e.status, code:e.code, api:e.api};
  }
};

/************************************************
 * IFA0030_端末チェック
 ************************************************/
export const IFA0030 = async () : Promise<ApiResponse<IFA0030Response>> => {
  try {
    const secretKey = await getEncryptionKeyFromKeystore(); // AES暗号化のための秘密鍵
    const realm = getInstance()
    const userInfo = realm.objects('user')[0]
    const settingsInfo = await realm.objects('settings')[0]
    const comId = await loadFromKeystore("comId") as ComId
    const trmId = await loadFromKeystore("trmId") as TrmId
    const apiKey = await loadFromKeystore("apiKey") as ApiKey
    const trmKey = await loadFromKeystore("trmKey") as TrmKey
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
    const res = await sendToServer(requestData,"IFA0030","端末チェック");
    const response = res as AxiosResponse<IFA0030Response>;
    return { success: true, data: response.data };
  } catch (error) {
    const e = error as CustomError;
    return { success: false, error: e.message, status:e.status, code:e.code, api:e.api};
  }
};

/************************************************
 * IFA0040_端末設定ファイル配信
 ************************************************/
export const IFA0040 = async () : Promise<ApiResponse<ArrayBuffer>> => {
  try {
    const secretKey = await getEncryptionKeyFromKeystore(); // AES暗号化のための秘密鍵
    const realm = getInstance()
    const userInfo = realm.objects('user')[0]
    const settingsInfo = realm.objects('settings')[0] 
    const comId = await loadFromKeystore("comId") as ComId
    const trmId = await loadFromKeystore("trmId") as TrmId
    const apiKey = await loadFromKeystore("apiKey") as ApiKey
    const trmKey = await loadFromKeystore("trmKey") as TrmKey
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
    const res = await sendToServer(requestData,"IFA0040","端末設定ファイル配信");
    const response = res.data as ArrayBuffer;
    return { success: true, data: response};
  } catch (error) {
    const e = error as CustomError;
    return { success: false, error: e.message, status:e.status, code:e.code, api:e.api};
  }
};

/************************************************
 * IFA0050_更新ファイル配信
 ************************************************/
export const IFA0050 = async () : Promise<ApiResponse<ArrayBuffer>> => {
  try {
    const secretKey = await getEncryptionKeyFromKeystore(); // AES暗号化のための秘密鍵
    const realm = getInstance()
    const userInfo = realm.objects('user')[0]
    const settingsInfo = realm.objects('settings')[0] 
    const comId = await loadFromKeystore("comId") as ComId
    const trmId = await loadFromKeystore("trmId") as TrmId
    const apiKey = await loadFromKeystore("apiKey") as ApiKey
    const trmKey = await loadFromKeystore("trmKey") as TrmKey   
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
    const res = await sendToServer(requestData,"IFA0050","更新ファイル配信");
    const response = res.data as ArrayBuffer;
    return { success: true, data: response};
  } catch (error) {
    const e = error as CustomError;
    return { success: false, error: e.message, status:e.status, code:e.code, api:e.api};
  }
};

/************************************************
 * IFA0051_バージョンアップ完了報告
 ************************************************/
export const IFA0051 = async () : Promise<ApiResponse<null>> => {
  try {
    const secretKey = await getEncryptionKeyFromKeystore(); // AES暗号化のための秘密鍵
    const realm = getInstance()
    const userInfo = realm.objects('user')[0]
    const settingsInfo = realm.objects('settings')[0] 
    const comId = await loadFromKeystore("comId") as ComId
    const trmId = await loadFromKeystore("trmId") as TrmId
    const apiKey = await loadFromKeystore("apiKey") as ApiKey
    const trmKey = await loadFromKeystore("trmKey") as TrmKey
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
    const res = await sendToServer(requestData,"IFA0051","バージョンアップ完了報告");
    return { success: true, data: null};
  } catch (error) {
    const e = error as CustomError;
    return { success: false, error: e.message, status:e.status, code:e.code, api:e.api};
  }
};

/************************************************
 * IFA0110_業務データ
 ************************************************/
const setIFA0110RequestData = async <T,>(interFaceName:string,dataDtl:T) => {
  const secretKey = await getEncryptionKeyFromKeystore(); // AES暗号化のための秘密鍵
  const realm = getInstance()
  const userInfo = realm.objects('user')[0]
  const settingsInfo = realm.objects('settings')[0] 
  const locationInfo = realm.objects('location')[0] 
  // const comId = await loadFromKeystore("comId") as ComId
  const trmId = await loadFromKeystore("trmId") as TrmId
  const apiKey = await loadFromKeystore("apiKey") as ApiKey
  const trmKey = await loadFromKeystore("trmKey") as TrmKey  
  const requestData = {
    comId: userInfo.comId,
    usrId: userInfo.userId,
    trmId: trmId.trmId,
    apiKey: decryptWithAES256CBC(apiKey.apiKey,secretKey), // 復号化
    trmKey: decryptWithAES256CBC(trmKey.trmKey,secretKey), // 復号化
    appTyp: 1, 
    appVer: settingsInfo.appVer,
    vclLat: locationInfo.latitude,
    vclLon: locationInfo.longitude,
    ifNo:interFaceName,
    gymDt:dataDtl,
  }
  return requestData;
}

/************************************************
 * IFA0330_新タグ情報照会(除去土壌等) 
 ************************************************/
export const IFA0330 = async (txtNewTagId:string) : Promise<ApiResponse<IFA0330Response>> => {
  try {
    const realm = getInstance()
    const loginInfo = realm.objects('login')[0]
    const requestDataDtl = {
      comId: loginInfo.comId,
      dtl: {newTagId:txtNewTagId
        },
    };

    const requestData = await setIFA0110RequestData("IFA0330",requestDataDtl);

    // サーバー通信処理（Api.js内の関数を呼び出し）
    const res = await sendToServer(requestData,"IFA0330","新タグ情報照会(除去土壌等)");    
    const response = res as AxiosResponse<IFA0330Response>;

    if (response.data && response.data.sttCd && response.data.cnt == 0){
      //0件の場合
      return { success: false, error: "zero", status:null, code:null, api:null, data:null};
    }
    return { success: true, data: response.data };
  } catch (error) {
    const e = error as CustomError;
    return { success: false, error: e.message, status:e.status, code:e.code, api:e.api};
  }
};
import RNFS from 'react-native-fs';
const filePath = RNFS.DocumentDirectoryPath + '/file.ext'; // ファイルパス

/************************************************
 * サーバー通信を行う関数
 * @param {*} requestData 
 * @param {*} endpoint エンドポイント
 * @param {*} msg インターフェース名
 ************************************************/
export const sendToServer = async <TRequest, TResponse>(requestData:TRequest,endpoint:string,msg:string):Promise<AxiosResponse<TResponse>> => {
  let URI = null;
  // 設定ファイルから接続先URLを取得
//  const settings = await getSettings();
  const settings = await getSettings(endpoint);//★スタブ用
  const BASEURL = settings.connectionURL;
  URI = BASEURL;

  // リクエスト送信前にログ記録
  await logCommunication('SEND', URI, null, endpoint + " : " + JSON.stringify(requestData));

  // Axiosリクエストの設定
  const config = {
    method: 'post',
    url: URI,
    data: JSON.stringify(requestData), // 通信を行うインターフェース内容
    timeout: 30000, // タイムアウト時間を30秒で指定
    validateStatus: function (status:number) {
      return status >= 100 && status <= 599; // 全てのHTTPステータスコードを例外としない
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  // Axiosでサーバー通信を行う
  let response = null;
  try{
    response = await axios(config);
    if(endpoint == "IFA0040"||endpoint == "IFA0050"){
      // TextEncoderを使用してテキストをUint8Arrayにエンコード
      // Bufferを使用してテキストをバイナリデータに変換
      const jsonString = `{"id":1,"appVer":"1.0.0","settingFileDt":"2024/01/0100:00:00","serverName":"開発","serverUrl":"https://api.myservice.com","logTerm":30,"logCapacity":10000,"locGetTerm":60,"camTimeout":30,"btnNewTagSoil":1,"btnRefNewTagSoil":1,"btnRefOldTagSoil":1,"btnNewTagAsh":1,"btnRefNewTagAsh":1,"btnRefOldTagAsg":1,"btnTrnCard":1,"btnUnload":1,"btnStat":1,"reasonListOldTag":"updated,deprecated","useMethodInnerBag":2,"packTyp":3,"kgThresSoil":500,"kgThresAsh":1000,"radioThres":30,"ldpRadioThres":10,"ldpRadioThresMax":100,"estRadioThres":20,"radioConvFact":15,"facArriveTerm":120,"selPlants":2,"thresPlants":50,"selCombust":3,"thresCombust":75,"selSoil":4,"thresSoil":100,"selConcrete":5,"thresConcrete":125,"selAsphalt":6,"thresAsphalt":150,"selNoncombustMix":7,"thresNoncombustMix":175,"selAsbestos":8,"thresAsbestos":200,"selPlasterboard":9,"thresPlasterboard":225,"selHazard":10,"thresHazard":250,"selOutCombust":11,"thresOutCombust":275,"selOutNoncombust":12,"thresOutNoncombust":300,"selTmpCombust":13,"thresTmpCombust":325,"selTmpNoncombust":14,"thresTmpCNoncombust":350,"selAsh":15,"thresAsh":375}`;
      const bufferData = Buffer.from(jsonString);

      // 新しい ArrayBuffer を作成
      const arrayBufferData = new ArrayBuffer(bufferData.length);
      
      // 新しい Uint8Array を作成し、BufferData の内容をコピー
      const view = new Uint8Array(arrayBufferData);
      for (let i = 0; i < bufferData.length; ++i) {
          view[i] = bufferData[i];
      }
      response.data = view.buffer;
    }
  }catch(e){
    const error = e as AxiosError
    const errorMessage = error.response ? `Status: ${error.response.status}, Body: ${JSON.stringify(error.response.data)}` : error.message;
    // エラー時にログ記録
    await logCommunication('ERROR', URI, null, errorMessage);
    if (error.code === 'ECONNABORTED') {
      // タイムアウト処理
      console.error('Communication timed out', error);
      throw new CustomError('timeout',null,null,msg);
    } else {
      // その他の異常処理
      console.error('An error occurred during communication', error);
      throw new CustomError('error',null,null,msg);
    }
  }
  // HTTPステータスコードが200以外の場合は異常処理
  if (response.status !== 200) {
    console.error('Server returned status code ', response.status);
    throw new CustomError('codeHttp200',response.status,null,msg);
  //【応答データ】.【ステータスコード】＝"01:異常"　の場合
  }else if(response.data && response.data.sttCd && response.data.sttCd == "01"){
    console.error('Server returned status code ', response.status);
    throw new CustomError('codeRsps01',response.status,response.data.sttCd,msg);
  }

  // 応答受信後にログ記録
  await logCommunication('RECV', URI, response.status, endpoint + " : "  + JSON.stringify(response.data));
  return response;
};

/************************************************
 * サーバー通信を行う関数(ファイル送信)
 * @param {*} requestData
 * @param {*} endpoint エンドポイント
 * @param {*} msg インターフェース名
 * @param {*} filePath ファイルパス
 ************************************************/
export const sendFileToServer = async <TRequest, TResponse>(requestData:TRequest,endpoint:string,msg:string,filePath:string):Promise<AxiosResponse<TResponse>> => {
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
  // const settings = await getSettings();
  const settings = await getSettings(endpoint);//★スタブ用
  const BASEURL = settings.connectionURL;
  URI = BASEURL;

  // リクエスト送信前にログ記録
  await logCommunication('SEND', URI, null, endpoint + " : "  + `${JSON.stringify(requestData)} filePath:${filePath}`);

    // Axiosリクエストの設定
  const config = {
    method: 'post',
    url: URI,
    data: formData, // 通信を行うインターフェース内容
    timeout: 30000, // タイムアウト時間を30秒で指定
    validateStatus: function (status:number) {
      return status >= 100 && status <= 599; // 全てのHTTPステータスコードを例外としない
    },
    headers: {
      'Content-Type': 'multipart/form-data' // ログファイル送信時
      //React Nativeのネットワーキングは、適切なContent-Typeヘッダーとバウンダリを自動的に扱うことができるため
      //multipart/form-dataを扱う際には、バウンダリを設定せずで問題無し
    }
  };

  // Axiosでサーバー通信を行う
  let response = null
  try {
    response = await axios(config);
  }catch(e){
    const error = e as AxiosError
    const errorMessage = error.response ? `Status: ${error.response.status}, Body: ${JSON.stringify(error.response.data)}` : error.message;
    // エラー時にログ記録
    await logCommunication('ERROR', URI, null, errorMessage);
    if (error.code === 'ECONNABORTED') {
      // タイムアウト処理
      console.error('Communication timed out', errorMessage);
      throw new CustomError('timeout',null,null,msg);
    } else {
      // その他の異常処理
      console.error('An error occurred during communication', errorMessage);
      throw new CustomError('error',null,null,msg);
    }
  }
  // HTTPステータスコードが200以外の場合は異常処理
  if (response.status !== 200) {
    console.error('Server returned status code ', response.status);
    throw new CustomError('codeHttp200',response.status,null,msg);
  //【応答データ】.【ステータスコード】＝"01:異常"　の場合
  }else if(response.data && response.data.sttCd && response.data.sttCd == "01"){
    console.error('Server returned status code ', response.status);
    throw new CustomError('codeRsps01',response.status,response.data.sttCd,msg);
  }

  // 応答受信後にログ記録
  await logCommunication('RECV', URI, response.status, endpoint + " : "  + JSON.stringify(response.data));
  return response;

};


/************************************************
 * 設定ファイルの読み込み関数
 * @returns 
 ************************************************/
//const getSettings = async () => {
const getSettings = async (endpoint:string) => {//★スタブ用
  const realm = getInstance()
  const settingsInfo = realm.objects('settings')[0]
  
  //★スタブここから
  if(endpoint=='IFA0330'){
    return {
      connectionURL: 'https://script.google.com/macros/s/AKfycbxiP1DblU3h75dtf_PU8gSgUpocasWJ4rBxiUUmlMY3M3evePMG-HINhxV10-1GW7FP/exec'
    }
  }else if(endpoint == 'IFA0040' || endpoint == 'IF0050'){
    return {
      connectionURL: 'https://script.google.com/macros/s/AKfycbwepLJEO6HV2Hn1-ykRyFCLze5bSfp5gDnsNiL54bdbe7vIHR07ivOuF6d6FlKwoVn6/exec'
    }
  }else if(endpoint=='IFA0030'){//1,1
    return {
      // connectionURL: 'https://script.google.com/macros/s/AKfycbzpdPH8AHwRAWPGXJieNecal8OeGVO4AHtGeKZr31gz_edledxDk35ZZ4yNyXQeqEwg_w/exec'
      connectionURL: 'https://script.google.com/macros/s/AKfycbwFul0A7PHmend-smjoO5y8Rahugea53bdH9-nKasEX4tferFnHq4GDtm4jzRxFJZNELw/exec'
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
  status: number | null;
  code: string | null;
  api: string;
  constructor(message: string, status: number | null, code: string | null, api: string) {
    super(message);
    this.status = status
    this.code = code;
    this.api = api;
  }
}