/**-------------------------------------------
 * ログ処理
 * utils/Log.tsx
 * ---------------------------------------------*/
import RNFS, {ReadDirItem} from 'react-native-fs';
import Geolocation from 'react-native-geolocation-service';

export const logDirectory = `${RNFS.DocumentDirectoryPath}/logs`;
import messages from './messages';
import {zip} from 'react-native-zip-archive';
import {loadFromKeystore} from './KeyStore';
import {getInstance} from './Realm'; // realm.jsから関数をインポート
import {TrmId} from '../types/type';

/************************************************
 * 指定したログファイルを削除する関数
 ************************************************/
export const deleteLogFile = async (filePath: string): Promise<void> => {
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
export const compressLogFiles = async (): Promise<string | undefined> => {
  const trmId = (await loadFromKeystore('trmId')) as TrmId;
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14); // yyyyMMddhhmmss形式
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
export const checkLogFile = async (): Promise<number | undefined> => {
  try {
    const files = await RNFS.readDir(logDirectory);
    let totalSize = 0; //合計ファイル数
    for (const file of files) {
      if (file.isFile()) {
        totalSize++;
      }
    }
    console.log('total:', totalSize, ' files');
    return totalSize;
  } catch (error) {
    console.error('Failed to delete logs:', error);
  }
};

/************************************************
 * ログファイルを削除する関数
 ************************************************/
export const deleteLogs = async (
  showAlertCallback: (
    title: string,
    message: string,
    cancelable: boolean,
  ) => Promise<void>,
): Promise<void> => {
  try {
    const files = await RNFS.readDir(logDirectory);
    for (const file of files) {
      if (file.isFile()) {
        await RNFS.unlink(file.path);
      }
    }
    await showAlertCallback('通知', messages.IA5005('ログの削除'), false);

    // ステップ2.4: 削除操作のログを記録
    remakeLogFile();
    logUserAction('ログファイル初期化');
  } catch (error) {
    console.error('Failed to delete logs:', error);
  }
};

/************************************************
 * ログファイルの合計サイズを計算する関数
 ************************************************/
export const calculateTotalLogSize = async (): Promise<number> => {
  try {
    const files = await RNFS.readDir(logDirectory); // ディレクトリ内のファイル一覧を取得
    let totalSize = 0; // 合計サイズ

    for (const file of files) {
      if (file.isFile()) {
        // ディレクトリではなくファイルの場合
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
export const initializeLogFile = async (): Promise<void> => {
  // ログディレクトリの存在確認
  const directoryExists = await RNFS.exists(logDirectory);
  if (!directoryExists) {
    await RNFS.mkdir(logDirectory);
  }

  // 新しいログファイルの作成
  const newLogFileName = `${new Date()
    .toISOString()
    .split('T')[0]
    .replace(/-/g, '')}_001.log`;
  const newLogFilePath = `${logDirectory}/${newLogFileName}`;
  const logFileExists = await RNFS.exists(newLogFilePath);
  if (!logFileExists) {
    // ログファイルの作成
    await RNFS.writeFile(newLogFilePath, '', 'utf8');
    return;
  }
};

/************************************************
 * ログファイルの再作成
 ************************************************/
export const remakeLogFile = async (): Promise<void> => {
  // ログディレクトリの存在確認
  const directoryExists = await RNFS.exists(logDirectory);
  if (!directoryExists) {
    await RNFS.mkdir(logDirectory);
  }

  // 新しいログファイルの作成
  const newLogFileName = `${new Date()
    .toISOString()
    .split('T')[0]
    .replace(/-/g, '')}_001.log`;
  const newLogFilePath = `${logDirectory}/${newLogFileName}`;
  const logFileExists = await RNFS.exists(newLogFilePath);
  if (!logFileExists) {
    // ログファイルの作成
    await RNFS.writeFile(newLogFilePath, '', 'utf8');
    return;
  }

  // ファイル一覧を取得して最新の連番を決定するロジックを実装する
  const files: ReadDirItem[] = await RNFS.readDir(logDirectory);
  const datePrefix = new Date().toISOString().split('T')[0].replace(/-/g, '');
  let maxSeq = 0;

  files.forEach(file => {
    const match = file.name.match(new RegExp(`^${datePrefix}_(\\d{3})\\.log$`));
    if (match && parseInt(match[1], 10) > maxSeq) {
      maxSeq = parseInt(match[1], 10);
    }
  });

  const seq = (maxSeq + 1).toString().padStart(3, '0');
  // ログファイルの作成
  await RNFS.writeFile(`${logDirectory}/${datePrefix}_${seq}.log`, '', 'utf8');
};

/************************************************
 * ログの書き込み
 * @param {*} logData
 ************************************************/
export const writeLog = async (logData: string): Promise<void> => {
  await rotateLogFile();
  const logFilePath = `${logDirectory}/${await getCurrentLogFileName()}`;
  console.log(logData);
  await RNFS.appendFile(logFilePath, `${logData}\n`, 'utf8');
};

/************************************************
 * 現在のログファイル名の取得
 ************************************************/
export const getCurrentLogFileName = async (): Promise<string> => {
  // ファイル一覧を取得して最新の連番を決定するロジックを実装する
  const files: ReadDirItem[] = await RNFS.readDir(logDirectory);
  const datePrefix = new Date().toISOString().split('T')[0].replace(/-/g, '');
  let maxSeq = 0;

  files.forEach(file => {
    const match = file.name.match(new RegExp(`^${datePrefix}_(\\d{3})\\.log$`));
    if (match && parseInt(match[1], 10) > maxSeq) {
      maxSeq = parseInt(match[1], 10);
    }
  });

  const seq = maxSeq.toString().padStart(3, '0');
  return `${datePrefix}_${seq}.log`;
};

/************************************************
 * ログファイルのローテーション
 ************************************************/
export const rotateLogFile = async (): Promise<void> => {
  try {
    const currentLogFileName = await getCurrentLogFileName();
    const currentLogFilePath = `${logDirectory}/${currentLogFileName}`;

    // ファイルの存在を確認
    const fileExists = await RNFS.exists(currentLogFilePath);
    if (!fileExists) {
      await remakeLogFile();
      return;
    }

    const fileStats = await RNFS.stat(currentLogFilePath);
    const realm = getInstance();
    const settingsInfo = realm.objects('settings')[0];
    const maxLogFileSize = (settingsInfo.logCapacity as number) * 1024 * 1024;

    if (
      fileStats.size >= maxLogFileSize ||
      new Date().getDate() !== new Date(fileStats.ctime).getDate()
    ) {
      await remakeLogFile();
    }

    const retentionPeriod = settingsInfo.logTerm as number;
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - retentionPeriod);

    const files = await RNFS.readDir(logDirectory); //ディレクトリ内のファイル一覧を取得
    for (const file of files) {
      if (file.ctime) {
        const fileDate = new Date(file.ctime);
        if (fileDate < expiredDate) {
          await RNFS.unlink(file.path);
        }
      }
    }
  } catch (error) {
    console.error('Error rotating log files:', error);
  }
};

/************************************************
 * 画面遷移ログの書き込み
 * @param {*} actionDescription
 ************************************************/
export const logScreen = async (actionDescription: string): Promise<void> => {
  const logEntry = `"OP", "${new Date().toISOString()}", "${actionDescription}"`;
  await writeLog(logEntry);
};

/************************************************
 * 操作ログの書き込み
 * @param {*} actionDescription
 ************************************************/
export const logUserAction = async (
  actionDescription: string,
): Promise<void> => {
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
export const logCommunication = async (
  method: string,
  url: string,
  status: number | null,
  response: string,
): Promise<void> => {
  const logEntry = `"CM", "${new Date().toISOString()}", "${method}", "${url}", "${status}", "${response}"`;
  await writeLog(logEntry);
};

/************************************************
 * 位置情報の取得とログ
 * @param {*} position
 * @param {*} flg
 * @param {*} error
 ************************************************/
export const logPosition = async (
  position: Geolocation.GeoPosition | null,
  flg: string,
  error: string | null,
): Promise<void> => {
  if (flg === 'get' && position) {
    const {latitude, longitude} = position.coords;
    const logEntry = `"LC", "${new Date().toISOString()}", "開始", "${latitude}", "${longitude}"`;
    writeLog(logEntry);
  } else if (flg === 'stop' && position) {
    const {latitude, longitude} = position.coords;
    const logEntry = `"LC", "${new Date().toISOString()}", "停止", "${latitude}", "${longitude}"`;
    writeLog(logEntry);
  } else if (flg === 'reGet' && position) {
    const {latitude, longitude} = position.coords;
    const logEntry = `"LC", "${new Date().toISOString()}", "再開", "${latitude}", "${longitude}"`;
    writeLog(logEntry);
  } else {
    const logEntry = `"LC", "${new Date().toISOString()}", "失敗", "${error}"`;
    writeLog(logEntry);
  }
};
