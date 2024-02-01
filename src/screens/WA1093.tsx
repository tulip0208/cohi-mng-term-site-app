/**-------------------------------------------
 * A01-0090_新タグ紐付(灰)
 * WA1093
 * screens/WA1093.tsx
 * ---------------------------------------------*/
import FunctionHeader from '../components/FunctionHeader.tsx'; // Headerコンポーネントのインポート
import Footer from '../components/Footer.tsx'; // Footerコンポーネントのインポート
import {styles} from '../styles/CommonStyle.tsx'; // 共通スタイル
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import {logUserAction, logScreen} from '../utils/Log.tsx';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../navigation/AppNavigator.tsx';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {
  WA1091BackState,
  WA1090PrevScreenId,
  WA1090NewTagIdState,
  WA1091OldTagInfoState,
  WA1093MemoState,
} from '../atom/atom.tsx';
import {useAlert} from '../components/AlertContext.tsx';
import messages from '../utils/messages.tsx';
import ProcessingModal from '../components/Modal.tsx';
import {NativeModules} from 'react-native';
const {JISInputFilter} = NativeModules;
// WA1093 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1093'>;
interface Props {
  navigation: NavigationProp;
}
const WA1093 = ({navigation}: Props) => {
  const [lnkNewTagDatMem, setLnkNewTagDatMem] = useState<string>(''); // メモ
  const [modalVisible, setModalVisible] = useState<boolean>(false); //処理中モーダルの状態
  const [inputLimit, setInputLimit] = useState<number>(400); // メモ文字数
  const newTagId = useRecoilValue(WA1090NewTagIdState); // Recoil 新タグID
  const WA1091OldTagInfo = useRecoilValue(WA1091OldTagInfoState); // Recoil 旧タグ情報
  const [prevScreenId, setPrevScreenId] = useRecoilState(WA1090PrevScreenId); // Recoil 遷移元画面ID
  const [WA1093Memo, setWA1093Memo] = useRecoilState(WA1093MemoState); // Recoil メモ
  const setBack = useSetRecoilState(WA1091BackState); // Recoil 戻る
  const {showAlert} = useAlert();

  /************************************************
   * 初期表示設定
   ************************************************/
  useEffect(() => {
    if (WA1093Memo) {
      //メモ：一時記憶メモを表示
      setLnkNewTagDatMem(WA1093Memo);
    }
  }, []);

  /************************************************
   * 破棄ボタン処理
   ************************************************/
  const btnAppDestroy = async () => {
    await logUserAction('ボタン押下: 破棄(WA1093)');
    const result = await showAlert('確認', messages.IA5012(), true);
    if (result) {
      setBack(true);
      setPrevScreenId('WA1040');
      await logScreen('画面遷移:WA1090_新タグ読込(灰)');
      navigation.navigate('WA1090');
    }
  };

  /************************************************
   * 戻るボタン処理
   ************************************************/
  const btnAppBack = async () => {
    await logUserAction('ボタン押下: 戻る(WA1093)');
    if (prevScreenId === 'WA1094') {
      //遷移元画面IDを設定
      setPrevScreenId('WA1093');
      await logScreen('画面遷移:WA1094_登録内容確認(灰)');
      navigation.navigate('WA1094');
    } else {
      const result = await showAlert('確認', messages.IA5014(), true);
      if (result) {
        // 一時領域をクリアする
        setWA1093Memo(''); //メモ
        //遷移元画面IDを設定
        setPrevScreenId('WA1093');
        await logScreen('画面遷移:WA1092_重量・線量(土壌)');
        navigation.navigate('WA1092');
      }
    }
  };

  /************************************************
   * 次へボタン処理
   ************************************************/
  const btnAppNext = async () => {
    await logUserAction('ボタン押下: 次へ(WA1093)');
    // 一時領域に設定する
    setWA1093Memo(lnkNewTagDatMem); //メモ
    //遷移元画面IDを設定
    setPrevScreenId('WA1093');
    await logScreen('画面遷移:WA1094_登録内容確認(灰)');
    navigation.navigate('WA1094');
  };

  /************************************************
   * 文字フィルタリング
   * JIS第一水準、JIS第二水準に含まれない場合、入力された文字を無効
   ************************************************/
  // 入力されたときのハンドラー
  const handleInputChange = async (newText: string) => {
    try {
      if (newText == null) {
        setLnkNewTagDatMem('');
      }
      let filteredText: string = await JISInputFilter.checkJISText(newText);
      if (!filteredText) {
        filteredText = '';
      }
      setLnkNewTagDatMem(filteredText);
      setInputLimit(400 - filteredText.length); //残文字数リアルタイム変動
    } catch (error) {
      console.error(error);
    }
  };

  // 入力がフォーカスアウトされたときのハンドラー
  const filterText = async () => {
    try {
      if (lnkNewTagDatMem == null) {
        setLnkNewTagDatMem('');
      }
      let filteredText: string = await JISInputFilter.checkJISText(
        lnkNewTagDatMem,
      );
      if (!filteredText) {
        filteredText = '';
      }
      setLnkNewTagDatMem(filteredText);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={'padding'}
      style={styles.flex1}
      keyboardVerticalOffset={0}>
      <ScrollView
        contentContainerStyle={[styles.containerWithKeybord, styles.flexGrow1]}>
        {/* ヘッダ */}
        <FunctionHeader
          appType={'現'}
          viewTitle={'メモ入力'}
          functionTitle={'紐付(灰)'}
        />

        {/* 上段 */}
        <View style={[styles.topContent]}>
          <View style={[styles.main]}>
            <Text style={[styles.labelText, styles.bold]}>
              新タグID：{newTagId}
            </Text>
            <Text style={[styles.labelText, styles.bold]}>
              旧タグID：{WA1091OldTagInfo.oldTagId}
            </Text>
            <Text style={[styles.labelText, styles.centerContent]}>
              メモを入力して下さい。
            </Text>
            <Text style={[styles.labelText, styles.centerContent]}>
              メモ(省略可){inputLimit}文字まで：
            </Text>
          </View>

          <View style={[styles.middleContent]}>
            <View style={[styles.inputReasonScrollContainer]}>
              <ScrollView
                contentContainerStyle={[styles.inputReasonScrollViewStyle]}
                showsVerticalScrollIndicator={true}>
                <TextInput
                  multiline={true}
                  onChangeText={handleInputChange}
                  onBlur={filterText}
                  value={lnkNewTagDatMem}
                  style={[styles.inputReason, styles.textAreaInput]}
                />
              </ScrollView>
            </View>
          </View>
        </View>

        {/* 下段 */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.button, styles.destroyButton]}
            onPress={btnAppDestroy}>
            <Text style={styles.endButtonText}>破棄</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.endButton]}
            onPress={btnAppBack}>
            <Text style={styles.endButtonText}>戻る</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={btnAppNext}>
            <Text style={styles.startButtonText}>次へ</Text>
          </TouchableOpacity>
        </View>

        {/* フッタ */}
        <Footer />

        {/* 処理中モーダル */}
        <ProcessingModal
          visible={modalVisible}
          message={messages.IA5018()}
          onClose={() => setModalVisible(false)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
export default WA1093;
