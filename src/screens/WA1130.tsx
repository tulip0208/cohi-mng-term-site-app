/**-------------------------------------------
 * A01-0130_荷下登録
 * WA1130
 * screens/WA1130.tsx
 * ---------------------------------------------*/
import FunctionHeader from '../components/FunctionHeader.tsx'; // Headerコンポーネントのインポート
import Footer from '../components/Footer.tsx'; // Footerコンポーネントのインポート
import {styles} from '../styles/CommonStyle.tsx'; // 共通スタイル
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
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
import {IFT0640} from '../utils/Api.tsx';
import {StackNavigationProp} from '@react-navigation/stack';
import {RNCamera} from 'react-native-camera';
import {RootList} from '../navigation/AppNavigator.tsx';
import {
  ApiResponse,
  IFT0640Response,
  IFT0640ResponseDtl,
  IFT0640ResponseDtlDtl,
} from '../types/type.tsx';
import {useRecoilState, useResetRecoilState, useSetRecoilState} from 'recoil';
import {
  WA1130DataState,
  WA1131BackState,
  WA1130PrevScreenId,
  IFT0640DataState,
} from '../atom/atom.tsx';
// WA1130 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1130'>;
interface Props {
  navigation: NavigationProp;
}
const WA1130 = ({navigation}: Props) => {
  const [wkplcTyp, setWkplcTyp] = useState<string>(''); //作業場所種類
  const [wkplc, setWkplc] = useState<string>(''); // 作業場所
  const [storPlacId, setStorPlacId] = useState<String>(''); //保管場ID
  const [fixPlacId, setFixPlacId] = useState<String>(''); //定置場ID
  const [facTyp, setFacTyp] = useState<String>(''); //施設区分
  const [modalVisible, setModalVisible] = useState<boolean>(false); //処理中モーダルの状態
  const [showScannerCard, setShowScannerCard] = useState<boolean>(false); // カメラ表示用の状態
  const [showScannerWkPlc, setShowScannerWkPlc] = useState<boolean>(false); // カメラ表示用の状態
  const [isCard, setIsCard] = useState<boolean>(false); // 送信準備完了状態
  const [WA1130Data, setWA1130Data] = useRecoilState(WA1130DataState); // Recoil 保管場ID,定置場ID,施設区分
  const [WA1131back, setWa1131Back] = useRecoilState(WA1131BackState); // Recoil 戻る
  const setPrevScreenId = useSetRecoilState(WA1130PrevScreenId); // Recoil 遷移元画面ID
  const setIFT0640Data = useSetRecoilState(IFT0640DataState); // Recoil IFT0640レスポンスデータ
  const resetWA1130Data = useResetRecoilState(WA1130DataState); //Recoilリセット
  const {showAlert} = useAlert();

  /************************************************
   * 初期表示設定
   ************************************************/
  //初期処理
  useEffect(() => {
    reset();
    contentsViews();
  }, []);

  //WA1141帰還処理
  useEffect(() => {
    if (WA1131back) {
      reset();
      // 遷移状態をリセット
      setWa1131Back(false);
      contentsViews();
    }
  }, [WA1131back]);

  //画面表示前処理
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
      setStorPlacId(
        fixedPlacesInfo.storPlacId
          ? (fixedPlacesInfo.storPlacId as string)
          : '',
      ); //保管場ID
      setFixPlacId(
        fixedPlacesInfo.fixPlacId ? (fixedPlacesInfo.fixPlacId as string) : '',
      ); //定置場ID
      setFacTyp(fixedPlacesInfo.facTyp ? String(fixedPlacesInfo.facTyp) : ''); //施設区分

      setWkplc(fixedPlacesInfo.fixPlacNm as string);
      if (facTyp === '0') {
        //施設区分が定置場の場合
        setWkplcTyp('定置場');
      } else if (facTyp === '1') {
        //施設区分が受入の場合
        setWkplcTyp('受入・分別施設');
      }

      setWA1130Data({
        ...WA1130Data,
        facTyp: facTyp as string,
        storPlacId: storPlacId as string,
        fixPlacId: fixPlacId as string,
      });

      setIsCard(true);
    } else {
      setIsCard(false);
      await showAlert('通知', messages.WA5010(), false);
    }
  };

  // 値の初期化
  const reset = () => {
    resetWA1130Data();
    setIsCard(false);
    setPrevScreenId('WA1130');
    setWkplc('');
    setWkplcTyp('');
  };

  // タグ読込ボタンのスタイルを動的に変更するための関数
  const getCardButtonStyle = () => {
    return isCard
      ? [styles.button, styles.buttonSmall, styles.centerButton]
      : [
          styles.button,
          styles.buttonSmall,
          styles.centerButton,
          styles.disabledButton,
        ];
  };

  /************************************************
   * コードスキャン後の処理 (作業場所用)
   * @param param0
   * @returns
   ************************************************/
  const handleCodeScannedForWkPlc = async (data: string) => {
    const parts = data.split(',');
    setShowScannerWkPlc(false);
    //読み込んだID種別が定置場ではない場合
    if (parts[0] !== '6') {
      await showAlert('通知', messages.EA5023(), false);
      return;
    }

    setStorPlacId(parts[1]); //保管場ID
    setFixPlacId(parts[2]); //定置場ID
    setFacTyp(parts[4]); //施設区分

    if (parts[4] === '0') {
      //施設区分が定置場の場合
      setWkplcTyp('定置場');
    } else if (parts[4] === '1') {
      //施設区分が受入の場合
      setWkplcTyp('受入・分別施設');
    }
    setWkplc(parts[3]);

    setWA1130Data({
      ...WA1130Data,
      facTyp: facTyp as string,
      storPlacId: storPlacId as string,
      fixPlacId: fixPlacId as string,
    });

    setIsCard(true);
  };

  // 作業場所コードスキャンボタン押下時の処理
  const btnWkPlcQr = async () => {
    await logUserAction('ボタン押下: 作業場所読込');
    setShowScannerWkPlc(true);
  };

  /************************************************
   * コードスキャン後の処理 (輸送コード読込ボタン用)
   * @param param0
   * @returns
   ************************************************/
  const handleCodeScannedForCard = async (data: string, type: string) => {
    const parts = data.split(',');
    setShowScannerCard(false);
    if (type === RNCamera.Constants.BarCodeType.qr && parts.length !== 2) {
      // --QRコード(2カラム以外)--
      await showAlert('通知', messages.EA5002('輸送カード'), false);
      return;
    } else if (
      type === RNCamera.Constants.BarCodeType.qr &&
      parts.length === 2
    ) {
      // --QRコード(2カラム)--
      setModalVisible(true);
      const trpCrdNo = parts[1];
      setWA1130Data({...WA1130Data, trpComId: parts[0], trpCrdNo: trpCrdNo});
      // 通信を実施
      const responseIFT0640 = await IFT0640(WA1130Data);
      if (await apiIsError(responseIFT0640)) {
        setModalVisible(false);
        return false;
      } else {
        await showAlert('通知', messages.IA5005('輸送カード申請'), false);
      }
      const responseIFT0640Data = responseIFT0640.data as IFT0640Response<
        IFT0640ResponseDtl<IFT0640ResponseDtlDtl>
      >;
      //0件の場合
      if (responseIFT0640Data?.dtl.length === 0) {
        await showAlert('通知', messages.EA5018(trpCrdNo), false);
        setModalVisible(false);
        return;
      }
      //一次記憶領域の[保管場ID]とレスポンスが一致しない場合(応答データを1件として扱う)
      else if (responseIFT0640Data?.dtl[0].stgLocId !== WA1130Data.storPlacId) {
        await showAlert('通知', messages.EA5019(trpCrdNo), false);
        setModalVisible(false);
        return;
      }
      //レスポンスを一時記憶領域に設定
      const dataDtl = responseIFT0640Data
        .dtl[0] as IFT0640ResponseDtl<IFT0640ResponseDtlDtl>;

      // lgSdBgDtl 配列を変換
      const lgSdBgDtlWithCheck = dataDtl.lgSdBgDtl.map(item => ({
        ...item,
        check: false, // check プロパティを追加(WA1131のチェックで使用)
      }));

      // 変換した配列を使用して新しいデータオブジェクトを作成
      const newDataDtl = {
        ...dataDtl,
        lgSdBgDtl: lgSdBgDtlWithCheck,
      };

      // レスポンスデータを記憶領域に設定
      setIFT0640Data(newDataDtl);

      setWA1130Data({...WA1130Data, wkplc: wkplc, wkplcTyp: wkplcTyp});
      await logScreen('画面遷移:WA1131_荷下登録新タグ読込');
      navigation.navigate('WA1131');
    } else {
      //それ以外
      await showAlert('通知', messages.EA5002('輸送カード'), false);
      return;
    }
    setModalVisible(false);
    return;
  };

  // タグコードスキャンボタン押下時の処理
  const btnTrpCrd = async () => {
    await logUserAction('ボタン押下: 輸送カード読込');
    setShowScannerCard(true);
  };

  /************************************************
   * 戻るボタン処理
   ************************************************/
  const btnAppBack = async () => {
    await logUserAction('ボタン押下: 戻る(WA1130)');
    if (!(await showAlert('確認', messages.IA5011(), true))) {
      return;
    }
    await logScreen('画面遷移:WA1040_メニュー');
    navigation.navigate('WA1040');
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
          viewTitle={'QR読込'}
          functionTitle={'荷下登録'}
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
            下記ボタンを押して輸送カード左上のQRコードを読取って下さい。
          </Text>
          <TouchableOpacity
            style={getCardButtonStyle()}
            disabled={!isCard}
            onPress={btnTrpCrd}>
            <Text style={styles.buttonText}>輸送カード読込</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.flex1} />
        {/* 下段 */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.button, styles.endButton]}
            onPress={btnAppBack}>
            <Text style={styles.endButtonText}>戻る</Text>
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
              isActive={showScannerCard}
              errMsg={'作業場所QRコード'}
            />
          </Modal>
        )}

        {/* 輸送カード読込用QRコードスキャナー */}
        {showScannerCard && (
          <Modal
            visible={showScannerCard}
            onRequestClose={() => setShowScannerCard(false)}>
            <QRScanner
              onScan={handleCodeScannedForCard}
              closeModal={() => setShowScannerCard(false)}
              isActive={showScannerCard}
              errMsg={'輸送カード読込'}
            />
          </Modal>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
export default WA1130;
