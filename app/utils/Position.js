/**-------------------------------------------
 * 位置情報管理
 * 
 * ---------------------------------------------*/

//utils/Position
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';
import { logPosition } from './Log';
import { getInstance } from '../utils/Realm'; // realm.jsから関数をインポート
/************************************************
 * 位置情報取得の権限を要求する関数（Androidのみ）
 * @returns 
 ************************************************/
const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('位置情報の権限が拒否されました。');
        return false;
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
}

/************************************************
 * 位置情報を監視する関数
 * @returns 
 ************************************************/
export const watchLocation = async () => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return;
  const realm = await getInstance()
  const settingsInfo = realm.objects('settings')[0]
  const positionRealm = realm.objects('position')//★位置情報テーブル不確定
  let position = null;
  //位置情報テーブルが存在しない場合
  if(positionRealm === 0){
    setupRealmPosition(realm);
  }
  const positionInfo = realm.objects('position')[0];
  Geolocation.watchPosition(
    (position) => {
      // if(positionInfo.xxx === position){
        //前回がエラーとかのフラグがあれば再開
        //if(positionInfo.xxx === "1"){
        //    xxx
        //  logPosition(position,"reGet",null)   
        //}
        //位置情報とエラーフラグの更新
        //  logPosition(position,"get",null)   
        // ....
      // }

      logPosition(position,"get",null)
    },
    (error) => {
        //  logPosition(position,"error",error)
      console.log(error);
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 100,
      interval: settingsInfo.locGetTerm, // ここを設定ファイルから取得した値に置き換える
    },
  );
}

/************************************************
 * 位置情報の監視を停止する関数
 ************************************************/
export const clearLocation = async () => {
    const realm = await getInstance()
    let positionInfo = realm.objects('position')[0]//★位置情報テーブル不確定
    const watchId = "xxx"//★positionInfo.watchId
    if (watchId !== null) {  
      Geolocation.watchPosition(
        (position) =>{
            logPosition(position,"stop",null)
        }
      )
      Geolocation.clearWatch(watchId);
      //★positionInfo.watchId = null;
    //   realm.write(() => {
    //     realm.create('position', {//★テーブル名
    //         positionInfo
    //     }, Realm.UpdateMode.Modified); // Modified は既存のデータがあれば更新、なければ作成
    //   });
    }
}

/************************************************
 * 位置情報テーブル設定
 ************************************************/
const setupRealmPosition = async (realm) => {
  //位置情報テーブルが存在しない場合
  if(positionRealm === 0){
    console.log('setupRealm position');
    //const bundledSettings = bundledSettingsPath; // requireによってインポートされた設定データ
    // realm.write(() => {
    //   realm.create('position', {
    //     id: 1, // プライマリーキーとしてのID
    //     ...bundledSettings, // スプレッド構文で他のフィールドを展開
    //   });
    // });
  }
}