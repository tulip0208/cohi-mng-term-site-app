/**-------------------------------------------
 * A01-0140_定置登録
 * WA1140
 * screens/WA1140.tsx
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
import {IFA0330, IFA0340} from '../utils/Api.tsx';
import {StackNavigationProp} from '@react-navigation/stack';
import {RNCamera} from 'react-native-camera';
import {RootList} from '../navigation/AppNavigator.tsx';
import {
  ApiResponse,
  IFA0330Response,
  IFA0330ResponseDtl,
} from '../types/type.tsx';
import {useRecoilState, useResetRecoilState} from 'recoil';
import {
  WA1140DataState,
  WA1141BackState,
  WA1140PrevScreenId,
} from '../atom/atom.tsx';
// WA1140 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1140'>;
interface Props {
  navigation: NavigationProp;
}
const WA1140 = ({navigation}: Props) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [showScannerTag, setShowScannerTag] = useState<boolean>(false); // カメラ表示用の状態
  const [showScannerWkPlc, setShowScannerWkPlc] = useState<boolean>(false); // カメラ表示用の状態
  const [wkplcTyp, setWkplcTyp] = useState<string>('');
  const [wkplc, setWkplc] = useState<string>('');
  const [WA1140Data, setWA1140Data] = useRecoilState(WA1140DataState);
  const [inputVisible, setInputVisible] = useState<boolean>(false);
  const [isNext, setIsNext] = useState<boolean>(false); // 送信準備完了状態
  const [inputValue, setInputValue] = useState<string>('');
  const [isTagRead, setIsTagRead] = useState<boolean>(false); // 送信準備完了状態
  const [isWkPlcRead, setIsWkPlcRead] = useState<boolean>(false); // タグ読込
  const [isCannotRead, setIsCannotRead] = useState<boolean>(false);
  const [isViewNextButton, setIsViewNextButton] = useState<boolean>(false);
  const [newTagId, setNewTagId] = useState<String>();
  const [storPlacId, setStorPlacId] = useState<String>();
  const [fixPlacId, setFixPlacId] = useState<String>();
  const [prevScreenId, setPrevScreenId] = useRecoilState(WA1140PrevScreenId); //遷移元画面ID
  const [WA1141back, setWa1141Back] = useRecoilState(WA1141BackState);
  const resetWA1140Data = useResetRecoilState(WA1140DataState);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null,
  );
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
  //WA1141帰還処理
  useEffect(() => {
    if (WA1141back) {
      reset();
      // 遷移状態をリセット
      setWa1141Back(false);
      contentsViews();
    }
  }, [WA1141back]);
  const contentsViews = async () => {
    const realm = getInstance();
    const loginInfo = realm.objects('login')[0];
    const fixedPlacesInfo = realm.objects('fixed_places')[0];
    if (
      loginInfo.wkplacTyp === 6 &&
      fixedPlacesInfo &&
      fixedPlacesInfo.type &&
      fixedPlacesInfo.type === 0
    ) {
      setWkplcTyp('定置場');

      setStorPlacId(
        fixedPlacesInfo.storPlacId
          ? (fixedPlacesInfo.storPlacId as string)
          : '',
      ); //保管場ID
      setFixPlacId(
        fixedPlacesInfo.fixPlacId ? (fixedPlacesInfo.fixPlacId as string) : '',
      ); //定置場ID

      setWkplc(fixedPlacesInfo.fixPlacNm as string);
      setWA1140Data({
        ...WA1140Data,
        storPlacId: storPlacId as string,
        fixPlacId: fixPlacId as string,
      });

      setIsTagRead(true);
    } else {
      setIsTagRead(false);
      await showAlert('通知', messages.WA5010(), false);
    }
  };
  // 値の初期化
  const reset = () => {
    resetWA1140Data();
    setIsTagRead(false);
    setIsWkPlcRead(false);
    setInputValue('');
    setPrevScreenId('WA1140');
    setIsViewNextButton(false);
    setWkplc('');
    setWkplcTyp('');
    setInputVisible(false);
    setIsNext(true);
    setIsCannotRead(false);
    setIsViewNextButton(false);
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
  // 旧タグID読み取りメッセージ
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
   * フォーマットチェック
   ************************************************/
  const checkFormat = (data: string) => {
    const pattern = /^[0-9][2-5][0-9]0[0-9]{11}$/;
    return pattern.test(data);
  };

  /************************************************
   * コードスキャン後の処理 (作業場所用)
   * @param param0
   * @returns
   ************************************************/
  const handleCodeScannedForWkPlc = async (data: string) => {
    const parts = data.split(',');
    setShowScannerWkPlc(false);
    //読み込んだID種別が定置場では または定置場かつ施設区分：定置場でない場合
    if (parts[0] !== '6' || (parts[0] === '6' && parts[4] !== '0')) {
      await showAlert('通知', messages.EA5023(), false);
      return;
    }

    setStorPlacId(parts[1]); //保管場ID
    setFixPlacId(parts[2]); //定置場ID

    setWkplcTyp('定置場');
    setWkplc(parts[3]);
    setWA1140Data({
      ...WA1140Data,
      storPlacId: storPlacId as string,
      fixPlacId: fixPlacId as string,
      wkplc: wkplc,
      wkplcTyp: wkplcTyp,
    });
    setIsTagRead(true);
    setIsWkPlcRead(true);
  };
  // 作業場所コードスキャンボタン押下時の処理
  const btnWkPlcQr = async () => {
    await logUserAction('ボタン押下: 作業場所読込');
    setShowScannerWkPlc(true);
  };

  /************************************************
   * コードスキャン後の処理 (タグ用)
   * @param param0
   * @returns
   ************************************************/
  const handleCodeScannedForTag = async (data: string, type: string) => {
    const parts = data.split(',');
    setShowScannerTag(false);
    if (type !== RNCamera.Constants.BarCodeType.qr && type !== 'CODABAR') {
      await showAlert('通知', messages.EA5008(), false);
      return;
    } else if (
      type !== RNCamera.Constants.BarCodeType.qr &&
      (parts.length === 1 || parts[0] !== 'CM')
    ) {
      // --QRコード(CSVでない||CMでない)--
      await showAlert('通知', messages.EA5009(), false);
      return;
    } else if (
      type === RNCamera.Constants.BarCodeType.qr &&
      parts.length !== 1 &&
      parts[0] === 'CM'
    ) {
      // --QRコード(CM)--
      setModalVisible(true);
      setNewTagId('a' + parts[1] + 'a');
      //新タグID参照処理
      if (await procNewTagId(String(newTagId))) {
        setModalVisible(false);
        await logScreen('画面遷移:WA1141_定置場所入力');
        navigation.navigate('WA1141');
      }
    } else if (type === 'CODABAR') {
      // --バーコード--
      if (!checkFormat(data)) {
        await showAlert('通知', messages.EA5017(data), false);
        setIsNext(false);
        return;
      }
      setModalVisible(true);
      setNewTagId('a' + data + 'a');
      //新タグID参照処理
      if (await procNewTagId(String(newTagId))) {
        setModalVisible(false);
        await logScreen('画面遷移:WA1141_定置場所入力');
        navigation.navigate('WA1141');
      }
    } else {
      //それ以外
      await showAlert('通知', messages.EA5008(), false);
      return;
    }
    setModalVisible(false);
    return;
  };
  // タグコードスキャンボタン押下時の処理
  const btnTagQr = async () => {
    await logUserAction('ボタン押下: タグ読込');
    setShowScannerTag(true);
  };

  /************************************************
   * 新タグ情報照会処理
   ************************************************/
  const procNewTagId = async (txtNewTagId: string): Promise<boolean> => {
    // 新タグIDの2桁目が"6:タグ色黒"もしくは"8:タグ色灰色" を判断
    if (!(txtNewTagId.charAt(1) === '6' || txtNewTagId.charAt(1) === '8')) {
      // 通信を実施
      const responseIFA0330 = await IFA0330(txtNewTagId);
      const data = responseIFA0330.data as IFA0330Response<IFA0330ResponseDtl>;
      const dataDtl = data.dtl[0] as IFA0330ResponseDtl;
      setWA1140Data({
        ...WA1140Data,
        wkplc: wkplc,
        wkplcTyp: wkplcTyp,
        newTagId: newTagId as string,
        rmSolTyp: String(dataDtl.rmSolTyp),
      });
      if (await apiIsError(responseIFA0330)) {
        return false;
      }
    } else {
      // 通信を実施
      const responseIFA0340 = await IFA0340(txtNewTagId);
      if (await apiIsError(responseIFA0340)) {
        return false;
      }
      // 新タグIDの2桁目が"6:タグ色黒"もしくは"8:タグ色灰色"の場合
      // 6=主灰(1),8=飛灰(2)
      let tmpRmSolTyp = '';
      if (txtNewTagId.charAt(1) === '6') {
        tmpRmSolTyp = '1';
      } else {
        tmpRmSolTyp = '2';
      }
      setWA1140Data({
        ...WA1140Data,
        wkplc: wkplc,
        wkplcTyp: wkplcTyp,
        newTagId: txtNewTagId,
        rmSolTyp: String(tmpRmSolTyp),
      });
    }
    return true;
  };

  /************************************************
   * 破棄ボタン処理
   ************************************************/
  const btnAppDestroy = async () => {
    await logUserAction('ボタン押下: 破棄(WA1140)');
    const result = await showAlert('確認', messages.IA5012(), true);
    if (result) {
      reset();
      setPrevScreenId('WA1040');
      setWa1141Back(true);
      await logScreen('画面遷移:WA1140_新タグ読込(定置登録)');
      navigation.navigate('WA1140');
    }
  };

  /************************************************
   * 戻るボタン処理
   ************************************************/
  const btnAppBack = async () => {
    await logUserAction('ボタン押下: 戻る(WA1140)');
    await logScreen('画面遷移:WA1040_メニュー');
    navigation.navigate('WA1040');
  };

  /************************************************
   * 次へボタン処理
   ************************************************/
  const btnAppNext = async () => {
    await logUserAction('ボタン押下: 次へ(WA1140)');
    // モーダル表示
    setModalVisible(true);
    // 新タグID参照処理実施
    if (!(await procNewTagId('a' + inputValue + 'a'))) {
      // モーダル非表示
      setModalVisible(false);
      setShowScannerTag(false);
      return;
    }
    // モーダル非表示
    setModalVisible(false);
    await logScreen('画面遷移:WA1141_定置場所入力');
    navigation.navigate('WA1141');
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
          functionTitle={'定置登録'}
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
          <TouchableOpacity
            style={getTagReadButtonStyle()}
            disabled={!isTagRead}
            onPress={btnTagQr}>
            <Text style={styles.buttonText}>タグ読込</Text>
          </TouchableOpacity>
        </View>

        {/* 中段2 */}
        <View style={[styles.main, styles.center]}>
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
              isActive={showScannerTag}
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
export default WA1140;
