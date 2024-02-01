/**-------------------------------------------
 * A01-0140_定置登録
 * WA1141
 * screens/WA1141.tsx
 * ---------------------------------------------*/
import FunctionHeader from '../components/FunctionHeader.tsx'; // Headerコンポーネントのインポート
import Footer from '../components/Footer.tsx'; // Footerコンポーネントのインポート
import {styles} from '../styles/CommonStyle.tsx'; // 共通スタイル
import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {logUserAction, logScreen} from '../utils/Log.tsx';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../navigation/AppNavigator.tsx';
import {useSetRecoilState, useRecoilState} from 'recoil';
import {
  WA1140DataState,
  WA1141BackState,
  WA1140PrevScreenId,
} from '../atom/atom.tsx';
import {CT0007} from '../enum/enums.tsx';
import {Picker} from '@react-native-picker/picker';
import {getInstance} from '../utils/Realm.tsx'; // realm.jsから関数をインポート
import {useAlert} from '../components/AlertContext.tsx';
import messages from '../utils/messages.tsx';
import ProcessingModal from '../components/Modal.tsx';
import {getCurrentDateTime} from '../utils/common.tsx';
import {IFT0140} from '../utils/Api.tsx';
import {ApiResponse} from '../types/type.tsx';
// WA1141 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1141'>;
interface Props {
  navigation: NavigationProp;
}
interface PickerOption {
  label: string;
  value: string;
}
const WA1141 = ({navigation}: Props) => {
  const [selectStySec, setSelectStySec] = useState<string>(''); //選択した定置区画ID
  const [selectAreNo, setSelectAreNo] = useState<string>(''); //選択した区域番号
  const [selectNos, setSelectNos] = useState<string>(''); //選択した段数
  const [stySec, setStySec] = useState<string>(''); //定置区画ID
  const [isStySecFocused, setIsStySecFocused] = useState<boolean>(false); //定置区画IDフォーカス判断
  const [isAreNoFocused, setIsAreNoFocused] = useState<boolean>(false); //区域番号フォーカス判断
  const [isNosFocused, setIsNosFocused] = useState<boolean>(false); //段数フォーカス判断
  const [isSendDisabled, setIsSendDisabled] = useState<boolean>(false); //送信ボタン 活性・非活性
  const [modalVisible, setModalVisible] = useState<boolean>(false); //処理中モーダルの状態
  const [stySecOptions, setStySecOptions] = useState<PickerOption[]>([]); //定置区画ID 選択肢
  const [areNoOptions, setAreNoOptions] = useState<PickerOption[]>([]); //区域番号 選択肢
  const [WA1140Data, setWA1140Data] = useRecoilState(WA1140DataState); //Recoil 表示データ
  const setBack = useSetRecoilState(WA1141BackState); // Recoil 戻る
  const setPrevScreenId = useSetRecoilState(WA1140PrevScreenId); //遷移元画面ID
  const {showAlert} = useAlert();
  const realm = getInstance();

  /************************************************
   * 初期表示設定
   ************************************************/
  useEffect(() => {
    // 初期ロード時に選択肢をセットする
    updateStySecOptions();
    updateAreNoOptions();
    isSend(); //次へボタンの活性・非活性
  }, []);

  useEffect(() => {
    updateAreNoOptions();
  }, [stySec]);

  /************************************************
   * 破棄ボタン処理
   ************************************************/
  const btnAppDestroy = async () => {
    await logUserAction('ボタン押下: 破棄(WA1141)');
    setBack(true);
    setPrevScreenId('WA1040');
    await logScreen('画面遷移:WA1140_新タグ読込(定置登録)');
    navigation.navigate('WA1140');
  };

  /************************************************
   * 送信ボタン処理
   ************************************************/
  const btnAppSend = async () => {
    await logUserAction('ボタン押下: 送信(WA1141)');
    //段数で選択された値が、除去土壌種別ごとの閾値を超える場合
    const settingsInfo = realm.objects('settings')[0];
    // maxNosのマッピングを作成し、適切な型アノテーションを設定
    const maxNosMapping: {[key: string]: number} = {
      '1': settingsInfo.selPlans as number,
      '2': settingsInfo.selCombust as number,
      '3': settingsInfo.selSoil as number,
      '4': settingsInfo.selConcrete as number,
      '5': settingsInfo.selAsphalt as number,
      '6': settingsInfo.selNoncombustMix as number,
      '7': settingsInfo.selAsbestos as number,
      '8': settingsInfo.selPlasterboard as number,
      '9': settingsInfo.selHazard as number,
      '10': settingsInfo.selOutCombust as number,
      '11': settingsInfo.selOutNoncombust as number,
      '12': settingsInfo.selTmpCombust as number,
      '13': settingsInfo.selTmpNoncombust as number,
      '14': settingsInfo.selAsh as number,
    };

    // rmSolTypに基づいてmaxNosを取得する際には、キーを文字列として扱う
    const maxNos = maxNosMapping[String(WA1140Data.rmSolTyp)];

    if (Number(selectNos) > maxNos) {
      await showAlert('通知', messages.EA5024(String(maxNos)), false);
      return;
    }
    setModalVisible(true);
    const dateStr = getCurrentDateTime();
    //一時記憶領域の[定置区画ID]、[区域番号]、[段数]に設定
    setWA1140Data({
      ...WA1140Data,
      stySec: selectStySec,
      areNo: selectAreNo,
      nos: selectNos,
    });
    //IFT0140実行
    const responseIFA0140 = await IFT0140(WA1140Data, dateStr);
    if (await apiIsError(responseIFA0140)) {
      return;
    }
    if (responseIFA0140.data?.itcRstCd === 1) {
      //★確認
      await showAlert('通知', messages.EA5025(WA1140Data.newTagId), false);
      return;
    }
    await showAlert('通知', messages.IA5005('定置ステータス更新'), false);

    setModalVisible(false);
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
      }
      return true;
    } else {
      return false;
    }
  };

  /************************************************
   * ボタン表示・非表示判断
   ************************************************/
  const getButtonStyle = () => {
    return isSendDisabled
      ? [styles.button, styles.settingButton, styles.settingButtonDisabled]
      : [styles.button, styles.settingButton, styles.settingButton];
  };

  //ボタン活性化
  const isSend = () => {
    if (selectAreNo && selectAreNo && selectNos) {
      setIsSendDisabled(false);
    } else {
      setIsSendDisabled(true);
    }
  };

  //定置区画ID選択肢作成
  const updateStySecOptions = () => {
    let tempList;
    tempList = realm
      .objects('fixed_places_info')
      .filtered(
        'storPlacId == $0 AND fixPlacId == $1',
        WA1140Data.storPlacId,
        WA1140Data.fixPlacId,
      )
      .sorted('useDt', true);
    if (tempList.length > 0) {
      setStySec(tempList[0].stySec as string); //定置区画ID
      setSelectAreNo(tempList[0].areNo as string); //区域番号
      const options: PickerOption[] = tempList.map(item => ({
        label: item.stySec as string, // 型アサーションを使用
        value: item.stySec as string, // 型アサーションを使用
      }));
      setStySecOptions(options);
    }
  };

  //定置区画IDフォーカスイン
  const handleStySecFocus = () => {
    setIsStySecFocused(true);
  };

  //定置区画IDフォーカスアウト
  const handleStySecBlur = () => {
    if (isStySecFocused) {
      //定置区画ID未入力
      if (stySec === '') {
        //区域番号一覧をクリア
        setSelectAreNo('');
        setStySecOptions([]);
        return;
      }
      const tempList = realm
        .objects('fixed_places_info')
        .filtered(
          'storPlacId == $0 AND fixPlacId == $1 AND stySec == $2',
          WA1140Data.storPlacId,
          WA1140Data.fixPlacId,
          stySec,
        )
        .sorted('useDt', true);
      if (tempList.length > 0) {
        //取得した[区域番号]の一覧を画面上の区域番号に設定する。
        updateStySecOptions(); // 区域番号選択肢を更新
        setSelectAreNo(tempList[0].areNo as string); //区域番号
      }
      setIsStySecFocused(false);
      isSend();
    }
  };

  //区域番号選択肢作成
  const updateAreNoOptions = () => {
    let tempList;
    tempList = realm
      .objects('fixed_places_info')
      .filtered(
        'storPlacId == $0 AND fixPlacId == $1 AND stySec == $2',
        WA1140Data.storPlacId,
        WA1140Data.fixPlacId,
        stySec,
      )
      .sorted('useDt', true);
    if (tempList.length > 0) {
      setSelectAreNo(tempList[0].areNo as string); //区域番号
      const options: PickerOption[] = tempList.map(item => ({
        label: item.areNo as string, // 型アサーションを使用
        value: item.areNo as string, // 型アサーションを使用
      }));
      setAreNoOptions(options);
    }
  };

  //区域番号 フォーカスイン
  const handleAreNoFocus = () => {
    setIsAreNoFocused(true);
  };

  //区域番号 フォーカスアウト
  const handleAreNoBlur = () => {
    if (isAreNoFocused) {
      isSend();
    }
  };

  //段数 フォーカスイン
  const handleNosFocus = () => {
    setIsNosFocused(true);
  };

  //段数 フォーカスアウト
  const handleNosBlur = () => {
    if (isNosFocused) {
      isSend();
    }
  };

  //段数
  const makePickerNos = () => {
    const settingsInfo = realm.objects('settings')[0];

    // maxNosのマッピングを作成し、適切な型アノテーションを設定
    const maxNosMapping: {[key: string]: number} = {
      '1': settingsInfo.selPlans as number,
      '2': settingsInfo.selCombust as number,
      '3': settingsInfo.selSoil as number,
      '4': settingsInfo.selConcrete as number,
      '5': settingsInfo.selAsphalt as number,
      '6': settingsInfo.selNoncombustMix as number,
      '7': settingsInfo.selAsbestos as number,
      '8': settingsInfo.selPlasterboard as number,
      '9': settingsInfo.selHazard as number,
      '10': settingsInfo.selOutCombust as number,
      '11': settingsInfo.selOutNoncombust as number,
      '12': settingsInfo.selTmpCombust as number,
      '13': settingsInfo.selTmpNoncombust as number,
      '14': settingsInfo.selAsh as number,
    };

    // rmSolTypに基づいてmaxNosを取得する際には、キーを文字列として扱う
    const maxNos = maxNosMapping[String(WA1140Data.rmSolTyp)];

    const numberItems = Array.from({length: maxNos}, (_, index) => index + 1); // 1から始まる数値の配列を生成

    return (
      <Picker
        selectedValue={selectNos}
        onValueChange={itemValue => setSelectNos(itemValue)}
        style={[styles.pickerStyle]}>
        {numberItems.map(item => (
          <Picker.Item key={item} label={`${item}`} value={item} />
        ))}
      </Picker>
    );
  };

  return (
    <View style={styles.container}>
      {/* ヘッダ */}
      <FunctionHeader
        appType={'現'}
        viewTitle={'定置場所入力'}
        functionTitle={'定置登録'}
      />

      {/* 上段 */}
      <View style={[styles.main]}>
        <Text style={[styles.labelText]}>作業場所：{WA1140Data.wkplcTyp}</Text>
        <Text style={[styles.labelText, styles.labelTextPlace]}>
          {WA1140Data.wkplc}
        </Text>
      </View>

      {/* 中段 */}
      <View style={[styles.textareaContainer, styles.topContent]}>
        <View style={styles.tableMain}>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={[styles.labelText, styles.alignRight]}>
                新タグID：
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.labelText}>{WA1140Data.newTagId}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={[styles.labelText, styles.alignRight]}>
                除去土壌等種別：
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.labelText}>
                {CT0007[Number(WA1140Data?.rmSolTyp)]}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={[styles.labelText, styles.alignRight]}>
                定置区画ID：
              </Text>
            </View>
            <View
              style={[styles.tableCell, styles.pickerFixStyle]}
              onStartShouldSetResponder={() => true}
              onResponderGrant={handleStySecFocus}
              onResponderRelease={handleStySecBlur}>
              <Picker
                selectedValue={selectStySec}
                onValueChange={itemValue => setSelectStySec(itemValue)}
                style={[styles.pickerStyle]}>
                {stySecOptions.map(item => (
                  <Picker.Item
                    key={item.label as string}
                    label={`${item.label}`}
                    value={item.label}
                  />
                ))}
              </Picker>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={[styles.labelText, styles.alignRight]}>
                区域番号：
              </Text>
            </View>
            <View
              style={[styles.tableCell, styles.pickerFixStyle]}
              onStartShouldSetResponder={() => true}
              onResponderGrant={handleAreNoFocus}
              onResponderRelease={handleAreNoBlur}>
              <Picker
                selectedValue={selectAreNo}
                onValueChange={itemValue => setSelectAreNo(itemValue)}
                style={[styles.pickerStyle]}>
                {areNoOptions.map(item => (
                  <Picker.Item
                    key={item.label as string}
                    label={`${item.label}`}
                    value={item.label}
                  />
                ))}
              </Picker>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={[styles.labelText, styles.alignRight]}>段数：</Text>
            </View>
            <View
              style={[styles.tableCell, styles.pickerFixStyle]}
              onStartShouldSetResponder={() => true}
              onResponderGrant={handleNosFocus}
              onResponderRelease={handleNosBlur}>
              {makePickerNos()}
            </View>
          </View>
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
    </View>
  );
};
export default WA1141;
