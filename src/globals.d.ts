/**-------------------------------------------
 * グローバル変数
 * globals.d.ts
 * ---------------------------------------------*/
declare global {
  //位置情報取得用
  var locationStarted: boolean;
  var locationStopped: boolean;
  var locationErrored: boolean;
  var watchId: number | null;
  //Realmインスタンス用
  var realmInstance: Realm;
  // NodeJS.Global型を追加
  var global: NodeJS.Global;
}
export {};
