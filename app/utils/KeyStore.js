// utils/keyStore.js
import * as Keychain from 'react-native-keychain';
import {base64ToUint8Array,uint8ArrayToBase64} from './Security'

/************************************************
 * encriptionKey保存 (Realmファイル暗号化)：Int8Array(64)のサイズで生成したRealmファイル暗号化キー
 * @param {*} key 
 ************************************************/
export const storeEncryptionKeyInKeystore = async (key) => {
  try {
    // Convert the key to a string to store it
    const keyString = uint8ArrayToBase64(key);
    await Keychain.setGenericPassword('encryptionKey', keyString, {
      service: 'ims.encryption',
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
      accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
    });
    console.log('Key stored successfully!');
  } catch (error) {
    console.error('Error storing the encryption key', error);
    throw error;
  }
};

/************************************************
 * encriptionKey取得 (Realmファイル暗号化)：Int8Array(64)のサイズで生成したRealmファイル暗号化キー
 * @returns 
 ************************************************/
export const getEncryptionKeyFromKeystore = async () => {

  try {
    const credentials = await Keychain.getGenericPassword({
      service: 'ims.encryption'
    });
    if (credentials) {
      binary =credentials.password.split(",");
      const binaryString = base64ToUint8Array(credentials.password);
      return binaryString;
    } else {
      throw 'No key found';
    }
  } catch (error) {
    console.error('Error retrieving the encryption key', error);
    return null;
//    throw error;
  }
};

/************************************************
 * KeyStoreのキーを指定してクリア
 * @param {*} key 
 ************************************************/
export const clearKeyStore = async (key) => {
  try {
    await Keychain.resetGenericPassword({ service: key });
    console.log("Key value cleared successfully.");
  } catch (error) {
    console.error("Error clearing key value: ", error);
  }
};

/************************************************
 * keyStoreにデータを保存
 * @param {*} key 
 * @param {*} data 
 ************************************************/
export const saveToKeystore = async (key, data) => {
  try {
    // オブジェクトを文字列に変換し、Base64エンコードを行う
    const base64Data = Buffer.from(JSON.stringify(data)).toString('base64');    
    await Keychain.setGenericPassword(key, base64Data,{service: key});
    console.log('Data saved successfully! key : ',key);
  } catch (error) {
    console.error('Error saving data', error);
  }
};

/************************************************
 * keyStoreからデータを取得
 * @param {*} key 
 * @returns 
 ************************************************/
export const loadFromKeystore = async (key) => {
  try {
    const credentials = await Keychain.getGenericPassword({service: key});
    if (credentials && credentials.username === key) {
      // Base64デコードを行い、文字列をオブジェクトに変換する
      const data = JSON.parse(Buffer.from(credentials.password, 'base64').toString('utf8'));
      console.log('Data loaded successfully! key :',key);
      return data;
    } else {
      console.log('No data found');
      return null;
    }
  } catch (error) {
    console.error('Error loading data', error);
  }
};

/************************************************
 * WA1020前処理（アクティベーション有無チェック）
 * @returns 
 ************************************************/
export const checkActivation = async () => {
  try {
    // KeyStoreからアクティベーション情報を取得
    const credentials = await Keychain.getGenericPassword({
      service: 'activationInfo'
    });
    if (credentials) {
      // Base64デコードを行い、文字列をオブジェクトに変換する
      const data = JSON.parse(Buffer.from(credentials.password, 'base64').toString('utf8'));      
      // アクティベーション有無のチェック
      return data
    }
  } catch (error) {
    console.error('Activation check failed', error);
  }
  ret = null;
  // アクティベーション情報が存在しない、または無効である場合
  return ret;
};