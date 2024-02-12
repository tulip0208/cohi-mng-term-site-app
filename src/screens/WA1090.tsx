/**-------------------------------------------
 * A01-0090_新タグ紐付(灰)
 * WA1090
 * screens/WA1090.tsx
 * ---------------------------------------------*/
import FunctionHeader from '../components/FunctionHeader.tsx'; // Headerコンポーネントのインポート
import Footer from '../components/Footer.tsx'; // Footerコンポーネントのインポート
import {styles} from '../styles/CommonStyle.tsx'; // 共通スタイル
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import {getInstance} from '../utils/Realm.tsx'; // realm.jsから関数をインポート
import messages from '../utils/messages.tsx';
import QRScanner from '../utils/QRScanner.tsx';
import ProcessingModal from '../components/Modal.tsx';
import {logUserAction, logScreen} from '../utils/Log.tsx';
import {useAlert} from '../components/AlertContext.tsx';
import {IFA0340} from '../utils/Api.tsx';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../navigation/AppNavigator.tsx';
import {
  ApiResponse,
  IFA0340Response,
  IFA0340ResponseDtl,
} from '../types/type.tsx';
import {useRecoilState, useResetRecoilState, useSetRecoilState} from 'recoil';
import {
  WA1090PrevScreenId,
  WA1092WtDsState,
  WA1091BackState,
  WA1090NewTagIdState,
  WA1091OldTagInfoState,
  WA1090WkPlacState,
  WA1093MemoState,
  WA1090KbnState,
} from '../atom/atom.tsx';

