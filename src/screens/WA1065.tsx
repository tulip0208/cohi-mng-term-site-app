/**-------------------------------------------
 * A01-0060_新タグID参照(土壌)
 * WA1065
 * screens/WA1065.tsx
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
  WA1061BackState,
  WA1060PrevScreenId,
  WA1060NewTagIdState,
  WA1060OldTagInfosState,
  WA1063MemoAutoState,
  WA1065MemoState,
} from '../atom/atom.tsx';
import {useAlert} from '../components/AlertContext.tsx';
import messages from '../utils/messages.tsx';
import ProcessingModal from '../components/Modal.tsx';
import {NativeModules} from 'react-native';
import {useButton} from '../hook/useButton.tsx';
const {JISInputFilter} = NativeModules;
// WA1065 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1065'>;
interface Props {
  navigation: NavigationProp;
}
const WA1065 = ({navigation}: Props) => {
  const [lnkNewTagDatMem, setLnkNewTagDatMem] = useState<string>(''); // メモ
  const [modalVisible, setModalVisible] = useState<boolean>(false); //処理中モーダルの状態
  const [inputLimit, setInputLimit] = useState<number>(400); // メモ文字数
  const newTagId = useRecoilValue(WA1060NewTagIdState); // Recoil 新タグID
  const WA1060OldTagInfos = useRecoilValue(WA1060OldTagInfosState); // Recoil 旧タグ情報
  const WA1063MemoAuto = useRecoilValue(WA1063MemoAutoState); // Recoil メモ自動
  const [prevScreenId, setPrevScreenId] = useRecoilState(WA1060PrevScreenId); // Recoil 遷移元画面ID
  const [WA1065Memo, setWA1065Memo] = useRecoilState(WA1065MemoState); // Recoil メモ
  const setBack = useSetRecoilState(WA1061BackState); // Recoil 戻る
  const [isBtnEnabledDel, toggleButtonDel] = useButton(); //ボタン制御
  const [isBtnEnabledBck, toggleButtonBck] = useButton(); //ボタン制御
  const [isBtnEnabledNxt, toggleButtonNxt] = useButton(); //ボタン制御
  const {showAlert} = useAlert();

  /************************************************
   * 初期表示設定
   ************************************************/
  useEffect(() => {
    if (WA1063MemoAuto) {
      //文字数：400-一時記憶メモ字数を表示
      setInputLimit(400 - WA1063MemoAuto.length);
    }
    if (WA1065Memo) {
      //メモ：一時記憶メモを表示
      setLnkNewTagDatMem(WA1065Memo);
    }
  }, []);

  /************************************************
   * 破棄ボタン処理
   ************************************************/
  const btnAppDestroy = async () => {
    //ボタン連続押下制御
    if (!isBtnEnabledDel) {
      return;
    } else {
      toggleButtonDel();
    }
    await logUserAction('ボタン押下: WA1065 - 破棄');
    const result = await showAlert('確認', messages.IA5012(), true);
    if (result) {
      setBack(true);
      setPrevScreenId('WA1040');
      await logScreen('画面遷移: WA1065 → WA1060_新タグ読込(土壌)');
      navigation.navigate('WA1060');
    }
  };

  /************************************************
   * 戻るボタン処理
   ************************************************/
  const btnAppBack = async () => {
    //ボタン連続押下制御
    if (!isBtnEnabledBck) {
      return;
    } else {
      toggleButtonBck();
    }
    await logUserAction('ボタン押下: WA1065 - 戻る');
    if (prevScreenId === 'WA1066') {
      //遷移元画面IDを設定
      setPrevScreenId('WA1065');
      await logScreen('画面遷移: WA1065 → WA1066_登録内容確認(土壌)');
      navigation.navigate('WA1066');
    } else {
      const result = await showAlert('確認', messages.IA5014(), true);
      if (result) {
        // 一時領域をクリアする
        setWA1065Memo(''); //メモ
        //遷移元画面IDを設定
        setPrevScreenId('WA1065');
        await logScreen('画面遷移: WA1065 → WA1064_重量・線量(土壌)');
        navigation.navigate('WA1064');
      }
    }
  };

  /************************************************
   * 次へボタン処理
   ************************************************/
  const btnAppNext = async () => {
    //ボタン連続押下制御
    if (!isBtnEnabledNxt) {
      return;
    } else {
      toggleButtonNxt();
    }
    await logUserAction('ボタン押下: WA1065 - 次へ');
    // 一時領域に設定する
    setWA1065Memo(lnkNewTagDatMem); //メモ
    //遷移元画面IDを設定
    setPrevScreenId('WA1065');
    await logScreen('画面遷移: WA1065 → WA1066_登録内容確認(土壌)');
    navigation.navigate('WA1066');
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
          functionTitle={'紐付(土)'}
        />

        {/* 上段 */}
        <View style={[styles.topContent]}>
          <View style={[styles.main]}>
            <Text
              style={[styles.labelText, styles.bold, styles.labelTextOver]}
              numberOfLines={1}
              ellipsizeMode="tail">
              新タグID：{newTagId}
            </Text>
            <Text
              style={[styles.labelText, styles.bold, styles.labelTextOver]}
              numberOfLines={1}
              ellipsizeMode="tail">
              旧タグ数：{WA1060OldTagInfos.length}
            </Text>
            <Text style={[styles.labelText, styles.centerContent]}>
              メモを入力して下さい。
            </Text>
            <Text style={[styles.labelText, styles.centerContent]}>
              メモ(省略可){inputLimit}文字まで：
            </Text>
          </View>

          <View style={[styles.middleContent, styles.justifyContentCenter]}>
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
            disabled={!isBtnEnabledDel}
            style={[styles.button, styles.destroyButton]}
            onPress={btnAppDestroy}>
            <Text style={styles.endButtonText}>破棄</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={!isBtnEnabledBck}
            style={[styles.button, styles.endButton]}
            onPress={btnAppBack}>
            <Text style={styles.endButtonText}>戻る</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={!isBtnEnabledNxt}
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
export default WA1065;
