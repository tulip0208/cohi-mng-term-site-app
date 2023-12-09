/**-------------------------------------------
 * A01-0070_新タグID参照(土壌)
 * WA1070
 * ---------------------------------------------*/
// app/screens/WA1070.js
import Header from '../components/Header'; // Headerコンポーネントのインポート
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
import { initializeLogFile, logUserAction, logCommunication, watchPosition, writeLog,logScreen,calculateTotalLogSize  } from '../utils/Log';
import { useAlert } from '../components/AlertContext';

const WA1070 = ({closeModal}) => {
    const [userName, setUserName] = useState('');  //利用者
    const [wkplac, setWkplac] = useState(''); // 作業場所
    const [wkplacId, setWkplacId] = useState(''); // 作業場所種別ID
    const [isReadyToSend, setIsReadyToSend] = useState(false); // 送信準備完了状態
    const [showScannerUsr, setShowScannerUsr] = useState(false); // カメラ表示用の状態
    const [showScannerWkplac, setShowScannerWkplac] = useState(false); // カメラ表示用の状態
    const [modalVisible, setModalVisible] = useState(false);
    const { showAlert } = useAlert();

    // useEffect フックを使用してステートが変更されるたびにチェック
    useEffect(() => {
    }, []);

    /************************************************
     * 終了ボタン押下時のポップアップ表示
     ************************************************/
    const btnAppClose = async () => {
      await logUserAction(`ボタン押下: 終了(WA1070)`);  
      const result = await showAlert("確認", messages.IA5001(), true);
      if (result) {
        BackHandler.exitApp()
      }
    };

    return (
      <View style={styles.container}>
        {/* ヘッダ */}
        <Header title={"新タグID参照(土壌)"}/>
  
        {/* 下段 */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={[styles.button, styles.endButtonSmall]} onPress={btnAppClose}>
            <Text style={styles.endButtonText}>終了</Text>
          </TouchableOpacity>
        </View>
      
        {/* フッタ */}
        <Footer />
      </View>

    );
    
};
export default WA1070;