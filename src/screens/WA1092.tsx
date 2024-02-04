/**-------------------------------------------
 * A01-0090_新タグ紐付(灰)
 * WA1092
 * screens/WA1092.tsx
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
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import {logUserAction, logScreen} from '../utils/Log.tsx';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../navigation/AppNavigator.tsx';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {
  WA1091BackState,
  WA1090PrevScreenId,
  WA1092WtDsState,
  WA1090NewTagIdState,
  WA1091OldTagInfoState,
} from '../atom/atom.tsx';
import {useAlert} from '../components/AlertContext.tsx';
import messages from '../utils/messages.tsx';
import ProcessingModal from '../components/Modal.tsx';
import {getInstance} from '../utils/Realm.tsx'; // realm.jsから関数をインポート
// WA1092 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1092'>;
interface Props {
  navigation: NavigationProp;
}
const WA1092 = ({navigation}: Props) => {
  const [caLgSdBgWt, setCaLgSdBgWt] = useState<string>(''); // 重量(Kg)
  const [caLgSdBgDsInt, setCaLgSdBgDsInt] = useState<string>(''); // 線量(μSv/h) 整数
  const [caLgSdBgDsDec, setCaLgSdBgDsDec] = useState<string>(''); // 線量(μSv/h) 小数
  const [modalVisible, setModalVisible] = useState<boolean>(false); //処理中モーダルの状態
  const [isNext, setIsNext] = useState<boolean>(false); //次へボタンのスタイル 活性・非活性
  const newTagId = useRecoilValue(WA1090NewTagIdState); //新タグID
  const WA1091OldTagInfo = useRecoilValue(WA1091OldTagInfoState); //Recoil 旧タグ情報
  const [prevScreenId, setPrevScreenId] = useRecoilState(WA1090PrevScreenId); //遷移元画面ID
  const [WA1092WtDs, setWA1092WtDs] = useRecoilState(WA1092WtDsState); // Recoil 重量・線量情報
  const setBack = useSetRecoilState(WA1091BackState); // Recoil 戻る
  const realm = getInstance();
  const settings = realm.objects('settings')[0];
  const {showAlert} = useAlert();

  /************************************************
   * 初期表示設定
   ************************************************/
  useEffect(() => {
    //初期値設定
    const init = async () => {
      //重量
      if (WA1092WtDs.caLgSdBgWt) {
        setCaLgSdBgWt(WA1092WtDs.caLgSdBgWt);
      }
      //線量
      if (WA1092WtDs.caLgSdBgDs) {
        const tmpCaLgSdBgDs = WA1092WtDs.caLgSdBgDs.split('.');
        setCaLgSdBgDsInt(tmpCaLgSdBgDs[0]);
        if (tmpCaLgSdBgDs.length > 1) {
          setCaLgSdBgDsInt(tmpCaLgSdBgDs[1]);
        }
      }
    };
    init();
  }, []);

  //次へボタン活性・非活性
  useEffect(() => {
    if (caLgSdBgWt && caLgSdBgDsInt && caLgSdBgDsDec) {
      setIsNext(true);
    } else {
      setIsNext(false);
    }
  }, [caLgSdBgWt, caLgSdBgDsInt, caLgSdBgDsDec]);

  // 次へボタンのスタイルを動的に変更するための関数
  const getNextButtonStyle = () => {
    return isNext
      ? [styles.button, styles.startButton]
      : [styles.button, styles.startButton, styles.disabledButton];
  };

  // 小数点以下二桁目補填
  const handleBlurCaLgSdBgDsDec = () => {
    if (caLgSdBgDsDec.length < 2) {
      setCaLgSdBgDsDec(caLgSdBgDsDec.padEnd(2, '0'));
    }
  };

  /************************************************
   * 破棄ボタン処理
   ************************************************/
  const btnAppDestroy = async () => {
    await logUserAction('ボタン押下: 破棄(WA1092)');
    const result = await showAlert('確認', messages.IA5012(), true);
    if (result) {
      setBack(true);
      setPrevScreenId('WA1040');
      await logScreen('画面遷移:WA1090_新タグ読込(灰)');
      navigation.navigate('WA1090');
    }
  };

  /************************************************
   * 戻るボタン処理
   ************************************************/
  const btnAppBack = async () => {
    await logUserAction('ボタン押下: 戻る(WA1092)');
    if (prevScreenId === 'WA1094') {
      //遷移元画面IDを設定
      setPrevScreenId('WA1092');
      await logScreen('画面遷移:WA1094_登録内容確認(灰)');
      navigation.navigate('WA1094');
    } else {
      const result = await showAlert('確認', messages.IA5014(), true);
      if (result) {
        // 一時領域をクリアする
        setWA1092WtDs({
          caLgSdBgWt: '', //重量
          caLgSdBgDs: '', //線量
        });
        //遷移元画面IDを設定
        setPrevScreenId('WA1092');
        await logScreen('画面遷移:WA1093_必須情報入力(土壌)');
        navigation.navigate('WA1093');
      }
    }
  };

  /************************************************
   * 次へボタン処理
   ************************************************/
  const btnAppNext = async () => {
    await logUserAction('ボタン押下: 次へ(WA1092)');
    //重量が閾値を越えるか確認
    if (Number(caLgSdBgWt) > Number(settings.kgThresSoil)) {
      const result = await showAlert(
        '確認',
        messages.WA5004(String(settings.kgThresAsh)),
        true,
      );
      if (!result) {
        return;
      }
    }
    //線量が閾値を越えるか確認
    if (
      Number(caLgSdBgDsInt) + Number(caLgSdBgDsDec) >
      Number(settings.radioThres)
    ) {
      const result = await showAlert(
        '確認',
        messages.WA5004(String(settings.radioThres)),
        true,
      );
      if (!result) {
        return;
      }
    }
    // 一時領域に設定する
    setWA1092WtDs({
      caLgSdBgWt: String(caLgSdBgWt ?? ''), //重量
      caLgSdBgDs:
        caLgSdBgDsInt && caLgSdBgDsDec
          ? String(Number(caLgSdBgDsInt) + Number(caLgSdBgDsDec))
          : '', //線量
    });
    if (prevScreenId === 'WA1094') {
      //遷移元画面IDを設定
      setPrevScreenId('WA1092');
      await logScreen('画面遷移:WA1094_登録内容確認(灰)');
      navigation.navigate('WA1094');
    } else {
      //遷移元画面IDを設定
      setPrevScreenId('WA1092');
      await logScreen('画面遷移:WA1093_メモ入力(灰)');
      navigation.navigate('WA1093');
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
          viewTitle={'重量・線量'}
          functionTitle={'紐付(灰)'}
        />

        {/* 上段 */}
        <View style={[styles.main, styles.topContent]}>
          <Text style={[styles.labelText, styles.bold]}>
            新タグID：{newTagId}
          </Text>
          <Text style={[styles.labelText, styles.bold]}>
            旧タグID：{WA1091OldTagInfo.oldTagId}
          </Text>
          <Text style={[styles.labelText, styles.centerContent]}>
            重量、線量を入力して下さい。
          </Text>
          <View style={styles.middleContainer}>
            <View style={styles.tableMain}>
              <View style={[styles.tableRow, styles.pickerContainer]}>
                <View style={styles.tableCell}>
                  <Text style={[styles.inputLabelText, styles.alignRight]}>
                    重量(Kg)：
                  </Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.center,
                    styles.decimalInputContainer,
                  ]}>
                  <TextInput
                    keyboardType="numeric"
                    value={caLgSdBgWt}
                    style={styles.inputWt}
                    maxLength={4}
                    onChangeText={(text: string) => {
                      const filteredText = text.replace(/[^0-9]/g, '');
                      setCaLgSdBgWt(filteredText);
                    }}
                  />
                </View>
              </View>
              <View style={[styles.tableRow, styles.pickerContainer]}>
                <View style={styles.tableCell}>
                  <Text style={[styles.inputLabelText, styles.alignRight]}>
                    線量(μSv/h)：
                  </Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.center,
                    styles.decimalInputContainer,
                  ]}>
                  <TextInput
                    keyboardType="numeric"
                    value={caLgSdBgDsInt}
                    style={styles.inputDs}
                    maxLength={4}
                    onChangeText={(text: string) => {
                      const filteredText = text.replace(/[^0-9]/g, '');
                      setCaLgSdBgDsInt(filteredText);
                    }}
                  />
                  <Text style={styles.dotStyle}>.</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={caLgSdBgDsDec}
                    style={styles.inputDs}
                    maxLength={2}
                    onChangeText={(text: string) => {
                      const filteredText = text.replace(/[^0-9]/g, '');
                      setCaLgSdBgDsDec(filteredText);
                    }}
                    onBlur={handleBlurCaLgSdBgDsDec}
                  />
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text style={[styles.inputLabelText, styles.alignRight]}>
                    推定放射能濃度：
                  </Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.inputLabelText}>
                    {WA1091OldTagInfo.meaRa}
                  </Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text style={[styles.inputLabelText, styles.alignRight]}>
                    (Bq/Kg)　
                  </Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.inputLabelText} />
                </View>
              </View>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
export default WA1092;
