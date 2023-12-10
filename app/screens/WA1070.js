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
      }, 100); // 10秒 = 10000ミリ秒
    };
  
    /************************************************
     * QRコードスキャン後の処理 (タグ用)
     * @param {*} scannedData 
     ************************************************/
    const handleQRCodeScannedForTag = async (scannedData) => {
      const parts = scannedData.split(',');
      if(parts.length === 1 || parts[0] !== "CM" ){
        await showAlert("通知", messages.EA5009(""), false);
        return;
      }
      setShowScannerTag(false);   
      // モーダル表示
      setModalVisible(true);




       // モーダル非表示
       setModalVisible(false);
    }
    // ユーザQRコードスキャンボタン押下時の処理
    const btnTagQr = async () => {
      await logUserAction(`ボタン押下: タグ読込`);
      setShowScannerTag(true);
    };    
    /************************************************
     * 戻るボタン処理
     ************************************************/
    const btnAppBack = async () => {
      await logUserAction(`ボタン押下: 戻る(WA1070)`);  
      navigation.navigate('WA1040');
    };
  // キーボードの高さに基づいたオフセットを設定 (例: 20)
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 20 : 0;

    return (

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }} // KeyboardAvoidingView に flex: 1 を追加
        keyboardVerticalOffset={keyboardVerticalOffset}
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
          <TouchableOpacity style={[styles.button,styles.startButton]} onPress={""}>
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
                <QRScanner onScan={handleQRCodeScannedForTag} closeModal={() => setShowScannerTag(false)} isActive={showScannerTag} errMsg={"タグ"}/>
            </Modal>
        )}



        </ScrollView>
      </KeyboardAvoidingView>  
    );
    
};
export default WA1070;