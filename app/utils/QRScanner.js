/**-------------------------------------------
 * QRコードリーダ
 * 
 * ---------------------------------------------*/
//utils/QRScannner
import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { styles } from '../styles/CommonStyle'; // 適切なパスに修正してください
import messages from '../utils/messages'; // 適切なパスに修正してください
import { getInstance } from '../utils/Realm'; // 適切なパスに修正してください
import { useAlert } from '../components/AlertContext';
import Header from '../components/Header'; // Headerコンポーネントのインポート

const QRScanner = ({ onScan, closeModal, isActive, errMsg }) => {
    const [camTimeout, setCamTimeout] = useState(null);  // カメラのタイムアウト値を保存する状態
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const { showAlert } = useAlert();

    useEffect(() => {
      let timeout;

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

      if (isActive && camTimeout) {
        timeout = setTimeout(async () => {
          await showAlert("通知", messages.EA5001(errMsg), false);
          closeModal(); // カメラを閉じる処理
        }, camTimeout * 1000);
      }
      return () => {
        if (timeout) clearTimeout(timeout);
      };      
    }, [isActive, camTimeout, errMsg, showAlert, closeModal]);


    const handleBarCodeScanned = ({ type, data }) => {
      setScanned(true);
      onScan(data,type); // スキャンデータを親コンポーネントに渡す
    };
  
    if (hasPermission === null) {
      return <Text>カメラへのアクセスをリクエスト中...</Text>;
    }
    if (hasPermission === false) {
      return <Text>カメラへのアクセスが許可されていません。</Text>;
    }
  
    /************************************************
     * 終了ボタン押下時のポップアップ表示
     ************************************************/
    const btnAppClose = async () => {
      await logUserAction(`ボタン押下: 中断(QRScanner)`);  
      BackHandler.exitApp()
    };

    return (
      <View style={styles.container}>
        {/* ヘッダ */}
        <Header title={"QR/バーコード読込"}/>

        <BarCodeScanner style={styles.camera} onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}>
        <View style={styles.overlay}>
          <View style={styles.crosshair} />
          <View style={styles.crosshairHorizontal} />
        </View>

        </BarCodeScanner>
        {/*{scanned && <Text style={styles.barcodeText}>{data}</Text>}*/}

        {/* 下段 */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={[styles.button, styles.endButtonSmall]} onPress={closeModal}>
            <Text style={styles.endButtonText}>中断</Text>
          </TouchableOpacity>
        </View>        
      </View>
    );
  };
  

export default QRScanner;