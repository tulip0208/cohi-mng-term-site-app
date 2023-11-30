// app/screens/WA1020.js
import Header from '../components/Header'; // Headerコンポーネントのインポート
import Footer from '../components/Footer'; // Footerコンポーネントのインポート
import { styles } from '../styles/CommonStyle'; // 共通スタイル
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert,BackHandler } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { getInstance } from '../utils/Realm'; // realm.jsから関数をインポート
import messages from '../utils/messages';
import {encryptWithAES256CBC,getEncryptionKeyFromKeystore,saveToKeystore,clearKeyStore,loadFromKeystore} from '../utils/Security';
import Realm from "realm";
//Realm.flags.THROW_ON_GLOBAL_REALM = true;

const useTimeout = (isActive, timeoutDuration, onTimeout) => {
  useEffect(() => {
    let timeout;

    if (isActive) {
      timeout = setTimeout(onTimeout, timeoutDuration);
    }

    return () => clearTimeout(timeout);
  }, [isActive, timeoutDuration, onTimeout]);
};

const QRScanner = ({ onScan, closeModal, isActive }) => {
    const [camTimeout, setCamTimeout] = useState(null);  // カメラのタイムアウト値を保存する状態
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
      // カメラのパーミッション要求
      const requestPermission = async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      };
      requestPermission();

      // データベースから設定を読み込む
      const loadSettings = async () => {
        const realm = await getInstance();
        const settings = realm.objects('settings')[0];
        setCamTimeout(settings.camTimeout);  // カメラのタイムアウト値を状態にセット
      };
      loadSettings();      
    }, []);

    // カスタムフックを使用してタイムアウトを管理
    useTimeout(isActive, camTimeout * 1000, () => {
      Alert.alert(
        "",
        messages.EA5001("利用者QRコード"),
        [{ text: "OK", onPress: closeModal }]
      );
    });
    
    const handleBarCodeScanned = ({ type, data }) => {
      setScanned(true);
      onScan(data); // スキャンデータを親コンポーネントに渡す
    };
  
    if (hasPermission === null) {
      return <Text>カメラへのアクセスをリクエスト中...</Text>;
    }
    if (hasPermission === false) {
      return <Text>カメラへのアクセスが許可されていません。</Text>;
    }
  
    return (
      <View style={styles.container}>
        <BarCodeScanner style={styles.camera} onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}>
          
        </BarCodeScanner>
        {/*{scanned && <Text style={styles.barcodeText}>{data}</Text>}*/}
      </View>
    );
  };
  

