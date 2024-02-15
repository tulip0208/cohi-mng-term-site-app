/**-------------------------------------------
 * 画面遷移
 * navigation/AppNavigator.tsx
 * ---------------------------------------------*/
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  checkActivation,
  loadFromKeystore,
  saveToKeystore,
} from '../utils/KeyStore'; // KeyStoreの確認関数
import WA1020 from '../screens/WA1020';
import WA1030 from '../screens/WA1030';
import WA1040 from '../screens/WA1040';
import WA1050 from '../screens/WA1050';
import WA1060 from '../screens/WA1060';
import WA1061 from '../screens/WA1061';
import WA1062 from '../screens/WA1062';
import WA1063 from '../screens/WA1063';
import WA1064 from '../screens/WA1064';
import WA1065 from '../screens/WA1065';
import WA1066 from '../screens/WA1066';
import WA1070 from '../screens/WA1070';
import WA1071 from '../screens/WA1071';
import WA1080 from '../screens/WA1080';
import WA1081 from '../screens/WA1081';
import WA1090 from '../screens/WA1090';
import WA1091 from '../screens/WA1091';
import WA1092 from '../screens/WA1092';
import WA1093 from '../screens/WA1093';
import WA1094 from '../screens/WA1094';
import WA1100 from '../screens/WA1100';
import WA1101 from '../screens/WA1101';
import WA1110 from '../screens/WA1110';
import WA1111 from '../screens/WA1111';
import WA1120 from '../screens/WA1120';
import WA1121 from '../screens/WA1121';
import WA1122 from '../screens/WA1122';
import WA1123 from '../screens/WA1123';
import WA1130 from '../screens/WA1130';
import WA1131 from '../screens/WA1131';
import WA1140 from '../screens/WA1140';
import WA1141 from '../screens/WA1141';
import setupRealm, {getInstance} from '../utils/Realm'; // Realmのセットアップ関数をインポート
import {IFA0051} from '../utils/Api';
import {initializeLogFile, logScreen} from '../utils/Log';
import {AlertProvider} from '../components/AlertContext';
import {watchLocation} from '../utils/Location';
import {useAlert} from '../components/AlertContext';
import messages from '../utils/messages';
import {ApiResponse, verUpRep} from '../types/type';
import {useSetRecoilState} from 'recoil';
import {serverNameState} from '../atom/atom.tsx';

