/**-------------------------------------------
 * A01-0120_輸送カード申請
 * WA1122
 * screens/WA1122.tsx
 * ---------------------------------------------*/
import FunctionHeader from '../components/FunctionHeader.tsx'; // Headerコンポーネントのインポート
import Footer from '../components/Footer.tsx'; // Footerコンポーネントのインポート
import {styles} from '../styles/CommonStyle.tsx'; // 共通スタイル
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import {logUserAction, logScreen} from '../utils/Log.tsx';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../navigation/AppNavigator.tsx';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {
  WA1120DataState,
  WA1120PrevScreenId,
  WA1120WkPlacState,
  WA1120CarState,
  WA1120DrvState,
  WA1120DestState,
  WA1120TrpCardNoState,
  WA1121DataState,
} from '../atom/atom.tsx';
import {useAlert} from '../components/AlertContext.tsx';
import messages from '../utils/messages.tsx';
import ProcessingModal from '../components/Modal.tsx';
import {getInstance} from '../utils/Realm.tsx'; // realm.jsから関数をインポート
import {IFT0130} from '../utils/Api.tsx';
import {getCurrentDateTime} from '../utils/common.tsx';
import {
  ApiResponse,
  caLgSdBgDsInfoConst,
  IFT0130Response,
  IFT0130ResponseDtl1,
  IFT0130ResponseDtl2,
} from '../types/type';
import {useButton} from '../hook/useButton.tsx';

