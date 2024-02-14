/**-------------------------------------------
 * A01-0060_新タグID参照(土壌)
 * WA1062
 * screens/WA1062.tsx
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
  KeyboardAvoidingView,
} from 'react-native';
import {logUserAction, logScreen} from '../utils/Log.tsx';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../navigation/AppNavigator.tsx';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {
  WA1061BackState,
  WA1060NewTagIdState,
  WA1060OldTagInfosState,
  WA1061TagIdState,
  WA1063MemoAutoState,
  WA1060PrevScreenId,
} from '../atom/atom.tsx';
import {useAlert} from '../components/AlertContext.tsx';
import messages from '../utils/messages.tsx';
import ProcessingModal from '../components/Modal.tsx';
import {Picker} from '@react-native-picker/picker';
import {getInstance} from '../utils/Realm'; // realm.jsから関数をインポート
import {NativeModules} from 'react-native';

const {JISInputFilter} = NativeModules;
// WA1062 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1062'>;
interface Props {
  navigation: NavigationProp;
}
const WA1062 = ({navigation}: Props) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false); // 処理中モーダルの状態
  const [selectRmSolType, setSelectRmSolType] = useState<string>(''); // 除去土壌等種別
  const [selectRmSolTypeInit, setSelectRmSolTypeInit] = useState<string>(''); // 除去土壌等種別 初期値
  const [selectUsgAluBg, setSelectUsgAluBg] = useState<string>(''); // アルミ内袋の有無
  const [lnkNewTagDatMemInp, setLnkNewTagDatMemInp] = useState<string>('');
  const [selectLnkNewTagDatMem, setSelectLnkNewTagDatMem] =
    useState<string>(''); //除染時データメモ 入力値
  const [isLnkNewTagDatMemInpDisabled, setIsLnkNewTagDatMemInpDisabled] =
    useState<boolean>(true); //除染時データメモ 入力値 活性・非活性
  const newTagId = useRecoilValue(WA1060NewTagIdState); // Recoil 新タグID
  const WA1061TagId = useRecoilValue(WA1061TagIdState); //Recoil 旧タグ
  const [WA1063MemoAuto, setWA1063MemoAuto] =
    useRecoilState(WA1063MemoAutoState); //Recoil メモ情報
  const [WA1060OldTagInfos, setWA1060OldTagInfos] = useRecoilState(
    WA1060OldTagInfosState,
  ); //Recoil 旧タグ情報
  const setBack = useSetRecoilState(WA1061BackState); // Recoil 遷移前画面
  const setPrevScreenId = useSetRecoilState(WA1060PrevScreenId); // Recoil 戻る
  const {showAlert} = useAlert();

  /************************************************
   * 初期表示設定
   ************************************************/
  useEffect(() => {
    //PICKER初期値設定
    setSelectLnkNewTagDatMem('');
    setSelectUsgAluBg('2');
    const color = newTagId.substring(1).charAt(0);
    switch (color) {
      case '1':
        setSelectRmSolType('1');
        setSelectRmSolTypeInit('1');
        break;
      case '3':
        setSelectRmSolType('3');
        setSelectRmSolTypeInit('3');
        break;
      default:
        setSelectRmSolType('');
        setSelectRmSolTypeInit('');
    }
    //遷移元画面IDを設定
    setPrevScreenId('WA1062');
  }, []);

  useEffect(() => {
    //理由：その他の場合のみ入力欄記載可
    if (selectLnkNewTagDatMem === 'その他') {
      setIsLnkNewTagDatMemInpDisabled(false);
    } else {
      setIsLnkNewTagDatMemInpDisabled(true);
    }
  }, [selectLnkNewTagDatMem]);

  // テキストボックスのスタイルを動的に変更するための関数
  const getTextInputStyle = () => {
    return isLnkNewTagDatMemInpDisabled
      ? [styles.textAreaInput, styles.inputDisabled]
      : styles.textAreaInput;
  };

  useEffect(() => {}, []);

  /************************************************
   * 戻るボタン処理
   ************************************************/
  const btnAppBack = async () => {
    await logUserAction('ボタン押下: WA1062 - 戻る');
    const result = await showAlert('確認', messages.IA5014(), true);
    if (result) {
      setBack(true);
      await logScreen('画面遷移: WA1062 → WA1061_旧タグ読込(土壌)');
      navigation.navigate('WA1061');
    }
  };

  /************************************************
   * 設定ボタン処理
   ************************************************/
  const btnSetting = async () => {
    await logUserAction('ボタン押下: WA1062 - 設定');
    // 一時記憶領域の[旧タグ由来情報(配列)]の配列末尾[N]に追加する。
    setWA1060OldTagInfos([
      ...WA1060OldTagInfos,
      {
        oldTag: WA1061TagId[0], //旧タグID
        genbaCheck: '2', //現場確認
        tsuInd: '2', //津波浸水
        splFac: '2', //特定施設由来
        rmSolTyp: selectRmSolType, //除去土壌等種別
        ocLndCla: '', //発生土地分類
        pkTyp: '', //荷姿種別
        usgInnBg: '', //内袋の利用方法
        usgInnBgNm: '', //内袋の利用方法名
        usgAluBg: selectUsgAluBg, //アルミ内袋の有無
        vol: '', //容積
        airDsRt: '', //空間線量率
        ocLndUseknd: '', //発生土地の利用区分
        ocloc: '', //発生場所
        rmSolInf:
          selectLnkNewTagDatMem === 'その他'
            ? lnkNewTagDatMemInp
            : selectLnkNewTagDatMem, //備考(除去土壌情報)
        lnkNewTagDatMem: '', //除染時データメモ
      },
    ]);

    //除去土壌等種別が変更された場合(既に旧タグがある場合 かつ ダミータグではない場合)
    if (
      selectRmSolTypeInit !== selectRmSolType &&
      WA1061TagId[1] !== 'dummyTag'
    ) {
      if (WA1063MemoAuto) {
        setWA1063MemoAuto(
          WA1063MemoAuto + ',' + WA1061TagId + ':除去土壌等種別が異なる',
        );
      } else {
        setWA1063MemoAuto(WA1061TagId + ':除去土壌等種別が異なる');
      }
    }
    await logScreen('画面遷移: WA1062 → WA1061_旧タグ読込(土壌)');
    navigation.navigate('WA1061');
  };

  /************************************************
   * 文字フィルタリング
   * JIS第一水準、JIS第二水準に含まれない場合、入力された文字を無効
   ************************************************/
  // 入力されたときのハンドラー
  const handleInputChange = async (newText: string) => {
    try {
      if (newText == null) {
        setLnkNewTagDatMemInp('');
      }
      let filteredText: string = await JISInputFilter.checkJISText(newText);
      if (!filteredText) {
        filteredText = '';
      }
      setLnkNewTagDatMemInp(filteredText);
    } catch (error) {
      console.error(error);
    }
    setLnkNewTagDatMemInp(newText);
  };

  // 入力がフォーカスアウトされたときのハンドラー
  const filterText = async () => {
    try {
      if (lnkNewTagDatMemInp == null) {
        setLnkNewTagDatMemInp('');
      }
      let filteredText: string = await JISInputFilter.checkJISText(
        lnkNewTagDatMemInp,
      );
      if (!filteredText) {
        filteredText = '';
      }
      setLnkNewTagDatMemInp(filteredText);
    } catch (error) {
      console.error(error);
    }
  };

  /************************************************
   * コンボボックス作成
   ************************************************/
  //除去土壌等種別
  const makePickerRmSolTyp = () => {
    const makeList = () => {
      const color = newTagId.substring(1).charAt(0);
      let items = [<Picker.Item key="" label="未選択" value="" />]; // Picker.Item を格納する配列
      //タグ色に応じた旧タグ由来情報の除去土壌等種別判定
      switch (color) {
        case '1': //緑色
          items.push(<Picker.Item key="1" label="1:草木類" value="1" />);
          break;
        case '2': //黄色
          items.push(
            <Picker.Item key="2" label="2:1以外の可燃廃棄物" value="2" />,
          );
          items.push(
            <Picker.Item
              key="10"
              label="10:屋外残置廃棄物_可燃物"
              value="10"
            />,
          );
          items.push(
            <Picker.Item key="12" label="12:仮置場解体発生可燃物" value="12" />,
          );
          break;
        case '3': //白色
          items.push(<Picker.Item key="3" label="3:土壌等" value="3" />);
          break;
        case '4': //青色
          items.push(
            <Picker.Item key="4" label="4:コンクリート殻等" value="4" />,
          );
          items.push(
            <Picker.Item key="5" label="5:アスファルト混合物" value="5" />,
          );
          items.push(
            <Picker.Item
              key="6"
              label="6:3、4、5以外の混合物・不燃物"
              value="6"
            />,
          );
          items.push(
            <Picker.Item
              key="11"
              label="11:屋外残置廃棄物_不燃物"
              value="11"
            />,
          );
          items.push(
            <Picker.Item key="13" label="13:仮置場解体発生不燃物" value="13" />,
          );
          break;
        case '5': //赤色
          items.push(<Picker.Item key="7" label="7:石綿含有建材" value="7" />);
          items.push(<Picker.Item key="8" label="8:石膏ボード" value="8" />);
          items.push(
            <Picker.Item
              key="9"
              label="9:7、8以外の危険物・有害物"
              value="9"
            />,
          );
          break;
        case '7': //橙色
          items.push(<Picker.Item key="1" label="1:草木類" value="1" />);
          items.push(
            <Picker.Item key="2" label="2:1以外の可燃廃棄物" value="2" />,
          );
          items.push(<Picker.Item key="3" label="3:土壌等" value="3" />);
          items.push(
            <Picker.Item key="4" label="4:コンクリート殻等" value="4" />,
          );
          items.push(
            <Picker.Item key="5" label="5:アスファルト混合物" value="5" />,
          );
          items.push(
            <Picker.Item
              key="6"
              label="6:3、4、5以外の混合物・不燃物"
              value="6"
            />,
          );
          items.push(
            <Picker.Item
              key="10"
              label="10:屋外残置廃棄物_可燃物"
              value="10"
            />,
          );
          items.push(
            <Picker.Item
              key="11"
              label="11:屋外残置廃棄物_不燃物"
              value="11"
            />,
          );
          items.push(
            <Picker.Item key="12" label="12:仮置場解体発生可燃物" value="12" />,
          );
          items.push(
            <Picker.Item key="13" label="13:仮置場解体発生不燃物" value="13" />,
          );
          break;
      }
      return items;
    };
    return (
      <Picker
        selectedValue={selectRmSolType}
        onValueChange={itemValue => setSelectRmSolType(itemValue)}
        style={[styles.pickerStyle]}>
        {makeList()}
      </Picker>
    );
  };
  //アルミ内袋の利用
  const makePickerUsgAluBg = () => {
    return (
      <Picker
        selectedValue={selectUsgAluBg}
        onValueChange={itemValue => setSelectUsgAluBg(itemValue)}
        style={[styles.pickerStyle]}>
        <Picker.Item key="" label="未選択" value="" />
        <Picker.Item key="1" label="利用あり" value="1" />
        <Picker.Item key="2" label="利用なし" value="2" />
      </Picker>
    );
  };
  //発行理由
  const makePickerLnkNewTagDatMem = () => {
    const realm = getInstance();
    const settings = realm.objects('settings')[0];
    const reasons = settings.reasonListOldTag as string;
    let reasonAry = reasons.split(',');
    reasonAry.push('その他');
    return (
      <Picker
        selectedValue={selectLnkNewTagDatMem}
        onValueChange={itemValue => {
          setSelectLnkNewTagDatMem(itemValue);
        }}
        style={[styles.pickerStyle]}>
        <Picker.Item key="" label="未選択" value="" />
        {reasonAry.map((reason, index) => (
          <Picker.Item key={index} label={reason} value={reason} />
        ))}
      </Picker>
    );
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
          viewTitle={'旧タグ設定'}
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
          <Text
            style={[styles.labelText, styles.bold, styles.labelTextOver]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {WA1061TagId[1] === 'dummyTag' ? 'ダミー' : '旧'}タグID：
            {WA1061TagId[0]}
          </Text>
          <View style={[styles.center]}>
            <Text style={[styles.labelText]}>
              {WA1061TagId[1] === 'dummyTag' ? 'ダミー' : '旧'}
              タグ情報を選択してください。
            </Text>
          </View>
          <View style={styles.tableMain}>
            <View style={[styles.tableRow, styles.pickerContainer]}>
              <View style={styles.tableCell}>
                <Text style={[styles.pickerLabelText, styles.alignRight]}>
                  除去土壌等種別：
                </Text>
              </View>
              <View style={[styles.tableCell, styles.pickerFixStyle]}>
                {makePickerRmSolTyp()}
              </View>
            </View>
            <View style={[styles.tableRow, styles.pickerContainer]}>
              <View style={styles.tableCell}>
                <Text style={[styles.pickerLabelText, styles.alignRight]}>
                  アルミ内袋の利用：
                </Text>
              </View>
              <View style={[styles.tableCell, styles.pickerFixStyle]}>
                {makePickerUsgAluBg()}
              </View>
            </View>
            <View style={[styles.tableRow, styles.pickerContainer]}>
              <View style={styles.tableCell}>
                <Text style={[styles.pickerLabelText, styles.alignRight]}>
                  発行理由：
                </Text>
              </View>
              <View style={[styles.tableCell, styles.pickerFixStyle]}>
                {makePickerLnkNewTagDatMem()}
              </View>
            </View>
            <View style={[styles.tableRow, styles.pickerContainer]}>
              <View style={styles.tableCell}>
                <Text style={[styles.pickerLabelText, styles.alignRight]}>
                  その他発行理由　
                </Text>
              </View>
              <View style={styles.tableCell} />
            </View>
          </View>
        </View>

        {/* 中段 */}
        <View style={[styles.textareaContainer, styles.middleContent]}>
          <View style={[styles.inputReasonScrollContainer]}>
            <ScrollView
              contentContainerStyle={[styles.inputReasonScrollViewStyle]}
              showsVerticalScrollIndicator={true}>
              <TextInput
                multiline={true}
                onChangeText={handleInputChange}
                onBlur={filterText}
                value={lnkNewTagDatMemInp}
                style={[styles.inputReason, getTextInputStyle()]}
                editable={!isLnkNewTagDatMemInpDisabled}
              />
            </ScrollView>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.button, styles.endButton]}
            onPress={btnAppBack}>
            <Text style={styles.endButtonText}>戻る</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={btnSetting}>
            <Text style={styles.startButtonText}>設定</Text>
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
export default WA1062;
