/**-------------------------------------------
 * A01-0020_アクティベーション
 * WA1020
 * ---------------------------------------------*/
// app/screens/WA1020.js
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
import { IFA0010 } from '../utils/Api'; 
import { initializeLogFile, logUserAction, logCommunication, watchPosition,logScreen  } from '../utils/Log';
import { useAlert } from '../components/AlertContext';

const WA1020 = ({ navigation,closeModal }) => {
    const [ERROR, setERROR] = useState('');
    const [userName, setUserName] = useState(''); //利用者
    const [trmId, setTrmId] = useState(''); // 端末ID
    const [comName, setComName] = useState(''); // 事業者名
    const [comId, setComId] = useState(''); // 事業者ID
    const [actReadFlg, setActReadFlg] = useState(''); // 端末ID
    const [showScannerUsr, setShowScannerUsr] = useState(false); // カメラ表示用の状態
    const [showScannerActivate, setShowScannerActivate] = useState(false); // カメラ表示用の状態
    const [isReadyToSend, setIsReadyToSend] = useState(false); // 送信準備完了状態
    const [modalVisible, setModalVisible] = useState(false);
    const { showAlert } = useAlert();

    /************************************************
     * QRコードスキャン後の処理 (ユーザ情報用)
     * @param {*} scannedData 
     ************************************************/
    const handleQRCodeScannedForUser = async (scannedData) => {
      // 利用者をクリアする
      setUserName("");
      const parts = scannedData.split(',');
      // CSVデータのフォーマットを確認（5つの部分があるか）
      if (parts.length === 5) {
        // ID種別が1かどうかを確認
        //console.log(parts)
        const idType = parts[0];
        if (idType === "1") {
            const comId = parts[1];
            const comName = parts[2];
            const userId = parts[3];
            const userName = parts[4];
            
            const realm = await getInstance();
            //realmへ保存
            try {
              realm.write(() => {
                // 既に同じユーザIDのデータがあれば上書き、なければ新規作成
                realm.create('user', {
                  id: 1,
                  comId: comId,
                  comNm: comName,
                  userId: userId,
                  userNm: userName,
                }, Realm.UpdateMode.Modified); // Modified は既存のデータがあれば更新、なければ作成
              });
              console.log('save realm : user => ', await realm.objects('user')[0])
              // 別途保存しているユーザー名ステートがある場合はその更新も行う
              setUserName(userName);
              setComName(comName);
              setComId(comId);
            } catch (error) {
              console.error('ユーザ設定に失敗しました。', error);
            }
            setShowScannerUsr(false);
        } else {
          // ID種別が1ではない場合のエラーハンドリング
          const result = await showAlert("通知", messages.EA5002("利用者"), false);
          setShowScannerUsr(false);   
        }
      } else {
        const result = await showAlert("通知", messages.EA5002("利用者"), false);
        setShowScannerUsr(false);   
        // CSVデータが正しいフォーマットでない場合のエラーハンドリング
      }      
    };

    /************************************************
     * QRコードスキャン後の処理 (アクティベーション情報用)
     * @param {*} scannedData 
     ************************************************/
    const handleQRCodeScannedForActivation = async (scannedData) => {
      // 端末IDをクリアする
      setTrmId("");
      const parts = scannedData.split(',');
      // CSVデータのフォーマットを確認（5つの部分があるか）
      if (parts.length === 5) {
        // ID種別が1かどうかを確認
        //console.log(parts)
        const comId = parts[0];       //事業者ID
        if (comId.startsWith("J")){//&&comId.length==10 ) {
            const trmId = parts[1];   //端末ID
            const apiKey = parts[2];  //端末APIキー
            const actKey = parts[3];  //アクティベーションキー
            const actExpDt = parts[4];//アクティベーション有効期限

            //キーを取得
            const key = await getEncryptionKeyFromKeystore();
            //端末APIキーのaes-256-cbc暗号化
            const apiKey256 = encryptWithAES256CBC(apiKey, key)

            // アクティベーション情報をKeyStoreに保存
            await saveToKeystore("activationInfo",{
              comId: comId,
              trmId: trmId,
              apiKey: apiKey256,
              actKey: actKey,
              actExpDt: actExpDt,
              actFin: 0, 
            });
            // 別途保存しているユーザー名ステートがある場合はその更新も行う
            setTrmId(trmId);
            setActReadFlg("済")

            setShowScannerActivate(false);
        } else {
          // ID種別が1ではない場合のエラーハンドリング
          const result = await showAlert("通知", messages.EA5002("アクティベーション"), false);
          setActReadFlg("未")
          //アクティベーション情報のクリア
          if(await loadFromKeystore("activationInfo")){
            await clearKeyStore("activationInfo")
          }
          setShowScannerActivate(false);   
        }
      } else {
        const result = await showAlert("通知", messages.EA5002("アクティベーション"), false);
        setActReadFlg("未")
        //アクティベーション情報のクリア
        if(await loadFromKeystore("activationInfo")){
          await clearKeyStore("activationInfo")
        }
        setShowScannerActivate(false);   
        // CSVデータが正しいフォーマットでない場合のエラーハンドリング
      }      
    };
    // ユーザQRコードスキャンボタン押下時の処理
    const btnUserQr = async () => {
        await logUserAction(`ボタン押下: QRコード読込(ユーザ)`);  

        setShowScannerUsr(true);
    };
    // アクティベーションQRコードスキャンボタン押下時の処理
    const btnActQr = async () => {
        await logUserAction(`ボタン押下: QRコード読込(アクティベーション)`);
        setShowScannerActivate(true);
    };    
    // useEffect フックを使用してステートが変更されるたびにチェック
    useEffect(() => {
        if (userName !== "" && actReadFlg !== "") {
            setIsReadyToSend(true); // 送信ボタンを活性化
        }
    }, [userName, actReadFlg]); // 依存配列に usrId と actReadFlg を追加
    // 送信ボタンのスタイルを動的に変更するための関数
    const getButtonStyle = () => {
        return isReadyToSend ? [styles.button,styles.startButton] : [styles.button,styles.startButton, styles.disabledButton];
    };

    /************************************************
     * 終了ボタン押下時のポップアップ表示
     ************************************************/
    const btnAppClose = async () => {
      await logUserAction(`ボタン押下: 終了(WA1030)`);      
      const result = await showAlert("確認", messages.IA5001(), true);
      if (result) {
        BackHandler.exitApp()
      }
    };

    /************************************************
     * 送信ボタン押下時の処理
     ************************************************/
    const btnSend = async () =>{
      await logUserAction(`ボタン押下: 送信(WA1020)`);  
      // モーダル表示
      setModalVisible(true);
      const hashedKey = await generateDeviceUniqueKey(); // デバイスIDと現在の日時からユニークなキーを生成し、SHA256でハッシュ化する関数
      const secretKey = await getEncryptionKeyFromKeystore(); // AES暗号化のための秘密鍵      
      //const encryptedKey = CryptoJS.AES.encrypt(hashedKey, secretKey).toString(); // AES-256-CBCで暗号化
      const encryptedKey = encryptWithAES256CBC(hashedKey, secretKey); // AES-256-CBCで暗号化
      try {
        // ハッシュ化されたキーをAES-256-CBCで暗号化し、KeyStoreに保存する関数
        // アクティベーション情報をKeyStoreに保存
        await saveToKeystore("trmKey",{
          trmKey: encryptedKey,
        });
        console.log('Device unique key stored successfully.');

        // 前処理はApi.jsへ移行

        // サーバー通信処理（Api.js内の関数を呼び出し）
        const responseIFA0010 = await IFA0010(encryptedKey,secretKey);//sendToServer(requestData,"IFA0010","端末登録");
        if(await apiIsError(responseIFA0010)) return;

        const activationInfo = await loadFromKeystore("activationInfo");
        // アクティベーション情報をKeyStoreに保存
        await saveToKeystore("activationInfo",{
          comId: activationInfo.comId,
          trmId: activationInfo.trmId,
          apiKey: activationInfo.apiKey,
          actKey: activationInfo.actKey,
          actExpDt: activationInfo.actExpDt,
          actFin: 1,//アクティベーション済へ変更 
        });
        // 事業者IDをKeyStoreに保存
        await saveToKeystore("comId",{comId:comId});
        // 端末IDをKeyStoreに保存
        await saveToKeystore("trmId",{trmId:activationInfo.trmId});
        // 端末APIキーをKeyStoreに保存
        await saveToKeystore("apiKey",{apiKey:activationInfo.apiKey});
        // 端末固有キーをKeyStoreに保存
        // →前半に実施しているため省略

        // モーダル非表示
        setModalVisible(false);

        // ログイン画面へ遷移する
        await logScreen(`画面遷移: WA1030_ログイン`);
        navigation.navigate('WA1030');
      } catch (error) {
        // モーダル非表示
        setModalVisible(false);
        console.error('登録に失敗しました。', error);
      }
    }

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
        }
        // モーダル非表示
        setModalVisible(false);          
        return true ;
      }else{
        return false;
      }
    }
        
    return (
      <View style={styles.container}>
        {/* ヘッダ */}
        <Header title={"端末登録"}/> 

        {/* 上段 */}
        <View style={styles.row}>
          <Text style={styles.errorText}>{ERROR}</Text>
        </View>

        {/* 中段 */}
        <View  style={[styles.main,styles.topContent]}>
          <Text style={styles.labelText}>利用者：{userName}</Text>
          <TouchableOpacity style={[styles.button]} onPress={btnUserQr}>
            <Text style={styles.buttonText}>QRコード読込</Text>
          </TouchableOpacity>
          <Text style={styles.labelText}>アクティベーションコード読込：{actReadFlg}</Text>
          <TouchableOpacity style={[styles.button]} onPress={btnActQr}>
            <Text style={styles.buttonText}>QRコード読込</Text>
          </TouchableOpacity>
          <Text style={styles.labelText}>端末ID：{trmId}</Text>
          <Text style={styles.labelText}>事業者：{comName}</Text>
        </View >
  
        {/* 下段 */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={[styles.button, styles.endButton]} onPress={btnAppClose}>
            <Text style={styles.endButtonText}>終了</Text>
          </TouchableOpacity>
          <TouchableOpacity 
                    style={getButtonStyle()}
                    //onPress={/* 送信処理 */}
                    //disabled={!isReadyToSend} // 送信準備ができていなければ無効化          
                    onPress={btnSend}
          >
            <Text style={styles.startButtonText}>送信</Text>
          </TouchableOpacity>
        </View>

        {/* フッタ */}
        <Footer /> 

        {/* 処理中モーダル */}
        <ProcessingModal
          visible={modalVisible}
          message={messages.IA5002()}
          onClose={() => setModalVisible(false)}
        />

        {/* ユーザID用QRコードスキャナー */}
        {showScannerUsr && (
            <Modal visible={showScannerUsr} onRequestClose={() => setShowScannerUsr(false)}>
                <QRScanner onScan={handleQRCodeScannedForUser} closeModal={() => setShowScannerUsr(false)} isActive={showScannerUsr} errMsg={"利用者QRコード"}/>
            </Modal>
        )}

        {/* アクティベーションコード用QRコードスキャナー */}
        {showScannerActivate && (
            <Modal visible={showScannerActivate} onRequestClose={() => setShowScannerActivate(false)}>
                <QRScanner onScan={handleQRCodeScannedForActivation} closeModal={() => setShowScannerActivate(false)} isActive={showScannerActivate}  errMsg={"アクティベーションQRコード"}/>
            </Modal>
        )}

              </View>
    );
};



export default WA1020;
