/**-------------------------------------------
 * 共通Util
 * utils/Realm.tsx
 * ---------------------------------------------*/
/************************************************
 * フォーマット日付文字列取得
 * yyyy/MM/dd HH:mm:ss
 ************************************************/
export const getCurrentDateTime = (): string => {
  const now = new Date();

  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');

  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};

/************************************************
 * フォーマット日付文字列取得
 * yyyy/MM/dd
 ************************************************/
export const getCurrentDate = (): string => {
  const now = new Date();

  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');

  return `${year}/${month}/${day}`;
};
