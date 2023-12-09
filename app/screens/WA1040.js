/**-------------------------------------------
 * A01-0040_メニュー
 * WA1040
 * ---------------------------------------------*/
// app/screens/WA1040.js
import TapHeader from '../components/TapHeader'; // Headerコンポーネントのインポート
import Footer from '../components/Footer'; // Footerコンポーネントのインポート
import { styles } from '../styles/CommonStyle'; // 共通スタイル
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert,BackHandler } from 'react-native';
import { getInstance } from '../utils/Realm'; // realm.jsから関数をインポート
import messages from '../utils/messages';
import {encryptWithAES256CBC,generateDeviceUniqueKey,decryptWithAES256CBC} from '../utils/Security';
import Realm from "realm";
import QRScanner from '../utils/QRScanner';
import ProcessingModal from '../components/Modal';
import { getEncryptionKeyFromKeystore,saveToKeystore,clearKeyStore,loadFromKeystore } from '../utils/KeyStore'; 
import { sendToServer } from '../utils/Api'; 
import { initializeLogFile, logUserAction, logCommunication, watchPosition, writeLog,logScreen  } from '../utils/Log';
import { useAlert } from '../components/AlertContext';

const WA1040 = ({navigation}) => {
    const [userName, setUserName] = useState('');  //利用者
    const [wkplac, setWkplac] = useState(''); // 作業場所
    const [wkplacId, setWkplacId] = useState(''); // 作業場所種別ID
    const [isReadyToSend, setIsReadyToSend] = useState(false); // 送信準備完了状態
    const [showScannerUsr, setShowScannerUsr] = useState(false); // カメラ表示用の状態
    const [showScannerWkplac, setShowScannerWkplac] = useState(false); // カメラ表示用の状態
    const [modalVisible, setModalVisible] = useState(false);
    const [isButtonView, setIsButtonView] = useState({});
    const { showAlert } = useAlert();

    // useEffect フックを使用してステートが変更されるたびにチェック
    useEffect(() => {
          const buttonViews = async () => {
            const realm = await getInstance();
            let settings = realm.objects('settings')[0];

            // ボタンの表示設定を確認して、状態を更新する
            const isButtonView = {
              button1: settings.btnNewTagSoil === 1,
              button2: settings.btnRefNewTagSoil === 1,
              button3: settings.btnRefOldTagSoil === 1,
              button4: settings.btnNewTagAsh === 1,
              button5: settings.btnRefNewTagAsh === 1,
              button6: settings.btnRefOldTagAsg === 1,
              button7: settings.btnTrnCard === 1,
              button8: settings.btnUnload === 1,
              button9: settings.btnStat === 1,
              // 他のボタンも同様に追加
            };
            
            setIsButtonView(isButtonView);
          } 
          buttonViews();
    }, []);

    /************************************************
     * 終了ボタン押下時のポップアップ表示
     ************************************************/
    const btnAppClose = async () => {
      await logUserAction(`ボタン押下: 終了(WA1040)`);  
      const result = await showAlert("確認", messages.IA5001(), true);
      if (result) {
        BackHandler.exitApp()
      }
    };

    const btnNewTagRegSol = async () => {
      await logUserAction(`ボタン押下:新タグ紐付(土壌)`);
      await logScreen(`画面遷移: WA1060_新タグ紐付(土壌)`);  
      navigation.navigate('WA1060')
    };
    const btnNewTagAsh = async () => {
      await logUserAction(`ボタン押下:新タグ紐付(灰)`);
      await logScreen(`画面遷移:WA1090_新タグ紐付(灰)`);  
      navigation.navigate('WA1090')
    };
    const btnNewTagRefSol = async () => {
      await logUserAction(`ボタン押下:新タグID参照(土壌)`);
      await logScreen(`画面遷移:WA1070_新タグID参照(土壌)`);  
      navigation.navigate('WA1070')
    };
    const btnNewTagRefAsh = async () => {
      await logUserAction(`ボタン押下:新タグID参照(灰)`);
      await logScreen(`画面遷移:WA1100_新タグID参照(灰)`);  
      navigation.navigate('WA1100')
    };
    const btnOldTagRefSol = async () => {
      await logUserAction(`ボタン押下:旧タグ参照(土壌)`);
      await logScreen(`画面遷移:WA1080_旧タグ参照(土壌)`);  
      navigation.navigate('WA1080')
    };
    const btnOldTagRefAsh = async () => {
      await logUserAction(`ボタン押下: 旧タグID参照(灰)`);
      await logScreen(`画面遷移:WA1110_旧タグID参照(灰)`);  
      navigation.navigate('WA1110')
    };
    const btnTrpCrd = async () => {
      await logUserAction(`ボタン押下: 輸送カード申請`);
      await logScreen(`画面遷移:WA1120_輸送カード申請`);  
      navigation.navigate('WA1120')
    };
    const btnNsReg = async () => {
      await logUserAction(`ボタン押下: 荷下登録`);
      await logScreen(`画面遷移:WA1130_荷下登録`);  
      navigation.navigate('WA1130')
    };
    const btnStyReg = async () => {
      await logUserAction(`ボタン押下: 定置登録`);
      await logScreen(`画面遷移:WA1140_定置登録`);  
      navigation.navigate('WA1140')
    };

    return (
      <View style={styles.container}>
        {/* ヘッダ */}
        <TapHeader title={"メニュー"} navigation={navigation} sourceScreenId={"WA1040"}/>
  
        {/* 中段 */}
        <View  style={[styles.menuMain,styles.topContent]}>
        {isButtonView.button1 && (
          <TouchableOpacity style={[styles.menuButton,styles.menuButton1]} onPress={btnNewTagRegSol}>
            <Text style={styles.menuButtonText1}>新タグ紐付</Text>
            <Text style={styles.menuButtonText1}>(土壌)</Text>
          </TouchableOpacity>
        )}
        {isButtonView.button2 && (        
          <TouchableOpacity style={[styles.menuButton,styles.menuButton2]} onPress={btnNewTagAsh}>
            <Text style={styles.menuButtonText1}>新タグ紐付</Text>
            <Text style={styles.menuButtonText1}>(灰)</Text>
          </TouchableOpacity>
        )}
        {isButtonView.button3 && (            
          <TouchableOpacity style={[styles.menuButton,styles.menuButton3]} onPress={btnNewTagRefSol}>
            <Text style={styles.menuButtonText1}>新タグ参照</Text>
            <Text style={styles.menuButtonText1}>(土壌)</Text>
          </TouchableOpacity>
        )}
        {isButtonView.button4 && (            
          <TouchableOpacity style={[styles.menuButton,styles.menuButton4]} onPress={btnNewTagRefAsh}>
            <Text style={styles.menuButtonText1}>新タグ参照</Text>
            <Text style={styles.menuButtonText1}>(灰)</Text>
          </TouchableOpacity>
        )}
        {isButtonView.button5 && (            
          <TouchableOpacity style={[styles.menuButton,styles.menuButton5]} onPress={btnOldTagRefSol}>
            <Text style={styles.menuButtonText1}>旧タグ参照</Text>
            <Text style={styles.menuButtonText1}>(土壌)</Text>
          </TouchableOpacity>    
        )}
        {isButtonView.button6 && (            
          <TouchableOpacity style={[styles.menuButton,styles.menuButton6]} onPress={btnOldTagRefAsh}>
            <Text style={styles.menuButtonText2}>旧タグ紐付</Text>
            <Text style={styles.menuButtonText2}>(灰)</Text>
          </TouchableOpacity>
        )}
        {isButtonView.button7 && (            
          <TouchableOpacity style={[styles.menuButton,styles.menuButton7]} onPress={btnTrpCrd}>
            <Text style={styles.menuButtonText1}>輸送カード</Text>
            <Text style={styles.menuButtonText1}>申請</Text>
          </TouchableOpacity>    
        )}
        {isButtonView.button8 && (            
          <TouchableOpacity style={[styles.menuButton,styles.menuButton8]} onPress={btnNsReg}>
            <Text style={styles.menuButtonText1}>荷下登録</Text>
          </TouchableOpacity>    
        )}
        {isButtonView.button9 && (            
          <TouchableOpacity style={[styles.menuButton,styles.menuButton9]} onPress={btnStyReg}>
            <Text style={styles.menuButtonText2}>定置登録</Text>
          </TouchableOpacity>       
        )}                                                              
        </View >
  

        {/* 下段 */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={[styles.button, styles.endButtonSmall]} onPress={btnAppClose}>
            <Text style={styles.endButtonText}>終了</Text>
          </TouchableOpacity>
        </View>
      
        {/* フッタ */}
        <Footer />

        {/* アラート */}
        <CustomAlertComponent />        
      </View>

    );
    
};
export default WA1040;