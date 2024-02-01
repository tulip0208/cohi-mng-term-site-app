/**-------------------------------------------
 * A01-0130_定置登録
 * WA1131
 * screens/WA1131.tsx
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
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {logUserAction, logScreen} from '../utils/Log.tsx';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../navigation/AppNavigator.tsx';
import QRScanner from '../utils/QRScanner.tsx';
import {useSetRecoilState, useRecoilState} from 'recoil';
import {
  WA1130DataState,
  WA1131BackState,
  WA1130PrevScreenId,
  IFT0640DataState,
} from '../atom/atom.tsx';
import {RNCamera} from 'react-native-camera';
import {getInstance} from '../utils/Realm.tsx'; // realm.jsから関数をインポート
import {useAlert} from '../components/AlertContext.tsx';
import messages from '../utils/messages.tsx';
import ProcessingModal from '../components/Modal.tsx';
import {getCurrentDateTime} from '../utils/common.tsx';
import {IFT0120, IFT0140FromWA1131} from '../utils/Api.tsx';
import {ApiResponse} from '../types/type.tsx';
// WA1131 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1131'>;
interface Props {
  navigation: NavigationProp;
}
const WA1131 = ({navigation}: Props) => {
  const [inputValue, setInputValue] = useState<string>(''); //新タグID設定ポップアップ 入力値
  const [newTagId, setNewTagId] = useState<String>(''); //新タグID
  const [showScannerTag, setShowScannerTag] = useState<boolean>(false); // カメラ表示用の状態
  const [isSendDisabled, setIsSendDisabled] = useState<boolean>(true); // 送信ボタン 活性・非活性
  const [modalVisible, setModalVisible] = useState<boolean>(false); //処理中モーダルの状態
  const [inputVisible, setInputVisible] = useState<boolean>(false); //新タグID設定ポップアップ 表示・非表示
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null,
  ); //長押しタグ表示用
  const [WA1130Data, setWA1130Data] = useRecoilState(WA1130DataState); // Recoil 保管場ID,定置場ID,施設区分
  const [IFT0640Data, setIFT0640Data] = useRecoilState(IFT0640DataState); // Recoil IFT0640レスポンスデータ
  const setBack = useSetRecoilState(WA1131BackState); // Recoil 戻る
  const setPrevScreenId = useSetRecoilState(WA1130PrevScreenId); // Recoil 遷移元画面ID
  const {showAlert} = useAlert();
  const realm = getInstance();

  /************************************************
   * 初期表示設定
   ************************************************/
  useEffect(() => {}, []);

  // 10秒以上の長押しを検出
  const onPressIn = () => {
    // 10秒後に実行されるアクション
    const timer = setTimeout(() => {
      setInputVisible(true);
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
    if (type !== RNCamera.Constants.BarCodeType.qr && type !== 'CODABAR') {
      await showAlert('通知', messages.EA5008(), false);
      return;
    } else if (
      type === RNCamera.Constants.BarCodeType.qr &&
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
      setNewTagId('a' + parts[1] + 'a');

      //後続の新タグID処理へ
    } else if (type === 'CODABAR') {
      // --バーコード--
      if (!checkFormat(data)) {
        await showAlert('通知', messages.EA5017(data), false);
        return;
      }
      setNewTagId('a' + data + 'a');

      //後続の新タグID処理へ
    } else {
      //それ以外
      await showAlert('通知', messages.EA5008(), false);
      return;
    }
    //新タグID処理
    await procNewTagId(newTagId as string);
    return;
  };
  // タグコードスキャンボタン押下時の処理
  const btnTagQr = async () => {
    await logUserAction('ボタン押下: タグ読込');
    setShowScannerTag(true);
  };

  /************************************************
   * 破棄ボタン処理
   ************************************************/
  const btnAppDestroy = async () => {
    await logUserAction('ボタン押下: 破棄(WA1131)');
    const result = await showAlert('確認', messages.IA5012(), true);
    if (result) {
      setBack(true);
      setPrevScreenId('WA1040');
      await logScreen('画面遷移:WA1130_荷下登録QR読込');
      navigation.navigate('WA1130');
    }
  };

  /************************************************
   * 送信ボタン処理
   ************************************************/
  const btnAppSend = async () => {
    await logUserAction('ボタン押下: 送信(WA1131)');
    setModalVisible(true);
    let tripStatusKbn = '';
    //一時記憶領域の[輸送ステータス区分]を設定する。
    if (WA1130Data.facTyp === '0') {
      //0:定置場の場合
      tripStatusKbn = '10'; //輸送ステータス区分　10:荷下完了
    } else if (WA1130Data.facTyp === '1') {
      //1:受入・分別施設
      const loginInfo = realm.objects('login')[0];
      if (loginInfo.comId === WA1130Data.trpComId) {
        tripStatusKbn = '14'; //輸送ステータス区分　10:荷下完了
      } else {
        tripStatusKbn = '15'; //輸送ステータス区分　15:施設受入(輻輳有)
      }
    }
    setWA1130Data({
      ...WA1130Data,
      trpStatus: tripStatusKbn, //設定した輸送ステータス区分
    });

    const dateStr = getCurrentDateTime();
    //通信処理 IFT0120
    const responseIFA0120 = await IFT0120(WA1130Data, IFT0640Data, dateStr);
    if (await apiIsError(responseIFA0120)) {
      return;
    }
    if (responseIFA0120.data?.itcRstCd === 1) {
      // invDatDtlからエラーの詳細を抽出し、string型を保証する
      const errorDetails: [string, string][] =
        responseIFA0120.data?.invDatDtl.map(dtl => {
          // sndIdとinvCdがundefinedでないことを確認し、stringに変換する（必要であれば）
          const sndId = typeof dtl.sndId === 'string' ? dtl.sndId : '';
          const invCd = typeof dtl.invCd === 'string' ? dtl.invCd : '';
          return [sndId, invCd]; // [string, string]型のペアを返す
        });
      await showAlert(
        '通知',
        messages.EA5030('荷下定置ステータス更新', ...errorDetails),
        false,
      );
      return;
    }
    await showAlert('通知', messages.IA5005('車両ステータス更新'), false);

    //通信処理 IFT0140(施設区分=1の場合)
    if (WA1130Data.facTyp === '1') {
      //IFT0140実行
      const responseIFA0140FromWA1131 = await IFT0140FromWA1131(
        WA1130Data,
        IFT0640Data,
        dateStr,
      );
      if (await apiIsError(responseIFA0120)) {
        return;
      }
      if (responseIFA0140FromWA1131.data?.itcRstCd === 1) {
        //★確認
        // invDatDtlからエラーの詳細を抽出し、string型を保証する
        const errorDetails: [string, string][] =
          responseIFA0140FromWA1131.data?.invDatDtl.map(dtl => {
            // sndIdとinvCdがundefinedでないことを確認し、stringに変換する（必要であれば）
            const sndId = typeof dtl.sndId === 'string' ? dtl.sndId : '';
            const invCd = typeof dtl.invCd === 'string' ? dtl.invCd : '';
            return [sndId, invCd]; // [string, string]型のペアを返す
          });
        await showAlert(
          '通知',
          messages.EA5030('荷下定置ステータス更新', ...errorDetails),
          false,
        );
        return;
      }
      await showAlert('通知', messages.IA5005('車両ステータス更新'), false);
    }

    setModalVisible(false);
    setBack(true);
    setPrevScreenId('WA1040');
    await logScreen('画面遷移:WA1130_荷下登録QR読込');
    navigation.navigate('WA1130');
  };

  /************************************************
   * 設定ボタン処理
   ************************************************/
  const btnAppSet = async () => {
    await logUserAction('ボタン押下: 設定(WA1131)');
    if (!checkFormat(inputValue)) {
      await showAlert('通知', messages.EA5017(inputValue), false);
      return;
    }
    // 最新のinputValueでnewTagIdを更新
    const newId = 'a' + inputValue + 'a';
    setNewTagId(newId);
    //新タグID処理
    procNewTagId(newId);
  };

  /************************************************
   * 新タグID処理
   ************************************************/
  const procNewTagId = async (tag: string) => {
    // 検索リストに新タグIDが存在するか確認
    let isTagFound = false;
    let allChecked = true;

    // lgSdBgDtl内の各要素をチェックし、新しい配列を作成する
    const newLgSdBgDtl = IFT0640Data.lgSdBgDtl.map(item => {
      if (item.newTagId === tag) {
        isTagFound = true;
        return {...item, check: true}; // 一致する場合はチェックプロパティをtrueに更新
      } else {
        if (!item.check) {
          allChecked = false;
        }
        return item; // 一致しない場合は元のitemを返す
      }
    });

    // 新タグIDが見つからなかった場合、ポップアップメッセージを表示して処理を中止
    if (!isTagFound) {
      await showAlert('確認', messages.EA5020(tag), false);
      return; // ここで処理を中止
    }

    // すべてのチェックボックスがオンの場合、送信ボタンを活性化
    if (allChecked) {
      setIsSendDisabled(false);
    }

    // lgSdBgDtlの状態を更新する
    setIFT0640Data(prevState => ({
      ...prevState,
      lgSdBgDtl: newLgSdBgDtl,
    }));
  };

  /************************************************
   * ボタン活性・非活性判断
   ************************************************/
  const getButtonStyle = () => {
    return isSendDisabled
      ? [styles.button, styles.settingButton, styles.settingButtonDisabled]
      : [styles.button, styles.settingButton, styles.settingButton];
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
      }
      return true;
    } else {
      return false;
    }
  };

  /************************************************
   * データ部分の値を表示するための関数
   ************************************************/
  const renderNewTagList = () => {
    //積載大型土のう袋等明細（新タグ）リスト
    const newTagComponent = IFT0640Data.lgSdBgDtl.map((lgSdBg, index) => (
      <View key={index} style={[styles.detailSection]}>
        <View style={[styles.tableCell1, styles.center]}>
          <Text style={styles.labelText}>
            {lgSdBg.check && (
              <Text style={[styles.labelText, styles.labelCheck]}>{'☑ '}</Text>
            )}
            {!lgSdBg.check && (
              <Text style={[styles.labelText, styles.labelCheck]}>{'☐ '}</Text>
            )}
          </Text>
        </View>
        <View style={[styles.tableCell4]}>
          <Text style={styles.labelText}>
            {`${index + 1}: ${lgSdBg.newTagId}`}
          </Text>
        </View>
      </View>
    ));

    return <View style={styles.tableMain}>{newTagComponent}</View>;
  };

  return (
    <View style={styles.container}>
      {/* ヘッダ */}
      <FunctionHeader
        appType={'現'}
        viewTitle={'新タグ読込'}
        functionTitle={'荷下登録'}
      />

      {/* 上段 */}
      <View style={[styles.main]}>
        <Text style={[styles.labelText]}>作業場所：{WA1130Data.wkplcTyp}</Text>
        <Text style={[styles.labelTextNarrow, styles.labelTextPlace]}>
          {WA1130Data.wkplc}
        </Text>
      </View>

      {/* 中段1 */}
      <View style={[styles.textareaContainer, styles.topContent]}>
        <View style={styles.tableMain}>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={[styles.labelTextNarrow, styles.alignRight]}>
                輸送カード番号：
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.labelTextNarrow}>{IFT0640Data.crdNo}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={[styles.labelTextNarrow, styles.alignRight]}>
                輸送車両：
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.labelTextNarrow}>{IFT0640Data.vclNum}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={[styles.labelTextNarrow, styles.alignRight]}>
                運転手：
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.labelTextNarrow}>{IFT0640Data.drvName}</Text>
            </View>
          </View>
          <View style={[styles.main, styles.narrow]}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSmall, styles.centerButton]}
              onPress={btnTagQr}>
              <Text style={styles.buttonText}>タグ読込</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* 中段2*/}
        <View style={styles.scrollContainer}>
          <ScrollView style={styles.scrollViewStyle}>
            {renderNewTagList()}
          </ScrollView>
        </View>
        {/* 中段3 */}
        <View style={[styles.main, styles.center]}>
          <TouchableWithoutFeedback
            onPressIn={() => onPressIn()}
            onPressOut={onPressOut}>
            <View>
              <Text style={styles.labelText}>
                新タグIDが読み込めない場合は
                <Text style={styles.bgYellow}>こちら</Text>を長押しして下さい。
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>

      {/* 下段 */}
      <View style={[styles.bottomSection, styles.settingMain]}>
        <TouchableOpacity
          style={[styles.button, styles.settingButton, styles.settingButton3]}
          onPress={btnAppDestroy}>
          <Text style={styles.endButtonText}>破棄</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={getButtonStyle()}
          disabled={isSendDisabled}
          onPress={btnAppSend}>
          <Text style={[styles.endButtonText, styles.settingButtonText1]}>
            送信
          </Text>
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

      {/* 新タグID設定ポップアップ */}
      <Modal animationType="fade" transparent={true} visible={inputVisible}>
        <View style={styles.modalBackground}>
          <View style={styles.modalInputView}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setInputValue('');
                setInputVisible(false);
              }}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <View style={[styles.inputContainer]}>
              <Text style={styles.inputWithText}>a</Text>
              <TextInput
                style={[styles.input, styles.inputWhite]}
                onChangeText={text => setInputValue(text)}
                value={inputValue}
                maxLength={15}
              />
              <Text style={styles.inputWithText}>a</Text>
            </View>
            <View
              style={[
                styles.bottomSection,
                styles.settingMain,
                styles.justifyContentCenter,
              ]}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.popupSettingButton,
                  styles.settingButton3,
                ]}
                onPress={() => {
                  logUserAction('ボタン押下: 戻る(WA1131)');
                  setInputValue('');
                  setInputVisible(false);
                }}>
                <Text style={styles.endButtonText}>戻る</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.popupSettingButton,
                  styles.settingButton2,
                ]}
                onPress={btnAppSet}>
                <Text style={[styles.endButtonText, styles.settingButtonText1]}>
                  設定
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
export default WA1131;