const WA1020 = ({ navigation,closeModal }) => {
    const [ERROR, setERROR] = useState('');
    const [userName, setUserName] = useState('');
    const [activationCode, setActivationCode] = useState('');
    const [trmId, setTrmId] = useState(''); // 端末ID
    const [comName, setComName] = useState(''); // 事業者名
    const [actReadFlg, setActReadFlg] = useState(''); // 端末ID
    const [showScannerUsr, setShowScannerUsr] = useState(false); // カメラ表示用の状態
    const [showScannerActivate, setShowScannerActivate] = useState(false); // カメラ表示用の状態
    const [isReadyToSend, setIsReadyToSend] = useState(false); // 送信準備完了状態

    const [usrInfo, setUsrInfo] = useState(null);//ユーザ情報
    const [activationInfo, setActivationInfo] = useState(null);//アクティベーション情報

    // QRコードスキャン後の処理 (ユーザー情報用)
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
              console.log('save realm : user => ',realm.objects('user')[0])
            } catch (error) {
              console.error('アクティベーションに失敗しました', error);
            }
         
            // 別途保存しているユーザー名ステートがある場合はその更新も行う
            setUserName(userName);
            setComName(comName)

            setShowScannerUsr(false);
        } else {
            // ID種別が1ではない場合のエラーハンドリング
            Alert.alert(
              "",
              messages.EA5002("利用者"),
              [{ text: "OK", onPress: closeModal }] // closeModalはQRScannerコンポーネントのprops
          );
          setShowScannerUsr(false);   
        }
      } else {
        Alert.alert(
            "",
            messages.EA5002("利用者"),
            [{ text: "OK", onPress: closeModal }] // closeModalはQRScannerコンポーネントのprops
        );
        setShowScannerUsr(false);   
        // CSVデータが正しいフォーマットでない場合のエラーハンドリング
      }      
    };


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
            const key = getEncryptionKeyFromKeystore();
            //端末APIキーのaes-256-cbc暗号化
            const apiKey256 = encryptWithAES256CBC(apiKey, key)
            console.log(apiKey," : ",apiKey256);


            // アクティベーション情報をKeyStoreに保存
            await saveToKeystore("activationInfo",JSON.stringify({
              comId: comId,
              trmId: trmId,
              apiKey: apiKey256,
              actKey: actKey,
              actExpDt: actExpDt,
              actFin: "1", // '済' 状態を表す
            }));
            // 別途保存しているユーザー名ステートがある場合はその更新も行う
            setTrmId(trmId);
            setActReadFlg("済")

            setShowScannerActivate(false);
        } else {
            // ID種別が1ではない場合のエラーハンドリング
            Alert.alert(
              "",
              messages.EA5002("アクティベーション"),
              [{ text: "OK", onPress: closeModal }] // closeModalはQRScannerコンポーネントのprops
          );
          setActReadFlg("未")
          //アクティベーション情報のクリア
          if(await loadFromKeystore("activationInfo")){
            await clearKeyStore("activationInfo")
          }
          setShowScannerActivate(false);   
        }
      } else {
        Alert.alert(
            "",
            messages.EA5002("アクティベーション"),
            [{ text: "OK", onPress: closeModal }] // closeModalはQRScannerコンポーネントのprops
        );
        setActReadFlg("未")
        //アクティベーション情報のクリア
        if(await loadFromKeystore("activationInfo")){
          await clearKeyStore("activationInfo")
        }
        setShowScannerActivate(false);   
        // CSVデータが正しいフォーマットでない場合のエラーハンドリング
      }      
    };    
    // ユーザーQRコードスキャンボタン押下時の処理
    const btnUserQr = () => {
        setShowScannerUsr(true);
    };
    // アクティベーションQRコードスキャンボタン押下時の処理
    const btnActQr = () => {
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

    // 戻るボタン押下時のポップアップ表示
    const confirmExit = () => {
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

    // 送信ボタン押下時の処理
    
    return (
      <View style={styles.container}>
        {/* ヘッダ */}
        <Header /> 

        {/* 上段 */}
        <View style={styles.row}>
          <Text style={styles.errorText}>{ERROR}</Text>
        </View>

        {/* 中段 */}
        <View  style={[styles.main,styles.middleContent]}>
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
          <TouchableOpacity style={[styles.button, styles.endButton]} onPress={confirmExit}>
            <Text style={styles.endButtonText}>終了</Text>
          </TouchableOpacity>
          <TouchableOpacity 
                    style={getButtonStyle()}
                    //onPress={/* 送信処理 */}
                    disabled={!isReadyToSend} // 送信準備ができていなければ無効化          
          >
            <Text style={styles.startButtonText}>送信</Text>
          </TouchableOpacity>
        </View>

        {/* フッタ */}
        <Footer /> 

        {/* ユーザーID用QRコードスキャナー */}
        {showScannerUsr && (
            <Modal visible={showScannerUsr} onRequestClose={() => setShowScannerUsr(false)}>
                <QRScanner onScan={handleQRCodeScannedForUser} closeModal={() => setShowScannerUsr(false)} isActive={showScannerUsr}/>
            </Modal>
        )}

        {/* アクティベーションコード用QRコードスキャナー */}
        {showScannerActivate && (
            <Modal visible={showScannerActivate} onRequestClose={() => setShowScannerActivate(false)}>
                <QRScanner onScan={handleQRCodeScannedForActivation} closeModal={() => setShowScannerActivate(false)} isActive={showScannerActivate}/>
            </Modal>
        )}

      </View>
    );
};



export default WA1020;
