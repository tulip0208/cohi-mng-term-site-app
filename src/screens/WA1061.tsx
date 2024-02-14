/**-------------------------------------------
 * A01-0060_新タグID参照(土壌)
 * WA1061
 * screens/WA1061.tsx
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
  KeyboardAvoidingView,
} from 'react-native';
import {logUserAction, logScreen} from '../utils/Log.tsx';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../navigation/AppNavigator.tsx';
import {
  useRecoilValue,
  useSetRecoilState,
  useResetRecoilState,
  useRecoilState,
} from 'recoil';
import {
  WA1060PrevScreenId,
  WA1061BackState,
  WA1060NewTagIdState,
  WA1060OldTagInfosState,
  WA1060WkPlacState,
  WA1061TagIdState,
} from '../atom/atom.tsx';
import {
  CT0007,
  CT0006,
  CT0005,
  CT0008,
  CT0009,
  CT0010,
  CT0011,
} from '../enum/enums.tsx';
import {useAlert} from '../components/AlertContext.tsx';
import messages from '../utils/messages.tsx';
import {ApiResponse, ComId, WA1060OldTagInfoConst} from '../types/type.tsx';
import QRScanner from '../utils/QRScanner.tsx';
import {RNCamera} from 'react-native-camera';
import PopupDetail from '../components/PopupDetail';
import ProcessingModal from '../components/Modal.tsx';
import {IFA0310} from '../utils/Api.tsx';
import {loadFromKeystore} from '../utils/KeyStore';

// WA1061 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1061'>;
interface Props {
  navigation: NavigationProp;
}
const WA1061 = ({navigation}: Props) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false); // 処理中モーダルの状態
  const [showScannerTag, setShowScannerTag] = useState<boolean>(false); // カメラ表示用の状態
  const [popupVisible, setPopupVisible] = useState<boolean>(false); // 詳細ポップアップ
  const [inputValue, setInputValue] = useState<string>(''); //旧タグID入力値
  const [selectedOldTagInfo, setSelectedOldTagInfo] =
    useState<WA1060OldTagInfoConst | null>(null); // 詳細ポップアップ表示する旧タグ情報
  const newTagId = useRecoilValue(WA1060NewTagIdState); // Recoil 新タグID
  const WA1060WkPlac = useRecoilValue(WA1060WkPlacState); // Recoil 作業場所情報
  const [WA1060OldTagInfos, setWA1060OldTagInfos] = useRecoilState(
    WA1060OldTagInfosState,
  ); //Recoil 旧タグ情報
  const setPrevScreenId = useSetRecoilState(WA1060PrevScreenId); // Recoil 遷移元画面ID
  const setBack = useSetRecoilState(WA1061BackState); // Recoil 戻る
  const resetWA1060OldTagInfos = useResetRecoilState(WA1060OldTagInfosState); //Recoilリセット
  const setWA1061TagId = useSetRecoilState(WA1061TagIdState); //Recoil 旧タグ
  const {showAlert} = useAlert();
  /************************************************
   * 初期表示設定
   ************************************************/
  useEffect(() => {
    setPrevScreenId('WA1061');
  }, []);

  /************************************************
   * コードスキャン後の処理 (タグ用)
   * @param param0
   * @returns
   ************************************************/
  const handleCodeScannedForTag = async (data: string, type: string) => {
    const parts = data.split(',');
    setShowScannerTag(false);

    //QR・バーコードではない場合
    if (type !== RNCamera.Constants.BarCodeType.qr && type !== 'CODABAR') {
      await showAlert('通知', messages.EA5008(), false);
      return;
    } else if (
      type === RNCamera.Constants.BarCodeType.qr &&
      parts.length >= 1 &&
      parts[0] === 'CM'
    ) {
      setModalVisible(true);
      //CSV1カラム目が"CM"である
      //旧タグ配列が0件の場合
      if (WA1060OldTagInfos.length === 0) {
        //新タグ色と旧タグ由来情報の除去土壌等種別判定処理
        if (!(await newOldJudge(String(parts[8])))) {
          setModalVisible(false);
          return;
        }
      }
      //旧タグ配列が1件以上の場合
      for (const WA1060OldTagInfo of WA1060OldTagInfos) {
        if (WA1060OldTagInfo.rmSolTyp !== parts[8]) {
          await showAlert('通知', messages.EA5010(), false);
          setModalVisible(false);
          return;
        }
      }
      //新タグID2桁目が7:橙かチェック
      const isOrange = newTagId.substring(1).startsWith('7');
      //一時記憶領域の[旧タグ由来情報(配列)]の配列末尾[N]に追加
      setWA1060OldTagInfos([
        ...WA1060OldTagInfos,
        {
          oldTag: parts[2], //旧タグID
          genbaCheck: '1', //現場確認
          tsuInd: parts[6], //津波浸水
          splFac: parts[7], //特定施設由来
          rmSolTyp: parts[8], //除去土壌等種別
          ocLndCla: parts[9], //発生土地分類
          pkTyp: parts[10], //荷姿種別
          usgInnBg: parts[11], //内袋の利用方法
          usgInnBgNm: parts[11], //内袋の利用方法名
          usgAluBg: parts[12], //アルミ内袋の有無
          vol: parts[13], //容積
          airDsRt: parts[14], //空間線量率
          ocLndUseknd: '', //発生土地の利用区分
          ocloc: parts[5], //発生場所
          rmSolInf: isOrange
            ? '調査結果：土壌環境及び土壌溶出基準出不適合'
            : parts[18], //備考(除去土壌情報)
          lnkNewTagDatMem: '', //除染時データメモ
        },
      ]);
      setModalVisible(false);
      return;
    } else if (
      type !== RNCamera.Constants.BarCodeType.qr ||
      (type === RNCamera.Constants.BarCodeType.qr && parts[0] !== 'CM')
    ) {
      //CSV1カラム目が"CM"ではない またはバーコード
      setModalVisible(true);
      const result = await oldTagProc(data);
      if (result === 'WA1062') {
        //画面遷移
        await logScreen('画面遷移: WA1061 → WA1062_旧タグ設定(土壌)');
        navigation.navigate('WA1062');
      }
    }
    setModalVisible(false);
    return;
  };

  // タグコードスキャンボタン押下時の処理
  const btnTagQr = async () => {
    await logUserAction('ボタン押下: WA1061 - タグ読込');
    //旧タグ配列が9件の場合処理中止
    if (WA1060OldTagInfos.length >= 9) {
      await showAlert('通知', messages.WA5002(), false);
      return;
    }
    //カメラ起動
    setShowScannerTag(true);
  };

  /************************************************
   * 新タグ色と旧タグ由来情報の除去土壌等種別判定処理
   ************************************************/
  const newOldJudge = async (rmSolTyp: string): Promise<boolean> => {
    //新タグの前後のaを取り除く
    let newTag = newTagId;
    if (newTag.startsWith('a')) {
      newTag = newTag.substring(1);
    }
    if (newTag.endsWith('a')) {
      newTag = newTag.substring(0, newTag.length - 1);
    }

    let judge = false;
    //タグ色に応じた旧タグ由来情報の除去土壌等種別判定
    switch (newTag.charAt(0)) {
      case '1': //緑色
        judge = ['1'].includes(rmSolTyp);
        break;
      case '2': //黄色
        judge = ['2', '10', '12'].includes(rmSolTyp);
        break;
      case '3': //白色
        judge = ['3'].includes(rmSolTyp);
        break;
      case '4': //青色
        judge = ['4', '5', '6', '11', '13'].includes(rmSolTyp);
        break;
      case '5': //赤色
        judge = ['7', '8', '9'].includes(rmSolTyp);
        break;
      case '7': //橙色
        judge = ['1', '2', '3', '4', '5', '6', '10', '11', '12', '13'].includes(
          rmSolTyp,
        );
        break;
    }

    //タグ色と旧タグ由来情報の除去土壌等種別が異なる場合
    if (!judge) {
      const result = await showAlert('確認', messages.WA5003(), true);
      if (!result) {
        return false;
      }
    }
    return true;
  };

  /************************************************
   * 旧タグ設定処理
   ************************************************/
  const oldTagProc = async (tagId: string): Promise<string> => {
    // 旧タグ情報照会(除去土壌)
    const responseIFA0310 = await IFA0310(tagId, WA1060WkPlac.wkplacId);
    const result = await apiIsError(responseIFA0310);
    if (result === 'zero') {
      //照会結果0件の場合
      setWA1061TagId([tagId, 'oldTag']);
      setModalVisible(false);
      return 'WA1062';
    } else if (result === 'error') {
      //異常の場合 中断
      setModalVisible(false);
      return '';
    }
    const rmSolTypResponse = String(responseIFA0310.data?.dtl[0].rmSolTyp);
    //新タグ色と旧タグ由来情報の除去土壌等種別判定処理
    if (!(await newOldJudge(rmSolTypResponse))) {
      setModalVisible(false);
      return '';
    }
    //旧タグ配列が1件以上の場合
    for (const WA1060OldTagInfo of WA1060OldTagInfos) {
      if (WA1060OldTagInfo.rmSolTyp !== rmSolTypResponse) {
        await showAlert('通知', messages.EA5010(), false);
        setModalVisible(false);
        return '';
      }
    }
    //【応答データ】の内容を一時記憶領域の[旧タグ由来情報(配列)]の配列末尾[N]に追加する。
    setWA1060OldTagInfos([
      ...WA1060OldTagInfos,
      {
        oldTag: tagId, //旧タグID
        genbaCheck: '1', //現場確認
        tsuInd: String(responseIFA0310.data?.dtl[0].tsuInd), //津波浸水
        splFac: String(responseIFA0310.data?.dtl[0].splFac), //特定施設由来
        rmSolTyp: String(responseIFA0310.data?.dtl[0].rmSolTyp), //去土壌等種別
        ocLndCla: String(responseIFA0310.data?.dtl[0].ocLndCla), //発生土地分類
        pkTyp: String(responseIFA0310.data?.dtl[0].pkTyp), //荷姿種別
        usgInnBg: String(responseIFA0310.data?.dtl[0].usgInnBg), //内袋の利用方法
        usgInnBgNm: String(responseIFA0310.data?.dtl[0].usgInnBgNm), //内袋の利用方法名
        usgAluBg: String(responseIFA0310.data?.dtl[0].usgAluBg), //アルミ内袋の有無
        vol: String(responseIFA0310.data?.dtl[0].vol), //容積
        airDsRt: String(responseIFA0310.data?.dtl[0].airDsRt), //空間線量率
        ocLndUseknd: String(responseIFA0310.data?.dtl[0].ocLndUseknd), //発生土地の利用区分
        ocloc: String(responseIFA0310.data?.dtl[0].ocloc), //発生場所
        rmSolInf: String(responseIFA0310.data?.dtl[0].rmSolInf), //備考(除去土壌情報)
        lnkNewTagDatMem: String(responseIFA0310.data?.dtl[0].lnkNewTagDatMem), //除染時データメモ
      },
    ]);
    return 'done';
  };

  /************************************************
   * 設定ボタン処理
   ************************************************/
  const btnSetting = async () => {
    await logUserAction('ボタン押下: WA1061 - 設定');
    setModalVisible(true);
    const result = await oldTagProc(inputValue);
    if (result === 'WA1062') {
      //画面遷移
      await logScreen('画面遷移: WA1061 → WA1062_旧タグ設定(土壌)');
      navigation.navigate('WA1062');
    } else if (result === 'done') {
      setInputValue('');
    }
    setModalVisible(false);
  };

  /************************************************
   * ダミータグボタン処理
   ************************************************/
  const btnDummyTag = async () => {
    await logUserAction('ボタン押下: WA1061 - ダミータグ');
    //旧タグ配列が9件の場合処理中止
    if (WA1060OldTagInfos.length >= 9) {
      await showAlert('通知', messages.WA5002(), false);
      return;
    }
    //ダミータグを採番する
    const comIdKeyStore = (await loadFromKeystore('comId')) as ComId; //keyStoreから事業者IDを取得
    const currentDateTime = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14); // yyyyMMddhhmmss形式
    const dummyTag = 'pit' + comIdKeyStore.comId + currentDateTime;
    //ダミータグを引継ぎ
    setWA1061TagId([dummyTag, 'dummyTag']);
    //画面遷移
    await logScreen('画面遷移: WA1061 → WA1062_旧タグ設定(土壌)');
    navigation.navigate('WA1062');
  };

  /************************************************
   * 一括取消ボタン処理
   ************************************************/
  const btnOldTagClr = async () => {
    await logUserAction('ボタン押下: WA1061 - 一括取消');
    const result = await showAlert('確認', messages.IA5013(), true);
    if (result) {
      //旧タグ配列初期化
      resetWA1060OldTagInfos();
    }
    return;
  };

  /************************************************
   * 破棄ボタン処理
   ************************************************/
  const btnAppDestroy = async () => {
    await logUserAction('ボタン押下: WA1061 - 破棄');
    const result = await showAlert('確認', messages.IA5012(), true);
    if (result) {
      //遷移元画面セット
      setPrevScreenId('WA1040');
      await logScreen('画面遷移: WA1061 → WA1061_旧タグ読込(土壌)');
      navigation.navigate('WA1061');
    }
  };

  /************************************************
   * 戻るボタン処理
   ************************************************/
  const btnAppBack = async () => {
    await logUserAction('ボタン押下: WA1061 - 戻る');
    const result = await showAlert('確認', messages.IA5014(), true);
    if (result) {
      setBack(true);
      //旧タグリストを初期値にリセット
      resetWA1060OldTagInfos();
      await logScreen('画面遷移: WA1061 → WA1060_新タグ読込(土壌)');
      navigation.navigate('WA1060');
    }
  };

  /************************************************
   * 次へボタン処理
   ************************************************/
  const btnAppNext = async () => {
    await logUserAction('ボタン押下: WA1061 - 次へ');
    await logScreen('画面遷移: WA1061 → WA1063_必須情報設定(土壌)');
    navigation.navigate('WA1063');
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
  const renderOldTagList = () => {
    //旧タグリスト
    const oldTagComponent = WA1060OldTagInfos.map((oldTagInfo, index) => (
      <View key={index} style={styles.detailSection}>
        <View style={[styles.tableCell2]}>
          <Text style={styles.labelTextNarrow}>{`${index + 1}: ${
            oldTagInfo.oldTag
          }`}</Text>
        </View>
        <View style={[styles.tableCell1]}>
          <TouchableOpacity
            style={[styles.detailButton]}
            onPress={async () => {
              setSelectedOldTagInfo(oldTagInfo);
              setPopupVisible(true);
              await logUserAction(
                'ボタン押下: 詳細(' + oldTagInfo.oldTag + ')(WA1061)',
              );
            }}>
            <Text style={styles.detailButtonText}>詳細</Text>
          </TouchableOpacity>
        </View>
      </View>
    ));

    // 旧タグが9個未満の場合に表示する設定セクション
    if (WA1060OldTagInfos.length < 9) {
      const configComponent = (
        <View key={WA1060OldTagInfos.length + 1} style={[styles.detailSection]}>
          <View style={[styles.tableCell2, styles.inputContainerLeft]}>
            <Text style={styles.labelTextNarrow}>{`${
              WA1060OldTagInfos.length + 1
            }: `}</Text>
            <TextInput
              value={inputValue}
              style={styles.input}
              maxLength={50}
              onChangeText={(text: string) => setInputValue(text)}
            />
          </View>
          <View style={[styles.tableCell1]}>
            <TouchableOpacity
              style={[styles.detailButton, styles.updateButton]}
              onPress={async () => {
                await logUserAction('ボタン押下: WA1061 - 設定');
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
      oldTagComponent.push(configComponent);
    }
    return <View style={styles.tableMain}>{oldTagComponent}</View>;
  };

  /************************************************
   * 詳細データをレンダリングするための関数
   ************************************************/
  const renderDetailData = (oldTagInfo: WA1060OldTagInfoConst) => {
    return (
      <View style={styles.tableMain}>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>
              津波浸水：{CT0005[Number(oldTagInfo?.tsuInd)]}
            </Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>
              特定施設：{CT0006[Number(oldTagInfo?.splFac)]}
            </Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>
              除去土壌等種別：{CT0007[Number(oldTagInfo?.rmSolTyp)]}
            </Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>
              発生土地分類：{CT0008[Number(oldTagInfo?.ocLndCla)]}
            </Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>
              荷姿種別：{CT0009[Number(oldTagInfo?.pkTyp)]}
            </Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>
              内袋の利用方法：{CT0010[Number(oldTagInfo?.usgInnBg)]}
            </Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>
              アルミ内袋の利用：{CT0011[Number(oldTagInfo?.usgAluBg)]}
            </Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>容積：{oldTagInfo?.vol}</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>
              空間線量率：{oldTagInfo?.airDsRt}
            </Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>
              発生土地の利用区分：{oldTagInfo?.ocLndUseknd}
            </Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>発生場所：{oldTagInfo?.ocloc}</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>備考(除去土壌情報)：</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>{oldTagInfo?.rmSolInf}</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>除染時データメモ：</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>{oldTagInfo?.lnkNewTagDatMem}</Text>
          </View>
        </View>
      </View>
    );
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
        <View style={[styles.main]}>
          <Text
            style={[styles.labelText, styles.bold, styles.labelTextOver]}
            numberOfLines={1}
            ellipsizeMode="tail">
            新タグID：{newTagId}
          </Text>
          <Text style={[styles.labelTextNarrow, styles.center]}>
            タグ読取ボタンを押してフレコンに取り付けられたタグを読込んで下さい。
          </Text>
        </View>
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.buttonNarrow, styles.centerButtonNarrow]}
            onPress={btnTagQr}>
            <Text style={styles.buttonText}>タグ読込</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.buttonNarrow,
              styles.centerButtonNarrow,
              styles.dummyTagButton,
            ]}
            onPress={btnDummyTag}>
            <Text style={styles.buttonText}>ダミータグ</Text>
          </TouchableOpacity>
        </View>
        {/* 中段 */}
        <View style={[styles.textareaContainer, styles.topContent]}>
          <View style={styles.bottomSectionNarrow}>
            <Text style={[styles.labelTextSetting, styles.bold]}>
              旧タグ数：{WA1060OldTagInfos.length}
            </Text>
            <TouchableOpacity
              style={[
                styles.buttonMoreNarrow,
                styles.centerButtonNarrow,
                styles.allCancelButton,
              ]}
              onPress={btnOldTagClr}>
              <Text style={styles.buttonTextNarrow}>一括取消</Text>
            </TouchableOpacity>
          </View>
          {/* 中段*/}
          <View style={styles.scrollPushContainer}>
            <ScrollView style={styles.scrollPushViewStyle}>
              {renderOldTagList()}
            </ScrollView>
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
          <TouchableOpacity
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

        {/* 詳細ポップアップ */}
        <PopupDetail
          isVisible={popupVisible}
          onClose={() => setPopupVisible(false)}>
          {/* 選択された oldTagInfo の詳細データをレンダリング */}
          {selectedOldTagInfo && renderDetailData(selectedOldTagInfo)}
        </PopupDetail>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
export default WA1061;
