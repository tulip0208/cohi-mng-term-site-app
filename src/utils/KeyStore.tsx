/**-------------------------------------------
 * DB(keyStore)設定・取得操作
 * utils/keyStore.tsx
 * ---------------------------------------------*/
import * as Keychain from 'react-native-keychain';
import {base64ToUint8Array, uint8ArrayToBase64} from './Security';
import {ActivationInfo} from '../types/type';

/************************************************
 * encriptionKey保存 (Realmファイル暗号化)：Int8Array(64)のサイズで生成したRealmファイル暗号化キー
 * @param {*} key
 ************************************************/
export const storeEncryptionKeyInKeystore = async (
  key: Uint8Array,
): Promise<void> => {
  try {
    // Convert the key to a string to store it
    const keyString = uint8ArrayToBase64(key);
    await Keychain.setGenericPassword('encryptionKey', keyString, {
      service: 'cms_site.encryption',
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
      accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
    });
    console.log('Key stored successfully!');
  } catch (error) {
    console.log('Error storing the encryption key', error);
    throw error;
  }
};

/************************************************
 * encriptionKey取得 (Realmファイル暗号化)：Int8Array(64)のサイズで生成したRealmファイル暗号化キー
 * @returns
 ************************************************/
export const getEncryptionKeyFromKeystore = async (): Promise<Uint8Array> => {
  const credentials = await Keychain.getGenericPassword({
    service: 'cms_site.encryption',
  });
  if (credentials) {
    const binaryString = base64ToUint8Array(credentials.password);
    return binaryString;
  } else {
    console.log('Error retrieving the encryption key No key found');
    return new Uint8Array();
  }
};

/************************************************
 * KeyStoreのキーを指定してクリア
 * @param {*} key
 ************************************************/
export const clearKeyStore = async (key: string): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({service: key});
    console.log('Key value cleared successfully. key:', key);
  } catch (error) {
    console.log('Error clearing key value: ', error);
  }
};

/************************************************
 * keyStoreにデータを保存
 * @param {*} key
 * @param {*} data
 ************************************************/
export const saveToKeystore = async <T,>(
  key: string,
  data: T,
): Promise<void> => {
  try {
    // オブジェクトを文字列に変換し、Base64エンコードを行う
    const base64Data = Buffer.from(JSON.stringify(data)).toString('base64');
    await Keychain.setGenericPassword(key, base64Data, {service: key});
    console.log('Data saved successfully! key : ', key);
  } catch (error) {
    console.log('Error saving data', error);
  }
};

/************************************************
 * keyStoreからデータを取得
 * @param {*} key
 * @returns
 ************************************************/
export const loadFromKeystore = async <T,>(key: string): Promise<T | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({service: key});
    if (credentials && credentials.username === key) {
      // Base64デコードを行い、文字列をオブジェクトに変換する
      const data = JSON.parse(
        Buffer.from(credentials.password, 'base64').toString('utf8'),
      );
      console.log('Data loaded successfully! key :', key);
      return data;
    } else {
      console.log('No data found key:', key);
    }
  } catch (error) {
    console.log('Error loading data', error);
  }
  return null;
};

/************************************************
 * WA1020前処理（アクティベーション有無チェック）
 * @returns
 ************************************************/
export const checkActivation = async (): Promise<ActivationInfo | null> => {
  try {
    // KeyStoreからアクティベーション情報を取得
    const credentials = await Keychain.getGenericPassword({
      service: 'activationInfo',
    });
    if (credentials) {
      // Base64デコードを行い、文字列をオブジェクトに変換する
      const data = JSON.parse(
        Buffer.from(credentials.password, 'base64').toString('utf8'),
      );
      // アクティベーション有無のチェック
      return data;
    }
  } catch (error) {
    console.log('Activation check failed', error);
  }
  return null;
};
