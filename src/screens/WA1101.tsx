/**-------------------------------------------
 * A01-0100_新タグID参照(灰)
 * WA1101
 * screens/WA1101.tsx
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
import {WA1100DataState, WA1101BackState} from '../atom/atom.tsx';
import {useButton} from '../hook/useButton.tsx';

// WA1101 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1101'>;
interface Props {
  navigation: NavigationProp;
}
const WA1101 = ({navigation}: Props) => {
  const WA1100Data = useRecoilValue(WA1100DataState); // Recoil 新タグID情報
  const setBack = useSetRecoilState(WA1101BackState); // Recoil 戻る
  const [isBtnEnabledBck, toggleButtonBck] = useButton(); //ボタン制御
  const [isBtnEnabledMnu, toggleButtonMnu] = useButton(); //ボタン制御

  /************************************************
   * 初期表示設定
   ************************************************/
  useEffect(() => {}, []);

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
    await logUserAction('ボタン押下: WA1101 - 戻る');
    setBack(true);
    await logScreen('画面遷移: WA1101 → WA1100_新タグ参照(土壌)');
    navigation.navigate('WA1100');
  };

  /************************************************
   * メニューボタン処理
   ************************************************/
  const btnMenu = async () => {
    //ボタン連続押下制御
    if (!isBtnEnabledMnu) {
      return;
    } else {
      toggleButtonMnu();
    }
    await logUserAction('ボタン押下: WA1101 - メニュー');
    await logScreen('画面遷移: WA1101 → WA1040_メニュー');
    navigation.navigate('WA1040');
  };

  return (
    <View style={styles.container}>
      {/* ヘッダ */}
      <FunctionHeader
        appType={'現'}
        viewTitle={'新タグ参照'}
        functionTitle={'参照(灰)'}
      />

      {/* 上段 */}
      <View style={[styles.main]}>
        <Text
          style={[styles.labelText, styles.labelTextOver]}
          numberOfLines={1}
          ellipsizeMode="tail">
          仮置場：{WA1100Data?.data.tmpLocNm}
        </Text>
        <Text
          style={[styles.labelText, styles.labelTextOver]}
          numberOfLines={1}
          ellipsizeMode="tail">
          新タグID：{WA1100Data?.head.newTagId}
        </Text>
        <Text
          style={[styles.labelText, styles.labelTextOver]}
          numberOfLines={1}
          ellipsizeMode="tail">
          旧タグID：{WA1100Data?.data.oldTagId}
        </Text>
      </View>

      {/* 中段2 */}
      <View style={[styles.textareaContainer, styles.middleContent]}>
        <View style={styles.tableMain}>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={[styles.labelText, styles.alignRight]}>
                重量(Kg)：
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text
                style={[styles.labelText, styles.labelTextOver]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {WA1100Data?.data.surDsWt}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={[styles.labelText, styles.alignRight]}>
                線量(μSv/h)：
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text
                style={[styles.labelText, styles.labelTextOver]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {WA1100Data?.data.surDsRt}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={[styles.labelText, styles.alignRight]}>
                測定放射能濃度：
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text
                style={[styles.labelText, styles.labelTextOver]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {WA1100Data?.data.meaRa}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={[styles.labelText, styles.alignRight]}>
                (Bq/Kg)　
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.labelText} />
            </View>
          </View>
        </View>
      </View>

      {/* 中段2 */}
      <Text style={[styles.labelText, styles.main]}>メモ：</Text>
      <View style={[styles.textareaContainer, styles.middleContent]}>
        <View style={[styles.scrollContainer]}>
          <ScrollView
            style={[styles.scrollViewStyle]}
            showsVerticalScrollIndicator={true}>
            <Text style={styles.labelText}>
              {WA1100Data?.data.lnkNewTagDatMem}
            </Text>
          </ScrollView>
        </View>
      </View>

      {/* 下段 */}
      <View style={[styles.bottomSection, styles.settingMain]}>
        <TouchableOpacity
          disabled={!isBtnEnabledBck}
          style={[styles.button, styles.settingButton, styles.settingButton3]}
          onPress={btnAppBack}>
          <Text style={styles.endButtonText}>戻る</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!isBtnEnabledMnu}
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
export default WA1101;
