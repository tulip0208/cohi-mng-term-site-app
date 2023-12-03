/**
 * 位置情報管理
 * 
 */

//utils/position
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';

// 位置情報取得の権限を要求する関数（Androidのみ）
async function requestLocationPermission() {
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

// 位置情報を監視する関数
async function watchLocation() {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return;

  Geolocation.watchPosition(
    (position) => {
      console.log(position);
      // 位置情報が更新されたら、ここに処理を追加
      // 例: データベースに位置情報を追加または更新
    },
    (error) => {
      console.log(error);
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 100,
      interval: 30000, // ここを設定ファイルから取得した値に置き換える
      fastestInterval: 5000, // 必要に応じて設定
      useSignificantChanges: false, // 必要に応じて設定
    },
  );
}

// 位置情報監視を開始する
watchLocation();
