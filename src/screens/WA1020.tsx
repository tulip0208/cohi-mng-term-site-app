/**-------------------------------------------
 * A01-0020_アクティベーション
 * WA1020
 * screens/WA1020.tsx
 * ---------------------------------------------*/
import FunctionHeader from '../components/FunctionHeader.tsx';
import Footer from '../components/Footer';
import {styles} from '../styles/CommonStyle';
import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, Modal, BackHandler} from 'react-native';
import {getInstance} from '../utils/Realm';
import messages from '../utils/messages';
import {encryptWithAES256CBC, generateDeviceUniqueKey} from '../utils/Security';
import Realm from 'realm';
import QRScanner from '../utils/QRScanner';
import ProcessingModal from '../components/Modal';
import {
  getEncryptionKeyFromKeystore,
  saveToKeystore,
  clearKeyStore,
  loadFromKeystore,
} from '../utils/KeyStore';
import {IFA0010} from '../utils/Api';
import {logUserAction, logScreen} from '../utils/Log';
import {useAlert} from '../components/AlertContext';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../navigation/AppNavigator';
import {ActivationInfo, ApiResponse} from '../types/type';
import {useButton} from '../hook/useButton.tsx';

// WA1020 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1020'>;
interface Props {
  navigation: NavigationProp;
}
const WA1020 = ({navigation}: Props) => {
  const [userName, setUserName] = useState<string>(''); //利用者
  const [trmId, setTrmId] = useState<string>(''); // 端末ID
  const [comName, setComName] = useState<string>(''); // 事業者名
  const [comId, setComId] = useState<string>(''); // 事業者ID
  const [actReadFlg, setActReadFlg] = useState<string>(''); // 端末ID
  const [showScannerUsr, setShowScannerUsr] = useState<boolean>(false); // カメラ表示用の状態
  const [showScannerActivate, setShowScannerActivate] =
    useState<boolean>(false); // カメラ表示用の状態
  const [isReadyToSend, setIsReadyToSend] = useState<boolean>(false); // 送信準備完了状態
  const [modalVisible, setModalVisible] = useState<boolean>(false); //処理中モーダルの状態
  const [isBtnEnabledUsr, toggleButtonUsr] = useButton(); //ボタン制御
  const [isBtnEnabledAct, toggleButtonAct] = useButton(); //ボタン制御
  const [isBtnEnabledEnd, toggleButtonEnd] = useButton(); //ボタン制御
  const [isBtnEnabledSnd, toggleButtonSnd] = useButton(); //ボタン制御
  const {showAlert} = useAlert();

  // useEffect フックを使用してステートが変更されるたびにチェック
  useEffect(() => {
    if (userName !== '' && actReadFlg === '済') {
      setIsReadyToSend(true); // 送信ボタンを活性化
    }
  }, [userName, actReadFlg]); // 依存配列に usrId と actReadFlg を追加

  // 送信ボタンのスタイルを動的に変更するための関数
  const getButtonStyle = () => {
    return isReadyToSend
      ? [styles.button, styles.startButton]
      : [styles.button, styles.startButton, styles.disabledButton];
  };

  /************************************************
   * QRコードスキャン後の処理 (ユーザ情報用)
   * @param {*} scannedData
   ************************************************/
  const handleQRCodeScannedForUser = async (scannedData: string) => {
    // 利用者をクリアする
    setUserName('');
    const parts = scannedData.split(',');
    // CSVデータのフォーマットを確認（5つの部分があるか）
    if (parts.length === 5) {
      // ID種別が1かどうかを確認
      const idType = parts[0];
      if (idType === '1') {
        const comIdQr = parts[1];
        const comNameQr = parts[2];
        const userIdQr = parts[3];
        const userNameQr = parts[4];

        const realm = getInstance();
        //realmへ保存
        realm.write(() => {
          // 既に同じユーザIDのデータがあれば上書き、なければ新規作成
          realm.create(
            'user',
            {
              id: 1,
              comId: comIdQr,
              comNm: comNameQr,
              userId: userIdQr,
              userNm: userNameQr,
            },
            Realm.UpdateMode.Modified,
          ); // Modified は既存のデータがあれば更新、なければ作成
        });
        console.log('save realm : user => ', realm.objects('user')[0]);
        // 別途保存しているユーザー名ステートがある場合はその更新も行う
        setUserName(userNameQr);
        setComName(comNameQr);
        setComId(comIdQr);
        setShowScannerUsr(false);
      } else {
        // ID種別が1ではない場合のエラーハンドリング
        setShowScannerUsr(false);
        await showAlert('通知', messages.EA5002('利用者'), false);
      }
    } else {
      setShowScannerUsr(false);
      await showAlert('通知', messages.EA5002('利用者'), false);
      // CSVデータが正しいフォーマットでない場合のエラーハンドリング
    }
  };

  /************************************************
   * QRコードスキャン後の処理 (アクティベーション情報用)
   * @param {*} scannedData
   ************************************************/
  const handleQRCodeScannedForActivation = async (scannedData: string) => {
    // 端末IDをクリアする
    setTrmId('');
    const parts = scannedData.split(',');
    // CSVデータのフォーマットを確認（5つの部分があるか）
    if (parts.length === 5) {
      // ID種別が1かどうかを確認
      const comIdQr = parts[0]; //事業者ID
      if (comIdQr.startsWith('J')) {
        //&&comId.length==10 ) {
        const trmIdQr = parts[1]; //端末ID
        const apiKeyQr = parts[2]; //端末APIキー
        const actKeyQr = parts[3]; //アクティベーションキー
        const actExpDtQr = parts[4]; //アクティベーション有効期限

        //キーを取得
        const key = await getEncryptionKeyFromKeystore();
        //端末APIキーのaes-256-cbc暗号化
        const apiKey256 = encryptWithAES256CBC(apiKeyQr, key);

        // アクティベーション情報をKeyStoreに保存
        await saveToKeystore('activationInfo', {
          comId: comIdQr,
          trmId: trmIdQr,
          apiKey: apiKey256,
          actKey: actKeyQr,
          actExpDt: actExpDtQr,
          actFin: 0, //未
        });
        // 別途保存しているユーザー名ステートがある場合はその更新も行う
        setTrmId(trmIdQr);
        setActReadFlg('済');

        setShowScannerActivate(false);
      } else {
        // ID種別が1ではない場合のエラーハンドリング
        setShowScannerActivate(false);
        await showAlert('通知', messages.EA5002('アクティベーション'), false);
        setActReadFlg('未');
        //アクティベーション情報のクリア
        if (await loadFromKeystore('activationInfo')) {
          await clearKeyStore('activationInfo');
        }
      }
    } else {
      setShowScannerActivate(false);
      await showAlert('通知', messages.EA5002('アクティベーション'), false);
      setActReadFlg('未');
      //アクティベーション情報のクリア
      if (await loadFromKeystore('activationInfo')) {
        await clearKeyStore('activationInfo');
      }
      // CSVデータが正しいフォーマットでない場合のエラーハンドリング
    }
  };

  // ユーザQRコードスキャンボタン押下時の処理
  const btnUserQr = async (): Promise<void> => {
    //ボタン連続押下制御
    if (!isBtnEnabledUsr) {
      return;
    } else {
      toggleButtonUsr();
    }

    await logUserAction('ボタン押下: WA1020 - QRコード読込(ユーザ)');

    setShowScannerUsr(true);
  };

  // アクティベーションQRコードスキャンボタン押下時の処理
  const btnActQr = async (): Promise<void> => {
    //ボタン連続押下制御
    if (!isBtnEnabledAct) {
      return;
    } else {
      toggleButtonAct();
    }

    await logUserAction(
      'ボタン押下: WA1020 - QRコード読込(アクティベーション)',
    );
    setShowScannerActivate(true);
  };

  /************************************************
   * 終了ボタン押下時のポップアップ表示
   ************************************************/
  const btnAppClose = async () => {
    //ボタン連続押下制御
    if (!isBtnEnabledEnd) {
      return;
    } else {
      toggleButtonEnd();
    }
    await logUserAction('ボタン押下: WA1020 - 終了');
    const result = await showAlert('確認', messages.IA5001(), true);
    if (result) {
      BackHandler.exitApp();
    }
  };

  /************************************************
   * 送信ボタン押下時の処理
   ************************************************/
  const btnSend = async () => {
    //ボタン連続押下制御
    if (!isBtnEnabledSnd) {
      return;
    } else {
      toggleButtonSnd();
    }
    await logUserAction('ボタン押下: WA1020 - 送信');
    // モーダル表示
    setModalVisible(true);
    const hashedKey = await generateDeviceUniqueKey(); // デバイスIDと現在の日時からユニークなキーを生成し、SHA256でハッシュ化する関数
    const secretKey = await getEncryptionKeyFromKeystore(); // AES暗号化のための秘密鍵
    const encryptedKey = encryptWithAES256CBC(hashedKey, secretKey); // AES-256-CBCで暗号化
    try {
      // ハッシュ化されたキーをAES-256-CBCで暗号化し、KeyStoreに保存する関数
      // アクティベーション情報をKeyStoreに保存
      await saveToKeystore('trmKey', {
        trmKey: encryptedKey,
      });
      console.log('Device unique key stored successfully.');

      // 前処理はApi.jsへ移行

      // サーバー通信処理（Api.js内の関数を呼び出し）
      const responseIFA0010 = await IFA0010(encryptedKey, secretKey); //sendToServer(requestData,"IFA0010","端末登録");
      if (await apiIsError(responseIFA0010)) {
        setModalVisible(false);
        return;
      }

      const activationInfo = (await loadFromKeystore(
        'activationInfo',
      )) as ActivationInfo;
      // アクティベーション情報をKeyStoreに保存
      await saveToKeystore('activationInfo', {
        comId: activationInfo.comId,
        trmId: activationInfo.trmId,
        apiKey: activationInfo.apiKey,
        actKey: activationInfo.actKey,
        actExpDt: activationInfo.actExpDt,
        actFin: 1, //済へ変更
      });
      // 事業者IDをKeyStoreに保存
      await saveToKeystore('comId', {comId: comId});
      // 端末IDをKeyStoreに保存
      await saveToKeystore('trmId', {trmId: activationInfo.trmId});
      // 端末APIキーをKeyStoreに保存
      await saveToKeystore('apiKey', {apiKey: activationInfo.apiKey});
      // 端末固有キーをKeyStoreに保存
      // →前半に実施しているため省略

      // モーダル非表示
      setModalVisible(false);

      // ログイン画面へ遷移する
      await logScreen('画面遷移: WA1020 → WA1030_ログイン');
      navigation.navigate('WA1030');
    } catch (error) {
      // モーダル非表示
      setModalVisible(false);
      console.error('登録に失敗しました。', error);
    }
  };

  /************************************************
   * API通信処理エラー有無確認・エラーハンドリング
   * @param {*} response
   * @returns
   ************************************************/
  const apiIsError = async <T,>(response: ApiResponse<T>): Promise<boolean> => {
    if (!response.success) {
      switch (response.error) {
        case 'codeHttp200':
          await showAlert(
            '通知',
            messages.EA5004(response.api as string, response.status as number),
            false,
          );
          break;
        case 'codeRsps01':
          await showAlert(
            '通知',
            messages.EA5005(response.api as string, response.code as string),
            false,
          );
          break;
        case 'timeout':
          await showAlert('通知', messages.EA5003(), false);
          break;
      }
      return true;
    } else {
      return false;
    }
  };

  return (
    <View style={styles.container}>
      {/* ヘッダ */}
      <FunctionHeader
        appType={'現'}
        viewTitle={'端末登録'}
        functionTitle={''}
      />

      {/* 中段 */}
      <View style={[styles.main, styles.topContent]}>
        <Text
          style={[styles.labelText, styles.labelTextOver]}
          numberOfLines={1}
          ellipsizeMode="tail">
          利用者：{userName}
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.buttonRead]}
          onPress={btnUserQr}
          disabled={!isBtnEnabledUsr}>
          <Text style={styles.buttonText}>利用者読込</Text>
        </TouchableOpacity>
        <Text
          style={[styles.labelText, styles.labelTextOver]}
          numberOfLines={1}
          ellipsizeMode="tail">
          アクティベーションコード読込：{actReadFlg}
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.buttonRead]}
          onPress={btnActQr}
          testID="act"
          disabled={!isBtnEnabledAct}>
          <Text style={styles.buttonText}>アクティベーション</Text>
          <Text style={styles.buttonText}>コード読込</Text>
        </TouchableOpacity>
        <Text
          style={[styles.labelText, styles.labelTextOver]}
          numberOfLines={1}
          ellipsizeMode="tail">
          端末ID：{trmId}
        </Text>
        <Text
          style={[styles.labelText, styles.labelTextOver]}
          numberOfLines={1}
          ellipsizeMode="tail">
          事業者：{comName}
        </Text>
      </View>

      {/* 下段 */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.button, styles.endButton]}
          onPress={btnAppClose}
          disabled={!isBtnEnabledEnd}>
          <Text style={styles.endButtonText}>終了</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={getButtonStyle()}
          disabled={!isReadyToSend || !isBtnEnabledSnd}
          onPress={btnSend}>
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
        <Modal
          visible={showScannerUsr}
          onRequestClose={() => setShowScannerUsr(false)}>
          <QRScanner
            onScan={handleQRCodeScannedForUser}
            closeModal={() => setShowScannerUsr(false)}
            isActive={showScannerUsr}
            errMsg={'利用者QRコード'}
          />
        </Modal>
      )}

      {/* アクティベーションコード用QRコードスキャナー */}
      {showScannerActivate && (
        <Modal
          visible={showScannerActivate}
          onRequestClose={() => setShowScannerActivate(false)}>
          <QRScanner
            onScan={handleQRCodeScannedForActivation}
            closeModal={() => setShowScannerActivate(false)}
            isActive={showScannerActivate}
            errMsg={'アクティベーションQRコード'}
          />
        </Modal>
      )}
    </View>
  );
};

export default WA1020;
