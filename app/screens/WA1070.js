/**-------------------------------------------
 * A01-0070_新タグID参照(土壌)
 * WA1070
 * ---------------------------------------------*/
// app/screens/WA1070.js
import FunctionHeader from '../components/FunctionHeader'; // Headerコンポーネントのインポート
import Footer from '../components/Footer'; // Footerコンポーネントのインポート
import { styles } from '../styles/CommonStyle'; // 共通スタイル
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, TouchableWithoutFeedback ,ScrollView,Alert,BackHandler,KeyboardAvoidingView } from 'react-native';
import { getInstance } from '../utils/Realm'; // realm.jsから関数をインポート
import messages from '../utils/messages';
import {encryptWithAES256CBC,generateDeviceUniqueKey,decryptWithAES256CBC} from '../utils/Security';
import Realm from "realm";
import QRScanner from '../utils/QRScanner';
import ProcessingModal from '../components/Modal';
import { getEncryptionKeyFromKeystore,saveToKeystore,clearKeyStore,loadFromKeystore } from '../utils/KeyStore'; 
import { sendToServer } from '../utils/Api'; 
import { initializeLogFile, logUserAction, logCommunication, watchPosition, writeLog,logScreen,calculateTotalLogSize  } from '../utils/Log';
import { useAlert } from '../components/AlertContext';
import { Keyboard } from 'react-native';
import { IFA0330 } from '../utils/Api'; 
const WA1070 = ({navigation,closeModal}) => {

    const [userName, setUserName] = useState('');  //利用者
    const [wkplac, setWkplac] = useState(''); // 作業場所
    const [wkplacId, setWkplacId] = useState(''); // 作業場所種別ID
    const [isReadyToSend, setIsReadyToSend] = useState(false); // 送信準備完了状態
    const [showScannerUsr, setShowScannerUsr] = useState(false); // カメラ表示用の状態
    const [showScannerWkplac, setShowScannerWkplac] = useState(false); // カメラ表示用の状態
    const [modalVisible, setModalVisible] = useState(false);
    const { showAlert } = useAlert();
    const [showScannerTag, setShowScannerTag] = useState(false); // カメラ表示用の状態    
    const [wkplcTyp, setWkplcTyp] = useState('');
    const [wkplc, setWkplc] = useState('');
    const [inputVisible, setInputVisible] = useState(false);
    const [tempInfo, setTempInfo] = useState('');
    const [isNextDisabled, setIsNextDisabled] = useState(false); // 送信準備完了状態

    /************************************************
     * 初期表示設定
     ************************************************/   
    useEffect(() => {
      const contentsViews = async () => {
        const realm = await getInstance();
        const loginInfo = realm.objects('login')[0];
        let place;
        switch(loginInfo.wkplacTyp){
          case 4:
            setWkplcTyp("仮置場");    
            place = realm.objects('temporary_places')[0]
            setWkplc(place.tmpPlacNm);   
            break;
          case 5:
            setWkplcTyp("保管場");    
            place = realm.objects('storage_places')[0]
            setWkplc(place.storPlacNm);   
            break;
          case 6:
            setWkplcTyp("定置場");    
            place = realm.objects('fixed_places')[0]
            setWkplc(place.fixPlacNm);   
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
      }, 100); // 10秒 = 10000ミリ秒
    };
  
    /************************************************
     * コードスキャン後の処理 (タグ用)
     * @param {*} scannedData 
     ************************************************/
    const handleCodeScannedForTag = async (scannedData,type) => {
      const parts = scannedData.split(',');
      setShowScannerTag(false);
      let code = '';
      if (type !== BarCodeScanner.Constants.BarCodeType.qr && type !== BarCodeScanner.Constants.BarCodeType.codabar) {
        await showAlert("通知", messages.EA5001("タグ"), false);
        return;
      }else if(parts.length === 1 || parts[0] !== "CM" ){
        await showAlert("通知", messages.EA5009(""), false);
        return;
      }else if(parts[0] === "CM"){
        // --QRコード--
        // 新タグID参照処理実施(csvデータ2カラム目 新タグID)
        code = parts[1];
      }else{
        // --バーコード--
        // フォーマットチェック
        if(!checkFormat(scannedData)){
          await showAlert("通知", messages.EA5017(scannedData), false);
          return;
        }else if(scannedData.charAt(0) === '6' ||
                 scannedData.charAt(0) === '8'){
          await showAlert("通知", messages.EA5022("土壌","新タグ参照(灰)",scannedData), false);
          return;
        }
        code = "a"+scannedData+"a"
      }

      // モーダル表示
      setModalVisible(true);
      // 新タグID参照処理実施
      procNewTagId(code);
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
     * フォーマットチェック
     ************************************************/
    const checkFormat = async (data) => {
      const pattern = /^[0-9][2-5][0-9]0[0-9]{11}$/;
      return pattern.test(str);
    };

    /************************************************
     * 新タグID参照処理
     ************************************************/
    const procNewTagId = async (txtNewTagId) => {
      // ログファイルアップロード通信を実施
      const responseIFA0330 = await IFA0330(txtNewTagId);
      if(await apiIsError(responseIFA0330)) return;
      const data = responseIFA0330.data[0];
      setTempInfo({
        newTagID: data.newTagId,
        rmSolTyp: data.rmSolTyp,
        pkTyp: data.pkTyp,
        splFac: data.splFac,
        tsuInd: data.tsuInd,
        usgInnBg: data.usgInnBg,
        usgAluBg: data.usgAluBg,
        yesNoOP: data.yesNoOP,
        caLgSdBgWt: data.caLgSdBgWt,
        caLgSdBgDs: data.caLgSdBgDs,
        estRa: data.xxxxx,//★ IFA0330に無し。要確認
        lnkNewTagDatMem: data.lnkNewTagDatMem,
      });
    };
    
    /************************************************
     * 戻るボタン処理
     ************************************************/
    const btnAppBack = async () => {
      await logUserAction(`ボタン押下: 戻る(WA1070)`);  
      navigation.navigate('WA1040');
    };

    /************************************************
     * API通信処理エラー有無確認・エラーハンドリング
     * @param {*} response 
     * @returns 
     ************************************************/
    const apiIsError = async (response)=>{
      if (!response.success) {
        switch(response.error){
          case 'codeHttp200':
            await showAlert("通知", messages.EA5004(response.api,response.code), false);
            break;
          case 'codeRsps01':
            await showAlert("通知", messages.EA5005(msg,response.status), false); 
            break;
          case 'timeout':
            await showAlert("通知", messages.EA5003(""), false);
            break;
          case 'zero'://取得件数0件の場合
            await showAlert("通知", messages.IA5015(""), false);
            break;            
        }
        // モーダル非表示
        setModalVisible(false);          
        return true ;
      }else{
        return false;
      }
    }

    return (

      <KeyboardAvoidingView 
        behavior={"height"}
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
            <Text>新タグIDが読み込めない場合：</Text>
          </TouchableWithoutFeedback>
          {inputVisible && 
            <View style={[styles.inputContainer]}>
              <Text style={styles.inputWithText}>a</Text>
              <TextInput style={styles.input}/>
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
              style={[styles.button,styles.startButton]}
              onPress={""}
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