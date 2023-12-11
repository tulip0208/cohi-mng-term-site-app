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
import { useAlert } from '../components/AlertContext';
import { getInstance } from '../utils/Realm'; // realm.jsから関数をインポート

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
export const deleteLogs = async (showAlertCallback) => {
  try {
    const files = await RNFS.readDir(logDirectory);
    for (const file of files) {
      if (file.isFile()) {
        await RNFS.unlink(file.path);
      }
    }
    const result = await showAlertCallback("通知", messages.IA5005('ログの削除'), false);

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
    const totalSizeMB = Math.max(1, Math.ceil(totalSize / (1024 * 1024)));
    
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
  await rotateLogFile();
  const logFilePath = `${logDirectory}/${getCurrentLogFileName()}`;
  console.log(logData)
  await RNFS.appendFile(logFilePath, `${logData}\n`, 'utf8');
};

/************************************************
 * 現在のログファイル名の取得
 ************************************************/
export const getCurrentLogFileName = async () => {
  // ファイル一覧を取得して最新の連番を決定するロジックを実装する
  const files = await RNFS.readDir(logDirectory);
  const datePrefix = new Date().toISOString().split('T')[0].replace(/-/g, '');
  let maxSeq = 0;

  files.forEach(file => {
    const match = file.name.match(new RegExp(`^${datePrefix}_(\\d{3})\\.log$`));
    if (match && parseInt(match[1], 10) > maxSeq) {
      maxSeq = parseInt(match[1], 10);
    }
  });

  const seq = (maxSeq + 1).toString().padStart(3, '0');
  return `${datePrefix}_${seq}.log`;
};

/************************************************
 * ログファイルのローテーション
 ************************************************/
export const rotateLogFile = async () => {
  try {
    const currentLogFileName = await getCurrentLogFileName();
    const currentLogFilePath = `${logDirectory}/${currentLogFileName}`;
    
    // ファイルの存在を確認
    const fileExists = await RNFS.exists(currentLogFilePath);
    if (!fileExists) {
      await initializeLogFile();
      return;
    }

    const fileStats = await RNFS.stat(currentLogFilePath);
    const realm = await getInstance();
    const settingsInfo = realm.objects('settings')[0];
    const maxLogFileSize = settingsInfo.logCapacity * 1024 * 1024;

    if (fileStats.size >= maxLogFileSize || new Date().getDate() !== new Date(fileStats.ctime).getDate()) {
      await initializeLogFile();
    }

    const retentionPeriod = settingsInfo.logTerm;
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - retentionPeriod);

    const files = await RNFS.readDir(logDirectory); // ディレクトリ内のファイル一覧を取得
    for (const file of files) {
      const fileDate = new Date(file.ctime);
      if (fileDate < expiredDate) {
        await RNFS.unlink(file.path);
      }
    }
  } catch (error) {
    console.error('Error rotating log files:', error);
  }
}

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
export const logPosition2 = (position, flg, error) => {
  let logEntry;
  if (flg === "get" || flg === "stop" || flg === "reGet") {
      const { latitude, longitude } = position.coords;
      logEntry = `"LC", "${new Date().toISOString()}", "${flg === "get" ? "取得" : flg === "stop" ? "停止" : "再開"}", "${latitude}", "${longitude}"`;
  } else {
      logEntry = `"LC", "${new Date().toISOString()}", "失敗", "${error.message}"`;
  }
  writeLog(logEntry);
};