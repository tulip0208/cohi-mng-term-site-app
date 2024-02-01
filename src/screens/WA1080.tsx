/**-------------------------------------------
 * A01-0080_旧タグID参照(土壌)
 * WA1080
 * screens/WA1080.tsx
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
import {IFA0310} from '../utils/Api.tsx';
import {StackNavigationProp} from '@react-navigation/stack';
import {RNCamera} from 'react-native-camera';
import {RootList} from '../navigation/AppNavigator.tsx';
import {
  ApiResponse,
  IFA0310Response,
  IFA0310ResponseDtl,
} from '../types/type.tsx';
import {useRecoilState, useResetRecoilState, useSetRecoilState} from 'recoil';
import {WA1080DataState, WA1081BackState} from '../atom/atom.tsx';
// WA1080 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1080'>;
interface Props {
  navigation: NavigationProp;
}
const WA1080 = ({navigation}: Props) => {
  const [wkplcTyp, setWkplcTyp] = useState<string>(''); //作業場所種類
  const [wkplc, setWkplc] = useState<string>(''); // 作業場所
  const [inputValue, setInputValue] = useState<string>(''); //旧タグID入力値
  const [modalVisible, setModalVisible] = useState<boolean>(false); //処理中モーダルの状態
  const [showScannerTag, setShowScannerTag] = useState<boolean>(false); // カメラ表示用の状態
  const [showScannerWkPlc, setShowScannerWkPlc] = useState<boolean>(false); // カメラ表示用の状態
  const [inputVisible, setInputVisible] = useState<boolean>(false); // 旧タグ欄入力値 表示・非表示
  const [isNext, setIsNext] = useState<boolean>(false); // 送信準備完了状態
  const [isTagRead, setIsTagRead] = useState<boolean>(false); // 送信準備完了状態
  const [isWkPlcRead, setIsWkPlcRead] = useState<boolean>(false); // タグ読込
  const [isCannotRead, setIsCannotRead] = useState<boolean>(false); // 旧タグID読み取りメッセージ
  const [isViewNextButton, setIsViewNextButton] = useState<boolean>(false); // 次へボタン 表示・非表示
  const [wkPlacId, setWkPlcId] = useState<string>(); // 作業場所ID
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null,
  ); //長押しタグ表示用
  const [WA1081back, setWa1081Back] = useRecoilState(WA1081BackState); // Recoil 戻る
  const setWA1080Data = useSetRecoilState(WA1080DataState); // Recoil 旧タグID情報
  const resetWA1080Data = useResetRecoilState(WA1080DataState); //Recoilリセット
  const {showAlert} = useAlert();
  /************************************************
   * 初期表示設定
   ************************************************/
  //初期処理
  useEffect(() => {
    reset();
    contentsViews();
  }, []);

  //WA1081帰還処理
  useEffect(() => {
    if (WA1081back) {
      reset();
      // 遷移状態をリセット
      setWa1081Back(false);
      contentsViews();
    }
  }, [WA1081back]);

  //画面表示前処理
  const contentsViews = async () => {
    const realm = getInstance();
    const loginInfo = realm.objects('login')[0];
    let place;
    switch (loginInfo.wkplacTyp) {
      case 4:
        place = realm.objects('temporary_places')[0];
        setWkplcTyp('仮置場');
        setWkPlcId(place.tmpPlacId as string);
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
    resetWA1080Data();
    setIsTagRead(false);
    setIsWkPlcRead(false);
    setInputValue('');
    setIsViewNextButton(false);
    setWkPlcId('');
    setWkplc('');
    setWkplcTyp('');
    setInputVisible(false);
    setIsNext(true);
    setIsCannotRead(false);
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
      ? '旧タグIDが読み込めない場合：'
      : '旧タグIDが読み込めない場合はここを長押しして下さい。';
  };

  // 入力値が変更されたときのハンドラー
  const handleInputChange = (text: string) => {
    setInputValue(text);
  };

  // 入力がフォーカスアウトされたときのハンドラー
  const handleInputBlur = async () => {
    // 入力値が空かどうかによってブール値ステートを更新
    setIsNext(inputValue !== '');
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
    setWkPlcId(parts[1]);
    setWkplc(parts[2]);
    setWkplcTyp('仮置場');
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
    let code = '';
    if (type !== RNCamera.Constants.BarCodeType.qr && type !== 'CODABAR') {
      await showAlert('通知', messages.EA5008(), false);
      return;
    } else if (parts.length !== 1 && parts[0] === 'CM') {
      // --QRコード(CM)--
      // 一時データ格納する
      setWA1080Data({
        head: {
          wkplcTyp: wkplcTyp,
          wkplc: wkplc,
          oldTagId: parts[2],
        },
        data: {
          rmSolTyp: Number(parts[8]),
          weight: parts[16],
          airDsRt: Number(parts[17]),
          rcvDt: parts[15],
          splFac: Number(parts[7]),
          tsuInd: Number(parts[6]),
          pkTyp: Number(parts[10]),
          usgInnBg: Number(parts[11]),
          usgAluBg: Number(parts[12]),
          vol: Number(parts[13]),
          arNm: parts[4],
          ocLndCla: Number(parts[9]),
          ocLndUseknd: '',
          ocloc: parts[5],
          rmSolInf: parts[18],
          lnkNewTagDatMem: '',
        },
      });
      await logScreen('画面遷移:WA1081_旧タグ参照(土壌)');
      navigation.navigate('WA1081');
    } else if (parts.length !== 1 && parts[0] !== 'CM') {
      // --QRコード(CM以外)--
      // モーダル表示
      setModalVisible(true);
      // IFA0310処理
      procOldTagId(data);
      // 旧タグID参照処理実施
      if (!(await procOldTagId(code))) {
        // モーダル非表示
        setModalVisible(false);
        setShowScannerTag(false);
        return;
      }
      await logScreen('画面遷移:WA1081_旧タグ参照(土壌)');
      navigation.navigate('WA1081');
    }
  };

  // タグコードスキャンボタン押下時の処理
  const btnTagQr = async () => {
    await logUserAction('ボタン押下: タグ読込');
    setShowScannerTag(true);
  };

  /************************************************
   * 旧タグ情報照会処理
   ************************************************/
  const procOldTagId = async (txtOldTagId: string): Promise<boolean> => {
    // 通信を実施
    const responseIFA0310 = await IFA0310(txtOldTagId, wkPlacId as string);
    if (await apiIsError(responseIFA0310)) {
      return false;
    }
    const data = responseIFA0310.data as IFA0310Response<IFA0310ResponseDtl>;
    const dataDtl = data.dtl[0] as IFA0310ResponseDtl;

    // 一時データ格納する
    setWA1080Data({
      head: {
        wkplcTyp: wkplcTyp,
        wkplc: wkplc,
        oldTagId: txtOldTagId,
      },
      data: {
        rmSolTyp: Number(dataDtl.rmSolTyp),
        weight: '',
        airDsRt: dataDtl.airDsRt as number,
        rcvDt: '',
        splFac: Number(dataDtl.splFac),
        tsuInd: Number(dataDtl.tsuInd),
        pkTyp: Number(dataDtl.pkTyp),
        usgInnBg: Number(dataDtl.usgInnBg),
        usgAluBg: Number(dataDtl.usgAluBg),
        vol: dataDtl.vol as number,
        arNm: dataDtl.arNm,
        ocLndCla: Number(dataDtl.ocLndCla),
        ocLndUseknd: dataDtl.ocLndUseknd as string,
        ocloc: dataDtl.ocloc as string,
        rmSolInf: dataDtl.rmSolInf as string,
        lnkNewTagDatMem: dataDtl.lnkNewTagDatMem as string,
      },
    });
    return true;
  };

  /************************************************
   * 戻るボタン処理
   ************************************************/
  const btnAppBack = async () => {
    await logUserAction('ボタン押下: 戻る(WA1080)');
    await logScreen('画面遷移:WA1040_メニュー');
    navigation.navigate('WA1040');
  };

  /************************************************
   * 次へボタン処理
   ************************************************/
  const btnAppNext = async () => {
    await logUserAction('ボタン押下: 次へ(WA1080)');
    // モーダル表示
    setModalVisible(true);
    // 旧タグID参照処理実施
    if (!(await procOldTagId(inputValue))) {
      // モーダル非表示
      setModalVisible(false);
      setShowScannerTag(false);
      return;
    }
    // モーダル非表示
    setModalVisible(false);
    await logScreen('画面遷移:WA1081_旧タグ参照(土壌)');
    navigation.navigate('WA1081');
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
          viewTitle={'旧タグ読込'}
          functionTitle={'参照(土)'}
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
        <View style={[styles.main, styles.center, styles.zIndex]}>
          <TouchableWithoutFeedback
            onPressIn={() => onPressIn()}
            onPressOut={onPressOut}>
            <Text style={styles.labelText}>{getInfoMsg()}</Text>
          </TouchableWithoutFeedback>
          {inputVisible && (
            <View style={[styles.inputContainer]}>
              <TextInput
                style={getTextInputStyle()}
                onChangeText={handleInputChange}
                onBlur={handleInputBlur}
                value={inputValue}
                editable={isWkPlcRead}
                maxLength={50}
              />
            </View>
          )}
        </View>
        <View style={styles.flex1} />
        {/* 下段 */}
        <View style={styles.bottomSection}>
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
export default WA1080;
