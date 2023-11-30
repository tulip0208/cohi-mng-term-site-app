// app/navigation/AppNavigator.js
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { checkActivation } from '../utils/KeyStore'; // KeyStoreの確認関数（仮
import WA1020 from '../screens/WA1020';
import { onAppLaunch  } from '../utils/Realm'; // Realmのセットアップ関数をインポート


const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState('Main');

  useEffect(() => {
    // アプリ起動時の処理
 
    const initialize = async () => {
      //起動時の初期処理
      await onAppLaunch();
      const isActivate = await checkActivation(); // アクティベーション情報の確認

      if (isActivate) {
        setInitialRoute('WA1020'); // アクティベーション情報がない場合、ログイン画面に設定
      } else {
        setInitialRoute('WA1020'); // アクティベーション情報がない場合、ログイン画面に設定
      }
    };

    initialize();
  }, []);

  return (
//    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="WA1020" component={WA1020} />
        {/*<Stack.Screen name="WA1020" component={WA1020} />*/}
      </Stack.Navigator>
    //</NavigationContainer>
  );
};

export default AppNavigator;
