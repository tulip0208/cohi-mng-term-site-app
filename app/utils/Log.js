/**-------------------------------------------
 * ログ処理
 * 
 * ---------------------------------------------*/
//utils/log
import RNFS from 'react-native-fs';
import Geolocation from '@react-native-community/geolocation';
import { Alert } from 'react-native';
export const logDirectory = `${RNFS.DocumentDirectoryPath}/logs`;
import messages from '../utils/messages';
import { zip } from 'react-native-zip-archive';
import { loadFromKeystore } from '../utils/KeyStore'; 

/************************************************
 * 指定したログファイルを削除する関数
 ************************************************/
export const deleteLogFile = async (filePath) => {
  try {
    const fileExists = await RNFS.exists(filePath);
    if (fileExists) {
      await RNFS.unlink(filePath);
      console.log(`File deleted: ${filePath}`);
    } else {
      console.log(`File does not exist: ${filePath}`);
    }
  } catch (error) {
    console.error(`Failed to delete file: ${filePath}`, error);
    throw error; // エラーを呼び出し元に伝播させる
  }
};
/************************************************
 * ログファイルを圧縮する関数
 ************************************************/
export const compressLogFiles = async () => {
  const trmId = await loadFromKeystore('trmId');
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0,14); // yyyyMMddhhmmss形式
  const targetPath = `${RNFS.DocumentDirectoryPath}/log_${trmId.trmId}_${timestamp}.zip`;
  const sourcePath = `${RNFS.DocumentDirectoryPath}/logs`;

  try {
    await zip(sourcePath, targetPath);
    console.log(`Logs are compressed to ${targetPath}`);
    return targetPath;
  } catch (error) {
    console.error(error);
  }
};

/************************************************
 * ログファイルを確認する関数
 ************************************************/
export const checkLogFile = async () => {
  try {
    const files = await RNFS.readDir(logDirectory);
    let totalSize = 0; //合計ファイル数
    for (const file of files) {
      if (file.isFile()) {
        totalSize++;
      }
    }
    console.log("total:",totalSize," files");
    return totalSize;
  } catch (error) {
    console.error('Failed to delete logs:', error);
  }
};

/************************************************
 * ログファイルを削除する関数
 ************************************************/
export const deleteLogs = async () => {
  try {
    const files = await RNFS.readDir(logDirectory);
    for (const file of files) {
      if (file.isFile()) {
        await RNFS.unlink(file.path);
      }
    }

    Alert.alert('', messages.IA5005('ログの削除'), [{ text: 'はい' }]);

    // ステップ2.4: 削除操作のログを記録
    initializeLogFile()
    logUserAction('ログファイル初期化')
  } catch (error) {
    console.error('Failed to delete logs:', error);
  }
};

/************************************************
 * ログファイルの合計サイズを計算する関数
 ************************************************/
export const calculateTotalLogSize = async () => {
  try {
    const files = await RNFS.readDir(logDirectory); // ディレクトリ内のファイル一覧を取得
    let totalSize = 0; // 合計サイズ

    for (const file of files) {
      if (file.isFile()) { // ディレクトリではなくファイルの場合
        const fileSize = await RNFS.stat(file.path); // ファイルのサイズを取得
        totalSize += fileSize.size; // 合計サイズに加算
      }
    }

    // バイトをMBに変換し、小数点1位以下を切り上げ
    const totalSizeMB = Math.ceil((totalSize / (1024 * 1024)) * 10) / 10;
    
    return totalSizeMB; // 合計サイズをMB単位で返す
  } catch (error) {
    console.error(error);
    return 0; // エラーがあった場合は0を返す
  }
};

/************************************************
 * ログファイルの初期化
 ************************************************/
export const initializeLogFile = async () => {
  // ログディレクトリの存在確認
  const directoryExists = await RNFS.exists(logDirectory);
  if (!directoryExists) {
    await RNFS.mkdir(logDirectory);
  }

  // 新しいログファイルの作成
  const newLogFileName = `${new Date().toISOString().split('T')[0]}_001.log`;
  const newLogFilePath = `${logDirectory}/${newLogFileName}`;

  // ログファイルの作成
  if (!(await RNFS.exists(newLogFilePath))) {
    await RNFS.writeFile(newLogFilePath, '', 'utf8');
  }
};

/************************************************
 * ログの書き込み
 * @param {*} logData 
 ************************************************/
export const writeLog = async (logData) => {
  const logFilePath = `${logDirectory}/${getCurrentLogFileName()}`;
  console.log(logData)
  await RNFS.appendFile(logFilePath, `${logData}\n`, 'utf8');
};

/************************************************
 * 現在のログファイル名の取得
 ************************************************/
export const getCurrentLogFileName = () => {
  // 現在の日付と連番を使ってログファイル名を決定するロジックをここに実装
};

/************************************************
 * 画面遷移ログの書き込み
 * @param {*} actionDescription 
 ************************************************/
export const logScreen = async (actionDescription) => {
    const logEntry = `"VW", "${new Date().toISOString()}", "${actionDescription}"`;
    await writeLog(logEntry);
};

/************************************************
 * 操作ログの書き込み
 * @param {*} actionDescription 
 ************************************************/
export const logUserAction = async (actionDescription) => {
    const logEntry = `"OP", "${new Date().toISOString()}", "${actionDescription}"`;
    await writeLog(logEntry);
};

/************************************************
 * 通信ログの書き込み
 * @param {*} method 
 * @param {*} url 
 * @param {*} status 
 * @param {*} response 
 ************************************************/
export const logCommunication = async (method, url, status, response) => {
    const logEntry = `"CM", "${new Date().toISOString()}", "${method}", "${url}", "${status}", "${response}"`;
    await writeLog(logEntry);
};

/************************************************
 * 位置情報の取得とログ
 * @param {*} position 
 * @param {*} flg 
 * @param {*} error 
 ************************************************/
export const logPosition = (position,flg,error) => {
    if(flg === "get"){
        const { latitude, longitude } = position.coords;
        const logEntry = `"LC", "${new Date().toISOString()}", "取得", "${latitude}", "${longitude}"`;
        writeLog(logEntry);  
    }else if(flg === "stop"){
        const { latitude, longitude } = position.coords;
        const logEntry = `"LC", "${new Date().toISOString()}", "停止", "${latitude}", "${longitude}"`;
        writeLog(logEntry);  
    }else if(flg === "reGet"){
        const { latitude, longitude } = position.coords;
        const logEntry = `"LC", "${new Date().toISOString()}", "再開", "${latitude}", "${longitude}"`;
        writeLog(logEntry);  
    }else{
        const logEntry = `"LC", "${new Date().toISOString()}", "失敗", "${error.message}"`;
        writeLog(logEntry);  
    }
};