export type RootList = {
  WA1020: undefined;
  WA1030: undefined;
  WA1040: undefined;
  WA1050: {sourceScreenId: string};
  WA1060: undefined;
  WA1061: undefined;
  WA1062: undefined;
  WA1063: undefined;
  WA1064: undefined;
  WA1065: undefined;
  WA1066: undefined;
  WA1070: undefined;
  WA1071: undefined;
  WA1080: undefined;
  WA1081: undefined;
  WA1090: undefined;
  WA1091: undefined;
  WA1092: undefined;
  WA1093: undefined;
  WA1094: undefined;
  WA1100: undefined;
  WA1101: undefined;
  WA1110: undefined;
  WA1111: undefined;
  WA1120: undefined;
  WA1121: undefined;
  WA1122: undefined;
  WA1123: undefined;
  WA1130: undefined;
  WA1131: undefined;
  WA1140: undefined;
  WA1141: undefined;
};
const Stack = createStackNavigator<RootList>();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState<keyof RootList>();
  const [isLoading, setIsLoading] = useState<boolean>(true); // ローディング状態の追加
  const setServerName = useSetRecoilState(serverNameState);
  const {showAlert} = useAlert();

  useEffect(() => {
    // アプリ起動時の処理
    // ログファイル初期化
    initializeLogFile();

    const initialize = async () => {
      //起動時の初期処理
      const ret = await setupRealm();
      //サーバ名の設定
      setServerName(ret as string);
      //--------WA1020_前処理--------
      // アクティベーション情報の確認
      const activationInfo = await checkActivation();

      if (activationInfo && activationInfo.actFin === 1) {
        //--------WA1030_前処理--------
        //バージョンアップ報告チェック
        const verUpRepKeyStore = (await loadFromKeystore(
          'verUpRep',
        )) as verUpRep;
        //バージョンアップ報告=1:"要"の場合
        if (verUpRepKeyStore && verUpRepKeyStore.verUpRep === 1) {
          // サーバー通信処理（Api.js内の関数を呼び出し
          try {
            const responseIFA0051 = await IFA0051();
            if (await apiIsError(responseIFA0051)) {
              return;
            }

            await saveToKeystore('verUpRep', {
              verUpRep: 0,
            });
          } catch (error) {
            console.log('バージョンアップ報告に失敗しました。:', error);
          }
        } else {
          console.log('keyStoreにバージョンアップ報告が存在しません。');
        }

        //ログイン情報チェック
        const realm = getInstance();
        const loginInfo = realm.objects('login')[0];
        const currentDateTime = new Date()
          .toISOString()
          .replace(/[^0-9]/g, '')
          .slice(0, 8); // yyyyMMddhhmmss形式

        //時分秒を除く日付を突合し確認
        if (
          loginInfo &&
          (loginInfo.loginDt as string).replace(/[^0-9]/g, '').slice(0, 8) ===
            currentDateTime &&
          loginInfo.logoutFlg === '0'
        ) {
          // [位置情報取得間隔]の間隔で位置情報の取得を開始する。
          await watchLocation();
          await logScreen('画面遷移: WA1040_メニュー');
          setInitialRoute('WA1040'); // ログイン済みの場合、メニュー画面起動
        } else {
          // realm-ログイン情報・ユーザクリア
          // 特定のデータを検索する
          const userInfo = realm.objects('user')[0];
          // データベースからデータを削除
          realm.write(() => {
            if (loginInfo) {
              realm.delete(loginInfo);
            }
            if (userInfo) {
              realm.delete(userInfo);
            }
          });

          await logScreen('画面遷移: WA1030_ログイン');
          setInitialRoute('WA1030'); // アクティベーション情報がない・アクティベージョン済の場合、ログイン画面に設定
        }
      } else {
        await logScreen('画面遷移: WA1020_アクティベーション');
        setInitialRoute('WA1020'); // アクティベーション画面へ遷移
      }
      setIsLoading(false); // ローディング完了
    };

    initialize();
  }, []);

  /************************************************
   * API通信処理エラー有無確認・エラーハンドリング
   * @param {*} response
   * @returns
   ************************************************/
  const apiIsError = async <T,>(response: ApiResponse<T>): Promise<boolean> => {
    if (!response.success) {
      switch (response.error) {
        case 'codeHttp200':
          await showAlert(
            '通知',
            messages.EA5004(response.api as string, response.status as number),
            false,
          );
          break;
        case 'codeRsps01':
          await showAlert(
            '通知',
            messages.EA5005(response.api as string, response.code as string),
            false,
          );
          break;
        case 'timeout':
          await showAlert('通知', messages.EA5003(), false);
          break;
      }
      return true;
    } else {
      return false;
    }
  };

  // ローディング中は何も表示しない（またはローディングインジケーターを表示）
  // Footerにサーバ名を表示させるため。（表示順序関係）
  if (isLoading) {
    return null;
  }
  return (
    <NavigationContainer>
      <AlertProvider>
        <Stack.Navigator
          screenOptions={{headerShown: false}}
          initialRouteName={initialRoute}>
          <Stack.Screen name="WA1020" component={WA1020} />
          <Stack.Screen name="WA1030" component={WA1030} />
          <Stack.Screen name="WA1040" component={WA1040} />
          <Stack.Screen name="WA1050" component={WA1050} />
          <Stack.Screen name="WA1060" component={WA1060} />
          <Stack.Screen name="WA1061" component={WA1061} />
          <Stack.Screen name="WA1062" component={WA1062} />
          <Stack.Screen name="WA1063" component={WA1063} />
          <Stack.Screen name="WA1064" component={WA1064} />
          <Stack.Screen name="WA1065" component={WA1065} />
          <Stack.Screen name="WA1066" component={WA1066} />
          <Stack.Screen name="WA1070" component={WA1070} />
          <Stack.Screen name="WA1071" component={WA1071} />
          <Stack.Screen name="WA1080" component={WA1080} />
          <Stack.Screen name="WA1081" component={WA1081} />
          <Stack.Screen name="WA1090" component={WA1090} />
          <Stack.Screen name="WA1091" component={WA1091} />
          <Stack.Screen name="WA1092" component={WA1092} />
          <Stack.Screen name="WA1093" component={WA1093} />
          <Stack.Screen name="WA1094" component={WA1094} />
          <Stack.Screen name="WA1100" component={WA1100} />
          <Stack.Screen name="WA1101" component={WA1101} />
          <Stack.Screen name="WA1110" component={WA1110} />
          <Stack.Screen name="WA1111" component={WA1111} />
          <Stack.Screen name="WA1120" component={WA1120} />
          <Stack.Screen name="WA1121" component={WA1121} />
          <Stack.Screen name="WA1122" component={WA1122} />
          <Stack.Screen name="WA1123" component={WA1123} />
          <Stack.Screen name="WA1130" component={WA1130} />
          <Stack.Screen name="WA1131" component={WA1131} />
          <Stack.Screen name="WA1140" component={WA1140} />
          <Stack.Screen name="WA1141" component={WA1141} />
        </Stack.Navigator>
      </AlertProvider>
    </NavigationContainer>
  );
};

export default AppNavigator;
