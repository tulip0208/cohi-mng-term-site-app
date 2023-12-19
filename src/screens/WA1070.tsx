/**-------------------------------------------
 * A01-0070_新タグID参照(土壌)
 * WA1070
 * screens/WA1070.tsx
 * ---------------------------------------------*/
import FunctionHeader from '../components/FunctionHeader.tsx'; // Headerコンポーネントのインポート
import Footer from '../components/Footer.tsx'; // Footerコンポーネントのインポート
import { styles } from '../styles/CommonStyle.tsx'; // 共通スタイル
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, TouchableWithoutFeedback ,ScrollView,KeyboardAvoidingView } from 'react-native';
import { getInstance } from '../utils/Realm.tsx'; // realm.jsから関数をインポート
import messages from '../utils/messages.tsx';
import QRScanner from '../utils/QRScanner.tsx';
import ProcessingModal from '../components/Modal.tsx';
import { logUserAction, logScreen  } from '../utils/Log.tsx';
import { useAlert } from '../components/AlertContext.tsx';
import { IFA0330 } from '../utils/Api.tsx'; 
import { StackNavigationProp } from '@react-navigation/stack';
import { RNCamera } from 'react-native-camera';
import { RootList } from '../navigation/AppNavigator';
import { ApiResponse, IFA0330Response,IFA0330ResponseDtl,WA1070Const } from '../types/type';
import { useRecoilState } from "recoil";
import { WA1070DataState } from "../atom/atom.tsx";
// WA1071 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1070'>;
interface Props {
  navigation: NavigationProp;
};
const WA1070 = ({navigation}:Props) => {
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [showScannerTag, setShowScannerTag] = useState<boolean>(false); // カメラ表示用の状態    
    const [wkplcTyp, setWkplcTyp] = useState<string>('');
    const [wkplc, setWkplc] = useState<string>('');
    const [ WA1070Data, setWA1070Data ] = useRecoilState(WA1070DataState);
    const [tempInfo, setTempInfo] = useState<WA1070Const>();
    const [inputVisible, setInputVisible] = useState<boolean>(false);
    const [isNextDisabled, setIsNextDisabled] = useState<boolean>(false); // 送信準備完了状態
    const [inputValue, setInputValue] = useState<string>('');
    const { showAlert } = useAlert();
    /************************************************
     * 初期表示設定
     ************************************************/   
    useEffect(() => {
      const contentsViews = async () => {
        const realm = getInstance();
        const loginInfo = realm.objects('login')[0];
        let place;
        switch(loginInfo.wkplacTyp){
          case 4:
            setWkplcTyp("仮置場");    
            place = realm.objects('temporary_places')[0]
            setWkplc(place.tmpPlacNm as string);   
            break;
          case 5:
            setWkplcTyp("保管場");    
            place = realm.objects('storage_places')[0]
            setWkplc(place.storPlacNm as string);   
            break;
          case 6:
            setWkplcTyp("定置場");    
            place = realm.objects('fixed_places')[0]
            setWkplc(place.fixPlacNm as string);   
            break;
        }    
      } 
      contentsViews();  
    }, []);

    // 10秒以上の長押しを検出
    const handleLongPress = () => {  
      setTimeout(() => {
        setInputVisible(true);
        setIsNextDisabled(true);
      }, 10000); // 10秒 = 10000ミリ秒
    };
    // 送信ボタンのスタイルを動的に変更するための関数
    const getButtonStyle = () => {
      return isNextDisabled ? [styles.button,styles.startButton] : [styles.button,styles.startButton, styles.disabledButton];
    };
    // 入力値が変更されたときのハンドラー
    const handleInputChange = (text:string) => {
      setInputValue(text); 
    };
    // 入力がフォーカスアウトされたときのハンドラー
    const handleInputBlur = async () => {
      // 入力値が空かどうかによってブール値ステートを更新
      setIsNextDisabled(inputValue !== '');
      // 正規表現チェック
      if(!checkFormat(inputValue)){
        await showAlert("通知", messages.EA5017(inputValue), false);
        setIsNextDisabled(false);
        return 
      }
      // 一桁目チェック
      if (inputValue.startsWith('6') || inputValue.startsWith('8')) {
        await showAlert("通知", messages.EA5022("土壌","新タグ参照(灰)",inputValue), false);
        setIsNextDisabled(false);
        return 
      }
    };

    /************************************************
     * フォーマットチェック
     ************************************************/
    const checkFormat = (data:string) => {
      const pattern = /^[0-9][2-5][0-9]0[0-9]{11}$/;
      return pattern.test(data);
    };

    /************************************************
     * コードスキャン後の処理 (タグ用)
     * @param param0 
     * @returns 
     ************************************************/
    const handleCodeScannedForTag = async (data:string,type:string) => {
      const parts = data.split(',');
      setShowScannerTag(false);
      let code = '';
      if (type !== RNCamera.Constants.BarCodeType.qr && type !== RNCamera.Constants.BarCodeType.code39) {
        await showAlert("通知", messages.EA5001("タグ"), false);
        return;
      }else if(parts.length === 1 || parts[0] !== "CM" ){
        await showAlert("通知", messages.EA5009(), false);
        return;
      }else if(parts[0] === "CM"){
        // --QRコード--
        // 新タグID参照処理実施(csvデータ2カラム目 新タグID)
        // モーダル表示
        setModalVisible(true);        
        code = parts[1];
      }else{
        // --バーコード--
        // フォーマットチェック
        if(!checkFormat(data)){
          await showAlert("通知", messages.EA5017(data), false);
          return;
        }else if(data.charAt(0) === '6' ||
                 data.charAt(0) === '8'){
          await showAlert("通知", messages.EA5022("土壌","新タグ参照(灰)",data), false);
          return;
        }
        // モーダル表示
        setModalVisible(true);        
        code = "a"+data+"a"
      }

      // 新タグID参照処理実施
      if(!await procNewTagId(code)) {
        setShowScannerTag(false);
        return;
      }

      // モーダル非表示
      setModalVisible(false);
      await logScreen(`画面遷移:WA1071_新タグ参照(土壌)`);  
      navigation.navigate('WA1071')
    }
    // ユーザQRコードスキャンボタン押下時の処理
    const btnTagQr = async () => {
      await logUserAction(`ボタン押下: タグ読込`);
      setShowScannerTag(true);
    }; 

    /************************************************
     * 新タグID参照処理
     ************************************************/
    const procNewTagId = async (txtNewTagId:string):Promise<boolean> => {
      // ログファイルアップロード通信を実施
      const responseIFA0330 = await IFA0330(txtNewTagId);
      if(await apiIsError(responseIFA0330)) return false;
      const data = responseIFA0330.data as IFA0330Response;
      const dataDtl = data.dtl[0] as IFA0330ResponseDtl;
      
      // oldTagId の値だけを抽出して新しい配列に格納する
      const oldTagIds = data.dtl.map(item => item.oldTagId);

      // 一時データ格納する
      setWA1070Data({
        head:{
          wkplcTyp:wkplcTyp,
          wkplc:wkplc,
          newTagId:txtNewTagId,
        },
        data:{
          newTagId: dataDtl.newTagId,
          rmSolTyp: dataDtl.rmSolTyp,
          pkTyp: dataDtl.pkTyp,
          splFac: dataDtl.splFac,
          tsuInd: dataDtl.tsuInd,
          usgInnBg: dataDtl.usgInnBg,
          usgAluBg: dataDtl.usgAluBg,
          yesNoOP: dataDtl.yesNoOP,
          caLgSdBgWt: dataDtl.caLgSdBgWt,
          caLgSdBgDs: dataDtl.caLgSdBgDs,
          estRa: dataDtl.estRa,
          lnkNewTagDatMem: dataDtl.lnkNewTagDatMem,  
        },
        oldTag:{
          //---旧タグ---
          oldTagId:oldTagIds.length,
          oldTagIdList:oldTagIds as string[],
        }
      });
      return true;
    };
    
    /************************************************
     * 戻るボタン処理
     ************************************************/
    const btnAppBack = async () => {
      await logUserAction(`ボタン押下: 戻る(WA1070)`);  
      navigation.navigate('WA1040');
    };

    /************************************************
     * 次へボタン処理
     ************************************************/
    const btnAppNext = async () => {
      await logUserAction(`ボタン押下: 次へ(WA1070)`);  
      // モーダル表示
      setModalVisible(true);
      // 新タグID参照処理実施
      await procNewTagId('a' + inputValue + 'a');
      // モーダル非表示
      setModalVisible(false);
      await logScreen(`画面遷移:WA1071_新タグ参照(土壌)`);  
      navigation.navigate('WA1071');
    };

    /************************************************
     * API通信処理エラー有無確認・エラーハンドリング
     * @param {*} response 
     * @returns 
     ************************************************/
    const apiIsError = async <T,>(response:ApiResponse<T>):Promise<boolean>=>{
      if (!response.success) {
        switch(response.error){
          case 'codeHttp200':
            await showAlert("通知", messages.EA5004(response.api as string,response.code as string), false);
            break;
          case 'codeRsps01':
            await showAlert("通知", messages.EA5005(response.api as string,response.status as number), false); 
            break;
          case 'timeout':
            await showAlert("通知", messages.EA5003(), false);
            break;
          case 'zero'://取得件数0件の場合
            await showAlert("通知", messages.IA5015(), false);
            break;                  
        }
        return true ;
      }else{
        return false;
      }
    }

    return (

      <KeyboardAvoidingView 
        behavior={"padding"}
        style={{ flex: 1 }} // KeyboardAvoidingView に flex: 1 を追加
        keyboardVerticalOffset={0}
      >
      <ScrollView  contentContainerStyle={[styles.containerWithKeybord, { flexGrow: 1 }]}>
        {/* ヘッダ */}
        <FunctionHeader appType={"現"} viewTitle={"新タグ読込"} functionTitle={"参照(土)"}/>
  
        {/* 上段 */}
        <View  style={[styles.main,styles.topContent]}>
          <Text style={[styles.labelText]}>作業場所：{wkplcTyp}</Text>
          <Text style={[styles.labelText,styles.labelTextPlace]}>{wkplc}</Text>
        </View>

        {/* 中段1 */}
        <View  style={[styles.main,styles.middleContent]}>
          <Text style={styles.labelText}>下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。</Text>
          <TouchableOpacity style={[styles.button,styles.buttonSmall,styles.centerButton]} onPress={btnTagQr}>
            <Text style={styles.buttonText}>タグ読込</Text>
          </TouchableOpacity>          
        </View>

        {/* 中段2 */}
        <View  style={[styles.main,styles.topContent,styles.center]}>
          <TouchableWithoutFeedback onLongPress={handleLongPress}>
            <Text style={styles.labelText}>新タグIDが読み込めない場合：</Text>
          </TouchableWithoutFeedback>
          {inputVisible && 
            <View style={[styles.inputContainer]}>
              <Text style={styles.inputWithText}>a</Text>
              <TextInput 
                style={styles.input}
                onChangeText={handleInputChange}
                onBlur={handleInputBlur}
                value={inputValue}
              />
              <Text>a</Text>
            </View>
          }
        </View>
        <View style={{ flex: 1 }} /> 
        {/* 下段 */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={[styles.button, styles.endButton]} onPress={btnAppBack}>
            <Text style={styles.endButtonText}>戻る</Text>
          </TouchableOpacity>
          <TouchableOpacity 
              style={getButtonStyle()}
              onPress={btnAppNext}
              disabled={!isNextDisabled}
          >
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
            <Modal visible={showScannerTag} onRequestClose={() => setShowScannerTag(false)}>
                <QRScanner onScan={handleCodeScannedForTag} closeModal={() => setShowScannerTag(false)} isActive={showScannerTag} errMsg={"タグ"}/>
            </Modal>
        )}

        </ScrollView>
      </KeyboardAvoidingView>  
    );
    
};
export default WA1070;