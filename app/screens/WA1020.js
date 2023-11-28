// app/screens/WA1020.js
import Header from '../components/Header'; // Headerコンポーネントのインポート
import Footer from '../components/Footer'; // Footerコンポーネントのインポート
import { styles } from '../styles/CommonStyle'; // 共通スタイル
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert,BackHandler } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { getRealmInstance } from '../utils/Realm'; // realm.jsから関数をインポート

const QRScanner = ({ onScan, closeModal }) => {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [data, setData] = useState('');


    useEffect(() => {
      (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    }, []);

    const handleBarCodeScanned = ({ type, data }) => {
      setScanned(true);
      setData(data);
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
          {scanned && <Text onPress={() => setScanned(false)}>タップして再スキャン</Text>}
        </BarCodeScanner>
        {scanned && <Text style={styles.barcodeText}>{data}</Text>}
      </View>
    );
  };
  

const WA1020 = ({ navigation }) => {
    const [ERROR, setERROR] = useState('');
    const [userName, setUserName] = useState('');
    const [activationCode, setActivationCode] = useState('');
    const [devId, setDevId] = useState(''); // 端末ID
    const [comName, setComName] = useState(''); // 事業者名
    const [actReadFlg, setActReadFlg] = useState(''); // 端末IDです。
    const [showScannerUsr, setShowScannerUsr] = useState(false); // カメラ表示用の状態
    const [showScannerActivate, setShowScannerActivate] = useState(false); // カメラ表示用の状態
    const [isReadyToSend, setIsReadyToSend] = useState(false); // 送信準備完了状態

    const [usrInfo, setUsrInfo] = useState(null);//ユーザ情報
    const [activationInfo, setActivationInfo] = useState(null);//アクティベーション情報

    // QRコードスキャン後の処理 (ユーザー情報用)
    const handleQRCodeScannedForUser = (scannedData) => {
      // 利用者をクリアする
      setUserName("");
      const parts = scannedData.split(',');
      // CSVデータのフォーマットを確認（5つの部分があるか）
      if (parts.length === 5) {
        // ID種別が1かどうかを確認
        const idType = parts[0];
        if (idType === "1") {
            const comId = parts[1];
            const comName = parts[2];
            const userId = parts[3];
            const userName = parts[4];
            
            // 必要なデータをステートに保存
            setUsrInfo({
                comId: comId,
                comName: comName,
                userId: userId,
                userName: userName
            });
            // 別途保存しているユーザー名ステートがある場合はその更新も行う
            setUserName(userName);
            setComName(comName)

            setShowScannerUsr(false);
        } else {
            // ID種別が1ではない場合のエラーハンドリング
            console.error("不正なID種別です。");
            // エラーメッセージのステートを設定
            setERROR("不正なID種別です。");
        }
    } else {
        // CSVデータが正しいフォーマットでない場合のエラーハンドリング
        console.error("QRコードのフォーマットが不正です。");
        // エラーメッセージのステートを設定
        setERROR("QRコードのフォーマットが不正です。");
    }      
        // try {

        //     // setERROR(null);
        //     const data = JSON.parse(scannedData);
        //     setUsrInfo(data); // オブジェクト全体をステートに保存
        //     setUserName(data.userName); // 利用者情報を
        //     setShowScannerUsr(false);
        // } catch (error) {
        //     console.error("QRコードが不適切です", error);
        // }        
    };    
    // QRコードスキャン後の処理 (アクティベーション情報用)
    const handleQRCodeScannedForActivation = (scannedData) => {
        try {
            // setERROR(null);
            const data = JSON.parse(scannedData);
            setActivationInfo(data); // オブジェクト全体をステートに保存
            setDevId(data.devId); // 端末ID設定
            setActReadFlg("済")
            setShowScannerActivate(false);
        } catch (error) {
            console.error("QRコードが不適切です", error);
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

    const handleActivation = async () => {
        const realm = await getRealmInstance();
        try {
          realm.write(() => {
            realm.create('Activation', {
              devId: devId,
              usrId: usrId,
              activationCode: activationCode,
              isActivated: true,
            });
          });
        } catch (error) {
          console.error('アクティベーションに失敗しました', error);
        } finally {
          if (realm) {
            realm.close();
          }
        }
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
          <Text style={styles.labelText}>端末ID：{devId}</Text>
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
                <QRScanner onScan={handleQRCodeScannedForUser} closeModal={() => setShowScannerUsr(false)} />
            </Modal>
        )}

        {/* アクティベーションコード用QRコードスキャナー */}
        {showScannerActivate && (
            <Modal visible={showScannerActivate} onRequestClose={() => setShowScannerActivate(false)}>
                <QRScanner onScan={handleQRCodeScannedForActivation} closeModal={() => setShowScannerActivate(false)} />
            </Modal>
        )}

      </View>
    );
};



export default WA1020;
