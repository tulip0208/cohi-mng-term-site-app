/**
 * ログ処理
 * 
 */
//utils/log
import RNFS from 'react-native-fs';
import Geolocation from '@react-native-community/geolocation';

export const logDirectory = `${RNFS.DocumentDirectoryPath}/logs`;

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
