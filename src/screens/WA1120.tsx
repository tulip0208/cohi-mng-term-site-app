/**-------------------------------------------
 * A01-0120_輸送カード申請
 * WA1120
 * screens/WA1120.tsx
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
import {IFT0120FromWA1120} from '../utils/Api.tsx';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../navigation/AppNavigator.tsx';
import {ApiResponse, TrmId} from '../types/type.tsx';
import {useRecoilState, useResetRecoilState, useSetRecoilState} from 'recoil';
import {
  WA1120DataState,
  WA1120BackState,
  WA1120PrevScreenId,
  WA1120WkPlacState,
  WA1120CarState,
  WA1120DrvState,
  WA1120DestState,
  WA1120TrpCardNoState,
} from '../atom/atom.tsx';
import {loadFromKeystore} from '../utils/KeyStore'; // KeyStoreの確認関数
import {getCurrentDateTime} from '../utils/common.tsx';
import {useButton} from '../hook/useButton.tsx';

// WA1120 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1120'>;
interface Props {
  navigation: NavigationProp;
}
const WA1120 = ({navigation}: Props) => {
  const [wkplcTyp, setWkplcTyp] = useState<string>(''); //作業場所種類
  const [wkplc, setWkplc] = useState<string>(''); // 作業場所
  const [carPlate, setCarPlate] = useState<string>(''); //輸送車両
  const [drvNm, setDrvNm] = useState<string>(''); //運転手
  const [destinationNm, setDestinationNm] = useState<string>(''); // 行先名
  const [modalVisible, setModalVisible] = useState<boolean>(false); //処理中モーダルの状態
  const [isNext, setIsNext] = useState<boolean>(false); // 送信準備完了状態
  const [showScannerWkPlc, setShowScannerWkPlc] = useState<boolean>(false); // カメラ表示用の状態
  const [showScannerCarQr, setShowScannerCarQr] = useState<boolean>(false); // カメラ表示用の状態
  const [showScannerDrvQr, setShowScannerDrvQr] = useState<boolean>(false); // カメラ表示用の状態
  const [showScannerDestamQr, setShowScannerDestamQr] =
    useState<boolean>(false); // カメラ表示用の状態
  const [back, setBack] = useRecoilState(WA1120BackState); //Recoil 戻る
  const [prevScreenId, setPrevScreenId] = useRecoilState(WA1120PrevScreenId); // Recoil 遷移元画面ID
  const [WA1120WkPlac, setWA1120WkPlac] = useRecoilState(WA1120WkPlacState); // Recoil 作業場所情報
  const [WA1120Car, setWA1120Car] = useRecoilState(WA1120CarState); // Recoil 車両情報
  const [WA1120Drv, setWA1120Drv] = useRecoilState(WA1120DrvState); // Recoil 運転手情報情報
  const [WA1120Dest, setWA1120Dest] = useRecoilState(WA1120DestState); // Recoil 行先情報
  const setWA1120TrpCardNo = useSetRecoilState(WA1120TrpCardNoState); // Recoil 輸送カード番号
  const setWA1120Data = useSetRecoilState(WA1120DataState); // Recoil 画面上部作業情報
  const resetWA112WkPlacState = useResetRecoilState(WA1120WkPlacState); //Recoilリセット
  const resetWA1120CarState = useResetRecoilState(WA1120CarState); //Recoilリセット
  const resetWA1120DrvState = useResetRecoilState(WA1120DrvState); //Recoilリセット
  const resetWA1120DestState = useResetRecoilState(WA1120DestState); //Recoilリセット
  const [isBtnEnabledWkp, toggleButtonWkp] = useButton(); //ボタン制御
  const [isBtnEnabledCar, toggleButtonCar] = useButton(); //ボタン制御
  const [isBtnEnabledDrv, toggleButtonDrv] = useButton(); //ボタン制御
  const [isBtnEnabledDst, toggleButtonDst] = useButton(); //ボタン制御
  const [isBtnEnabledDel, toggleButtonDel] = useButton(); //ボタン制御
  const [isBtnEnabledBck, toggleButtonBck] = useButton(); //ボタン制御
  const [isBtnEnabledNxt, toggleButtonNxt] = useButton(); //ボタン制御
  const {showAlert} = useAlert();

  /************************************************
   * 初期表示設定
   ************************************************/
  //初期処理
  useEffect(() => {
    if (prevScreenId && prevScreenId === 'WA1040') {
      reset();
    }
    setPrevScreenId('WA1120');
    contentsViews();
  }, []);

  useEffect(() => {
    if (prevScreenId && prevScreenId === 'WA1040') {
      reset();
    }
    setPrevScreenId('WA1120');
    setBack(false);
    contentsViews();
  }, [back]);

  useEffect(() => {
    if (
      WA1120WkPlac.wkplacId &&
      WA1120Car.carId &&
      WA1120Drv.drvId &&
      WA1120Dest.storPlacId
    ) {
      setIsNext(true);
    } else {
      setIsNext(false);
    }
  }, [
    WA1120WkPlac.wkplacId,
    WA1120Car.carId,
    WA1120Drv.drvId,
    WA1120Dest.storPlacId,
  ]);

  //画面表示前処理
  const contentsViews = async () => {
    const realm = getInstance();
    const loginInfo = realm.objects('login')[0];
    let place;
    switch (loginInfo.wkplacTyp) {
      case 4:
        place = realm.objects('temporary_places')[0];
        setWkplcTyp('仮置場');
        setWA1120WkPlac({
          idTyp: '4', //ID種別
          wkplacId: place.tmpPlacId as string, //作業場所ID
          wkplacNm: place.tmpPlacNm as string, //作業場所名
          delSrcTyp: place.delSrcTyp as string, //搬出元種別
          wkplac: wkplcTyp, //作業場所
        });
        // setWkplc(place.tmpPlacNm as string);
        break;
      default:
        await showAlert('通知', messages.WA5001(), false);
        break;
    }
  };

  // 値の初期化
  const reset = () => {
    resetWA112WkPlacState();
    resetWA1120CarState();
    resetWA1120DrvState();
    resetWA1120DestState();
    setWkplcTyp('');
    setWkplc('');
    setCarPlate('');
    setDrvNm('');
    setDestinationNm('');
    setPrevScreenId('WA1120');
    setWkplc('');
    setWkplcTyp('');
    contentsViews();
    setIsNext(false);
  };

  // 次へボタンのスタイルを動的に変更するための関数
  const getNextButtonStyle = () => {
    return isNext
      ? [styles.button, styles.startButton]
      : [styles.button, styles.startButton, styles.disabledButton];
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
    setWA1120WkPlac({
      idTyp: parts[0], //ID種別
      wkplacId: parts[1], //作業場所ID
      wkplacNm: parts[2], //作業場所名
      delSrcTyp: parts[3], //搬出元種別
      wkplac: wkplcTyp,
    });
    setWkplc(parts[2]);
  };

  // 作業場所コードスキャンボタン押下時の処理
  const btnWkPlcQr = async () => {
    //ボタン連続押下制御
    if (!isBtnEnabledWkp) {
      return;
    } else {
      toggleButtonWkp();
    }
    await logUserAction('ボタン押下: WA1120 - 作業場所読込');
    setShowScannerWkPlc(true);
  };

  /************************************************
   * コードスキャン後の処理 (車両用)
   * @param param0
   * @returns
   ************************************************/
  const handleCodeScannedForCarQr = async (data: string) => {
    const parts = data.split(',');
    setShowScannerCarQr(false);
    if (parts[0] !== '2') {
      await showAlert('通知', messages.EA5002('車両'), false);
      return;
    }
    setCarPlate(parts[5]);
    setWA1120Car({
      idTyp: parts[0], //ID種別
      carId: parts[4], //車両ID
      carNm: parts[3], //車両名称
      carNo: parts[5], //車両番号
      maxWt: parts[6], //最大積載量
      carWt: parts[7], //車両重量
      empCarWt: parts[8], //空車重量
    });
  };

  // 車両コードスキャンボタン押下時の処理
  const btnCarQr = async () => {
    //ボタン連続押下制御
    if (!isBtnEnabledCar) {
      return;
    } else {
      toggleButtonCar();
    }
    await logUserAction('ボタン押下: WA1120 - 車両読込');
    setShowScannerCarQr(true);
  };

  /************************************************
   * コードスキャン後の処理 (運転手用)
   * @param param0
   * @returns
   ************************************************/
  const handleCodeScannedForDrvQr = async (data: string) => {
    const parts = data.split(',');
    setShowScannerDrvQr(false);
    if (parts[0] !== '3') {
      await showAlert('通知', messages.EA5002('運転手'), false);
      return;
    }
    setDrvNm(parts[3]);
    setWA1120Drv({
      idTyp: parts[0], //ID種別
      drvId: parts[4], //運転手ID
      drvNm: parts[3], //運転手名
    });
  };

  // 運転手コードスキャンボタン押下時の処理
  const btnDrvQr = async () => {
    //ボタン連続押下制御
    if (!isBtnEnabledDrv) {
      return;
    } else {
      toggleButtonDrv();
    }
    await logUserAction('ボタン押下: WA1120 - 運転手読込');
    setShowScannerDrvQr(true);
  };

  /************************************************
   * コードスキャン後の処理 (行先用)
   * @param param0
   * @returns
   ************************************************/
  const handleCodeScannedForDestamQr = async (data: string) => {
    const parts = data.split(',');
    setShowScannerDestamQr(false);
    if (parts[0] !== '6') {
      await showAlert('通知', messages.EA5014(), false);
      return;
    }
    setDestinationNm(parts[2]);
    setWA1120Dest({
      idTyp: parts[0], //ID種別
      storPlacId: parts[1], //保管場ID
      fixPlacId: parts[3], //定置場ID
      fixPlacNm: parts[2], //定置場名
      facTyp: parts[4], //施設区分
      raKbn: parts[5], //濃度区分
    });
    setWkplc(parts[2]);
    setIsNext(true); //次へボタン活性化
  };

  // 行先コードスキャンボタン押下時の処理
  const btnDestamQr = async () => {
    //ボタン連続押下制御
    if (!isBtnEnabledDst) {
      return;
    } else {
      toggleButtonDst();
    }
    await logUserAction('ボタン押下: WA1120 - 行先読込');
    setShowScannerDestamQr(true);
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
    await logUserAction('ボタン押下: WA1120 - 破棄');
    const result = await showAlert('確認', messages.IA5012(), true);
    if (result) {
      reset();
      setPrevScreenId('WA1040');
      setBack(true);
      await logScreen('画面遷移: WA1120 → WA1120_輸送カード申請');
      navigation.navigate('WA1120');
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
    await logUserAction('ボタン押下: WA1120 - 戻る');
    const result = await showAlert('確認', messages.IA5011(), true);
    if (result) {
      await logScreen('画面遷移: WA1120 → WA1040_メニュー');
      navigation.navigate('WA1040');
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
    await logUserAction('ボタン押下: WA1120 - 次へ');
    // モーダル表示
    setModalVisible(true);
    const dateStr = getCurrentDateTime();
    //通信処理 IFT0120
    const responseIFA0120 = await IFT0120FromWA1120(
      WA1120WkPlac,
      WA1120Car,
      WA1120Drv,
      dateStr,
    );
    if (await apiIsError(responseIFA0120)) {
      return;
    }
    const trmId = (await loadFromKeystore('trmId')) as TrmId;
    const trpCardNo =
      'd' + trmId.trmId + dateStr.replace(/[^0-9]/g, '').slice(0, 14) + 'd';
    setWA1120TrpCardNo(trpCardNo);
    // モーダル非表示
    setModalVisible(false);

    setWA1120Data({
      wkplc: wkplc,
      wkplcTyp: wkplcTyp,
    });

    setPrevScreenId('WA1120');
    await logScreen('画面遷移: WA1120 → WA1121_輸送カード申請タグ読込');
    navigation.navigate('WA1121');
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
          functionTitle={'輸送(申)'}
        />

        {/* 上段 */}
        <View style={[styles.main]}>
          <View style={styles.tableMain}>
            <View style={styles.tableRow}>
              <View style={styles.tableCell11}>
                <Text style={[styles.labelText, styles.alignRight]}>
                  作業場所：
                </Text>
              </View>
              <View style={[styles.tableCell5, styles.alignLeft]}>
                <Text
                  style={[
                    styles.labelText,
                    styles.alignLeft,
                    styles.labelTextOver,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {wkplcTyp}
                </Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell11}>
                <Text style={[styles.labelTextNarrow, styles.alignRight]}>
                  　　　　　
                </Text>
              </View>
              <View style={[styles.tableCell5, styles.alignLeft]}>
                <Text
                  style={[
                    styles.labelTextNarrow,
                    styles.alignLeft,
                    styles.labelTextOver,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {wkplc}
                </Text>
              </View>
            </View>
            <View style={[styles.narrow]}>
              <TouchableOpacity
                disabled={!isBtnEnabledWkp}
                style={[styles.button, styles.buttonSmall, styles.centerButton]}
                onPress={btnWkPlcQr}>
                <Text style={styles.buttonText}>作業場所読込</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableCell11}>
                <Text style={[styles.labelText, styles.alignRight]}>
                  輸送車両：
                </Text>
              </View>
              <View style={[styles.tableCell5, styles.alignLeft]}>
                <Text
                  style={[
                    styles.labelText,
                    styles.alignLeft,
                    styles.labelTextOver,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {carPlate}
                </Text>
              </View>
            </View>
            <View style={[styles.narrow]}>
              <TouchableOpacity
                disabled={!isBtnEnabledCar}
                style={[styles.button, styles.buttonSmall, styles.centerButton]}
                onPress={btnCarQr}>
                <Text style={styles.buttonText}>車両読込</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableCell11}>
                <Text style={[styles.labelText, styles.alignRight]}>
                  　運転手：
                </Text>
              </View>
              <View style={[styles.tableCell5, styles.alignLeft]}>
                <Text
                  style={[
                    styles.labelText,
                    styles.alignLeft,
                    styles.labelTextOver,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {drvNm}
                </Text>
              </View>
            </View>
            <View style={[styles.narrow]}>
              <TouchableOpacity
                disabled={!isBtnEnabledDrv}
                style={[styles.button, styles.buttonSmall, styles.centerButton]}
                onPress={btnDrvQr}>
                <Text style={styles.buttonText}>運転手読込</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableCell11}>
                <Text style={[styles.labelText, styles.alignRight]}>
                  　行先名：
                </Text>
              </View>
              <View style={[styles.tableCell5, styles.alignLeft]}>
                <Text
                  style={[
                    styles.labelText,
                    styles.alignLeft,
                    styles.labelTextOver,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {destinationNm}
                </Text>
              </View>
            </View>
            <View style={[styles.narrow]}>
              <TouchableOpacity
                disabled={!isBtnEnabledDst}
                style={[styles.button, styles.buttonSmall, styles.centerButton]}
                onPress={btnDestamQr}>
                <Text style={styles.buttonText}>行先読込</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.flex1} />
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

        {/* 車両用QRコードスキャナー */}
        {showScannerCarQr && (
          <Modal
            visible={showScannerCarQr}
            onRequestClose={() => setShowScannerCarQr(false)}>
            <QRScanner
              onScan={handleCodeScannedForCarQr}
              closeModal={() => setShowScannerCarQr(false)}
              isActive={showScannerCarQr}
              errMsg={'車両QRコード'}
            />
          </Modal>
        )}

        {/* 運転手用QRコードスキャナー */}
        {showScannerDrvQr && (
          <Modal
            visible={showScannerDrvQr}
            onRequestClose={() => setShowScannerDrvQr(false)}>
            <QRScanner
              onScan={handleCodeScannedForDrvQr}
              closeModal={() => setShowScannerDrvQr(false)}
              isActive={showScannerDrvQr}
              errMsg={'運転手QRコード'}
            />
          </Modal>
        )}

        {/* 行先用QRコードスキャナー */}
        {showScannerDestamQr && (
          <Modal
            visible={showScannerDestamQr}
            onRequestClose={() => setShowScannerDestamQr(false)}>
            <QRScanner
              onScan={handleCodeScannedForDestamQr}
              closeModal={() => setShowScannerDestamQr(false)}
              isActive={showScannerDestamQr}
              errMsg={'行先QRコード'}
            />
          </Modal>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
export default WA1120;
