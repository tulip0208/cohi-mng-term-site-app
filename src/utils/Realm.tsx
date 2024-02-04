/**-------------------------------------------
 * DB（realm）のセットアップ・インスタンス取得
 * utils/Realm.tsx
 * ---------------------------------------------*/
import Realm from 'realm';
import {
  settingsSchema,
  loginSchema,
  userSchema,
  temporaryPlacesSchema,
  storagePlacesSchema,
  fixedPlacesSchema,
  fixedPlacesInfoSchema,
  locationSchema,
} from './Schemas'; // 仮のスキーマファイル
import {generateEncryptionKey} from './Security';
import {
  getEncryptionKeyFromKeystore,
  storeEncryptionKeyInKeystore,
} from './KeyStore';
import RNFS from 'react-native-fs';
const realmPath = `${RNFS.DocumentDirectoryPath}/app.realm`;

// 設定データが含まれるJSONファイルのパスを指定します
import bundledSettingsPath from '../../assets/data/settings.json';
export let encryptionKey: Uint8Array; // 暗号化キーをグローバルで保持

/************************************************
 * アプリ起動時のRealmの設定を行う関数
 ************************************************/
const setupRealm = async (): Promise<string> => {
  //await deleteAllRealm(); //debug用
  try {
    // keyStoreからkeyを取得する
    encryptionKey = await getEncryptionKeyFromKeystore();

    // 初回起動時の処理
    if (encryptionKey.length === 0) {
      console.log('setupRealm firstTime');
      const newEncryptionKey = generateEncryptionKey();
      await storeEncryptionKeyInKeystore(newEncryptionKey);
      encryptionKey = newEncryptionKey;
    }

    // Realmの初期設定
    const realmConfig: Realm.Configuration = {
      path: realmPath,
      schema: [
        settingsSchema,
        loginSchema,
        userSchema,
        temporaryPlacesSchema,
        storagePlacesSchema,
        fixedPlacesSchema,
        fixedPlacesInfoSchema,
        locationSchema,
      ],
      encryptionKey: encryptionKey,
    };
    // Realmインスタンスを開く
    const realm = await Realm.open(realmConfig);
    global.realmInstance = realm; // グローバルインスタンスとして設定
    const settings = realm.objects('settings').filtered('id == 1'); // 'settings'はスキーマ名

    // 設定データがまだ存在しない場合は挿入する
    if (settings.isEmpty()) {
      console.log('setupRealm settings');
      const bundledSettings = bundledSettingsPath; // requireによってインポートされた設定データ

      realm.write(() => {
        realm.create(
          'settings',
          {
            ...bundledSettings, // スプレッド構文で他のフィールドを展開
            id: 1, // プライマリーキーとしてのID
          },
          Realm.UpdateMode.Modified,
        );
      });
    }
    return settings[0].serverName as string;
  } catch (error) {
    console.log('Error setting up Realm:', error);
    return '';
  }
};

/************************************************
 * インスタンス取得関数
 ************************************************/
export const getInstance = (): Realm => {
  return global.realmInstance;
};

/************************************************
 * Realm データベースファイルを削除する関数
 ************************************************/
export const deleteRealm = async (schemaName: string) => {
  const realm = getInstance();
  realm.write(() => {
    // 指定したスキーマのすべてのオブジェクトを取得
    let allObjects = realm.objects(schemaName);
    // 取得したオブジェクトをすべて削除
    realm.delete(allObjects);
  });
};

/************************************************
 * 全Realm データベースファイルを削除する関数
 * ※デバッグ用
 ************************************************/
// const deleteAllRealm = async () => {
//   const delRealmPath = `${RNFS.DocumentDirectoryPath}/app.realm`;

//   try {
//     // ファイルが存在するか確認
//     const fileExists = await RNFS.exists(delRealmPath);
//     if (fileExists) {
//       // ファイルが存在する場合、削除
//       await RNFS.unlink(delRealmPath);
//       console.log('Realm database file deleted successfully.');
//     } else {
//       console.log('Realm database file does not exist.');
//     }
//   } catch (error) {
//     console.error('Error deleting Realm database file:', error);
//   }
// };

export default setupRealm;
