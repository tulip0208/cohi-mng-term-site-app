// app/navigation/AppNavigator.js
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { checkActivation,loadFromKeystore } from '../utils/KeyStore'; // KeyStoreの確認関数
import WA1020 from '../screens/WA1020';
import WA1030 from '../screens/WA1030';
import WA1040 from '../screens/WA1040';
import { Text } from 'react-native';
import { onAppLaunch,getInstance } from '../utils/Realm'; // Realmのセットアップ関数をインポート
import { sendToServer } from '../utils/Api'; 

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState('Main');
  const [isLoading, setIsLoading] = useState(true); // ローディング状態の追加

  useEffect(() => {
    // アプリ起動時の処理
 
    const initialize = async () => {
      //起動時の初期処理
      await onAppLaunch();
      // アクティベーション情報の確認
      const activationInfo = await checkActivation(); 
      if (!activationInfo || activationInfo.actFin == 1) {
        //バージョンアップ報告チェック
        const verupRepKeyStore=await loadFromKeystore("verupRep");//★バージョンアップ報告の物理名不明
        //バージョンアップ報告=1:"要"の場合
        if(verupRepKeyStore && verupRepKeyStore.verupRep==="1"){
          // サーバー通信処理（Api.js内の関数を呼び出し）
          try{
            const response = await IFA0051();
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
        const loginInfo = realm.objects('login')[0]
        const currentDateTime = new Date().toISOString().replace(/[^0-9]/g, "").slice(0,14); // yyyyMMddhhmmss形式
        console.log('currentDateTime : ',currentDateTime )
        if(loginInfo && loginInfo.loginDt==currentDateTime && loginInfo.logoutFlg=="0"){
          const settingsInfo = realm.objects('settings')[0]
          // ★位置情報取得
          //
          console.log("メニュー画面起動")
          setInitialRoute('WA1040'); // ログイン済みの場合、メニュー画面起動
        }
        // realm-ログイン情報・ユーザクリア
        // 特定のデータを検索する
        const userInfo = realm.objects('user')[0];
        // データベースからデータを削除
        realm.write(() => {
          if(loginInfo)realm.delete(loginInfo);
          if(userInfo)realm.delete(userInfo);
        });
        console.log("ログイン画面起動")

        setInitialRoute('WA1030'); // アクティベーション情報がない・アクティベージョン済の場合、ログイン画面に設定
      } else {
        console.log("アクティベーション画面起動")
        setInitialRoute('WA1020'); // アクティベーション画面へ遷移
      }
      setIsLoading(false); // ローディング完了

    };

    initialize();
  }, []);
  // ローディング中は何も表示しない（またはローディングインジケーターを表示）
  // Footerにサーバ名を表示させるため。（表示順序関係）
  if (isLoading) {
    return null;//<Text>Loading...</Text>;
  }
  return (
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="WA1020" component={WA1020} />
        <Stack.Screen name="WA1030" component={WA1030} />        
        <Stack.Screen name="WA1040" component={WA1040} />
        {/*<Stack.Screen name="WA1020" component={WA1020} />*/}
      </Stack.Navigator>
  );
};

export default AppNavigator;
