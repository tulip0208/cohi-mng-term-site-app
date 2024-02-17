/**-------------------------------------------
 * A01-0090_新タグ紐付(灰)
 * WA1091
 * screens/WA1091.tsx
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
import {useSetRecoilState, useRecoilValue} from 'recoil';
import {
  WA1091BackState,
  WA1090PrevScreenId,
  WA1090NewTagIdState,
  WA1090WkPlacState,
  WA1091OldTagInfoState,
} from '../atom/atom.tsx';
import {useAlert} from '../components/AlertContext.tsx';
import messages from '../utils/messages.tsx';
import ProcessingModal from '../components/Modal.tsx';
import {IFA0320} from '../utils/Api.tsx';
import {
  ApiResponse,
  IFA0320Response,
  IFA0320ResponseDtl,
} from '../types/type.tsx';
import {useButton} from '../hook/useButton.tsx';
// WA1091 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1091'>;
interface Props {
  navigation: NavigationProp;
}
const WA1091 = ({navigation}: Props) => {
  const [inputValue, setInputValue] = useState<string>(''); //旧タグID入力値
  const [modalVisible, setModalVisible] = useState<boolean>(false); //処理中モーダルの状態
  const [isNext, setIsNext] = useState<boolean>(false); //次へボタンのスタイル 活性・非活性
  const newTagId = useRecoilValue(WA1090NewTagIdState); // Recoil 新タグID
  const WA1090WkPlac = useRecoilValue(WA1090WkPlacState); // Recoil 作業場所情報
  const setPrevScreenId = useSetRecoilState(WA1090PrevScreenId); // Recoil 遷移元画面ID
  const setBack = useSetRecoilState(WA1091BackState); // Recoil 戻る
  const setWA1091OldTagInfo = useSetRecoilState(WA1091OldTagInfoState); // Recoil 旧タグID情報
  const [isBtnEnabledDel, toggleButtonDel] = useButton(); //ボタン制御
  const [isBtnEnabledBck, toggleButtonBck] = useButton(); //ボタン制御
  const [isBtnEnabledNxt, toggleButtonNxt] = useButton(); //ボタン制御
  const {showAlert} = useAlert();

  /************************************************
   * 初期表示設定
   ************************************************/
  useEffect(() => {}, []);

  // 入力値が変更されたときのハンドラー
  const handleInputChange = (text: string) => {
    setInputValue(text);
  };

  // 入力がフォーカスアウトされたときのハンドラー
  const handleInputBlur = async () => {
    // 入力値が空かどうかによってブール値ステートを更新
    setIsNext(inputValue !== '');
  };

  // 次へボタンのスタイルを動的に変更するための関数
  const getNextButtonStyle = () => {
    return isNext
      ? [styles.button, styles.startButton]
      : [styles.button, styles.startButton, styles.disabledButton];
  };

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
    await logUserAction('ボタン押下: WA1091 - 破棄');
    const result = await showAlert('確認', messages.IA5012(), true);
    if (result) {
      setBack(true);
      setPrevScreenId('WA1040');
      await logScreen('画面遷移: WA1091 → WA1090_新タグ読込(灰)');
      navigation.navigate('WA1090');
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
    await logUserAction('ボタン押下: WA1091 - 戻る');
    const result = await showAlert('確認', messages.IA5014(), true);
    if (result) {
      // 一時領域をクリアする
      setWA1091OldTagInfo({
        oldTagId: '', //旧タグID
        ashTyp: '', // 焼却灰種別、半角英数字
        meaRa: '', // 測定濃度（焼却時）、半角数値
        conRa: '', // 換算濃度（焼却時）、半角数値
        surDsRt: '', // 表面線量率（焼却時）、半角数値（オプショナル）
        surDsDt: '', // 表面線量率測定日（焼却時）、日付（オプショナル）
        surDsWt: '', // 表面線量率測定時重量（焼却時）、半角数値（オプショナル）
      }); //旧タグ由来情報
      //遷移元画面IDを設定
      setPrevScreenId('WA1091');
      await logScreen('画面遷移: WA1091 → WA1090_新タグ読込(灰)');
      navigation.navigate('WA1090');
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
    await logUserAction('ボタン押下: WA1091 - 次へ');
    setModalVisible(true);
    // 通信を実施
    const responseIFA0320 = await IFA0320(inputValue, WA1090WkPlac.wkplacId);
    if (await apiIsError(responseIFA0320)) {
      return;
    }
    const data = responseIFA0320.data as IFA0320Response<IFA0320ResponseDtl>;
    const dataDtl = data.dtl[0] as IFA0320ResponseDtl;
    // 一時データ格納する
    setWA1091OldTagInfo({
      oldTagId: String(inputValue),
      ashTyp: String(dataDtl.ashTyp),
      meaRa: String(dataDtl.meaRa),
      conRa: String(dataDtl.conRa),
      surDsRt: String(dataDtl.surDsRt),
      surDsDt: String(dataDtl.surDsDt),
      surDsWt: String(dataDtl.surDsWt),
    });
    //遷移元画面IDを設定
    setPrevScreenId('WA1091');
    await logScreen('画面遷移: WA1091 → WA1092_必須情報入力(灰)');
    navigation.navigate('WA1092');
  };

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
        case 'zero': //取得件数0件の場合
          await showAlert('通知', messages.EA5012(), false);
          break;
      }
      return true;
    } else {
      return false;
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
          viewTitle={'旧タグ入力'}
          functionTitle={'紐付(灰)'}
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
          </View>

          <View style={[styles.main, styles.center, styles.middleContainer]}>
            <Text style={styles.labelText}>旧タグIDを入力して下さい。</Text>
            <View style={[styles.inputContainer]}>
              <TextInput
                testID="text0"
                style={styles.input}
                onChangeText={handleInputChange}
                onBlur={handleInputBlur}
                value={inputValue}
                editable={true}
                maxLength={50}
              />
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
            style={getNextButtonStyle()}
            onPress={btnAppNext}
            disabled={!isNext || !isBtnEnabledNxt}>
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
export default WA1091;
