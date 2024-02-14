/**-------------------------------------------
 * A01-0030_ログイン
 * WA1030
 * ---------------------------------------------*/
// app/screens/WA1030.js
import TapFunctionHeader from '../components/TapFunctionHeader'; // Headerコンポーネントのインポート
import Footer from '../components/Footer';
import {styles} from '../styles/CommonStyle';
import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, Modal, BackHandler} from 'react-native';
import {getInstance, deleteRealm} from '../utils/Realm';
import messages from '../utils/messages';
import Realm from 'realm';
import QRScanner from '../utils/QRScanner';
import ProcessingModal from '../components/Modal';
import {saveToKeystore, loadFromKeystore} from '../utils/KeyStore';
import {IFA0030, IFA0040, IFA0050, IFA0051} from '../utils/Api';
import {initializeLogFile, logUserAction, logScreen} from '../utils/Log';
import {watchLocation} from '../utils/Location';
import RNFS from 'react-native-fs';
import {useAlert} from '../components/AlertContext';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../navigation/AppNavigator';
import {
  ComId,
  TemporaryPlaces,
  StoragePlaces,
  FixedPlaces,
  ApiResponse,
  Settings,
} from '../types/type';
import Crypto from 'react-native-aes-crypto';
import {Buffer} from 'buffer';
import {getCurrentDateTime} from '../utils/common';
import RNRestart from 'react-native-restart';
import {NativeModules} from 'react-native';
const {ApkInstaller} = NativeModules;
// WA1030 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1030'>;
interface Props {
  navigation: NavigationProp;
}
const WA1030 = ({navigation}: Props) => {
  const [userName, setUserName] = useState<string>(''); //利用者
  const [wkplac, setWkplac] = useState<string>(''); // 作業場所
  const [isReadyToSend, setIsReadyToSend] = useState<boolean>(false); // 送信準備完了状態
  const [showScannerUsr, setShowScannerUsr] = useState<boolean>(false); // カメラ表示用の状態
  const [showScannerWkplac, setShowScannerWkplac] = useState<boolean>(false); // カメラ表示用の状態
  const [modalVisible, setModalVisible] = useState<boolean>(false); //処理中モーダルの状態
  const [wkplacId, setWkplacId] = useState<string>(''); // 作業場所種別ID
  const [wkplacTyp, setWkplacTyp] = useState<number>(); //作業場所種類
  const [fixPlacId, setFixPlacId] = useState<string | null>(null); // 定置場ID
  const {showAlert} = useAlert();

  // useEffect フックを使用してステートが変更されるたびにチェック
  useEffect(() => {
    initializeLogFile();
    if (userName !== '' && wkplac !== '') {
      setIsReadyToSend(true); // 送信ボタンを活性化
    }
  }, [userName, wkplac]); // 依存配列に usrId と actReadFlg を追加

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

        const comIdKeyStore = (await loadFromKeystore('comId')) as ComId; //keyStoreから事業者IDを取得
        if (comIdKeyStore.comId !== comIdQr) {
          console.log(comIdKeyStore.comId, comIdQr);
          // ID種別が1ではない場合のエラーハンドリング
          await showAlert('通知', messages.EA5006('利用者'), false);
          setShowScannerUsr(false);
        } else {
          const realm = getInstance();
          //realmへ保存
          try {
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
            console.log(
              'save realm : user => ',
              await realm.objects('user')[0],
            );
            // 別途保存しているユーザー名ステートがある場合はその更新も行う
            setUserName(userNameQr);
          } catch (error) {
            console.error('ユーザ設定に失敗しました。', error);
          }

          setShowScannerUsr(false);
        }
      } else {
        // ID種別が1ではない場合のエラーハンドリング
        await showAlert('通知', messages.EA5002('利用者'), false);
        await deleteRealm('user');
        setShowScannerUsr(false);
      }
    } else {
      await showAlert('通知', messages.EA5002('利用者'), false);
      await deleteRealm('user');
      setShowScannerUsr(false);
      // CSVデータが正しいフォーマットでない場合のエラーハンドリング
    }
  };

  /************************************************
   * QRコードスキャン後の処理 (作業場所用)
   * @param {*} scannedData
   ************************************************/
  const handleQRCodeScannedForWkplac = async (scannedData: string) => {
    // 作業場所をクリアする
    setWkplac('');
    const parts = scannedData.split(',');
    // CSVデータのフォーマットを確認（5つの部分があるか）
    if (parts.length !== 0) {
      try {
        // ID種別が4~6かどうかを確認
        const typ = Number(parts[0]); //ID
        if (typ === 4 || typ === 5 || typ === 6) {
          let db: Partial<TemporaryPlaces | StoragePlaces | FixedPlaces>;
          let schema = '';
          let uuid = await Crypto.randomUuid();
          switch (typ) {
            //仮置場
            case 4:
              schema = 'temporary_places';
              db = {
                id: uuid,
                tmpPlacId: parts[1], //場所ID
                tmpPlacNm: parts[2], //名前
                delSrcTyp: Number(parts[3]),
              };
              setWkplacId(parts[1]);
              setWkplac(parts[2]);
              break;

            //保管場
            case 5:
              schema = 'storage_places';
              db = {
                id: uuid,
                storPlacId: parts[2], //場所ID
                storPlacNm: parts[1], //名前
              };
              setWkplacId(parts[2]);
              setWkplac(parts[1]);
              break;

            //定置場
            case 6:
              schema = 'fixed_places';
              db = {
                id: uuid,
                storPlacId: parts[2], //名前
                fixPlacId: parts[1], //場所ID
                fixPlacNm: parts[3],
                facTyp: Number(parts[4]),
                conTyp: Number(parts[5]),
              };
              setWkplacId(parts[1]);
              setWkplac(parts[2]);
              setFixPlacId(parts[1]);
              break;
          }
          const realm = getInstance();
          //realmへ保存
          try {
            realm.write(() => {
              // 既に同じIDのデータがあれば上書き、なければ新規作成
              realm.create(schema, db, Realm.UpdateMode.Modified); // Modified は既存のデータがあれば更新、なければ作成
            });
            console.log(
              'save realm : ',
              schema,
              ' => ',
              realm.objects(schema)[0],
            );

            setWkplacTyp(typ);
          } catch (error) {
            console.error('作業場所に失敗しました。', error);
          }

          setShowScannerWkplac(false);
        } else {
          // ID種別が1ではない場合のエラーハンドリング
          await showAlert('通知', messages.EA5002('作業場所'), false);
          await deleteRealm('temporary_places');
          await deleteRealm('storage_places');
          await deleteRealm('fixed_places');
          setShowScannerWkplac(false);
        }
      } catch (error) {
        // CSVデータが正しいフォーマットでない場合のエラーハンドリング
        await showAlert('通知', messages.EA5002('作業場所'), false);
        await deleteRealm('temporary_places');
        await deleteRealm('storage_places');
        await deleteRealm('fixed_places');
        setShowScannerWkplac(false);
      }
    } else {
      // CSVデータが正しいフォーマットでない場合のエラーハンドリング
      await showAlert('通知', messages.EA5002('作業場所'), false);
      await deleteRealm('temporary_places');
      await deleteRealm('storage_places');
      await deleteRealm('fixed_places');
      setShowScannerWkplac(false);
    }
  };

  // ユーザQRコードスキャンボタン押下時の処理
  const btnUserQr = async () => {
    await logUserAction('ボタン押下: WA1030 - QRコード読込(ユーザ)');
    setShowScannerUsr(true);
  };

  // 作業場所QRコードスキャンボタン押下時の処理
  const btnWkplac = async () => {
    await logUserAction('ボタン押下: WA1030 - QRコード読込(作業場所)');
    setShowScannerWkplac(true);
  };

  /************************************************
   * 終了ボタン押下時のポップアップ表示
   ************************************************/
  const btnAppClose = async () => {
    await logUserAction('ボタン押下: WA1030 - 終了');
    const result = await showAlert('確認', messages.IA5001(), true);
    if (result) {
      BackHandler.exitApp();
    }
  };

  /************************************************
   * 利用開始ボタン押下時の処理
   ************************************************/
  const btnSend = async () => {
    await logUserAction('ボタン押下: WA1030 - 利用開始');
    // モーダル表示
    setModalVisible(true);
    try {
      const responseIFA0030 = await IFA0030();
      if (await apiIsError(responseIFA0030)) {
        setModalVisible(false);
        return;
      }

      const realm = getInstance();
      //【アプリ更新】＝"1"
      if (
        responseIFA0030.data &&
        responseIFA0030.data.isAppUpd &&
        responseIFA0030.data.isAppUpd === 1
      ) {
        const IA5004_choise = await showAlert('確認', messages.IA5004(), true);
        // ユーザーの選択に応じた処理
        if (IA5004_choise) {
          // ユーザーが「はい」を選んだ場合、IFA0050を呼び出す
          const responseIFA0050 = await IFA0050();
          if (await apiIsError(responseIFA0050)) {
            setModalVisible(true);
            return;
          }
          // バイナリーデータを変換する
          if (responseIFA0050.data) {
            const arrayBuffer = Buffer.from(responseIFA0050.data);
            const text = arrayBuffer.toString('base64');
            console.log(text);
            // apkファイルとして保存する
            const filePath =
              RNFS.DocumentDirectoryPath + '/IFA0050_BinaryData.apk';
            await RNFS.writeFile(filePath, text, 'base64');
            // バージョンアップ報告を要で更新
            await saveToKeystore('verUpRep', {verUpRep: 1});
            const result = await showAlert('通知', messages.IA5008(), false);
            if (result) {
              // 設定realmを削除
              await deleteRealm('settings');
              setModalVisible(false); // モーダルを非表示にする
              // APKファイルのパスを指定してインストール
              ApkInstaller.installApk(filePath);
              // アプリを再起動
              RNRestart.Restart();
              return;
            }
          }
        } else {
          console.log('利用開始を中止しました。');
          setModalVisible(false); // モーダルを非表示にする
          return; // ここで処理を終了
        }

        //【設定ファイル更新】＝"1"
      } else if (
        responseIFA0030.data &&
        responseIFA0030.data.isSetUpd &&
        responseIFA0030.data.isSetUpd === 1
      ) {
        const IA5009_choise = await showAlert('確認', messages.IA5009(), true);
        // ユーザーの選択に応じた処理
        if (IA5009_choise) {
          // ユーザーが「はい」を選んだ場合、FA0040_端末設定ファイル配信を呼び出す
          const responseIFA0040 = await IFA0040();
          if (await apiIsError(responseIFA0040)) {
            return;
          }
          // バイナリーデータを変換する
          // Bufferを使用してデータをデコード
          if (responseIFA0040.data) {
            const arrayBuffer = Buffer.from(responseIFA0040.data);
            const text = arrayBuffer.toString();
            console.log(text);
            // realmの設定ファイルへ保存する
            const settingsInfo = JSON.parse(text) as Settings;
            realm.write(() => {
              realm.create(
                'settings',
                {
                  ...settingsInfo, // スプレッド構文で他のフィールドを展開
                  settingFileDt: getCurrentDateTime(), //取得日時が含まれないため追加設定
                },
                Realm.UpdateMode.Modified,
              );
            });
          }
          // IFA0051_バージョンアップ完了報告を呼び出す
          const responseIFA0051 = await IFA0051();
          if (await apiIsError(responseIFA0051)) {
            return;
          }
        }
      }
      // [位置情報取得間隔]の間隔で位置情報の取得を開始する。
      await watchLocation();
      // [ログイン情報]に保存する。
      const userInfo = realm.objects('user')[0];
      realm.write(() => {
        // 既に同じユーザIDのデータがあれば上書き、なければ新規作成
        realm.create(
          'login',
          {
            id: 1,
            loginDt: new Date()
              .toISOString()
              .replace(/[^0-9]/g, '')
              .slice(0, 14),
            comId: userInfo.comId,
            userId: userInfo.userId,
            wkplacTyp: wkplacTyp,
            wkplacId: wkplacId,
            fixPlacId: fixPlacId,
            logoutFlg: 0,
          },
          Realm.UpdateMode.Modified,
        ); // Modified は既存のデータがあれば更新、なければ作成
      });
      console.log('ログイン情報：', realm.objects('login'));
      // モーダル非表示
      setModalVisible(false);

      // メニュー画面へ遷移する
      await logScreen('画面遷移: WA1030 → WA1040_メニュー');
      navigation.navigate('WA1040');
    } catch (error) {
      // モーダル非表示
      setModalVisible(false);
      console.error('利用開始に失敗しました。', error);
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
      <TapFunctionHeader
        appType={'現'}
        viewTitle={'ログイン'}
        functionTitle={''}
        sourceScreenId={'WA1030'}
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
          onPress={btnUserQr}>
          <Text style={styles.buttonText}>利用者読込</Text>
        </TouchableOpacity>
        <Text
          style={[styles.labelText, styles.labelTextOver]}
          numberOfLines={1}
          ellipsizeMode="tail">
          作業場所：{wkplac}
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.buttonRead]}
          onPress={btnWkplac}>
          <Text style={styles.buttonText}>作業場所読込</Text>
        </TouchableOpacity>
      </View>

      {/* 下段 */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.button, styles.endButton]}
          onPress={btnAppClose}>
          <Text style={styles.endButtonText}>終了</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={getButtonStyle()}
          //onPress={/* 送信処理 */}
          disabled={!isReadyToSend} // 送信準備ができていなければ無効化
          onPress={btnSend}>
          <Text style={styles.startButtonText}>利用開始</Text>
        </TouchableOpacity>
      </View>

      {/* フッタ */}
      <Footer />

      {/* 処理中モーダル */}
      <ProcessingModal
        visible={modalVisible}
        message={messages.IA5003()}
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

      {/* 利用者用QRコードスキャナー */}
      {showScannerWkplac && (
        <Modal
          visible={showScannerWkplac}
          onRequestClose={() => setShowScannerWkplac(false)}>
          <QRScanner
            onScan={handleQRCodeScannedForWkplac}
            closeModal={() => setShowScannerWkplac(false)}
            isActive={showScannerWkplac}
            errMsg={'作業場所QRコード'}
          />
        </Modal>
      )}
    </View>
  );
};
export default WA1030;
