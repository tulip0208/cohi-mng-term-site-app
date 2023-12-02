// utils/security.js
import * as Crypto from 'expo-crypto';
import { Buffer } from 'buffer';
import CryptoJS from 'react-native-crypto-js';
import DeviceInfo from 'react-native-device-info';

 /***********************************************
 * ランダムなバイト列を生成する関数
 * @returns 
 ************************************************/
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

 /***********************************************
 * atob関数の実装
 * @param {*} input 
 * @returns 
 ************************************************/
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

 /************************************************
 * Base64 文字列をバイナリ文字列に変換する関数
 * @param {*} base64 
 * @returns 
 ************************************************/
const base64ToBinaryString = (base64) => {
  const raw = atob(base64);
  const rawLength = raw.length;
  let array = new Uint8Array(new ArrayBuffer(rawLength));

  for(let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }

  return array;
}

 /************************************************
 * Base64 文字列をバイナリ文字列に変換し、その後 Uint8Array に変換
 * @param {*} base64 
 * @returns 
 ************************************************/
export const base64ToUint8Array = (base64) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

 /************************************************
 * Uint8Array を Base64 文字列に変換する関数
 * @param {*} buffer 
 * @returns 
 ************************************************/
export const uint8ArrayToBase64 = (buffer) => {
  return Buffer.from(buffer).toString('base64');
};

 /************************************************
 * AES256CBC暗号化関数
 * @param {*} data 
 * @param {*} secretKey 
 * @returns 
 ************************************************/
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

 /************************************************
 * AES256CBC復号化関数
 * @param {*} ciphertext 
 * @param {*} secretKey 
 * @returns 
 ************************************************/
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

 /************************************************
 * デバイスIDと現在の日時からユニークなキーを生成し、SHA256でハッシュ化する関数
 * @returns 
 ************************************************/
export const generateDeviceUniqueKey = async () => {
  const deviceId = await DeviceInfo.getUniqueId(); // デバイスIDの取得
  console.log('deviceID : ',deviceId )
  const currentDateTime = new Date().toISOString().replace(/[^0-9]/g, "").slice(0,14); // YYYYMMDDhhmmss形式
  console.log('currentDateTime : ',currentDateTime )
  const combinedString = `${deviceId}${currentDateTime}`;
  //const hashedKey = CryptoJS.SHA256(combinedString).toString(); // SHA256でハッシュ化
  const hashedKey = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256,combinedString);
  console.log('sha256(deviceID + sysDate) : ',hashedKey )
  return hashedKey;
};