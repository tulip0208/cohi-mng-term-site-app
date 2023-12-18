/**-------------------------------------------
 * 位置情報管理
 * utils/Position.tsx
 * ---------------------------------------------*/
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';
import { logPosition } from './Log';
import { getInstance } from './Realm'; // realm.jsから関数をインポート
import { Position } from '../types/type';
import Crypto from 'react-native-aes-crypto';
/************************************************
 * 位置情報取得の権限を要求する関数（Androidのみ）
 * @returns 
 ************************************************/
const requestLocationPermission = async ():Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '位置情報の使用許可',
          message: '位置情報を使用してもよろしいでしょうか。',
          buttonNeutral: 'あとで聞く',
          buttonNegative: '拒否',
          buttonPositive: '許可',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

export default Position;

/************************************************
 * 位置情報を監視する関数
 * @returns 
 ************************************************/
export const watchLocation = async (): Promise<void> => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return;
  const realm = getInstance()
  const settingsInfo = realm.objects('settings')[0]

  //取得IDをグローバル変数へ代入
  // Geolocation.watchPosition(
  global.watchId = Geolocation.watchPosition(
    async (position) => {

      if(!global.locationStarted){
        if(global.locationErrored){
          logPosition(position,"reGet",null)
        }else{
          logPosition(position,"get",null)
        }
        global.locationStopped = false;
        global.locationStarted = true;
        global.locationErrored = false;
      }
      const { latitude, longitude} = position.coords;
      const timestampDate = new Date(position.timestamp);
      const location = realm.objects('location')[0] || null
      let getLocation = false;
      if (!location || location.length === 0){
        getLocation = true;
      }else{
        const lastLocation=realm.objects('location').sorted('schDt', true)[0];
        const lastSchDate = lastLocation.schDt as Date;
        getLocation = (lastSchDate.getTime() !== position.timestamp);
      }
      //取得した位置情報の測位日時と、[Realm].[位置情報]に保存した最新の位置情報の[測位日時]が同じ場合は破棄
      if (getLocation) {
        (async () => {
          let uuid = await Crypto.randomUuid();

          realm.write(() => {
            // 既に同じユーザIDのデータがあれば上書き、なければ新規作成
            realm.create('location', {
              id: uuid ,//ID UUID
              schDt: new Date(),//取得日時 YYYY/MM/DD hh:mm:ss
              locDt: timestampDate.getTime(),//測位日時 Timestampデータ
              latitude: `${latitude}`,//緯度 
              longitude: `${longitude}`,//経度 
              sndFlg: 1,//送信フラグ
              sndJsoIFA0110: '',
              sndJsonIFT0150: '',
              alrtCd: '',
            },);
          });          
        })();
            
      
      }      
    },
    (error) => {
      global.locationErrored = true;
      // エラーオブジェクトの内容に基づいてエラーメッセージを構築
      const errorMessage = `Error: ${error.code}, Message: ${error.message}`;
      // エラー時にログ記録
      logPosition(null, "error", errorMessage);
      console.log(error);
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 100,
      interval: settingsInfo.locGetTerm as number * 1000, // ここを設定ファイルから取得した値に置き換える ★後程復帰
      // fastestInterval: 1000, // 車載アプリの場合
    },
  );
}

/************************************************
 * 位置情報の監視を停止する関数
 ************************************************/
export const clearLocation = async (): Promise<void> => {
  try{
  if (global.watchId !== null) {
      const realm = getInstance()
      const lastLocation = realm.objects('location').sorted('schDt', true)[0];
      if(lastLocation){
        const position = {
          coords:{
            latitude:lastLocation.latitude,
            longitude:lastLocation.longitude
          }
        } as Geolocation.GeoPosition
        logPosition(position,"stop",null)  
      }
      Geolocation.clearWatch(global.watchId);
      global.locationStarted = false;
      global.locationStopped = true;
      watchId = null;
    }
  }catch(error){
    console.log(error)
  }
}

