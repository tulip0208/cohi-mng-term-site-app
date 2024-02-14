/**-------------------------------------------
 * A01-0120_輸送カード申請
 * WA1121
 * screens/WA1121.tsx
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
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import {logUserAction, logScreen} from '../utils/Log.tsx';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../navigation/AppNavigator.tsx';
import {useRecoilState, useRecoilValue, useResetRecoilState} from 'recoil';
import {
  WA1120PrevScreenId,
  WA1120DataState,
  WA1120WkPlacState,
  WA1120CarState,
  WA1120DrvState,
  WA1120DestState,
  WA1120TrpCardNoState,
  WA1121DataState,
  WA1121NewTagListState,
} from '../atom/atom.tsx';
import {useAlert} from '../components/AlertContext.tsx';
import messages from '../utils/messages.tsx';
import {
  ApiResponse,
  IFA0330Response,
  IFA0330ResponseDtl,
  IFA0340Response,
  IFA0340ResponseDtl,
} from '../types/type';
import QRScanner from '../utils/QRScanner.tsx';
import {RNCamera} from 'react-native-camera';
import ProcessingModal from '../components/Modal.tsx';
import {IFT0130, IFA0330, IFA0340} from '../utils/Api.tsx';
import {getInstance} from '../utils/Realm.tsx'; // realm.jsから関数をインポート
import {getCurrentDateTime} from '../utils/common.tsx';

// WA1121 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1121'>;
interface Props {
  navigation: NavigationProp;
}
const WA1121 = ({navigation}: Props) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false); //処理中モーダルの状態
  const [showScannerTag, setShowScannerTag] = useState<boolean>(false); // カメラ表示用の状態
  const [isDisabled, setIsDisabled] = useState<boolean>(false); // 送信・次へボタンのスタイル 活性・非活性
  const [isTagRead, setIsTagRead] = useState<boolean>(true); // タグ読込ボタンのスタイル 活性・非活性
  const [isSendNext, setIsSendNext] = useState<boolean>(true); // true=送信表示,false=次へ表示
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null,
  ); //長押しタグ表示用
  const WA1120TrpCardNo = useRecoilValue(WA1120TrpCardNoState); // Recoil 輸送カード番号
  const WA1120WkPlac = useRecoilValue(WA1120WkPlacState); // Recoil 作業場所情報
  const WA1120Car = useRecoilValue(WA1120CarState); // Recoil 車両情報
  const WA1120Drv = useRecoilValue(WA1120DrvState); // Recoil 運転手情報情報
  const WA1120Dest = useRecoilValue(WA1120DestState); // Recoil 行先情報
  const WA1120Data = useRecoilValue(WA1120DataState); // Recoil 画面上部作業情報
  const newTagList = useRecoilValue(WA1121NewTagListState); // Recoil 新タグリスト
  const [prevScreenId, setPrevScreenId] = useRecoilState(WA1120PrevScreenId); // Recoil 遷移元画面ID
  const [WA1121Data, setWA1121Data] = useRecoilState(WA1121DataState); // Recoil 画面作業情報
  const resetWA1121Data = useResetRecoilState(WA1121DataState); //Recoilリセット
  const realm = getInstance();
  const {showAlert} = useAlert();

  /************************************************
   * 初期表示設定
   ************************************************/
  useEffect(() => {
    //一時記憶領域初期化
    if (prevScreenId === 'WA1120') {
      resetWA1121Data();
    }
    //積載可能重量設定
    let wt = 0;
    if (Number(WA1120Car.empCarWt) <= Number(WA1120Car.carWt)) {
      wt = Number(WA1120Car.maxWt);
    } else {
      wt =
        Number(WA1120Car.maxWt) -
        (Number(WA1120Car.empCarWt) - Number(WA1120Car.carWt));
    }
    setWA1121Data(data => ({
      ...data,
      possibleWt: String(wt),
    }));
    //残り積載可能
    const leftWt = wt - Number(WA1121Data.sumWt);
    setWA1121Data(data => ({
      ...data,
      leftWt: String(leftWt),
    }));
    //送信・次へボタン
    const settingsInfo = realm.objects('settings')[0];
    if (wt > Number(settingsInfo.radioThres)) {
      setIsSendNext(true);
    }
  }, []);

  //新タグ情報20件以上の場合 タグ読込非活性
  useEffect(() => {
    if (newTagList.length >= 20) {
      setIsTagRead(false);
    }
  }, [newTagList]);

  //新タグ情報0件
  useEffect(() => {
    if (newTagList.length <= 0) {
      setIsDisabled(false);
    } else {
      //送信・次へ表示非表示
      const maxCaLgSdBgDs = Math.max(
        ...newTagList.map(newTag => parseFloat(newTag.caLgSdBgDs) || 0),
      );

      if (maxCaLgSdBgDs > 30) {
        setIsSendNext(true);
      } else {
        setIsSendNext(false);
      }
    }
  }, [newTagList]);

  // タグ読込ボタンのスタイルを動的に変更するための関数
  const getTagReadButtonStyle = () => {
    return isTagRead
      ? [styles.buttonNarrower, styles.centerButtonNarrow]
      : [
          styles.buttonNarrower,
          styles.centerButtonNarrow,
          styles.disabledButton,
        ];
  };

  // 送信・次へボタンのスタイルを動的に変更するための関数
  const getActionButtonStyle = () => {
    return isDisabled
      ? [styles.button, styles.startButton, styles.disabledButton]
      : [styles.button, styles.startButton];
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
    const parts = data.split(',');
    setShowScannerTag(false);
    let code = '';
    //QR・バーコードではない場合
    if (type !== RNCamera.Constants.BarCodeType.qr && type !== 'CODABAR') {
      await showAlert('通知', messages.EA5008(), false);
      return;
    } else if (type === 'CODABAR') {
      if (!checkFormat(data)) {
        await showAlert('通知', messages.EA5017(data), false);
        return;
      }
      code = 'a' + data + 'a';
    } else if (type === RNCamera.Constants.BarCodeType.qr) {
      if (parts.length === 1 || parts[0] !== 'CM') {
        await showAlert('通知', messages.EA5009(), false);
        return;
      }
      code = 'a' + parts[1] + 'a';
    }
    setModalVisible(true);
    newTagIdProc(code);
    setModalVisible(false);
    return;
  };

  // タグコードスキャンボタン押下時の処理
  const btnTagQr = async () => {
    await logUserAction('ボタン押下: WA1121 - タグ読込');
    //カメラ起動
    setShowScannerTag(true);
  };

  /************************************************
   * 破棄ボタン処理
   ************************************************/
  const btnAppDestroy = async () => {
    await logUserAction('ボタン押下: WA1121 - 破棄');
    const result = await showAlert('確認', messages.IA5012(), true);
    if (result) {
      //遷移元画面セット
      setPrevScreenId('WA1040');
      await logScreen('画面遷移: WA1121 → WA1121_輸送カード申請QR読込');
      navigation.navigate('WA1121');
    }
  };

  /************************************************
   * 戻るボタン処理
   ************************************************/
  const btnAppBack = async () => {
    await logUserAction('ボタン押下: WA1121 - 戻る');
    const result = await showAlert('確認', messages.IA5014(), true);
    if (result) {
      //新タグリストを初期値にリセット
      resetWA1121Data();
      await logScreen('画面遷移: WA1121 → WA1120_輸送カード申請QR読込');
      navigation.navigate('WA1120');
    }
  };

  /************************************************
   * 送信ボタン処理
   ************************************************/
  const btnSend = async () => {
    await logUserAction('ボタン押下: WA1121 - 送信');
    setModalVisible(true);

    //継続不可能組み合わせ判定
    //[フレコン種別]＝"1:除去土壌"の場合
    if (WA1121Data.freTyp === '1') {
      //[高低濃度混載]＝"3:混載"の場合
      if (WA1121Data.udNoMb === '3') {
        const result = await showAlert(
          '確認',
          messages.WA5009('高濃度・低濃度'),
          true,
        );
        if (!result) {
          //いいえ 処理中止
          return;
        }
      }
      //[不燃可燃混載]＝"3:混載"の場合
      if (WA1121Data.nenMb === '3') {
        const result = await showAlert(
          '確認',
          messages.WA5009('不燃・可燃'),
          true,
        );
        if (!result) {
          //いいえ 処理中止
          return;
        }
      }
      //[フレコン種別]＝"2:焼却灰"の場合
    } else if (WA1121Data.freTyp === '2') {
      //[主灰飛灰混載]＝"3:混載"の場合
      if (WA1121Data.haiMb === '3') {
        const result = await showAlert(
          '確認',
          messages.WA5009('主灰・飛灰'),
          true,
        );
        if (!result) {
          //いいえ 処理中止
          return;
        }
      }
    }

    //物品判定
    //[フレコン種別]＝"1:除去土壌"の場合
    if (WA1121Data.freTyp === '1') {
      //[不燃可燃混載]＝"1:可燃"の場合
      if (WA1121Data.nenMb === '1') {
        setWA1121Data(data => ({
          ...data,
          monoTyp: '0', //物品種類
        }));
      } else {
        setWA1121Data(data => ({
          ...data,
          monoTyp: '1', //物品種類
        }));
      }
      //[フレコン種別]＝"2:焼却灰"の場合
    } else if (WA1121Data.freTyp === '2') {
      //[主灰飛灰混載]＝"2:飛灰"の場合
      if (WA1121Data.haiMb === '2') {
        setWA1121Data(data => ({
          ...data,
          monoTyp: '3', //物品種類
        }));
      } else {
        setWA1121Data(data => ({
          ...data,
          monoTyp: '2', //物品種類
        }));
      }
    }

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
      {
        front: '', //放射線量 前
        back: '', //放射線量 後
        right: '', //放射線量 右
        left: '', //放射線量 左
      },
    );
    if (await apiIsError(responseIFT0130)) {
      setModalVisible(false);
      return false;
    }
    // 【応答データ】.【異常件数】＞0　もしくは【応答データ】.【輸送カード申請結果】="1:否認"の場合
    if (
      (responseIFT0130.data?.invDatDtl.length as number) > 0 ||
      ((responseIFT0130.data?.dtl.length as number) > 0 &&
        responseIFT0130.data?.dtl[0].trpCdAplRst === 1)
    ) {
      setModalVisible(false);
      await showAlert('通知', messages.EA5015(), false);
      return;
    }
    await showAlert('通知', messages.IA5005('輸送カード申請'), false);
    setModalVisible(false);

    //輸送カード申請結果を更新
    const trpCardApRslt = responseIFT0130.data?.dtl[0].trpCdAplRst as number;
    setWA1121Data({...WA1121Data, trpCardApRslt: String(trpCardApRslt)});
    await logScreen('画面遷移: WA1121 → WA1123_輸送カード申請結果表示');
    navigation.navigate('WA1123');
  };

  /************************************************
   * 次へボタン処理
   ************************************************/
  const btnAppNext = async () => {
    await logUserAction('ボタン押下: WA1121 - 次へ');

    //[フレコン種別]＝"1:除去土壌"の場合
    if (WA1121Data.freTyp === '1') {
      //[不燃可燃混載]＝"1:可燃"の場合
      if (WA1121Data.nenMb === '1') {
        setWA1121Data(data => ({
          ...data,
          monoTyp: '0', //物品種類
        }));
      } else {
        setWA1121Data(data => ({
          ...data,
          monoTyp: '1', //物品種類
        }));
      }
      //[フレコン種別]＝"2:焼却灰"の場合
    } else if (WA1121Data.freTyp === '2') {
      //[主灰飛灰混載]＝"2:飛灰"の場合
      if (WA1121Data.haiMb === '2') {
        setWA1121Data(data => ({
          ...data,
          monoTyp: '3', //物品種類
        }));
      } else {
        setWA1121Data(data => ({
          ...data,
          monoTyp: '2', //物品種類
        }));
      }
    }

    await logScreen('画面遷移: WA1121 → WA1122_輸送カード申請荷台高さ線量入力');
    navigation.navigate('WA1122');
  };

  /************************************************
   * 新タグID長押し処理
   ************************************************/
  const onPressIn = (index: number) => {
    // 10秒後に実行されるアクション
    const timer = setTimeout(async () => {
      const result = await showAlert('確認', messages.IA5024(), true);
      if (!result) {
        return;
      }
      //N番目の一次記憶領域の[輸送カード新タグID(配列)][N]の情報を退避して削除
      const tmpInfo = WA1121Data.trpCardTagInfoList[index];
      const newArray = WA1121Data.trpCardTagInfoList.filter(
        (_, i) => i !== index,
      );
      setWA1121Data({...WA1121Data, trpCardTagInfoList: newArray});

      //数量再計算
      //除去土壌等種別
      if (
        tmpInfo.rmSolTyp &&
        (tmpInfo.rmSolTyp === '1' ||
          tmpInfo.rmSolTyp === '2' ||
          tmpInfo.rmSolTyp === '10' ||
          tmpInfo.rmSolTyp === '12')
      ) {
        //可燃再計算
        const flamNm = Number(WA1121Data.flamNm) - 1;
        setWA1121Data({...WA1121Data, flamNm: String(flamNm)});
      } else {
        //不燃再計算
        const nonFlamNm = Number(WA1121Data.nonFlamNm) - 1;
        setWA1121Data({...WA1121Data, nonFlamNm: String(nonFlamNm)});
      }

      //除去土壌等種別
      if (tmpInfo.ashTyp && tmpInfo.ashTyp === '1') {
        //主灰再計算
        const bottomAshNm = Number(WA1121Data.bottomAshNm) - 1;
        setWA1121Data({...WA1121Data, bottomAshNm: String(bottomAshNm)});
      } else if (tmpInfo.ashTyp && tmpInfo.ashTyp === '2') {
        //飛灰再計算
        const flyAshNm = Number(WA1121Data.flyAshNm) - 1;
        setWA1121Data({...WA1121Data, flyAshNm: String(flyAshNm)});
      }

      //累計積載量 再計算
      const sumWt = Number(WA1121Data.sumWt) - Number(tmpInfo.caLgSdBgWt);
      setWA1121Data({...WA1121Data, sumWt: String(sumWt)});

      // 濃度の最大値を求める
      const maxEstRa = WA1121Data.trpCardTagInfoList.reduce((max, item) => {
        // estRaを数値に変換（もし数値でない場合は0を返す）
        const currentEstRa = Number(item.estRa) || 0;
        // 現在の値と最大値を比較し、大きい方を返す
        return Math.max(max, currentEstRa);
      }, 0); // 初期値は0
      // 最大値を一時記憶領域の放射能濃度(最大)に設定
      setWA1121Data({...WA1121Data, maxEstRa: String(maxEstRa)});

      // 線量の最大値を求める
      const surDsRt = WA1121Data.trpCardTagInfoList.reduce((max, item) => {
        //surDsRtを数値に変換（もし数値でない場合は0を返す）
        const currentSurDsRt = Number(item.caLgSdBgWt) || 0;
        // 現在の値と最大値を比較し、大きい方を返す
        return Math.max(max, currentSurDsRt);
      }, 0); // 初期値は0
      // 最大値を一時記憶領域の//表面線量率(最大)に設定
      setWA1121Data({...WA1121Data, surDsRt: String(surDsRt)});

      //残り積載可能 再計算
      const leftWt = Number(WA1121Data.possibleWt) - sumWt;
      setWA1121Data({...WA1121Data, leftWt: String(leftWt)});

      //setInputVisible(true); // 10秒後に実行される処理
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

  /************************************************
   * 設定ボタン処理
   ************************************************/
  const btnSetting = async () => {
    await logUserAction('ボタン押下: WA1121 - 設定');
    if (!checkFormat(inputValue)) {
      await showAlert('通知', messages.EA5017(inputValue), false);
      return;
    }
    const newTag = 'a' + inputValue + 'a';
    await newTagIdProc(newTag);
  };

  /************************************************
   * 新タグ追加処理 aXXXXXXXXXXXXXXXa([a]付与済)
   ************************************************/
  const newTagIdProc = async (tagId: string) => {
    //非同期処理 計算不備回避
    let freTyp = WA1121Data.freTyp;
    let freJudGai = WA1121Data.freJudGai;
    let freJudNen = WA1121Data.freJudNen;
    let freJudNod = WA1121Data.freJudNod;
    let freJudWt = WA1121Data.freJudWt;

    // 新タグIDの2桁目が"6:タグ色黒"もしくは"8:タグ色灰色" の場合
    if (tagId.charAt(1) === '6' || tagId.charAt(1) === '8') {
      //[フレコン判定種別]　＝　"2:焼却灰"
      freTyp = '2';
      setWA1121Data({...WA1121Data, freTyp: '2'});
    } else {
      //[フレコン判定種別]　＝　"1:除去土壌"
      freTyp = '1';
      setWA1121Data({...WA1121Data, freTyp: '1'});
    }

    if (freTyp !== WA1121Data.freJudTyp) {
      await showAlert(
        '通知',
        messages.EA5016('除去土壌等、焼却灰が混載となる'),
        false,
      );
      return;
    }

    // 有害判定 5:赤 7:橙
    if (tagId.charAt(1) === '5' || tagId.charAt(1) === '7') {
      //[フレコン判定有害無害]　＝　"1:有害有り"
      freJudGai = '1';
      setWA1121Data({...WA1121Data, freJudGai: '1'});
    } else {
      //[フレコン判定有害無害]　＝　"0:有害無し"
      freJudGai = '0';
      setWA1121Data({...WA1121Data, freJudGai: '0'});
    }

    // 有害・無害混載判定
    if (WA1121Data.gai !== '9') {
      if (WA1121Data.gai !== freJudGai) {
        await showAlert(
          '通知',
          messages.EA5016('有害・無害が混載となる'),
          false,
        );
        return;
      }
    }

    setModalVisible(true);

    let dataDtl;
    //[フレコン判定種別]＝"1:除去土壌"の場合、除去土壌の判定処理
    if (WA1121Data.freJudTyp === '1') {
      //通信処理
      const responseIFA0330 = await IFA0330(tagId);
      if (await apiIsError(responseIFA0330)) {
        setModalVisible(false);
        return false;
      }
      const data = responseIFA0330.data as IFA0330Response<IFA0330ResponseDtl>;
      dataDtl = data.dtl[0] as IFA0330ResponseDtl;
      //応答データ.除去土壌等種別
      if (
        dataDtl.rmSolTyp &&
        (dataDtl.rmSolTyp === 1 ||
          dataDtl.rmSolTyp === 2 ||
          dataDtl.rmSolTyp === 10 ||
          dataDtl.rmSolTyp === 12)
      ) {
        //[フレコン判定不燃可燃]　＝　"1:可燃"
        freJudNen = '1';
        setWA1121Data({...WA1121Data, freJudNen: '1'});
      } else {
        //[フレコン判定不燃可燃]　＝　"2:不燃"
        freJudNen = '2';
        setWA1121Data({...WA1121Data, freJudNen: '2'});
      }

      //施設区分
      if (WA1120Dest.facTyp === '1') {
        //積込可否判定 3:白
        if (tagId.charAt(1) !== '3') {
          await showAlert('通知', messages.EA5026(), false);
          setModalVisible(false);
          return;
        }

        const settingsInfo = realm.objects('settings')[0];
        //【応答データ】.【推定放射能濃度】＞[Realm].[設定ファイル].[推定放射能濃度_閾値]の場合
        if (dataDtl.estRa > Number(settingsInfo.estRadioThres)) {
          //[フレコン判定濃度]　＝　"1:高濃度"
          freJudNod = '1';
          setWA1121Data({...WA1121Data, freJudNod: '1'});
        } else {
          //[フレコン判定濃度]　＝　"2:低濃度"
          freJudGai = '2';
          setWA1121Data({...WA1121Data, freJudNod: '2'});
        }

        //[高低濃度混載]、[フレコン判定濃度]が異なる場合
        if (WA1121Data.udNoMb !== freJudNod) {
          await showAlert('通知', messages.EA5027(), false);
          setModalVisible(false);
          return;
        }
      }

      //【応答データ】.【仮置場ID】＜＞一次記憶領域の[作業場所ID]の場合
      if (dataDtl.tmpLocId !== WA1120WkPlac.wkplacId) {
        await showAlert('通知', messages.EA5028(), false);
        setModalVisible(false);
        return;
      }

      //[フレコン判定重量]　＝　【応答データ】.【搬出時大型土のう袋等重量
      freJudWt = String(dataDtl.caLgSdBgWt);
      setWA1121Data({...WA1121Data, freJudWt: freJudWt});

      //【積載可能重量】＜（一時記憶領域の[累計積載量]＋一時記憶領域の[フレコン判定重量]の場合中止
      if (WA1121Data.possibleWt < WA1121Data.sumWt + WA1121Data.freJudWt) {
        await showAlert('通知', messages.EA5029(), false);
        setModalVisible(false);
        return;
      }

      const settingsInfo = realm.objects('settings')[0];
      //新タグ情報の追加
      setWA1121Data({
        ...WA1121Data,
        trpCardTagInfoList: [
          ...WA1121Data.trpCardTagInfoList,
          {
            newTagId: dataDtl.newTagId, //新タグID
            rmSolTyp: String(dataDtl.rmSolTyp), //除去土壌等種別
            ashTyp: '', //焼却灰種別
            caLgSdBgWt: String(dataDtl.caLgSdBgWt), //重量
            caLgSdBgDs: String(dataDtl.caLgSdBgDs), //線量
            estRa: String(dataDtl.estRa), //濃度
            raKbn: String(WA1121Data.freJudWt), //濃度区分
            class: tagId.charAt(1), //分類
            newTagIdRed: dataDtl.estRa === 1,
            caLgSdBgDsRed: dataDtl.caLgSdBgDs > Number(settingsInfo.radioThres),
          },
        ],
      });

      //累計積載量の計算
      const sumWt = Number(WA1121Data.sumWt) - dataDtl.caLgSdBgWt;
      setWA1121Data({...WA1121Data, sumWt: String(sumWt)});
      //[輸送カード新タグID].[N].[濃度]　＞　[放射能濃度(最大)]の場合
      if (dataDtl.caLgSdBgWt > Number(WA1121Data.maxEstRa)) {
        const maxEstRa = String(dataDtl.estRa);
        setWA1121Data({...WA1121Data, maxEstRa: maxEstRa});
      }
      //[輸送カード新タグID].[N].[線量]　＞　[表面線量率(最大)]の場合
      if (dataDtl.caLgSdBgDs > Number(WA1121Data.surDsRt)) {
        const surDsRt = String(dataDtl.caLgSdBgDs);
        setWA1121Data({...WA1121Data, surDsRt: surDsRt});
      }

      //[除去土壌等種別]に値が設定されている場合
      if (freJudNen === '1') {
        const flamNm = WA1121Data.flamNm + 1;
        setWA1121Data({...WA1121Data, flamNm: flamNm});
      } else if (freJudNen === '2') {
        const nonFlamNm = WA1121Data.nonFlamNm + 1;
        setWA1121Data({...WA1121Data, nonFlamNm: nonFlamNm});
      }
      //一時記憶領域設定
      //フレコン種別
      if (freTyp === '0') {
        freTyp = WA1121Data.freJudTyp;
        setWA1121Data({...WA1121Data, freTyp: WA1121Data.freJudTyp}); //2
      }
      //有害・無害
      if (WA1121Data.gai === '9') {
        setWA1121Data({...WA1121Data, gai: freJudGai});
      }
      //高低濃度混在
      if (WA1121Data.udNoMb === '0') {
        setWA1121Data({...WA1121Data, udNoMb: freJudNod});
      } else if (WA1121Data.udNoMb !== '0' && WA1121Data.udNoMb !== freJudNod) {
        setWA1121Data({...WA1121Data, udNoMb: '3'});
      }
      //不燃可燃混載
      if (WA1121Data.nenMb === '0') {
        setWA1121Data({...WA1121Data, nenMb: freJudNen});
      } else if (WA1121Data.nenMb !== freJudNen) {
        setWA1121Data({...WA1121Data, nenMb: '3'});
      }
      //----------------------------
    } else if (WA1121Data.freJudTyp === '2') {
      //[フレコン判定種別]＝"2:焼却灰"の場合、除去土壌の判定処理
      //通信処理
      const responseIFA0340 = await IFA0340(tagId);
      if (await apiIsError(responseIFA0340)) {
        setModalVisible(false);
        return false;
      }
      const data = responseIFA0340.data as IFA0340Response<IFA0340ResponseDtl>;
      dataDtl = data.dtl[0] as IFA0340ResponseDtl;

      //【応答データ】.【仮置場ID】＜＞一次記憶領域の[作業場所ID]の場合
      if (dataDtl.tmpLocId !== WA1120WkPlac.wkplacId) {
        await showAlert('通知', messages.EA5028(), false);
        setModalVisible(false);
        return;
      }

      //[フレコン判定重量]　＝　【応答データ】.【表面線量率測定時重量】
      freJudWt = String(dataDtl.surDsWt);
      setWA1121Data({...WA1121Data, freJudWt: freJudWt});

      //【積載可能重量】＜（一時記憶領域の[累計積載量]＋一時記憶領域の[フレコン判定重量]の場合中止
      if (WA1121Data.possibleWt < WA1121Data.sumWt + WA1121Data.freJudWt) {
        await showAlert('通知', messages.EA5029(), false);
        setModalVisible(false);
        return;
      }

      const settingsInfo = realm.objects('settings')[0];
      //新タグ情報の追加
      setWA1121Data({
        ...WA1121Data,
        trpCardTagInfoList: [
          ...WA1121Data.trpCardTagInfoList,
          {
            newTagId: dataDtl.newTagId, //新タグID
            rmSolTyp: '', //除去土壌等種別
            ashTyp: String(dataDtl.ashTyp), //焼却灰種別
            caLgSdBgWt: String(dataDtl.surDsWt), //重量
            caLgSdBgDs: String(dataDtl.surDsRt), //線量
            estRa: String(dataDtl.meaRa), //濃度
            raKbn: '1', //濃度区分
            class: tagId.charAt(1), //分類
            newTagIdRed: dataDtl.meaRa === 1,
            caLgSdBgDsRed: dataDtl.surDsRt > Number(settingsInfo.radioThres),
          },
        ],
      });

      //累計積載量の計算
      const sumWt = Number(WA1121Data.sumWt) - dataDtl.surDsWt;
      setWA1121Data({...WA1121Data, sumWt: String(sumWt)});
      //[輸送カード新タグID].[N].[濃度]　＞　[放射能濃度(最大)]の場合
      if (dataDtl.meaRa > Number(WA1121Data.maxEstRa)) {
        const maxEstRa = String(dataDtl.meaRa);
        setWA1121Data({...WA1121Data, maxEstRa: maxEstRa});
      }
      //[輸送カード新タグID].[N].[線量]　＞　[表面線量率(最大)]の場合
      if (dataDtl.surDsRt > Number(WA1121Data.surDsRt)) {
        const surDsRt = String(dataDtl.surDsRt);
        setWA1121Data({...WA1121Data, surDsRt: surDsRt});
      }

      //[焼却灰種別]に値が設定されている場合
      if (dataDtl.ashTyp === 1) {
        const bottomAshNm = WA1121Data.bottomAshNm + 1;
        setWA1121Data({...WA1121Data, bottomAshNm: bottomAshNm});
      } else if (dataDtl.ashTyp === 2) {
        const flyAshNm = WA1121Data.flyAshNm + 1;
        setWA1121Data({...WA1121Data, flyAshNm: flyAshNm});
      }

      //一時記憶領域設定
      //フレコン種別
      if (WA1121Data.freTyp === '0') {
        freTyp = WA1121Data.freJudTyp;
        setWA1121Data({...WA1121Data, freTyp: WA1121Data.freJudTyp}); //2
      }
      //有害・無害
      if (WA1121Data.gai === '9') {
        setWA1121Data({...WA1121Data, gai: freJudGai});
      }
      //高低濃度混在
      if (WA1121Data.udNoMb === '0') {
        setWA1121Data({...WA1121Data, udNoMb: freJudNod});
      } else if (WA1121Data.udNoMb !== '0' && WA1121Data.udNoMb !== freJudNod) {
        setWA1121Data({...WA1121Data, udNoMb: '3'});
      }
      //主灰飛灰混載
      if (WA1121Data.haiMb === '0') {
        setWA1121Data({...WA1121Data, haiMb: String(dataDtl.ashTyp)});
      } else if (WA1121Data.haiMb !== String(dataDtl.ashTyp)) {
        setWA1121Data({...WA1121Data, haiMb: '3'});
      }
    }
    if (WA1121Data.trpCardTagInfoList.length >= 20) {
      setIsTagRead(false);
    }
    setModalVisible(false);
    //残り積載可能（一時記憶領域の[積載可能重量]　－　位置記事億領域の[累計積載量]）の再計算
    const leftWt = Number(WA1121Data.possibleWt) - Number(WA1121Data.sumWt);
    setWA1121Data({...WA1121Data, leftWt: String(leftWt)});
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
        case 'zero': //取得件数0件の場合
          await showAlert('通知', messages.IA5015(), false);
          return 'zero';
      }
      return 'error';
    } else {
      return '';
    }
  };

  /************************************************
   * データ部分の値を表示するための関数
   ************************************************/
  const renderNewTagList = () => {
    // 色のマッピング
    const colorMapping: {[key: string]: string} = {
      '1': 'green',
      '2': 'yellow',
      '3': 'white',
      '4': 'blue',
      '5': 'red',
      '6': 'black',
      '7': 'orange',
      '8': 'grey',
    };

    //新タグリスト
    const newTagComponent = WA1121Data.trpCardTagInfoList.map(
      (trpCardTagInfo, index) => {
        // 分類に対応する色を取得
        const tagColor = colorMapping[trpCardTagInfo.class];

        return (
          <View key={index} style={[styles.tableMain]}>
            <View style={[styles.tableRow]}>
              <View style={[styles.tableCell3]}>
                <TouchableWithoutFeedback
                  onPressIn={() => onPressIn(index)}
                  onPressOut={onPressOut}>
                  <Text
                    style={[
                      styles.labelText,
                      trpCardTagInfo.newTagIdRed ? styles.red : '',
                    ]}>{`${index + 1}: ${trpCardTagInfo.newTagId}`}</Text>
                </TouchableWithoutFeedback>
              </View>
              <View style={[styles.tableCell1, styles.centerContainer]}>
                <Text style={[styles.labelText]}>分類</Text>
                <View
                  style={[
                    styles.block,
                    {backgroundColor: tagColor}, // 背景色
                  ]}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={[styles.tableCell3]}>
                <Text style={styles.labelTextNarrowMore}>
                  重:{trpCardTagInfo.caLgSdBgWt}
                </Text>
              </View>
              <View style={[styles.tableCell4]}>
                <Text
                  style={[
                    styles.labelTextNarrowMore,
                    trpCardTagInfo.caLgSdBgDsRed ? styles.red : '',
                  ]}>
                  線:{trpCardTagInfo.caLgSdBgDs}
                </Text>
              </View>
              <View style={[styles.tableCell4]}>
                <Text style={styles.labelTextNarrowMore}>
                  濃:{trpCardTagInfo.estRa}
                </Text>
              </View>
            </View>
          </View>
        );
      },
    );

    // 旧タグが9個未満の場合に表示する設定セクション
    if (WA1121Data.trpCardTagInfoList.length < 20) {
      const configComponent = (
        <View
          key={WA1121Data.trpCardTagInfoList.length + 1}
          style={[styles.detailSection]}>
          <View style={[styles.tableCell2, styles.inputContainer]}>
            <Text style={styles.labelTextNarrowMore}>{`${
              WA1121Data.trpCardTagInfoList.length + 1
            }: a`}</Text>
            <TextInput
              value={inputValue}
              style={styles.inputNarrow}
              maxLength={15}
              onChangeText={(text: string) => setInputValue(text)}
            />
            <Text style={styles.labelTextNarrowMore}>{'a'}</Text>
          </View>
          <View style={[styles.tableCell1]}>
            <TouchableOpacity
              style={[
                styles.detailButtonNarrow,
                styles.updateButton,
                styles.labelTextNarrowMore,
              ]}
              onPress={async () => {
                await logUserAction('ボタン押下: WA1121 - 設定');
                await btnSetting();
              }}>
              <Text style={[styles.detailButtonText, styles.settingButtonText]}>
                設定
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
      // configComponent を oldTagComponent 配列の末尾に追加
      newTagComponent.push(configComponent);
    }
    return <View style={styles.tableMain}>{newTagComponent}</View>;
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
          functionTitle={'紐付(土)'}
        />
        {/* 上段 */}
        <View style={styles.tableMain}>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={[styles.labelTextNarrowMore, styles.alignRight]}>
                作業場所:{WA1120Data.wkplcTyp}{' '}
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text
                style={[styles.labelTextNarrowMore, styles.labelTextOver]}
                numberOfLines={1}
                ellipsizeMode="tail">
                :{WA1120Data.wkplc}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={[styles.labelTextNarrowMore, styles.alignRight]}>
                輸送車両{' '}
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text
                style={[styles.labelTextNarrowMore, styles.labelTextOver]}
                numberOfLines={1}
                ellipsizeMode="tail">
                :{WA1120Car.carNo}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={[styles.labelTextNarrowMore, styles.alignRight]}>
                運転手{' '}
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text
                style={[styles.labelTextNarrowMore, styles.labelTextOver]}
                numberOfLines={1}
                ellipsizeMode="tail">
                :{WA1120Drv.drvNm}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={[styles.labelTextNarrowMore, styles.alignRight]}>
                行先名{' '}
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text
                style={[styles.labelTextNarrowMore, styles.labelTextOver]}
                numberOfLines={1}
                ellipsizeMode="tail">
                :{WA1120Dest.fixPlacNm}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={[styles.labelTextNarrowMore, styles.alignRight]}>
                輸送カード番号{' '}
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text
                style={[styles.labelTextNarrowMore, styles.labelTextOver]}
                numberOfLines={1}
                ellipsizeMode="tail">
                :{WA1120TrpCardNo}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.bottomSection}>
          <TouchableOpacity
            disabled={!isTagRead}
            style={getTagReadButtonStyle()}
            onPress={btnTagQr}>
            <Text style={styles.buttonTextNarrow}>タグ読込</Text>
          </TouchableOpacity>
        </View>

        {/* 中段 */}
        <View style={[styles.textareaContainer, styles.topContent]}>
          <View style={styles.scrollPushContainerNarrow}>
            <ScrollView style={styles.scrollPushViewStyle}>
              {renderNewTagList()}
            </ScrollView>
          </View>
        </View>
        <View style={[styles.center]}>
          <Text style={styles.labelTextNarrowMore}>
            数:可燃:{WA1121Data.flamNm} 不燃:{WA1121Data.nonFlamNm} 飛灰:
            {WA1121Data.flyAshNm} 主灰:{WA1121Data.bottomAshNm}
          </Text>
        </View>
        <View style={[styles.tableMain, styles.main]}>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={[styles.labelTextNarrowMore]}>積載可能</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={[styles.labelTextNarrowMore]}>累積可能</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={[styles.labelTextNarrowMore, styles.bold]}>
                残り積載可能
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={[styles.labelTextNarrowMore]}>
                {WA1121Data.possibleWt}
                <Text style={styles.labelSmall}>(kg)</Text>
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={[styles.labelTextNarrowMore]}>
                {WA1121Data.sumWt}
                <Text style={styles.labelSmall}>(kg)</Text>
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={[styles.labelTextNarrowMore, styles.bold]}>
                {WA1121Data.leftWt}
                <Text style={styles.labelSmall}>(kg)</Text>
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={[styles.labelTextNarrowMore]}>表面線量率(最大)</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={[styles.labelTextNarrowMore, styles.bold]}>
                : {WA1121Data.surDsRt}
                <Text style={styles.labelSmall}>(μSv/h)</Text>
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={[styles.labelTextNarrowMore]}>放射能濃度(最大)</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={[styles.labelTextNarrowMore, styles.bold]}>
                : {WA1121Data.maxEstRa}
                <Text style={styles.labelSmall}>(Bq/kg)</Text>
              </Text>
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
          {isSendNext && (
            <TouchableOpacity
              style={getActionButtonStyle()}
              onPress={btnAppNext}
              disabled={isDisabled}>
              <Text style={styles.startButtonText}>次へ</Text>
            </TouchableOpacity>
          )}
          {!isSendNext && (
            <TouchableOpacity
              style={getActionButtonStyle()}
              onPress={btnSend}
              disabled={isDisabled}>
              <Text style={styles.startButtonText}>送信</Text>
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

        {/* タグ用QRコードスキャナー */}
        {showScannerTag && (
          <Modal
            visible={showScannerTag}
            onRequestClose={() => setShowScannerTag(false)}>
            <QRScanner
              onScan={handleCodeScannedForTag}
              closeModal={() => setShowScannerTag(false)}
              isActive={showScannerTag}
              errMsg={'タグ読込'}
            />
          </Modal>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
export default WA1121;
