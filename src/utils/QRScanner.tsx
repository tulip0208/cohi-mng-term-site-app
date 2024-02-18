/**-------------------------------------------
 * QRコードリーダ
 * utils/QRScanner.tsx
 * ---------------------------------------------*/
import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, PermissionsAndroid} from 'react-native';
import {RNCamera, BarCodeReadEvent} from 'react-native-camera';
import {styles} from '../styles/CommonStyle'; // 適切なパスに修正してください
import messages from '../utils/messages'; // 適切なパスに修正してください
import {getInstance} from '../utils/Realm'; // 適切なパスに修正してください
import {useAlert} from '../components/AlertContext';
import Header from '../components/Header'; // Headerコンポーネントのインポート
import {logUserAction} from '../utils/Log';
import {useButton} from '../hook/useButton';
interface QRScannerProps {
  onScan: (data: string, type: string) => void;
  closeModal: () => void;
  isActive: boolean;
  errMsg: string;
}

const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  closeModal,
  isActive,
  errMsg,
}) => {
  const [camTimeout, setCamTimeout] = useState<number | null>(null); // カメラのタイムアウト値を保存する状態
  const [hasPermission, setHasPermission] = useState<boolean | null>(null); //カメラ許可
  const [scanned, setScanned] = useState<boolean>(false); //カメラ読込状態
  const [isReadyToScan, setIsReadyToScan] = useState<boolean>(false); //カメラ読込開始
  const [isBtnEnabledStp, toggleButtonStp] = useButton(); //ボタン制御
  const {showAlert} = useAlert();

  /************************************************
   * 前処理
   ************************************************/
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    // カメラ起動後2秒後に読み取りを開始(前回読み取り分が残っていた場合の対応)
    const scanDelay = setTimeout(() => {
      setIsReadyToScan(true);
    }, 2000);

    // カメラのパーミッション要求
    // OSへの許可要求のためカスタム通知は使用できない
    const requestPermission = async () => {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'カメラアクセス許可',
          message: 'カメラの使用を許可してください。',
          buttonNeutral: '後で尋ねる',
          buttonNegative: '拒否',
          buttonPositive: '許可',
        },
      );
      setHasPermission(status === PermissionsAndroid.RESULTS.GRANTED);
    };
    requestPermission();

    // データベースから設定を読み込む
    const loadSettings = () => {
      const realm = getInstance();
      let settings = realm.objects('settings')[0];
      setCamTimeout(settings.camTimeout as number); // カメラのタイムアウト値を状態にセット
    };
    loadSettings();

    if (isActive && camTimeout) {
      timeout = setTimeout(async () => {
        closeModal(); // カメラを閉じる処理
        await showAlert('通知', messages.EA5001(errMsg), false);
        await logUserAction('カメラ読込: 読込タイムアウト');
      }, camTimeout * 1000);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      clearTimeout(scanDelay);
    };
  }, [isActive, camTimeout, errMsg, showAlert, closeModal]);

  const handleBarCodeRead = async ({type, data}: BarCodeReadEvent) => {
    if (!scanned && isReadyToScan) {
      // isReadyToScan をチェック
      setScanned(true);
      await logUserAction(`カメラ読込: タイプ[${type}] データ[${data}]`);
      onScan(data, type); // スキャンデータを親コンポーネントに渡す
    }
  };

  // カメラアクセス関連のメッセージ
  if (hasPermission === null) {
    return <Text>カメラへのアクセスをリクエスト中...</Text>;
  }
  if (hasPermission === false) {
    return <Text>カメラへのアクセスが許可されていません。</Text>;
  }

  /************************************************
   * 中断ボタン押下時の処理
   ************************************************/
  const btnAppClose = async (): Promise<void> => {
    //ボタン連続押下制御
    if (!isBtnEnabledStp) {
      return;
    } else {
      toggleButtonStp();
    }
    await logUserAction('ボタン押下: 中断(QRScanner)');
    closeModal();
  };

  return (
    <View style={styles.container}>
      {/* ヘッダ */}
      <Header title={'QR/バーコード読込'} />

      <RNCamera
        style={styles.camera}
        onBarCodeRead={scanned ? undefined : handleBarCodeRead}
        barCodeTypes={[RNCamera.Constants.BarCodeType.qr, 'CODABAR']}
        captureAudio={false}>
        <View style={styles.overlay}>
          <View style={styles.crosshair} />
          <View style={styles.crosshairHorizontal} />
        </View>
      </RNCamera>

      {/* 下段 */}
      <View style={styles.cameraBottomSection}>
        <TouchableOpacity
          disabled={!isBtnEnabledStp}
          style={[styles.button, styles.endButtonSmall]}
          onPress={btnAppClose}>
          <Text style={styles.endButtonText}>中断</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default QRScanner;
