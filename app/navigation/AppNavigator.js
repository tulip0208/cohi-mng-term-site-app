// app/navigation/AppNavigator.js
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { checkActivation } from '../utils/KeyStore'; // KeyStoreの確認関数（仮
import WA1020 from '../screens/WA1020';
import WA1030 from '../screens/WA1030';
import { onAppLaunch  } from '../utils/Realm'; // Realmのセットアップ関数をインポート


const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState('Main');

  useEffect(() => {
    // アプリ起動時の処理
 
    const initialize = async () => {
      //起動時の初期処理
      await onAppLaunch();
      const activationInfo = await checkActivation(); // アクティベーション情報の確認
      if (!activationInfo || JSON.parse(activationInfo).actFin == 1) {
        console.log("ログイン画面起動")
        setInitialRoute('WA1030'); // アクティベーション情報がない・アクティベージョン済の場合、ログイン画面に設定
      } else {
        console.log("アクティベーション画面起動")
        setInitialRoute('WA1020'); // アクティベーション画面へ遷移
      }
    };

    initialize();
  }, []);

  return (
//    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="WA1030" component={WA1030} />        
        <Stack.Screen name="WA1020" component={WA1020} />

        {/*<Stack.Screen name="WA1020" component={WA1020} />*/}
      </Stack.Navigator>
    //</NavigationContainer>
  );
};

export default AppNavigator;
