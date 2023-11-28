// utils/Realm.js

import Realm from 'realm';
// スキーマ定義などをインポート

const encryptionKey = new Int8Array(64); // 例としてランダムなキーを生成

// Realmの設定
const realmConfig = new Realm();

// インスタンス取得関数
export const getInstance = async () => {
  return await Realm.open(realmConfig);
};

export default {
  getInstance,
  encryptionKey,
};
