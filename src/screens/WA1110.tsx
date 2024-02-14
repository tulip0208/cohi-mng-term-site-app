/**-------------------------------------------
 * A01-0110_旧タグID参照(灰)
 * WA1110
 * screens/WA1110.tsx
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
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import {getInstance} from '../utils/Realm.tsx'; // realm.jsから関数をインポート
import messages from '../utils/messages.tsx';
import QRScanner from '../utils/QRScanner.tsx';
import ProcessingModal from '../components/Modal.tsx';
import {logUserAction, logScreen} from '../utils/Log.tsx';
import {useAlert} from '../components/AlertContext.tsx';
import {IFA0320} from '../utils/Api.tsx';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../navigation/AppNavigator.tsx';
import {
  ApiResponse,
  IFA0320Response,
  IFA0320ResponseDtl,
} from '../types/type.tsx';
import {useRecoilState, useResetRecoilState, useSetRecoilState} from 'recoil';
import {WA1110DataState, WA1111BackState} from '../atom/atom.tsx';
// WA1110 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1110'>;
interface Props {
  navigation: NavigationProp;
}
const WA1110 = ({navigation}: Props) => {
  const [wkplcTyp, setWkplcTyp] = useState<string>(''); //作業場所種類
  const [wkplc, setWkplc] = useState<string>(''); // 作業場所
  const [inputValue, setInputValue] = useState<string>(''); //旧タグID入力値
  const [wkPlacId, setWkPlcId] = useState<string>(''); // 作業場所ID
  const [modalVisible, setModalVisible] = useState<boolean>(false); //処理中モーダルの状態
  const [showScannerTag, setShowScannerTag] = useState<boolean>(false); // カメラ表示用の状態
  const [showScannerWkPlc, setShowScannerWkPlc] = useState<boolean>(false); // カメラ表示用の状態
  const [isNext, setIsNext] = useState<boolean>(false); // 送信準備完了状態
  const [isWkPlcRead, setIsWkPlcRead] = useState<boolean>(false); // タグ読込
  const [WA1111back, setWa1111Back] = useRecoilState(WA1111BackState); // Recoil 戻る
  const setWA1110Data = useSetRecoilState(WA1110DataState); // Recoil 旧タグID情報
  const resetWA1110Data = useResetRecoilState(WA1110DataState); //Recoilリセット
  const {showAlert} = useAlert();

  /************************************************
   * 初期表示設定
   ************************************************/
  //初期処理
  useEffect(() => {
    reset();
    contentsViews();
  }, []); //WA1111帰還処理

  useEffect(() => {
    if (WA1111back) {
      reset();
      // 遷移状態をリセット
      setWa1111Back(false);
      contentsViews();
    }
  }, [WA1111back]);

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
        break;
      default:
        await showAlert('通知', messages.WA5001(), false);
        break;
    }
  };

  // 作業場所読込・入力値が空かどうかによってブール値ステートを更新
  useEffect(() => {
    isWkPlcRead && inputValue !== '' ? setIsNext(true) : setIsNext(false);
  }, [isWkPlcRead, inputValue]);

  // 値の初期化
  const reset = () => {
    resetWA1110Data();
    setWA1110Data(null);
    setIsWkPlcRead(false);
    setInputValue('');
    setWkPlcId('');
    setWkplc('');
    setWkplcTyp('');
  };

  // 次へボタンのスタイルを動的に変更するための関数
  const getNextButtonStyle = () => {
    return isNext
      ? [styles.button, styles.startButton]
      : [styles.button, styles.startButton, styles.disabledButton];
  };

  // 入力値が変更されたときのハンドラー
  const handleInputChange = (text: string) => {
    setInputValue(text);
  };

  // 入力がフォーカスアウトされたときのハンドラー
  const handleInputBlur = async () => {
    // 作業場所読込・入力値が空かどうかによってブール値ステートを更新
    // (isWkPlcRead && (inputValue !== '')) ? setIsNext(true) : setIsNext(false);
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
    setIsWkPlcRead(true);
  };

  // 作業場所コードスキャンボタン押下時の処理
  const btnWkPlcQr = async () => {
    await logUserAction('ボタン押下: WA1110 - 作業場所読込');
    setShowScannerWkPlc(true);
  };

  /************************************************
   * 旧タグ情報照会処理
   ************************************************/
  const procOldTagId = async (txtOldTagId: string): Promise<boolean> => {
    // 通信を実施
    const responseIFA0320 = await IFA0320(txtOldTagId, wkPlacId as string);
    if (await apiIsError(responseIFA0320)) {
      return false;
    }
    const data = responseIFA0320.data as IFA0320Response<IFA0320ResponseDtl>;
    const dataDtl = data.dtl[0] as IFA0320ResponseDtl;

    // 一時データ格納する
    setWA1110Data({
      head: {
        wkplcTyp: wkplcTyp,
        wkplc: wkplc,
        oldTagId: txtOldTagId,
      },
      data: {
        ashTyp: dataDtl.ashTyp,
        meaRa: dataDtl.meaRa,
        conRa: dataDtl.conRa,
        surDsRt: dataDtl.surDsRt,
        surDsDt: dataDtl.surDsDt,
        surDsWt: dataDtl.surDsWt,
      },
    });
    return true;
  };

  /************************************************
   * 戻るボタン処理
   ************************************************/
  const btnAppBack = async () => {
    await logUserAction('ボタン押下: WA1110 - 戻る');
    await logScreen('画面遷移: WA1110 → WA1040_メニュー');
    navigation.navigate('WA1040');
  };

  /************************************************
   * 次へボタン処理
   ************************************************/
  const btnAppNext = async () => {
    await logUserAction('ボタン押下: WA1110 - 次へ');
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
    await logScreen('画面遷移: WA1110 → WA1111_旧タグ参照(土壌)');
    navigation.navigate('WA1111');
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
          functionTitle={'参照(灰)'}
        />

        {/* 上段 */}
        <View style={[styles.main, styles.topContent]}>
          <Text
            style={[styles.labelText, styles.labelTextOver]}
            numberOfLines={1}
            ellipsizeMode="tail">
            作業場所：{wkplcTyp}
          </Text>
          <Text
            style={[
              styles.labelText,
              styles.labelTextPlace,
              styles.labelTextOver,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {wkplc}
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.buttonSmall, styles.centerButton]}
            onPress={btnWkPlcQr}>
            <Text style={styles.buttonText}>作業場所読込</Text>
          </TouchableOpacity>
          <View style={[styles.main, styles.center]}>
            <Text style={styles.labelText}>旧タグIDを入力して下さい。</Text>
            <View style={[styles.inputContainer]}>
              <TextInput
                style={styles.input}
                onChangeText={handleInputChange}
                onBlur={handleInputBlur}
                value={inputValue}
                maxLength={50}
              />
            </View>
          </View>
        </View>

        {/* 中段2 */}
        <View style={styles.flex1} />
        {/* 下段 */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.button, styles.endButton]}
            onPress={btnAppBack}>
            <Text style={styles.endButtonText}>戻る</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getNextButtonStyle()}
            onPress={btnAppNext}
            disabled={!isNext}>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
export default WA1110;
