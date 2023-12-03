/**
 * QRコードリーダ
 * 
 */
//utils/QRScannner
import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { styles } from '../styles/CommonStyle'; // 適切なパスに修正してください
import messages from '../utils/messages'; // 適切なパスに修正してください
import { getInstance } from '../utils/Realm'; // 適切なパスに修正してください

const useTimeout = (isActive, timeoutDuration, onTimeout) => {
  useEffect(() => {
    let timeout;

    if (isActive) {
      timeout = setTimeout(onTimeout, timeoutDuration);
    }

    return () => clearTimeout(timeout);
  }, [isActive, timeoutDuration, onTimeout]);
};

const QRScanner = ({ onScan, closeModal, isActive, errMsg }) => {
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
        messages.EA5001(errMsg),
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
  

export default QRScanner;