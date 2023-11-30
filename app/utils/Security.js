// utils/security.js
import * as Keychain from 'react-native-keychain';
import * as Crypto from 'expo-crypto';
import { Buffer } from 'buffer';
import CryptoJS from 'react-native-crypto-js';

// ランダムなバイト列を生成する関数
export const generateEncryptionKey = async () => {
    try {
      const byteString = await Crypto.getRandomBytesAsync(64);
      const key = new Uint8Array(byteString);
      return key;
    } catch (error) {
      console.error('Error generating random bytes:', error);
      return null;
    }
  };

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

//keyStoreからキー取得
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

// KeyStoreのキーを指定して、そのキー値をクリアするメソッド
export const clearKeyStore = async (key) => {
  try {
    await Keychain.resetGenericPassword({ service: key });
    console.log("Key value cleared successfully.");
  } catch (error) {
    console.error("Error clearing key value: ", error);
  }
};

export const saveToKeystore = async (key, data) => {
  try {
    await Keychain.setGenericPassword(key, data);
    console.log('Data saved successfully!');
  } catch (error) {
    console.error('Error saving data', error);
  }
};

export const loadFromKeystore = async (key) => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials && credentials.username === key) {
      console.log('Data loaded successfully!');
      return credentials.password;
    } else {
      console.log('No data found');
      return null;
    }
  } catch (error) {
    console.error('Error loading data', error);
  }
};

// atob関数を実装する（グローバルスコープで定義するか、別のファイルでexportして使用する）
const atob = (input) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = input.replace(/=+$/, '');
  let output = '';

  if (str.length % 4 == 1) {
    throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
    buffer = chars.indexOf(buffer);
  }

  return output;
};

// Base64 文字列をバイナリ文字列に変換する関数
const base64ToBinaryString = (base64) => {
  const raw = atob(base64);
  const rawLength = raw.length;
  let array = new Uint8Array(new ArrayBuffer(rawLength));

  for(let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }

  return array;
}

// Base64 文字列をバイナリ文字列に変換し、その後 Uint8Array に変換
export const base64ToUint8Array = (base64) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Uint8Array を Base64 文字列に変換する関数
const uint8ArrayToBase64 = (buffer) => {
  return Buffer.from(buffer).toString('base64');
};


// 暗号化関数
export const encryptWithAES256CBC = (data, secretKey) => {
  const key = CryptoJS.enc.Utf8.parse(secretKey);
  const iv = CryptoJS.lib.WordArray.random(16); // 16バイトのIVをランダムに生成

  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  // IVを結果に追加して、それをBase64でエンコードする
  const encryptedDataWithIv = iv.toString() + encrypted.toString();
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encryptedDataWithIv));
};

// 復号化関数
export const decryptWithAES256CBC = (ciphertext, secretKey) => {
  const key = CryptoJS.enc.Utf8.parse(secretKey);

  // Base64デコードとIVの分離
  const ciphertextBytesWithIv = CryptoJS.enc.Base64.parse(ciphertext);
  const iv = CryptoJS.lib.WordArray.create(ciphertextBytesWithIv.words.slice(0, 4)); // 先頭4ワード(16バイト)がIV
  const ciphertextBytes = CryptoJS.lib.WordArray.create(ciphertextBytesWithIv.words.slice(4)); // それ以降が暗号文

  // 暗号文を復号化
  const decrypted = CryptoJS.AES.decrypt({ ciphertext: ciphertextBytes }, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
};