// WA1090 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1090'>;
interface Props {
  navigation: NavigationProp;
}
const WA1090 = ({navigation}: Props) => {
  const [wkplcTyp, setWkplcTyp] = useState<string>(''); //作業場所種類
  const [wkplc, setWkplc] = useState<string>(''); // 作業場所
  const [inputValue, setInputValue] = useState<string>(''); //新タグID入力値
  const [modalVisible, setModalVisible] = useState<boolean>(false); //処理中モーダルの状態
  const [showScannerTag, setShowScannerTag] = useState<boolean>(false); // カメラ表示用の状態
  const [inputVisible, setInputVisible] = useState<boolean>(false); // 新タグ欄入力値 表示・非表示
  const [isNext, setIsNext] = useState<boolean>(false); // 送信準備完了状態
  const [isViewNextButton, setIsViewNextButton] = useState<boolean>(false); // 次へボタン 表示・非表示
  const [isCannotRead, setIsCannotRead] = useState<boolean>(false); // 新タグID読み取りメッセージ
  const [showScannerWkPlc, setShowScannerWkPlc] = useState<boolean>(false); // カメラ表示用の状態
  const [isTagRead, setIsTagRead] = useState<boolean>(false); // 送信準備完了状態
  const [isWkPlcRead, setIsWkPlcRead] = useState<boolean>(false); // タグ読込
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null,
  ); //長押しタグ表示用
  const [back, setBack] = useRecoilState(WA1091BackState); //Recoil 戻る
  const [prevScreenId, setPrevScreenId] = useRecoilState(WA1090PrevScreenId); //遷移元画面ID
  const setNewTagId = useSetRecoilState(WA1090NewTagIdState); //Recoil 新タグID
  const setWA1090WkPlac = useSetRecoilState(WA1090WkPlacState); // Recoil 作業場所情報
  const setKbn = useSetRecoilState(WA1090KbnState); // Recoil 遷移元画面ID
  const resetWA1092WtDsState = useResetRecoilState(WA1092WtDsState); //Recoilリセット
  const resetWA1090NewTagId = useResetRecoilState(WA1090NewTagIdState); //Recoilリセット
  const resetWA1091OldTagInfo = useResetRecoilState(WA1091OldTagInfoState); //Recoilリセット
  const resetWA1090WkPlac = useResetRecoilState(WA1090WkPlacState); //Recoilリセット
  const resetWA1093Memo = useResetRecoilState(WA1093MemoState); //Recoilリセット
  const {showAlert} = useAlert();
  /************************************************
   * 初期表示設定
   ************************************************/
  //初期処理
  useEffect(() => {
    if (prevScreenId && prevScreenId === 'WA1040') {
      reset();
    }
    contentsViews();
  }, []);

  useEffect(() => {
    if (prevScreenId && prevScreenId === 'WA1040') {
      reset();
    }
    setBack(false);
    contentsViews();
  }, [back]);

  // 画面表示前処理
  const contentsViews = async () => {
    const realm = getInstance();
    const loginInfo = realm.objects('login')[0];
    let place;
    switch (loginInfo.wkplacTyp) {
      case 4:
        place = realm.objects('temporary_places')[0];
        setWkplcTyp('仮置場');
        setWA1090WkPlac({
          idTyp: '4', //ID種別
          wkplacId: place.tmpPlacId as string, //作業場所ID
          wkplacNm: place.tmpPlacNm as string, //作業場所名
          delSrcTyp: place.delSrcTyp as string, //搬出元種別
          wkplac: wkplcTyp, //作業場所
        });
        setWkplc(place.tmpPlacNm as string);
        setIsTagRead(true);
        break;
      default:
        setIsTagRead(false);
        await showAlert('通知', messages.WA5001(), false);
        break;
    }
  };
  // 値の初期化
  const reset = () => {
    resetWA1092WtDsState();
    resetWA1091OldTagInfo();
    resetWA1090NewTagId();
    resetWA1090WkPlac();
    resetWA1093Memo();
    setIsTagRead(false);
    setIsWkPlcRead(false);
    setPrevScreenId('WA1090');
    setIsCannotRead(false);
    setInputVisible(false);
    setInputValue('');
    setIsViewNextButton(false);
    setWkplc('');
    setWkplcTyp('');
    contentsViews();
    setIsNext(true);
  };

  // 10秒以上の長押しを検出
  const onPressIn = () => {
    // 10秒後に実行されるアクション
    const timer = setTimeout(() => {
      setInputVisible(true);
      setIsNext(false);
      setIsCannotRead(true);
      setIsViewNextButton(true);
    }, 10000); // 10秒 = 10000ミリ秒
    setLongPressTimer(timer); // タイマーIDを保存
  };

  // タッチ終了時のイベントハンドラ
  const onPressOut = () => {
    // タイマーが設定されていればクリア
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null); // タイマーIDをクリア
    }
  };

  // 次へボタンのスタイルを動的に変更するための関数
  const getNextButtonStyle = () => {
    return isNext
      ? [styles.button, styles.startButton]
      : [styles.button, styles.startButton, styles.disabledButton];
  };

  // タグ読込ボタンのスタイルを動的に変更するための関数
  const getTagReadButtonStyle = () => {
    return isTagRead
      ? [styles.button, styles.buttonSmall, styles.centerButton]
      : [
          styles.button,
          styles.buttonSmall,
          styles.centerButton,
          styles.disabledButton,
        ];
  };

  // テキストボックスのスタイルを動的に変更するための関数
  const getTextInputStyle = () => {
    return isWkPlcRead ? styles.input : [styles.input, styles.inputDisabled];
  };

  // 新タグID読み取りメッセージ
  const getInfoMsg = () => {
    return isCannotRead
      ? '新タグIDが読み込めない場合：'
      : '新タグIDが読み込めない場合はここを長押しして下さい。';
  };

  // 入力値が変更されたときのハンドラー
  const handleInputChange = (text: string) => {
    setInputValue(text);
  };

  // 入力がフォーカスアウトされたときのハンドラー
  const handleInputBlur = async () => {
    // 入力値が空かどうかによってブール値ステートを更新
    setIsNext(inputValue !== '');
    // 正規表現チェック
    if (!checkFormat(inputValue)) {
      await showAlert('通知', messages.EA5017(inputValue), false);
      setIsNext(false);
      return;
    }
  };

  /************************************************
   * コードスキャン後の処理 (作業場所用)
   * @param param0
   * @returns
   ************************************************/
  const handleCodeScannedForWkPlc = async (data: string) => {
    const parts = data.split(',');
    setShowScannerWkPlc(false);
    if (parts[0] !== '4') {
      await showAlert('通知', messages.EA5007(), false);
      return;
    }
    setWkplcTyp('仮置場');
    setWA1090WkPlac({
      idTyp: parts[0], //ID種別
      wkplacId: parts[1], //作業場所ID
      wkplacNm: parts[2], //作業場所名
      delSrcTyp: parts[3], //搬出元種別
      wkplac: wkplcTyp,
    });
    setWkplc(parts[2]);

    setIsTagRead(true);
    setIsWkPlcRead(true);
  };

  // 作業場所コードスキャンボタン押下時の処理
  const btnWkPlcQr = async () => {
    await logUserAction('ボタン押下: WA1090 - 作業場所読込');
    setShowScannerWkPlc(true);
  };

  /************************************************
   * フォーマットチェック
   ************************************************/
  const checkFormat = (data: string) => {
    const pattern = /^[0-9][2-5][0-9]0[0-9]{11}$/;
    return pattern.test(data);
  };

  /************************************************
   * コードスキャン後の処理 (タグ用)
   * @param param0
   * @returns
   ************************************************/
  const handleCodeScannedForTag = async (data: string, type: string) => {
    setShowScannerTag(false);
    let code = '';
    if (type !== 'CODABAR') {
      await showAlert('通知', messages.EA5011(), false);
      return;
    } else {
      // --バーコード--
      // フォーマットチェック
      if (!checkFormat(data)) {
        await showAlert('通知', messages.EA5017(data), false);
        return;
      }
      // モーダル表示
      setModalVisible(true);
      code = 'a' + data + 'a';
    }

    // 新タグID参照処理実施(QR・バーコード)
    const retScreen = await procBarCode(code);
    setModalVisible(false);
    if (retScreen === 'WA1094') {
      setKbn('U');
      await logScreen('画面遷移: WA1090 → WA1094_登録内容確認(灰)');
      navigation.navigate('WA1094');
    } else if (retScreen === 'WA1091') {
      // 画面遷移
      setKbn('I');
      await logScreen('画面遷移: WA1090 → WA1091_旧タグ読込(灰)');
      navigation.navigate('WA1091');
    } else {
      // 終了処理
    }
  };

  // タグコードスキャンボタン押下時の処理
  const btnTagQr = async () => {
    await logUserAction('ボタン押下: WA1090 - タグ読込');
    setShowScannerTag(true);
  };

  /************************************************
   * 新タグID参照処理
   ************************************************/
  const procBarCode = async (txtNewTagId: string): Promise<string> => {
    // 通信を実施
    const responseIFA0340 = await IFA0340(txtNewTagId);
    if (await apiIsError(responseIFA0340)) {
      return '';
    }
    const data = responseIFA0340.data as IFA0340Response<IFA0340ResponseDtl>;
    setNewTagId(txtNewTagId);
    //レスポンス1件(共通)
    if (data.dtl.length === 1) {
      const result = await showAlert('確認', messages.IA5017(), true);
      if (result) {
        return 'WA1094';
      } else {
        return '';
      }
    } else {
      setNewTagId(txtNewTagId);
      return 'WA1091';
    }
  };

  /************************************************
   * 破棄ボタン処理
   ************************************************/
  const btnAppDestroy = async () => {
    await logUserAction('ボタン押下: WA1090 - 破棄');
    const result = await showAlert('確認', messages.IA5012(), true);
    if (result) {
      reset();
      setPrevScreenId('WA1040');
      setBack(true);
      await logScreen('画面遷移: WA1090 → WA1090_新タグ読込(土壌)');
      navigation.navigate('WA1090');
    }
  };

  /************************************************
   * 戻るボタン処理
   ************************************************/
  const btnAppBack = async () => {
    await logUserAction('ボタン押下: WA1090 - 戻る');
    const result = await showAlert('確認', messages.IA5011(), true);
    if (result) {
      await logScreen('画面遷移: WA1090 → WA1040_メニュー');
      navigation.navigate('WA1040');
    }
  };

  /************************************************
   * 次へボタン処理
   ************************************************/
  const btnAppNext = async () => {
    // モーダル表示
    setModalVisible(true);
    await logUserAction('ボタン押下: WA1090 - 次へ');
    // 新タグID参照処理実施
    const retScreen = await procBarCode('a' + inputValue + 'a');
    if (retScreen === 'WA1094') {
      setKbn('U');
      await logScreen('画面遷移: WA1090 → WA1094_登録内容確認(灰)');
      navigation.navigate('WA1094');
    } else if (retScreen === 'WA1091') {
      // 画面遷移
      setKbn('I');
      await logScreen('画面遷移: WA1090 → WA1091_旧タグ読込(灰)');
      navigation.navigate('WA1091');
    } else {
      // 終了処理
      setModalVisible(false);
    }
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
          await showAlert('通知', messages.IA5015(), false);
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
      style={styles.flex1} // KeyboardAvoidingView に flex: 1 を追加
      keyboardVerticalOffset={0}>
      <ScrollView
        contentContainerStyle={[styles.containerWithKeybord, styles.flexGrow1]}>
        {/* ヘッダ */}
        <FunctionHeader
          appType={'現'}
          viewTitle={'新タグ読込'}
          functionTitle={'紐付(灰)'}
        />

        {/* 上段 */}
        <View style={[styles.main]}>
          <Text style={[styles.labelText]}>作業場所：{wkplcTyp}</Text>
          <Text style={[styles.labelText, styles.labelTextPlace]}>{wkplc}</Text>
          <TouchableOpacity
            style={[styles.button, styles.buttonSmall, styles.centerButton]}
            onPress={btnWkPlcQr}>
            <Text style={styles.buttonText}>作業場所読込</Text>
          </TouchableOpacity>
        </View>

        {/* 中段1 */}
        <View style={[styles.main]}>
          <Text style={styles.labelText}>
            下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。
          </Text>
          <TouchableOpacity style={getTagReadButtonStyle()} onPress={btnTagQr}>
            <Text style={styles.buttonText}>タグ読込</Text>
          </TouchableOpacity>
        </View>

        {/* 中段2 */}
        <View style={[styles.main, styles.center, styles.zIndex]}>
          <TouchableWithoutFeedback
            onPressIn={() => onPressIn()}
            onPressOut={onPressOut}>
            <Text style={styles.labelText}>{getInfoMsg()}</Text>
          </TouchableWithoutFeedback>
          {inputVisible && (
            <View style={[styles.inputContainer]}>
              <Text style={styles.inputWithText}>a</Text>
              <TextInput
                style={getTextInputStyle()}
                onChangeText={handleInputChange}
                onBlur={handleInputBlur}
                value={inputValue}
                editable={isWkPlcRead}
                maxLength={15}
              />
              <Text style={styles.inputWithText}>a</Text>
            </View>
          )}
        </View>
        <View style={styles.flex1} />
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
          {isViewNextButton && (
            <TouchableOpacity
              style={getNextButtonStyle()}
              onPress={btnAppNext}
              disabled={!isNext}>
              <Text style={styles.startButtonText}>次へ</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* フッタ */}
        <Footer />

        {/* 処理中モーダル */}
        <ProcessingModal
          visible={modalVisible}
          message={messages.IA5018()}
          onClose={() => setModalVisible(false)}
        />

        {/* 作業場所用QRコードスキャナー */}
        {showScannerWkPlc && (
          <Modal
            visible={showScannerWkPlc}
            onRequestClose={() => setShowScannerWkPlc(false)}>
            <QRScanner
              onScan={handleCodeScannedForWkPlc}
              closeModal={() => setShowScannerWkPlc(false)}
              isActive={showScannerWkPlc}
              errMsg={'作業場所QRコード'}
            />
          </Modal>
        )}

        {/* タグ用QRコードスキャナー */}
        {showScannerTag && (
          <Modal
            visible={showScannerTag}
            onRequestClose={() => setShowScannerTag(false)}>
            <QRScanner
              onScan={handleCodeScannedForTag}
              closeModal={() => setShowScannerTag(false)}
              isActive={showScannerTag}
              errMsg={'タグ'}
            />
          </Modal>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
export default WA1090;
