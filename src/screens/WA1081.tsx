/**-------------------------------------------
 * A01-0080_旧タグID参照(土壌)
 * WA1081
 * screens/WA1081.tsx
 * ---------------------------------------------*/
import FunctionHeader from '../components/FunctionHeader.tsx'; // Headerコンポーネントのインポート
import Footer from '../components/Footer.tsx'; // Footerコンポーネントのインポート
import { styles } from '../styles/CommonStyle.tsx'; // 共通スタイル
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { logUserAction, logScreen  } from '../utils/Log.tsx';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootList } from '../navigation/AppNavigator.tsx';
import { useRecoilValue,useSetRecoilState } from "recoil";
import { WA1080DataState,WA1111BackState } from "../atom/atom.tsx";
import { CT0007,CT0006,CT0005,CT0009,CT0010,CT0011,CT0008} from "../enum/enums.tsx";

// WA1081 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1081'>;
interface Props {
  navigation: NavigationProp;
};
const WA1081 = ({navigation}:Props) => {
    const WA1080Data = useRecoilValue(WA1080DataState);
    const setBack = useSetRecoilState(WA1111BackState);
    /************************************************
     * 初期表示設定
     ************************************************/   
    useEffect(() => {
    }, []);

    /************************************************
     * データ部分の値を表示するための関数
     ************************************************/   
    const renderData = () => {
      return(
        <View style={styles.tableMain}>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}><Text style={styles.labelText}>土壌等種別：</Text></View>
            <View style={styles.tableCell}><Text style={styles.labelText}>{CT0007[WA1080Data?.data.rmSolTyp as number]}</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}><Text style={styles.labelText}>重量：</Text></View>
            <View style={styles.tableCell}><Text style={styles.labelText}>{WA1080Data?.data.weight}</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}><Text style={styles.labelText}>空間線量率：</Text></View>
            <View style={styles.tableCell}><Text style={styles.labelText}>{WA1080Data?.data.airDsRt}</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}><Text style={styles.labelText}>受入日：</Text></View>
            <View style={styles.tableCell}><Text style={styles.labelText}>{WA1080Data?.data.rcvDt}</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}><Text style={styles.labelText}>特定施設：</Text></View>
            <View style={styles.tableCell}><Text style={styles.labelText}>{CT0006[WA1080Data?.data.splFac as number]}</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}><Text style={styles.labelText}>津波浸水：</Text></View>
            <View style={styles.tableCell}><Text style={styles.labelText}>{CT0005[WA1080Data?.data.tsuInd as number]}</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}><Text style={styles.labelText}>荷姿種別：</Text></View>
            <View style={styles.tableCell}><Text style={styles.labelText}>{CT0009[WA1080Data?.data.pkTyp as number]}</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}><Text style={styles.labelText}>内袋利用方法：</Text></View>
            <View style={styles.tableCell}><Text style={styles.labelText}>{CT0010[WA1080Data?.data.usgInnBg as number]}</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}><Text style={styles.labelText}>アルミ内袋：</Text></View>
            <View style={styles.tableCell}><Text style={styles.labelText}>{CT0011[WA1080Data?.data.usgAluBg as number]}</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}><Text style={styles.labelText}>容積：</Text></View>
            <View style={styles.tableCell}><Text style={styles.labelText}>{WA1080Data?.data.vol}</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}><Text style={styles.labelText}>エリア名：</Text></View>
            <View style={styles.tableCell}><Text style={styles.labelText}>{WA1080Data?.data.arNm}</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}><Text style={styles.labelText}>発生土地分類：</Text></View>
            <View style={styles.tableCell}><Text style={styles.labelText}>{CT0008[WA1080Data?.data.ocLndCla as number]}</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}><Text style={styles.labelText}>土地利用区分：</Text></View>
            <View style={styles.tableCell}><Text style={styles.labelText}>{WA1080Data?.data.ocLndUseknd}</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}><Text style={styles.labelText}>発生場所：</Text></View>
            <View style={styles.tableCell}><Text style={styles.labelText}>{WA1080Data?.data.ocloc}</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}><Text style={styles.labelText}>備考(除去土壌情報)：</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}><Text style={styles.labelText}>{WA1080Data?.data.rmSolInf}</Text></View>
          </View>                                     
          <View style={styles.tableRow}>
            <View style={styles.tableCell}><Text style={styles.labelText}>除染時データメモ：</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}><Text style={styles.labelText}>{WA1080Data?.data.lnkNewTagDatMem}</Text></View>
          </View>
        </View>
      );
    };    

    /************************************************
     * 戻るボタン処理
     ************************************************/
    const btnAppBack = async () => {
      await logUserAction(`ボタン押下: 戻る(WA1081)`);
      setBack(true);      
      await logScreen(`画面遷移:WA1080_旧タグ参照(土壌)`);  
      navigation.navigate('WA1080');
    };

    /************************************************
     * メニューボタン処理
     ************************************************/
    const btnMenu = async () => {
      await logUserAction(`ボタン押下: メニュー(WA1081)`);  
      await logScreen(`画面遷移:WA1040_メニュー`);  
      navigation.navigate('WA1040');
    };

    return (
      <View style={styles.container}>
        {/* ヘッダ */}
        <FunctionHeader appType={"現"} viewTitle={"旧タグ参照"} functionTitle={"参照(土)"}/>
    
        {/* 上段 */}
        <View  style={[styles.main]}>
          <Text style={[styles.labelText]}>作業場所：{WA1080Data?.head.wkplcTyp}</Text>
          <Text style={[styles.labelText,styles.labelTextPlace]}>{WA1080Data?.head.wkplc}</Text>
          <Text style={[styles.labelText]}>旧タグID：{WA1080Data?.head.oldTagId}</Text>
        </View>

        {/* 中段 */}
        <View  style={[styles.textareaContainer,styles.middleContent]}>
          <View style={[styles.scrollContainer]}>
            <ScrollView 
                style={[styles.scrollViewStyle]}
                showsVerticalScrollIndicator={true}
            >
              {renderData()}
            </ScrollView>          
          </View>
        </View>

        {/* 下段 */}
        <View style={[styles.bottomSection,styles.settingMain]}>
          <TouchableOpacity style={[styles.button, styles.settingButton,styles.settingButton3]} onPress={btnAppBack}>
            <Text style={styles.endButtonText}>戻る</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.settingButton,styles.settingButton]} onPress={btnMenu}>
            <Text style={[styles.endButtonText,styles.settingButtonText1]}>メニュー</Text>
          </TouchableOpacity>                    
        </View>

        {/* フッタ */}
        <Footer /> 

      </View>
    );
    
};
export default WA1081;