// WA1122 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1122'>;
interface Props {
  navigation: NavigationProp;
}
const WA1122 = ({navigation}: Props) => {
  const [frCaLgSdBgDsInt, setFrCaLgSdBgDsInt] = useState<string>(''); //前の線量_整数
  const [frCaLgSdBgDsDec, setFrCaLgSdBgDsDec] = useState<string>(''); //前の線量_小数
  const [leCaLgSdBgDsInt, setLeCaLgSdBgDsInt] = useState<string>(''); //左の線量_整数
  const [leCaLgSdBgDsDec, setLeCaLgSdBgDsDec] = useState<string>(''); //左の線量_小数
  const [baCaLgSdBgDsInt, setBaCaLgSdBgDsInt] = useState<string>(''); //後の線量_整数
  const [baCaLgSdBgDsDec, setBaCaLgSdBgDsDec] = useState<string>(''); //後の線量_小数
  const [riCaLgSdBgDsInt, setRiCaLgSdBgDsInt] = useState<string>(''); //右の線量_整数
  const [riCaLgSdBgDsDec, setRiCaLgSdBgDsDec] = useState<string>(''); //右の線量_小数
  const [caLgSdBgDsInfo, setCaLgSdBgDsInfo] = useState<caLgSdBgDsInfoConst>({
    front: '', //放射線量 前
    back: '', //放射線量 後
    right: '', //放射線量 右
    left: '', //放射線量 左
  });
  const [modalVisible, setModalVisible] = useState<boolean>(false); //処理中モーダルの状態
  const [isSend, setIsSend] = useState<boolean>(false); // 送信ボタン 活性・非活性
  const WA1120WkPlac = useRecoilValue(WA1120WkPlacState); // Recoil 作業場所情報
  const WA1120Car = useRecoilValue(WA1120CarState); // Recoil 車両情報
  const WA1120Drv = useRecoilValue(WA1120DrvState); // Recoil 運転手情報情報
  const WA1120Dest = useRecoilValue(WA1120DestState); // Recoil 行先情報
  const WA1120Data = useRecoilValue(WA1120DataState); // Recoil 画面上部作業情報
  const WA1120TrpCardNo = useRecoilValue(WA1120TrpCardNoState); // Recoil 輸送カード番号
  const [WA1121Data, setWA1121Data] = useRecoilState(WA1121DataState); // Recoil 画面作業情報
  const setPrevScreenId = useSetRecoilState(WA1120PrevScreenId); //遷移元画面ID
  const [isBtnEnabledDel, toggleButtonDel] = useButton(); //ボタン制御
  const [isBtnEnabledBck, toggleButtonBck] = useButton(); //ボタン制御
  const [isBtnEnabledSnd, toggleButtonSnd] = useButton(); //ボタン制御
  const realm = getInstance();
  const settingsInfo = realm.objects('settings')[0];
  const {showAlert} = useAlert();

  /************************************************
   * 初期表示設定
   ************************************************/
  useEffect(() => {}, []);

  //線量監視 送信ボタン活性/非活性
  useEffect(() => {
    if (
      frCaLgSdBgDsInt &&
      frCaLgSdBgDsDec &&
      leCaLgSdBgDsInt &&
      leCaLgSdBgDsDec &&
      baCaLgSdBgDsInt &&
      baCaLgSdBgDsDec &&
      riCaLgSdBgDsInt &&
      riCaLgSdBgDsDec &&
      Number(frCaLgSdBgDsInt) + Number('0.' + frCaLgSdBgDsDec) <
        Number(settingsInfo.ldpRadioThresMax) &&
      Number(leCaLgSdBgDsInt) + Number('0.' + leCaLgSdBgDsDec) <
        Number(settingsInfo.ldpRadioThresMax) &&
      Number(baCaLgSdBgDsInt) + Number('0.' + baCaLgSdBgDsDec) <
        Number(settingsInfo.ldpRadioThresMax) &&
      Number(riCaLgSdBgDsInt) + Number('0.' + riCaLgSdBgDsDec) <
        Number(settingsInfo.ldpRadioThresMax)
    ) {
      setCaLgSdBgDsInfo({
        front: frCaLgSdBgDsInt + '.' + frCaLgSdBgDsDec, //放射線量 前
        left: leCaLgSdBgDsInt + '.' + leCaLgSdBgDsDec, //放射線量 左
        back: baCaLgSdBgDsInt + '.' + baCaLgSdBgDsDec, //放射線量 後
        right: riCaLgSdBgDsInt + '.' + riCaLgSdBgDsDec, //放射線量 右
      });
      setIsSend(true);
    } else {
      setIsSend(false);
    }
  }, [
    frCaLgSdBgDsInt,
    frCaLgSdBgDsDec,
    leCaLgSdBgDsInt,
    leCaLgSdBgDsDec,
    baCaLgSdBgDsInt,
    baCaLgSdBgDsDec,
    riCaLgSdBgDsInt,
    riCaLgSdBgDsDec,
  ]);

  // 小数点以下二桁目補填 前
  const handleBlurFrCaLgSdBgDsDec = () => {
    if (frCaLgSdBgDsDec.length < 2) {
      setFrCaLgSdBgDsDec(frCaLgSdBgDsDec.padEnd(2, '0'));
    }
  };

  // 小数点以下二桁目補填 左
  const handleBlurLeCaLgSdBgDsDec = () => {
    if (leCaLgSdBgDsDec.length < 2) {
      setLeCaLgSdBgDsDec(leCaLgSdBgDsDec.padEnd(2, '0'));
    }
  };

  // 小数点以下二桁目補填 後
  const handleBlurBaCaLgSdBgDsDec = () => {
    if (baCaLgSdBgDsDec.length < 2) {
      setBaCaLgSdBgDsDec(baCaLgSdBgDsDec.padEnd(2, '0'));
    }
  };

  // 小数点以下二桁目補填 右
  const handleBlurRiCaLgSdBgDsDec = () => {
    if (riCaLgSdBgDsDec.length < 2) {
      setRiCaLgSdBgDsDec(riCaLgSdBgDsDec.padEnd(2, '0'));
    }
  };

  /************************************************
   * ボタンスタイル
   ************************************************/
  const getButtonStyle = () => {
    return isSend
      ? [styles.button, styles.startButton]
      : [styles.button, styles.startButton, styles.settingButtonDisabled];
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
    await logUserAction('ボタン押下: WA1122 - 破棄');
    const result = await showAlert('確認', messages.IA5012(), true);
    if (result) {
      setPrevScreenId('WA1040');
      await logScreen('画面遷移: WA1122 → WA1120_輸送カード申請QR読込');
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
    await logUserAction('ボタン押下: WA1122 - 戻る');
    const result = await showAlert('確認', messages.IA5014(), true);
    if (result) {
      await logScreen('画面遷移: WA1122 → WA1121_輸送カード申請新タグ読込');
      navigation.navigate('WA1121');
    }
  };

  /************************************************
   * 送信ボタン処理
   ************************************************/
  const btnAppSend = async () => {
    //ボタン連続押下制御
    if (!isBtnEnabledSnd) {
      return;
    } else {
      toggleButtonSnd();
    }
    await logUserAction('ボタン押下: WA1122 - 送信');

    //線量_前、線量_左、線量_後、線量_右の値がいずれが[Realm].[設定ファイル].[荷台線量_上限閾値]を超える場合
    if (
      Number(frCaLgSdBgDsInt) + Number('0.' + frCaLgSdBgDsDec) >=
        Number(settingsInfo.ldpRadioThresMax) ||
      Number(leCaLgSdBgDsInt) + Number('0.' + leCaLgSdBgDsDec) >=
        Number(settingsInfo.ldpRadioThresMax) ||
      Number(baCaLgSdBgDsInt) + Number('0.' + baCaLgSdBgDsDec) >=
        Number(settingsInfo.ldpRadioThresMax) ||
      Number(riCaLgSdBgDsInt) + Number('0.' + riCaLgSdBgDsDec) >=
        Number(settingsInfo.ldpRadioThresMax)
    ) {
      await showAlert(
        '通知',
        messages.EA5021(String(settingsInfo.ldpRadioThresMax)),
        false,
      );
      return;
    }

    //線量_前、線量_左、線量_後、線量_右の値がいずれが[Realm].[設定ファイル].[荷台線量_閾値]を超える場合
    if (
      Number(frCaLgSdBgDsInt) + Number('0.' + frCaLgSdBgDsDec) >=
        Number(settingsInfo.ldpRadioThres) ||
      Number(leCaLgSdBgDsInt) + Number('0.' + leCaLgSdBgDsDec) >=
        Number(settingsInfo.ldpRadioThres) ||
      Number(baCaLgSdBgDsInt) + Number('0.' + baCaLgSdBgDsDec) >=
        Number(settingsInfo.ldpRadioThres) ||
      Number(riCaLgSdBgDsInt) + Number('0.' + riCaLgSdBgDsDec) >=
        Number(settingsInfo.ldpRadioThres)
    ) {
      const result = await showAlert(
        '確認',
        messages.WA5005(String(settingsInfo.ldpRadioThres)),
        true,
      );
      if (!result) {
        return;
      }
    }

    //線量_前＞（線量_後＋線量_左＋線量_右）÷３×５の場合
    if (
      Number(frCaLgSdBgDsInt) + Number('0.' + frCaLgSdBgDsDec) >
      ((Number(leCaLgSdBgDsInt) +
        Number('0.' + leCaLgSdBgDsDec) +
        Number(baCaLgSdBgDsInt) +
        Number('0.' + baCaLgSdBgDsDec) +
        Number(riCaLgSdBgDsInt) +
        Number('0.' + riCaLgSdBgDsDec)) /
        3) *
        5
    ) {
      const result = await showAlert(
        '確認',
        messages.WA5008(
          String(Number(frCaLgSdBgDsInt) + Number('0.' + frCaLgSdBgDsDec)),
        ),
        true,
      );
      if (!result) {
        return;
      }
    }

    //線量_後＞（線量_前＋線量_左＋線量_右）÷３×５の場合
    if (
      Number(baCaLgSdBgDsInt) + Number('0.' + baCaLgSdBgDsDec) >
      ((Number(leCaLgSdBgDsInt) +
        Number('0.' + leCaLgSdBgDsDec) +
        Number(frCaLgSdBgDsInt) +
        Number('0.' + frCaLgSdBgDsDec) +
        Number(riCaLgSdBgDsInt) +
        Number('0.' + riCaLgSdBgDsDec)) /
        3) *
        5
    ) {
      const result = await showAlert(
        '確認',
        messages.WA5008(
          String(Number(baCaLgSdBgDsInt) + Number('0.' + baCaLgSdBgDsDec)),
        ),
        true,
      );
      if (!result) {
        return;
      }
    }

    //線量_右＞（線量_前＋線量_後＋線量_左）÷３×５の場合
    if (
      Number(riCaLgSdBgDsInt) + Number('0.' + riCaLgSdBgDsDec) >
      ((Number(leCaLgSdBgDsInt) +
        Number('0.' + leCaLgSdBgDsDec) +
        Number(baCaLgSdBgDsInt) +
        Number('0.' + baCaLgSdBgDsDec) +
        Number(frCaLgSdBgDsInt) +
        Number('0.' + frCaLgSdBgDsDec)) /
        3) *
        5
    ) {
      const result = await showAlert(
        '確認',
        messages.WA5008(
          String(Number(riCaLgSdBgDsInt) + Number('0.' + riCaLgSdBgDsDec)),
        ),
        true,
      );
      if (!result) {
        return;
      }
    }

    //線量_左＞（線量_前＋線量_後＋線量_右）÷３×５の場合
    if (
      Number(leCaLgSdBgDsInt) + Number('0.' + leCaLgSdBgDsDec) >
      ((Number(frCaLgSdBgDsInt) +
        Number('0.' + frCaLgSdBgDsDec) +
        Number(baCaLgSdBgDsInt) +
        Number('0.' + baCaLgSdBgDsDec) +
        Number(riCaLgSdBgDsInt) +
        Number('0.' + riCaLgSdBgDsDec)) /
        3) *
        5
    ) {
      const result = await showAlert(
        '確認',
        messages.WA5008(
          String(Number(leCaLgSdBgDsInt) + Number('0.' + leCaLgSdBgDsDec)),
        ),
        true,
      );
      if (!result) {
        return;
      }
    }

    //[フレコン種別]が1:除去土壌の場合
    if (WA1121Data.freTyp === '1') {
      //[高低濃度混在]が"3:高低濃度混在"の場合
      if (WA1121Data.udNoMb === '3') {
        const result = await showAlert(
          '確認',
          messages.WA5009('高濃度・低濃度'),
          true,
        );
        if (!result) {
          return;
        }
      }
      //[不燃可燃混在]が"3:不燃・可燃混載"の場合
      if (WA1121Data.nenMb === '3') {
        const result = await showAlert(
          '確認',
          messages.WA5009('不燃・可燃'),
          true,
        );
        if (!result) {
          return;
        }
      }
    }

    //[フレコン種別]が2:焼却灰の場合
    if (WA1121Data.freTyp === '2') {
      //[主灰・飛灰]が"3:主灰・飛灰混載"の場合
      if (WA1121Data.haiMb === '3') {
        const result = await showAlert(
          '確認',
          messages.WA5009('主灰・飛灰'),
          true,
        );
        if (!result) {
          return;
        }
      }
    }

    setModalVisible(true);
    setModalVisible(true);
    const dateStr = getCurrentDateTime();
    //通信処理 IFT0130 輸送カード申請
    // 通信を実施
    const responseIFT0130 = await IFT0130(
      WA1120WkPlac,
      WA1120Car,
      WA1120Drv,
      WA1120Dest,
      WA1121Data,
      dateStr,
      caLgSdBgDsInfo,
    );
    if (await apiIsError(responseIFT0130)) {
      setModalVisible(false);
      return false;
    }
    const data = responseIFT0130.data as IFT0130Response<
      IFT0130ResponseDtl1,
      IFT0130ResponseDtl2
    >;
    const dataDtl = data.dtl[0] as IFT0130ResponseDtl1;
    if (data.invCnt > 0 || dataDtl.trpCdAplRst === 1) {
      await showAlert('通知', messages.EA5015(), false);
      setModalVisible(false);
      await logScreen('画面遷移: WA1122 → WA1121_輸送カード申請QRコード読込');
      navigation.navigate('WA1121');
    }

    //応答データで一時記憶領域更新
    //輸送カード申請結果を更新
    const trpCardApRslt = dataDtl.trpCdAplRst;
    setWA1121Data({...WA1121Data, trpCardApRslt: String(trpCardApRslt)});
    setModalVisible(false);
    await logScreen('画面遷移: WA1122 → WA1123_輸送カード申請結果表示');
    navigation.navigate('WA1123');
  };

  /************************************************
   * API通信処理エラー有無確認・エラーハンドリング
   * @param {*} response
   * @returns
   ************************************************/
  const apiIsError = async <T,>(response: ApiResponse<T>): Promise<string> => {
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
      }
      return 'error';
    } else {
      return '';
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
          viewTitle={'荷台高さ線量入力'}
          functionTitle={'輸送(申)'}
        />

        {/* 上段 */}
        <View style={[styles.main]}>
          <Text
            style={[styles.labelText, styles.labelTextOver]}
            numberOfLines={1}
            ellipsizeMode="tail">
            作業場所：{WA1120Data.wkplcTyp}
          </Text>
          <Text
            style={[
              styles.labelTextNarrow,
              styles.labelTextPlace,
              styles.labelTextOver,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {WA1120Data.wkplc}
          </Text>
        </View>

        {/* 中段1 */}
        <View style={[styles.textareaContainer, styles.topContent]}>
          <View style={styles.tableMain}>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={[styles.labelTextNarrow, styles.alignRight]}>
                  輸送車両：
                </Text>
              </View>
              <View style={styles.tableCell}>
                <Text
                  style={[styles.labelTextNarrow, styles.labelTextOver]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {WA1120Car.carNo}
                </Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={[styles.labelTextNarrow, styles.alignRight]}>
                  運転手：
                </Text>
              </View>
              <View style={styles.tableCell}>
                <Text
                  style={[styles.labelTextNarrow, styles.labelTextOver]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {WA1120Drv.drvNm}
                </Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={[styles.labelTextNarrow, styles.alignRight]}>
                  行先名：
                </Text>
              </View>
              <View style={styles.tableCell}>
                <Text
                  style={[styles.labelTextNarrow, styles.labelTextOver]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {WA1120Dest.fixPlacNm}
                </Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={[styles.labelTextNarrow, styles.alignRight]}>
                  輸送カード番号：
                </Text>
              </View>
              <View style={styles.tableCell}>
                <Text
                  style={[styles.labelTextNarrow, styles.labelTextOver]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {WA1120TrpCardNo}
                </Text>
              </View>
            </View>
            <View style={[styles.tableRow, styles.center]}>
              <Text style={[styles.labelText, styles.centerContent]}>
                荷台各面の中心位置放射線量率を入力後、
                送信ボタンを押して下さい。
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.main, styles.topContent]}>
          <View style={styles.middleContainer}>
            <View style={styles.tableMain}>
              <View style={[styles.tableRow, styles.pickerContainer]}>
                <View style={[styles.tableCell, styles.inputContainer]}>
                  <Text style={[styles.inputLabelText, styles.alignRight]}>
                    前：
                  </Text>
                  <TextInput
                    testID='radiation_forward'
                    keyboardType="numeric"
                    value={frCaLgSdBgDsInt}
                    style={styles.inputIntDecNarrow}
                    maxLength={3}
                    onChangeText={(text: string) => {
                      const filteredText = text.replace(/[^0-9]/g, '');
                      setFrCaLgSdBgDsInt(filteredText);
                    }}
                  />
                  <Text style={styles.dotStyle}>.</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={frCaLgSdBgDsDec}
                    style={styles.inputIntDecNarrow}
                    maxLength={2}
                    onChangeText={(text: string) => {
                      const filteredText = text.replace(/[^0-9]/g, '');
                      setFrCaLgSdBgDsDec(filteredText);
                    }}
                    onBlur={handleBlurFrCaLgSdBgDsDec}
                  />
                  <Text style={[styles.dotStyle, styles.inputLabelText]}>
                    μSv/h
                  </Text>
                </View>
              </View>
              <View style={[styles.tableRow, styles.pickerContainer]}>
                <View style={[styles.tableCell, styles.inputContainer]}>
                  <Text style={[styles.inputLabelText, styles.alignRight]}>
                    左：
                  </Text>
                  <TextInput
                    testID='radiation_left'
                    keyboardType="numeric"
                    value={leCaLgSdBgDsInt}
                    style={styles.inputIntDecNarrow}
                    maxLength={3}
                    onChangeText={(text: string) => {
                      const filteredText = text.replace(/[^0-9]/g, '');
                      setLeCaLgSdBgDsInt(filteredText);
                    }}
                  />
                  <Text style={styles.dotStyle}>.</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={leCaLgSdBgDsDec}
                    style={styles.inputIntDecNarrow}
                    maxLength={2}
                    onChangeText={(text: string) => {
                      const filteredText = text.replace(/[^0-9]/g, '');
                      setLeCaLgSdBgDsDec(filteredText);
                    }}
                    onBlur={handleBlurLeCaLgSdBgDsDec}
                  />
                  <Text style={[styles.dotStyle, styles.inputLabelText]}>
                    μSv/h
                  </Text>
                </View>
              </View>
              <View style={[styles.tableRow, styles.pickerContainer]}>
                <View style={[styles.tableCell, styles.inputContainer]}>
                  <Text style={[styles.inputLabelText, styles.alignRight]}>
                    後：
                  </Text>
                  <TextInput
                    testID='radiation_back'
                    keyboardType="numeric"
                    value={baCaLgSdBgDsInt}
                    style={styles.inputIntDecNarrow}
                    maxLength={3}
                    onChangeText={(text: string) => {
                      const filteredText = text.replace(/[^0-9]/g, '');
                      setBaCaLgSdBgDsInt(filteredText);
                    }}
                  />
                  <Text style={styles.dotStyle}>.</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={baCaLgSdBgDsDec}
                    style={styles.inputIntDecNarrow}
                    maxLength={2}
                    onChangeText={(text: string) => {
                      const filteredText = text.replace(/[^0-9]/g, '');
                      setBaCaLgSdBgDsDec(filteredText);
                    }}
                    onBlur={handleBlurBaCaLgSdBgDsDec}
                  />
                  <Text style={[styles.dotStyle, styles.inputLabelText]}>
                    μSv/h
                  </Text>
                </View>
              </View>
              <View style={[styles.tableRow, styles.pickerContainer]}>
                <View style={[styles.tableCell, styles.inputContainer]}>
                  <Text style={[styles.inputLabelText, styles.alignRight]}>
                    右：
                  </Text>
                  <TextInput
                    testID='radiation_right'
                    keyboardType="numeric"
                    value={riCaLgSdBgDsInt}
                    style={styles.inputIntDecNarrow}
                    maxLength={3}
                    onChangeText={(text: string) => {
                      const filteredText = text.replace(/[^0-9]/g, '');
                      setRiCaLgSdBgDsInt(filteredText);
                    }}
                  />
                  <Text style={styles.dotStyle}>.</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={riCaLgSdBgDsDec}
                    style={styles.inputIntDecNarrow}
                    maxLength={2}
                    onChangeText={(text: string) => {
                      const filteredText = text.replace(/[^0-9]/g, '');
                      setRiCaLgSdBgDsDec(filteredText);
                    }}
                    onBlur={handleBlurRiCaLgSdBgDsDec}
                  />
                  <Text style={[styles.dotStyle, styles.inputLabelText]}>
                    μSv/h
                  </Text>
                </View>
              </View>
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
            style={getButtonStyle()}
            disabled={!isSend || !isBtnEnabledSnd}
            onPress={btnAppSend}>
            <Text style={styles.startButtonText}>送信</Text>
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
export default WA1122;
