/**
 * 01-0050_端末設定
 * WA1050
 */
// app/screens/WA1050.js
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


const WA1050 = ({closeModal}) => {
    const [userName, setUserName] = useState('');  //利用者
    const [wkplac, setWkplac] = useState(''); // 作業場所
    const [wkplacId, setWkplacId] = useState(''); // 作業場所種別ID
    const [isReadyToSend, setIsReadyToSend] = useState(false); // 送信準備完了状態
    const [showScannerUsr, setShowScannerUsr] = useState(false); // カメラ表示用の状態
    const [showScannerWkplac, setShowScannerWkplac] = useState(false); // カメラ表示用の状態
    const [modalVisible, setModalVisible] = useState(false);

    // useEffect フックを使用してステートが変更されるたびにチェック
    useEffect(() => {
    }, []);

    /************************************************
     * 終了ボタン押下時のポップアップ表示
     ************************************************/
    const btnAppClose = () => {
      Alert.alert(
          "",
          "終了しますか？",
          [
              {
                  text: "いいえ",
                  style: "cancel"
              },
              {
                  text: "はい",
                  //onPress: () => navigation.goBack() // はいを選択したら前の画面に戻る
                  onPress: () => BackHandler.exitApp() // アプリを終了する
              }
          ],
          { cancelable: false }
      );
    };

    return (
      <View style={styles.container}>
        {/* ヘッダ */}
        <Header title={"新タグ紐付(土壌)"}/>
  
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
export default WA1050;