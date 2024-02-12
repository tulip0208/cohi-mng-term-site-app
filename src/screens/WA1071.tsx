/**-------------------------------------------
 * A01-0070_新タグID参照(土壌)
 * WA1071
 * screens/WA1071.tsx
 * ---------------------------------------------*/
import FunctionHeader from '../components/FunctionHeader.tsx'; // Headerコンポーネントのインポート
import Footer from '../components/Footer.tsx'; // Footerコンポーネントのインポート
import {styles} from '../styles/CommonStyle.tsx'; // 共通スタイル
import React, {useEffect} from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import {logUserAction, logScreen} from '../utils/Log.tsx';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../navigation/AppNavigator.tsx';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {WA1070DataState, WA1071BackState} from '../atom/atom.tsx';
import {
  CT0007,
  CT0006,
  CT0005,
  CT0009,
  CT0010,
  CT0011,
  CT0042,
} from '../enum/enums.tsx';

// WA1071 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1071'>;
interface Props {
  navigation: NavigationProp;
}
const WA1071 = ({navigation}: Props) => {
  const WA1070Data = useRecoilValue(WA1070DataState); // Recoil 新タグID情報
  const setBack = useSetRecoilState(WA1071BackState); // Recoil 戻る

  /************************************************
   * 初期表示設定
   ************************************************/
  useEffect(() => {}, []);

  /************************************************
   * データ部分の値を表示するための関数
   ************************************************/
  const renderOldTag = () => {
    return WA1070Data?.oldTag.oldTagIdList.map((tagId, index) => (
      <View key={index}>
        <Text style={styles.labelText}>{`${index + 1}: ${tagId}`}</Text>
      </View>
    ));
  };

  /************************************************
   * 戻るボタン処理
   ************************************************/
  const btnAppBack = async () => {
    await logUserAction('ボタン押下: WA1071 - 戻る');
    setBack(true);
    await logScreen('画面遷移: WA1071 → WA1070_新タグ参照(土壌)');
    navigation.navigate('WA1070');
  };

  /************************************************
   * メニューボタン処理
   ************************************************/
  const btnMenu = async () => {
    await logUserAction('ボタン押下: WA1071 - メニュー');
    await logScreen('画面遷移: WA1071 → WA1040_メニュー');
    navigation.navigate('WA1040');
  };

  /************************************************
   * データ部分の値を表示するための関数
   ************************************************/
  const renderData = () => {
    return (
      <View style={styles.tableMain}>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>土壌等種別：</Text>
          </View>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>
              {CT0007[WA1070Data?.data.rmSolTyp as number]}
            </Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>特定施設：</Text>
          </View>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>
              {CT0006[WA1070Data?.data.splFac as number]}
            </Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>津波浸水：</Text>
          </View>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>
              {CT0005[WA1070Data?.data.tsuInd as number]}
            </Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>重量：</Text>
          </View>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>{WA1070Data?.data.caLgSdBgWt}</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>線量：</Text>
          </View>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>{WA1070Data?.data.caLgSdBgDs}</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>推定濃度：</Text>
          </View>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>{WA1070Data?.data.estRa}</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>荷姿種別：</Text>
          </View>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>
              {CT0009[WA1070Data?.data.pkTyp as number]}
            </Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>内袋利用方法：</Text>
          </View>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>
              {CT0010[WA1070Data?.data.usgInnBg as number]}
            </Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>アルミ内袋：</Text>
          </View>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>
              {CT0011[WA1070Data?.data.usgAluBg as number]}
            </Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>オーバーパック：</Text>
          </View>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>
              {CT0042[WA1070Data?.data.yesNoOP as number]}
            </Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>メモ：</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.labelText}>
              {WA1070Data?.data.lnkNewTagDatMem}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* ヘッダ */}
      <FunctionHeader
        appType={'現'}
        viewTitle={'新タグ参照'}
        functionTitle={'参照(土)'}
      />

      {/* 上段 */}
      <View style={[styles.main]}>
        <Text style={[styles.labelText]}>
          作業場所：{WA1070Data?.head.wkplcTyp}
        </Text>
        <Text style={[styles.labelText, styles.labelTextPlace]}>
          {WA1070Data?.head.wkplc}
        </Text>
        <Text style={[styles.labelText]}>
          新タグID：{WA1070Data?.head.newTagId}
        </Text>
      </View>

      {/* 中段 */}
      <View style={[styles.textareaContainer, styles.middleContent]}>
        <View style={[styles.scrollContainer]}>
          <ScrollView
            style={[styles.scrollViewStyle]}
            showsVerticalScrollIndicator={true}>
            {renderData()}
          </ScrollView>
        </View>
      </View>
      <View style={[styles.main]}>
        <Text style={styles.labelTextSetting}>
          旧タグ数：{WA1070Data?.oldTag.oldTagId}
        </Text>
      </View>
      <View
        style={[
          styles.textareaContainer,
          styles.middleContent,
          styles.textareaContainerSecond,
        ]}>
        <View style={[styles.scrollContainer]}>
          <ScrollView
            style={[styles.scrollViewStyle]}
            showsVerticalScrollIndicator={true}>
            {renderOldTag()}
          </ScrollView>
        </View>
      </View>

      {/* 下段 */}
      <View style={[styles.bottomSection, styles.settingMain]}>
        <TouchableOpacity
          style={[styles.button, styles.settingButton, styles.settingButton3]}
          onPress={btnAppBack}>
          <Text style={styles.endButtonText}>戻る</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.settingButton, styles.settingButton]}
          onPress={btnMenu}>
          <Text style={[styles.endButtonText, styles.settingButtonText1]}>
            メニュー
          </Text>
        </TouchableOpacity>
      </View>

      {/* フッタ */}
      <Footer />
    </View>
  );
};
export default WA1071;
