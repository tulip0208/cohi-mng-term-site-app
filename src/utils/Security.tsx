/**-------------------------------------------
 * 各種キー設定・取得
 * utils/Security.tsx
 * ---------------------------------------------*/
import {Buffer} from 'buffer';
import {sha256} from 'react-native-sha256';
import CryptoJS from 'react-native-crypto-js';
import DeviceInfo from 'react-native-device-info';
import base64, {encode} from 'react-native-base64';

/***********************************************
 * ランダムなバイト列を生成する関数
 * @returns
 ************************************************/
export const generateEncryptionKey = (): Uint8Array => {
  const array = new Uint8Array(64);
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
};

/***********************************************
 * atob関数の実装(BASE64コード)
 * @param {*} input
 * @returns
 ************************************************/
export const atob = (input: string): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = input.replace(/[=]+$/, '');
  let output = '';

  if (str.length % 4 === 1) {
    throw new Error(
      "'atob' failed: The string to be decoded is not correctly encoded.",
    );
  }

  let bs = 0; // ここで bs を初期化
  for (
    let bc = 0, buffer, idx = 0;
    (buffer = str.charAt(idx++));
    // eslint-disable-next-line no-bitwise
    ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
      ? // eslint-disable-next-line no-bitwise
        (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = chars.indexOf(buffer);
  }

  return output;
};

/***********************************************
 * BASE64デコード
 * @param {*} input
 * @returns
 ************************************************/
export const decodeBase64 = (input: ArrayBuffer): string => {
  var binary = '';
  var bytes = new Uint8Array(input);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return encode(binary);
};

/************************************************
 * Base64 文字列をバイナリ文字列に変換する関数
 * @param {*} base64
 * @returns
 ************************************************/
// const base64ToBinaryString = (base64: string): Uint8Array => {
//   const raw = atob(base64);
//   const rawLength = raw.length;
//   let array = new Uint8Array(new ArrayBuffer(rawLength));

//   for (let i = 0; i < rawLength; i++) {
//     array[i] = raw.charCodeAt(i);
//   }

//   return array;
// };

/************************************************
 * 文字列をBASE64エンコードしてバイナリ文字列に変換する関数(Uint8Array)
 * @param {*} inputString
 * @returns
 ************************************************/
export const encodeToBase64AndReturnAsBinary = (
  inputString: string,
): Uint8Array => {
  const encodedString = base64.encode(inputString);
  const binaryData = new Uint8Array(encodedString.length);
  for (let i = 0; i < encodedString.length; i++) {
    binaryData[i] = encodedString.charCodeAt(i);
  }
  return binaryData;
};

/************************************************
 * 文字列をBASE64エンコードしてバイナリ文字列に変換する関数(ArrayBuffer)
 * @param {*} inputString
 * @returns
 ************************************************/
export const encodeStringToBase64Binary = (
  inputString: string,
): ArrayBuffer => {
  // 文字列をBase64エンコード
  const encodedString = base64.encode(inputString);

  // Base64エンコードされた文字列をArrayBufferに変換
  const buffer = new ArrayBuffer(encodedString.length);
  const bufferView = new Uint8Array(buffer);
  for (let i = 0; i < encodedString.length; i++) {
    bufferView[i] = encodedString.charCodeAt(i);
  }
  return buffer;
};

/************************************************
 * バイナリを文字列にしてBASE64デコード変換する関数(Uint8Array)
 * @param {*} binaryData
 * @returns
 ************************************************/
export const decodeBase64BinaryToStringUint8Array = (
  binaryData: Uint8Array,
): string => {
  // バイナリデータからBase64エンコードされた文字列を作成
  let base64String = '';
  for (let i = 0; i < binaryData.length; i++) {
    base64String += String.fromCharCode(binaryData[i]);
  }

  // Base64デコードを行い、元の文字列を取得
  return base64.decode(base64String);
};

/************************************************
 * バイナリを文字列にしてBASE64デコード変換する関数(ArrayBuffer)
 * @param {*} base64BinaryData
 * @returns
 ************************************************/
export const decodeBase64BinaryToStringArrayBuffer = (
  base64BinaryData: ArrayBuffer,
): string => {
  // ArrayBufferからUint8Arrayを作成
  const uint8Array = new Uint8Array(base64BinaryData);

  // Uint8Arrayを通常の数値の配列に変換
  const numArray = Array.from(uint8Array);

  // 数値の配列からバイナリ文字列を作成
  const binaryString = String.fromCharCode.apply(null, numArray);

  // バイナリ文字列をBase64デコードして元の文字列に戻す
  return base64.decode(binaryString);
};

/************************************************
 * Base64 文字列をバイナリ文字列に変換し、その後 Uint8Array に変換
 * @param {*} b64
 * @returns
 ************************************************/
export const base64ToUint8Array = (b64: string): Uint8Array => {
  const binaryString = atob(b64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

/************************************************
 * Uint8Array を Base64 文字列に変換する関数
 * @param {*} buffer
 * @returns
 ************************************************/
export const uint8ArrayToBase64 = (buffer: Uint8Array): string => {
  return Buffer.from(buffer).toString('base64');
};

/************************************************
 * AES256CBC暗号化関数
 * @param {*} data
 * @param {*} secretKey
 * @returns
 ************************************************/
export const encryptWithAES256CBC = (
  data: string,
  secretKey: Uint8Array,
): string => {
  let encJson = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    secretKey.toString(),
  ).toString();
  let encData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));
  return encData;
};

/************************************************
 * AES256CBC復号化関数
 * @param {*} ciphertext
 * @param {*} secretKey
 * @returns
 ************************************************/
export const decryptWithAES256CBC = (
  ciphertext: string,
  secretKey: Uint8Array,
): string => {
  let decData = CryptoJS.enc.Base64.parse(ciphertext).toString(
    CryptoJS.enc.Utf8,
  );
  let bytes = CryptoJS.AES.decrypt(decData, secretKey.toString()).toString(
    CryptoJS.enc.Utf8,
  );
  return JSON.parse(bytes);
};

/************************************************
 * デバイスIDと現在の日時からユニークなキーを生成し、SHA256でハッシュ化する関数
 * @returns
 ************************************************/
export const generateDeviceUniqueKey = async (): Promise<string> => {
  const deviceId = await DeviceInfo.getUniqueId(); // デバイスIDの取得
  const currentDateTime = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14); // yyyyMMddhhmmss形式
  const combinedString = `${deviceId}${currentDateTime}`;
  const hashedKey = await sha256(combinedString); // SHA256でハッシュ化
  return hashedKey;
};
