/**-------------------------------------------
 * 画面遷移
 * navigation/AppNavigator.tsx
 * ---------------------------------------------*/
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { checkActivation,loadFromKeystore,saveToKeystore,clearKeyStore } from '../utils/KeyStore'; // KeyStoreの確認関数
import WA1020 from '../screens/WA1020';
import WA1030 from '../screens/WA1030';
import WA1040 from '../screens/WA1040';
import WA1050 from '../screens/WA1050';
// import WA1060 from '../screens/WA1060';
import WA1070 from '../screens/WA1070';
import WA1071 from '../screens/WA1071';
import WA1080 from '../screens/WA1080';
import WA1081 from '../screens/WA1081';
// import WA1090 from '../screens/WA1090';
// import WA1100 from '../screens/WA1100';
import WA1110 from '../screens/WA1110';
import WA1111 from '../screens/WA1111';
// import WA1120 from '../screens/WA1120';
// import WA1130 from '../screens/WA1130';
// import WA1140 from '../screens/WA1140';
import setupRealm, { getInstance } from '../utils/Realm'; // Realmのセットアップ関数をインポート
import { IFA0051 } from '../utils/Api'; 
import { initializeLogFile, logScreen } from '../utils/Log';
import { AlertProvider } from '../components/AlertContext';
import { watchLocation } from '../utils/Location'; 
import { useAlert } from '../components/AlertContext';
import messages from '../utils/messages';
import { ApiResponse,verUpRep } from '../types/type';
import { useRecoilState } from "recoil";
import { serverNameState } from "../atom/atom.tsx";

export type RootList = {
  WA1020: undefined;
  WA1030: undefined;
  WA1040: undefined;
  WA1050: { sourceScreenId: string };
  WA1060: undefined;
  WA1070: undefined;
  WA1071: undefined;
  WA1080: undefined;
  WA1081: undefined;
  WA1090: undefined;
  WA1100: undefined;
  WA1110: undefined;
  WA1111: undefined;
  WA1120: undefined;
  WA1130: undefined;
  WA1140: undefined;
};
const Stack = createStackNavigator<RootList>();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState<keyof RootList>();
  const [isLoading, setIsLoading] = useState<boolean>(true); // ローディング状態の追加
  const [ serverName, setServerName ] = useRecoilState(serverNameState);
  const { showAlert } = useAlert();
  
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
      
      if (activationInfo && activationInfo.actFin == 1) {
        
        //--------WA1030_前処理--------
        //バージョンアップ報告チェック
        await clearKeyStore("verUpRep");
        const verUpRepKeyStore=await loadFromKeystore("verUpRep") as verUpRep;
        //バージョンアップ報告=1:"要"の場合
        console.log(verUpRepKeyStore)
        if(verUpRepKeyStore && verUpRepKeyStore.verUpRep==1){
          // サーバー通信処理（Api.js内の関数を呼び出し
          try{
            const responseIFA0051 = await IFA0051();
            if(await apiIsError(responseIFA0051)) return;

            await saveToKeystore("verUpRep",{
              verUpRep: 0,
            });
          }catch(error){
            console.log("バージョンアップ報告に失敗しました。:",error);
          }
        }else{
          console.log("keyStoreにバージョンアップ報告が存在しません。");
        }

        //ログイン情報チェック
        const realm = getInstance();
        const loginInfo =  realm.objects('login')[0]
        const currentDateTime = new Date().toISOString().replace(/[^0-9]/g, "").slice(0,8); // yyyyMMddhhmmss形式

        //時分秒を除く日付を突合し確認
        if(loginInfo && (loginInfo.loginDt as string ).replace(/[^0-9]/g, "").slice(0,8)==currentDateTime && loginInfo.logoutFlg=="0"){
          // [位置情報取得間隔]の間隔で位置情報の取得を開始する。
          await watchLocation();
          await logScreen(`画面遷移: WA1040_メニュー`);
          setInitialRoute('WA1040'); // ログイン済みの場合、メニュー画面起動
        }else{
          // realm-ログイン情報・ユーザクリア
          // 特定のデータを検索する
          const userInfo = realm.objects('user')[0];
          // データベースからデータを削除
          realm.write(() => {
            if(loginInfo)realm.delete(loginInfo);
            if(userInfo)realm.delete(userInfo);
          });

          await logScreen(`画面遷移: WA1030_ログイン`);
          setInitialRoute('WA1030'); // アクティベーション情報がない・アクティベージョン済の場合、ログイン画面に設定
        }
      } else {
        await logScreen(`画面遷移: WA1020_アクティベーション`);
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
  const apiIsError = async <T,>(response:ApiResponse<T>):Promise<boolean>=>{
    if (!response.success) {
      switch(response.error){
        case 'codeHttp200':
          await showAlert("通知", messages.EA5004(response.api as string,response.code as string), false);
          break;
        case 'codeRsps01':
          await showAlert("通知", messages.EA5005(response.api as string,response.status as number), false); 
          break;
        case 'timeout':
          await showAlert("通知", messages.EA5003(), false);
          break;
      }
      return true ;
    }else{
      return false;
    }
  }

  // ローディング中は何も表示しない（またはローディングインジケーターを表示）
  // Footerにサーバ名を表示させるため。（表示順序関係）
  if (isLoading) {
    return null;
  }
  return (
    <NavigationContainer>
      <AlertProvider>
        <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName={initialRoute}>
          <Stack.Screen name="WA1020" component={WA1020} />
          <Stack.Screen name="WA1030" component={WA1030} />        
          <Stack.Screen name="WA1040" component={WA1040} />
          <Stack.Screen name="WA1050" component={WA1050} />
          {/* <Stack.Screen name="WA1060" component={WA1060} /> */}
          <Stack.Screen name="WA1070" component={WA1070} />
          <Stack.Screen name="WA1071" component={WA1071} />
          <Stack.Screen name="WA1080" component={WA1080} />
          <Stack.Screen name="WA1081" component={WA1081} />
          {/* <Stack.Screen name="WA1090" component={WA1090} /> */}
          {/* <Stack.Screen name="WA1100" component={WA1100} /> */}
          <Stack.Screen name="WA1110" component={WA1110} />
          <Stack.Screen name="WA1111" component={WA1111} />
          {/* <Stack.Screen name="WA1120" component={WA1120} /> */}
          {/* <Stack.Screen name="WA1130" component={WA1130} /> */}
          {/* <Stack.Screen name="WA1140" component={WA1140} /> */}
        </Stack.Navigator>
      </AlertProvider>
    </NavigationContainer>
  );
};

export default AppNavigator;
