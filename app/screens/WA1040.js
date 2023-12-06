/**
 * A01-0040_メニュー
 * WA1040
 */
// app/screens/WA1040.js
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


const WA1040 = ({navigation}) => {
    const [userName, setUserName] = useState('');  //利用者
    const [wkplac, setWkplac] = useState(''); // 作業場所
    const [wkplacId, setWkplacId] = useState(''); // 作業場所種別ID
    const [isReadyToSend, setIsReadyToSend] = useState(false); // 送信準備完了状態
    const [showScannerUsr, setShowScannerUsr] = useState(false); // カメラ表示用の状態
    const [showScannerWkplac, setShowScannerWkplac] = useState(false); // カメラ表示用の状態
    const [modalVisible, setModalVisible] = useState(false);
    const [isButtonView, setIsButtonView] = useState({});

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

    const btnNewTagRegSol = () => {
      navigation.navigate('WA1060')
    };
    const btnNewTagAsh = () => {
      navigation.navigate('WA1090')
    };
    const btnNewTagRefSol = () => {
      navigation.navigate('WA1070')
    };
    const btnNewTagRefAsh = () => {
      navigation.navigate('WA1100')
    };
    const btnOldTagRefSol = () => {
      navigation.navigate('WA1080')
    };
    const btnOldTagRefAsh = () => {
      navigation.navigate('WA1110')
    };
    const btnTrpCrd = () => {
      navigation.navigate('WA1120')
    };
    const btnNsReg = () => {
      navigation.navigate('WA1130')
    };
    const btnStyReg = () => {
      navigation.navigate('WA1140')
    };

    return (
      <View style={styles.container}>
        {/* ヘッダ */}
        <Header title={"メニュー"}/>
  
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
      </View>

    );
    
};
export default WA1040;