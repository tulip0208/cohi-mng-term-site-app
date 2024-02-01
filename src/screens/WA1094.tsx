/**-------------------------------------------
 * A01-0090_新タグ紐付(灰)
 * WA1094
 * screens/WA1094.tsx
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
  KeyboardAvoidingView,
} from 'react-native';
import {logUserAction, logScreen} from '../utils/Log.tsx';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../navigation/AppNavigator.tsx';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {
  WA1091BackState,
  WA1090PrevScreenId,
  WA1092WtDsState,
  WA1090NewTagIdState,
  WA1091OldTagInfoState,
  WA1093MemoState,
  WA1090WkPlacState,
} from '../atom/atom.tsx';
import {useAlert} from '../components/AlertContext.tsx';
import messages from '../utils/messages.tsx';
import ProcessingModal from '../components/Modal.tsx';
import {ApiResponse} from '../types/type.tsx';
import {getCurrentDateTime} from '../utils/common.tsx';
import {IFT0420} from '../utils/Api.tsx';
// WA1094 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1094'>;
interface Props {
  navigation: NavigationProp;
}
const WA1094 = ({navigation}: Props) => {
  const [lnkNewTagDatMem, setLnkNewTagDatMem] = useState<string>(''); // メモ
  const [modalVisible, setModalVisible] = useState<boolean>(false); //処理中モーダルの状態
  const newTagId = useRecoilValue(WA1090NewTagIdState); // Recoil 新タグID
  const WA1091OldTagInfo = useRecoilValue(WA1091OldTagInfoState); //Recoil 旧タグ情報
  const WA1092WtDs = useRecoilValue(WA1092WtDsState); // Recoil 重量・線量情報
  const WA1093Memo = useRecoilValue(WA1093MemoState); // Recoil メモ
  const WA1090WkPlac = useRecoilValue(WA1090WkPlacState); // Recoil 作業場所情報
  const setPrevScreenId = useSetRecoilState(WA1090PrevScreenId); //遷移元画面ID
  const setBack = useSetRecoilState(WA1091BackState); // Recoil 戻る
  const {showAlert} = useAlert();

  /************************************************
   * 初期表示設定
   ************************************************/
  useEffect(() => {
    setLnkNewTagDatMem(WA1093Memo);
  }, []);

  /************************************************
   * 破棄ボタン処理
   ************************************************/
  const btnAppDestroy = async () => {
    setPrevScreenId('WA1040');
    await logUserAction('ボタン押下: 破棄(WA1094)');
    const result = await showAlert('確認', messages.IA5012(), true);
    if (result) {
      setBack(true);
      await logScreen('画面遷移:WA1090_新タグ読込(灰)');
      navigation.navigate('WA1090');
    }
  };

  /************************************************
   * 送信ボタン処理
   ************************************************/
  const btnAppSend = async () => {
    await logUserAction('ボタン押下: 送信(WA1094)');
    setModalVisible(true);
    const dateStr = getCurrentDateTime();

    //メモの上限文字数以降カット
    if (lnkNewTagDatMem.length > 400) {
      setLnkNewTagDatMem(lnkNewTagDatMem.substring(0, 400));
    }

    //IFT0420実行
    const responseIFA0420 = await IFT0420(
      WA1090WkPlac,
      WA1091OldTagInfo,
      dateStr,
      newTagId,
      WA1092WtDs,
      lnkNewTagDatMem,
    );
    const result = await apiIsError(responseIFA0420);
    if (result) {
      await showAlert('通知', messages.IA5005('新タグの紐付'), false);
    }

    setModalVisible(false);
    //遷移元画面IDを設定
    setPrevScreenId('WA1040');
    await logScreen('画面遷移:WA1090_新タグ読込(灰)');
    navigation.navigate('WA1090');
  };

  /************************************************
   * 重量・線量編集ボタン処理
   ************************************************/
  const btnEdtWtDs = async () => {
    await logUserAction('ボタン押下: 重量・線量編集(WA1094)');
    //遷移元画面IDを設定
    setPrevScreenId('WA1094');
    await logScreen('画面遷移:WA1092_重量・線量(灰)');
    navigation.navigate('WA1092');
  };

  /************************************************
   * メモ編集ボタン処理
   ************************************************/
  const btnEdtMemo = async () => {
    await logUserAction('ボタン押下: メモ編集(WA1094)');
    //遷移元画面IDを設定
    setPrevScreenId('WA1094');
    await logScreen('画面遷移:WA1093_メモ入力(灰)');
    navigation.navigate('WA1093');
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

  return (
    <KeyboardAvoidingView
      behavior={'padding'}
      style={styles.flex1}
      keyboardVerticalOffset={0}>
      <ScrollView
        contentContainerStyle={[styles.containerWithKeybord, styles.flexGrow1]}>
        {/* ヘッダ */}
        <FunctionHeader
          appType={'現'}
          viewTitle={'登録内容確認'}
          functionTitle={'紐付(灰)'}
        />
        {/* 上段 */}
        <View style={[styles.main]}>
          <Text style={[styles.labelText]}>
            作業場所：{WA1090WkPlac.wkplac}
          </Text>
          <Text style={[styles.labelTextNarrow, styles.labelTextPlace]}>
            {WA1090WkPlac.wkplacNm}
          </Text>
          <Text style={[styles.labelTextNarrow, styles.bold]}>
            新タグID：{newTagId}
          </Text>
          <Text style={[styles.labelTextNarrow, styles.bold]}>
            旧タグID：{WA1091OldTagInfo.oldTagId}
          </Text>

          <View style={styles.tableMain}>
            <View style={[styles.tableRow, styles.pickerContainer]}>
              <View style={styles.tableCell}>
                <Text style={[styles.labelTextNarrow, styles.alignRight]}>
                  重量(Kg)：
                </Text>
              </View>
              <View style={[styles.tableCell]}>
                <Text style={styles.labelTextNarrow}>
                  {WA1092WtDs.caLgSdBgWt ?? ''}
                </Text>
              </View>
            </View>
            <View style={[styles.tableRow, styles.pickerContainer]}>
              <View style={styles.tableCell}>
                <Text style={[styles.labelTextNarrow, styles.alignRight]}>
                  線量(μSv/h)：
                </Text>
              </View>
              <View style={[styles.tableCell]}>
                <Text style={styles.labelTextNarrow}>
                  {WA1092WtDs.caLgSdBgDs ?? ''}
                </Text>
              </View>
            </View>
            <View style={[styles.tableRow, styles.pickerContainer]}>
              <View style={styles.tableCell}>
                <Text style={[styles.labelTextNarrow, styles.alignRight]}>
                  推定放射能濃度：
                </Text>
              </View>
              <View style={[styles.tableCell]}>
                <Text style={styles.labelTextNarrow}>
                  {WA1091OldTagInfo.meaRa}
                </Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={[styles.labelTextNarrow, styles.alignRight]}>
                  (Bq/Kg)　
                </Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.labelTextNarrow} />
              </View>
            </View>
          </View>

          <View style={[styles.center, styles.updownMargin]}>
            <TouchableOpacity
              style={[styles.detailButton, styles.buttonHalf]}
              onPress={btnEdtWtDs}>
              <Text style={[styles.detailButtonText]}>重量・線量編集</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.tableRow, styles.pickerContainer]}>
            <View style={styles.tableCell}>
              <Text style={[styles.labelTextNarrow]}>メモ：</Text>
            </View>
            <View style={styles.tableCell} />
          </View>
        </View>

        <View
          style={[
            styles.memoScrollSmallContainer,
            styles.tableCell,
            styles.marginSide,
          ]}>
          <View style={styles.memoScrollSmall}>
            <ScrollView nestedScrollEnabled={true}>
              <Text style={[styles.memo, styles.textBlack]}>{WA1093Memo}</Text>
            </ScrollView>
          </View>
        </View>
        <View style={[styles.center, styles.updownMargin]}>
          <TouchableOpacity
            style={[styles.detailButton, styles.buttonHalf]}
            onPress={btnEdtMemo}>
            <Text style={[styles.detailButtonText]}>メモ編集</Text>
          </TouchableOpacity>
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
            style={[styles.button, styles.startButton, styles.buttonMaxHalf]}
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
export default WA1094;
