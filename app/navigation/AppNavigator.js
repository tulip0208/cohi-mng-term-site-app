/**-------------------------------------------
 * 画面遷移
 * 
 * ---------------------------------------------*/
// app/navigation/AppNavigator.js
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { checkActivation,loadFromKeystore,saveToKeystore,getEncryptionKeyFromKeystore,clearKeyStore } from '../utils/KeyStore'; // KeyStoreの確認関数
import WA1020 from '../screens/WA1020';
import WA1030 from '../screens/WA1030';
import WA1040 from '../screens/WA1040';
import WA1050 from '../screens/WA1050';
import WA1060 from '../screens/WA1060';
import WA1070 from '../screens/WA1070';
import WA1080 from '../screens/WA1080';
import WA1090 from '../screens/WA1090';
import WA1100 from '../screens/WA1100';
import WA1110 from '../screens/WA1110';
import WA1120 from '../screens/WA1120';
import WA1130 from '../screens/WA1130';
import WA1140 from '../screens/WA1140';
import { Text } from 'react-native';
import { onAppLaunch,getInstance } from '../utils/Realm'; // Realmのセットアップ関数をインポート
import { sendToServer,IFA0051 } from '../utils/Api'; 
import { initializeLogFile, logUserAction, logCommunication, watchPosition, logScreen } from '../utils/Log';
import { AlertProvider } from '../components/AlertContext';
import { watchLocation } from '../utils/Position'; 
const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState('Main');
  const [isLoading, setIsLoading] = useState(true); // ローディング状態の追加

  useEffect(() => {
    // アプリ起動時の処理
    // ログファイル初期化
    initializeLogFile();

    const initialize = async () => {
      //起動時の初期処理
      await onAppLaunch();

      //--------WA1020_前処理--------
      // アクティベーション情報の確認
      const activationInfo = await checkActivation(); 
      
      if (activationInfo && activationInfo.actFin == 1) {
        
        //--------WA1030_前処理--------

        //バージョンアップ報告チェック
        const verupRepKeyStore=await loadFromKeystore("verupRep");//★バージョンアップ報告の物理名不明
        //バージョンアップ報告=1:"要"の場合
        if(verupRepKeyStore && verupRepKeyStore.verupRep==="1"){
          // サーバー通信処理（Api.js内の関数を呼び出し）
          try{
            const responseIFA0051 = await IFA0051();
            if(await apiIsError(responseIFA0051)) return;

            await saveToKeystore("verupRep",{
              verupRep: "0",
            });//★バージョンアップ報告の物理名不明
          }catch(error){
            console.log("バージョンアップ報告に失敗しました。:",error);
          }
        }else{
          console.log("keyStoreにバージョンアップ報告が存在しません。");
        }
        //ログイン情報チェック
        const realm = await getInstance();
        const loginInfo = await realm.objects('login')[0]
        const currentDateTime = new Date().toISOString().replace(/[^0-9]/g, "").slice(0,8); // yyyyMMddhhmmss形式

        //時分秒を除く日付を突合し確認
        if(loginInfo && loginInfo.loginDt.replace(/[^0-9]/g, "").slice(0,8)==currentDateTime && loginInfo.logoutFlg=="0"){
          const settingsInfo = realm.objects('settings')[0]
          // ★位置情報取得し、設定ファイルへ？1040前処理(Position.js処理にて。要確認)
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
  // ローディング中は何も表示しない（またはローディングインジケーターを表示）
  // Footerにサーバ名を表示させるため。（表示順序関係）
  if (isLoading) {
    return null;
  }
  return (
    <AlertProvider>
      <Stack.Navigator   screenOptions={{headerShown: false}}initialRouteName={initialRoute}>
        <Stack.Screen name="WA1020" component={WA1020} />
        <Stack.Screen name="WA1030" component={WA1030} />        
        <Stack.Screen name="WA1040" component={WA1040} />
        <Stack.Screen name="WA1050" component={WA1050} />
        <Stack.Screen name="WA1060" component={WA1060} />
        <Stack.Screen name="WA1070" component={WA1070} />
        <Stack.Screen name="WA1080" component={WA1080} />
        <Stack.Screen name="WA1090" component={WA1090} />
        <Stack.Screen name="WA1100" component={WA1100} />
        <Stack.Screen name="WA1110" component={WA1110} />                                                        
        <Stack.Screen name="WA1120" component={WA1120} />
        <Stack.Screen name="WA1130" component={WA1130} />                
        <Stack.Screen name="WA1140" component={WA1140} />        
        {/*<Stack.Screen name="WA1020" component={WA1020} />*/}
      </Stack.Navigator>
    </AlertProvider>
  );
};

export default AppNavigator;
