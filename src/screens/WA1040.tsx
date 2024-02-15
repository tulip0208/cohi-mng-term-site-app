/**-------------------------------------------
 * A01-0040_メニュー
 * WA1040
 * screens/WA1040.tsx
 * ---------------------------------------------*/
import TapFunctionHeader from '../components/TapFunctionHeader'; // Headerコンポーネントのインポート
import Footer from '../components/Footer'; // Footerコンポーネントのインポート
import {styles} from '../styles/CommonStyle'; // 共通スタイル
import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, BackHandler} from 'react-native';
import {getInstance} from '../utils/Realm'; // realm.jsから関数をインポート
import messages from '../utils/messages';
import {logUserAction, logScreen} from '../utils/Log';
import {useAlert} from '../components/AlertContext';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../navigation/AppNavigator';
import {useButton} from '../hook/useButton';
// WA1040 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1040'>;
interface Props {
  navigation: NavigationProp;
}
const WA1040 = ({navigation}: Props) => {
  const [isButtonView, setIsButtonView] = useState<{[key: string]: boolean}>(
    {},
  ); //メニューボタン表示・非表示オブジェクト
  const [isBtnEnabled060, toggleButton060] = useButton(); //ボタン制御
  const [isBtnEnabled070, toggleButton070] = useButton(); //ボタン制御
  const [isBtnEnabled080, toggleButton080] = useButton(); //ボタン制御
  const [isBtnEnabled090, toggleButton090] = useButton(); //ボタン制御
  const [isBtnEnabled100, toggleButton100] = useButton(); //ボタン制御
  const [isBtnEnabled110, toggleButton110] = useButton(); //ボタン制御
  const [isBtnEnabled120, toggleButton120] = useButton(); //ボタン制御
  const [isBtnEnabled130, toggleButton130] = useButton(); //ボタン制御
  const [isBtnEnabled140, toggleButton140] = useButton(); //ボタン制御
  const [isBtnEnabledEnd, toggleButtonEnd] = useButton(); //ボタン制御
  const {showAlert} = useAlert();

  // useEffect フックを使用してステートが変更されるたびにチェック
  useEffect(() => {
    const buttonViews = async () => {
      const realm = getInstance();
      let settings = realm.objects('settings')[0];
      // ボタンの表示設定を確認して、状態を更新する
      const isButtonViewInit = {
        button1: settings.btnNewTagSoil === 1,
        button2: settings.btnRefNewTagSoil === 1,
        button3: settings.btnRefOldTagSoil === 1,
        button4: settings.btnNewTagAsh === 1,
        button5: settings.btnRefNewTagAsh === 1,
        button6: settings.btnRefOldTagAsg === 1,
        button7: settings.btnTrnCard === 1,
        button8: settings.btnUnload === 1,
        button9: settings.btnStat === 1,
        // 他のボタンも同様に追加
      };

      setIsButtonView(isButtonViewInit);
    };
    buttonViews();
  }, []);

  /************************************************
   * 終了ボタン押下時のポップアップ表示
   ************************************************/
  const btnAppClose = async () => {
    //ボタン連続押下制御
    if (!isBtnEnabledEnd) {
      return;
    } else {
      toggleButtonEnd();
    }
    await logUserAction('ボタン押下: WA1040 - 終了');
    const result = await showAlert('確認', messages.IA5001(), true);
    if (result) {
      BackHandler.exitApp();
    }
  };

  const btnNewTagRegSol = async () => {
    //ボタン連続押下制御
    if (!isBtnEnabled060) {
      return;
    } else {
      toggleButton060();
    }
    await logUserAction('ボタン押下: WA1040 - 新タグ紐付(土壌)');
    await logScreen('画面遷移: WA1040 → WA1060_新タグ紐付(土壌)');
    navigation.navigate('WA1060');
  };

  const btnNewTagAsh = async () => {
    //ボタン連続押下制御
    if (!isBtnEnabled090) {
      return;
    } else {
      toggleButton090();
    }
    await logUserAction('ボタン押下: WA1040 - 新タグ紐付(灰)');
    await logScreen('画面遷移: WA1040 → WA1090_新タグ紐付(灰)');
    navigation.navigate('WA1090');
  };

  const btnNewTagRefSol = async () => {
    //ボタン連続押下制御
    if (!isBtnEnabled070) {
      return;
    } else {
      toggleButton070();
    }
    await logUserAction('ボタン押下: WA1040 - 新タグID参照(土壌)');
    await logScreen('画面遷移: WA1040 → WA1070_新タグID参照(土壌)');
    navigation.navigate('WA1070');
  };

  const btnNewTagRefAsh = async () => {
    //ボタン連続押下制御
    if (!isBtnEnabled100) {
      return;
    } else {
      toggleButton100();
    }
    await logUserAction('ボタン押下: WA1040 - 新タグID参照(灰)');
    await logScreen('画面遷移: WA1040 → WA1100_新タグID参照(灰)');
    navigation.navigate('WA1100');
  };

  const btnOldTagRefSol = async () => {
    //ボタン連続押下制御
    if (!isBtnEnabled080) {
      return;
    } else {
      toggleButton080();
    }
    await logUserAction('ボタン押下: WA1040 - 旧タグ参照(土壌)');
    await logScreen('画面遷移: WA1040 → WA1080_旧タグ参照(土壌)');
    navigation.navigate('WA1080');
  };

  const btnOldTagRefAsh = async () => {
    //ボタン連続押下制御
    if (!isBtnEnabled110) {
      return;
    } else {
      toggleButton110();
    }
    await logUserAction('ボタン押下: WA1040 - 旧タグID参照(灰)');
    await logScreen('画面遷移: WA1040 → WA1110_旧タグID参照(灰)');
    navigation.navigate('WA1110');
  };

  const btnTrpCrd = async () => {
    //ボタン連続押下制御
    if (!isBtnEnabled120) {
      return;
    } else {
      toggleButton120();
    }
    await logUserAction('ボタン押下: WA1040 - 輸送カード申請');
    await logScreen('画面遷移: WA1040 → WA1120_輸送カード申請');
    navigation.navigate('WA1120');
  };

  const btnNsReg = async () => {
    //ボタン連続押下制御
    if (!isBtnEnabled130) {
      return;
    } else {
      toggleButton130();
    }
    await logUserAction('ボタン押下: WA1040 - 荷下登録');
    await logScreen('画面遷移: WA1040 → WA1130_荷下登録');
    navigation.navigate('WA1130');
  };

  const btnStyReg = async () => {
    //ボタン連続押下制御
    if (!isBtnEnabled140) {
      return;
    } else {
      toggleButton140();
    }
    await logUserAction('ボタン押下: WA1040 - 定置登録');
    await logScreen('画面遷移: WA1040 → WA1140_定置登録');
    navigation.navigate('WA1140');
  };

  return (
    <View style={styles.container}>
      {/* ヘッダ */}
      <TapFunctionHeader
        appType={'現'}
        viewTitle={'メニュー'}
        functionTitle={''}
        sourceScreenId={'WA1040'}
      />

      {/* 中段 */}
      <View style={[styles.menuMain, styles.topContent]}>
        {isButtonView.button1 && (
          <TouchableOpacity
            disabled={!isBtnEnabled060}
            style={[styles.menuButton, styles.menuButton1]}
            onPress={btnNewTagRegSol}>
            <Text style={styles.menuButtonText1}>新タグ紐付</Text>
            <Text style={styles.menuButtonText1}>(土壌)</Text>
          </TouchableOpacity>
        )}
        {isButtonView.button2 && (
          <TouchableOpacity
            disabled={!isBtnEnabled090}
            style={[styles.menuButton, styles.menuButton2]}
            onPress={btnNewTagAsh}>
            <Text style={styles.menuButtonText1}>新タグ紐付</Text>
            <Text style={styles.menuButtonText1}>(灰)</Text>
          </TouchableOpacity>
        )}
        {isButtonView.button3 && (
          <TouchableOpacity
            disabled={!isBtnEnabled070}
            style={[styles.menuButton, styles.menuButton3]}
            onPress={btnNewTagRefSol}>
            <Text style={styles.menuButtonText1}>新タグ参照</Text>
            <Text style={styles.menuButtonText1}>(土壌)</Text>
          </TouchableOpacity>
        )}
        {isButtonView.button4 && (
          <TouchableOpacity
            disabled={!isBtnEnabled100}
            style={[styles.menuButton, styles.menuButton4]}
            onPress={btnNewTagRefAsh}>
            <Text style={styles.menuButtonText1}>新タグ参照</Text>
            <Text style={styles.menuButtonText1}>(灰)</Text>
          </TouchableOpacity>
        )}
        {isButtonView.button5 && (
          <TouchableOpacity
            disabled={!isBtnEnabled080}
            style={[styles.menuButton, styles.menuButton5]}
            onPress={btnOldTagRefSol}>
            <Text style={styles.menuButtonText1}>旧タグ参照</Text>
            <Text style={styles.menuButtonText1}>(土壌)</Text>
          </TouchableOpacity>
        )}
        {isButtonView.button6 && (
          <TouchableOpacity
            disabled={!isBtnEnabled110}
            style={[styles.menuButton, styles.menuButton6]}
            onPress={btnOldTagRefAsh}>
            <Text style={styles.menuButtonText2}>旧タグ紐付</Text>
            <Text style={styles.menuButtonText2}>(灰)</Text>
          </TouchableOpacity>
        )}
        {isButtonView.button7 && (
          <TouchableOpacity
            disabled={!isBtnEnabled120}
            style={[styles.menuButton, styles.menuButton7]}
            onPress={btnTrpCrd}>
            <Text style={styles.menuButtonText1}>輸送カード</Text>
            <Text style={styles.menuButtonText1}>申請</Text>
          </TouchableOpacity>
        )}
        {isButtonView.button8 && (
          <TouchableOpacity
            disabled={!isBtnEnabled130}
            style={[styles.menuButton, styles.menuButton8]}
            onPress={btnNsReg}>
            <Text style={styles.menuButtonText1}>荷下登録</Text>
          </TouchableOpacity>
        )}
        {isButtonView.button9 && (
          <TouchableOpacity
            disabled={!isBtnEnabled140}
            style={[styles.menuButton, styles.menuButton9]}
            onPress={btnStyReg}>
            <Text style={styles.menuButtonText2}>定置登録</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 下段 */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          disabled={!isBtnEnabledEnd}
          style={[styles.button, styles.endButtonSmall]}
          onPress={btnAppClose}>
          <Text style={styles.endButtonText}>終了</Text>
        </TouchableOpacity>
      </View>

      {/* フッタ */}
      <Footer />
    </View>
  );
};
export default WA1040;
