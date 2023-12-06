/**
 * A01-0030_ログイン
 * WA1030
 */
// app/screens/WA1030.js
import Header from '../components/Header'; // Headerコンポーネントのインポート
import Footer from '../components/Footer'; // Footerコンポーネントのインポート
import { styles } from '../styles/CommonStyle'; // 共通スタイル
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert,BackHandler } from 'react-native';
import { getInstance } from '../utils/Realm'; // realm.jsから関数をインポート
import messages from '../utils/messages';
import {encryptWithAES256CBC,generateDeviceUniqueKey,decryptWithAES256CBC,atob} from '../utils/Security';
import Realm from "realm";
import QRScanner from '../utils/QRScanner';
import ProcessingModal from '../components/Modal';
import { getEncryptionKeyFromKeystore,saveToKeystore,clearKeyStore,loadFromKeystore } from '../utils/KeyStore'; 
import { IFA0030,IFA0040,IFA0050 } from '../utils/Api'; 
import { initializeLogFile, logUserAction, logCommunication, watchPosition, writeLog,logScreen  } from '../utils/Log';
import { watchLocation } from '../utils/Position'; 
import RNFS from 'react-native-fs';
import RNRestart from 'react-native-restart'; // まずインポートする

const WA1030 = ({navigation,closeModal}) => {
    const [userName, setUserName] = useState('');  //利用者
    const [wkplac, setWkplac] = useState(''); // 作業場所
    const [isReadyToSend, setIsReadyToSend] = useState(false); // 送信準備完了状態
    const [showScannerUsr, setShowScannerUsr] = useState(false); // カメラ表示用の状態
    const [showScannerWkplac, setShowScannerWkplac] = useState(false); // カメラ表示用の状態
    const [modalVisible, setModalVisible] = useState(false);
    const [wkplacId, setWkplacId] = useState(''); // 作業場所種別ID
    const [wkplacTyp,setWkplacTyp] = useState('')
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
        const idType = parts[0];
        if (idType === "1") {
            const comId = parts[1];
            const comName = parts[2];
            const userId = parts[3];
            const userName = parts[4];

            const comIdKeyStore=await loadFromKeystore("comId");//keyStoreから事業者IDを取得
            if(comIdKeyStore.comId != comId){
              console.log(comIdKeyStore.comId , comId)
              // ID種別が1ではない場合のエラーハンドリング
              Alert.alert(
                "",
                messages.EA5006("利用者"),
                [{ text: "OK", onPress: closeModal }] // closeModalはQRScannerコンポーネントのprops
              );
              setShowScannerUsr(false);                 
            }else{
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
              } catch (error) {
                console.error('ユーザ設定に失敗しました。', error);
              }

              setShowScannerUsr(false);  
            }
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

    /************************************************
     * QRコードスキャン後の処理 (作業場所用)
     * @param {*} scannedData 
     ************************************************/
    const handleQRCodeScannedForWkplac = async (scannedData) => {
      // 作業場所をクリアする
      setWkplac("");
      const parts = scannedData.split(',');
      // CSVデータのフォーマットを確認（5つの部分があるか）
      if (parts.length === 3) {
        // ID種別が4~6かどうかを確認
        const typ = parts[0];//ID
        if (typ == "4" || typ == "5" || typ == "6") {
            const id = parts[1];//場所ID
            const name = parts[2];//名前
            
            let db=null;
            let schema=null;
            //仮置場
            if (typ == "4"){
              schema = "temporary_places";
              db = {
                id: "1",//★一旦保留
                tmpPlacId: id,
                tmpPlacNm: name,
                delSrcTyp: 0,//★一旦保留
              }
            //保管場
            }else if(typ == "5"){
              schema = "storage_places";
              db = {
                id: "1",//★一旦保留
                storPlacId: id,
                storPlacNm: name,
              }
            //定置場
            }else{
              schema = "fixed_places";
              db = {
                id: "1",//★一旦保留
                storPlacId: null,
                fixPlacId: id,
                fixPlacNm: name,
                facTyp: null,
                conTyp: null,
              }
            }
              const realm = await getInstance();
              //realmへ保存
              try {
                realm.write(() => {
                  // 既に同じIDのデータがあれば上書き、なければ新規作成
                  realm.create(schema, db, Realm.UpdateMode.Modified); // Modified は既存のデータがあれば更新、なければ作成
                });
                console.log('save realm : ',schema, ' => ', await realm.objects(schema)[0])

                // 別途保存しているユーザー名ステートがある場合はその更新も行う
                setWkplac(name);
                setWkplacId(id);
                setWkplacTyp(typ);
              } catch (error) {
                console.error('作業場所に失敗しました。', error);
              }

              setShowScannerWkplac(false);  
        } else {
            // ID種別が1ではない場合のエラーハンドリング
            Alert.alert(
              "",
              messages.EA5002("作業場所"),
              [{ text: "OK", onPress: closeModal }] // closeModalはQRScannerコンポーネントのprops
            );
          setShowScannerWkplac(false);   
        }
      } else {
        Alert.alert(
            "",
            messages.EA5002("作業場所"),
            [{ text: "OK", onPress: closeModal }] // closeModalはQRScannerコンポーネントのprops
        );
        setShowScannerWkplac(false);   
        // CSVデータが正しいフォーマットでない場合のエラーハンドリング
      }      
    };

    // ユーザQRコードスキャンボタン押下時の処理
    const btnUserQr = async () => {
      await logUserAction(`ボタン押下: QRコード読込(ユーザ)`);
      setShowScannerUsr(true);
    };
    // 作業場所QRコードスキャンボタン押下時の処理
    const btnWkplac = async () => {
      await logUserAction(`ボタン押下: QRコード読込(作業場所)`);      
      setShowScannerWkplac(true);
    };    
    // useEffect フックを使用してステートが変更されるたびにチェック
    useEffect(() => {
      initializeLogFile();
        if (userName !== "" && wkplac !== "") {
            setIsReadyToSend(true); // 送信ボタンを活性化
        }
    }, [userName, wkplac]); // 依存配列に usrId と actReadFlg を追加
    // 送信ボタンのスタイルを動的に変更するための関数
    const getButtonStyle = () => {
        return isReadyToSend ? [styles.button,styles.startButton] : [styles.button,styles.startButton, styles.disabledButton];
    };
    /************************************************
     * 終了ボタン押下時のポップアップ表示
     ************************************************/
    const btnAppClose = async () => {
      await logUserAction(`ボタン押下: 終了(WA1030)`);      
      Alert.alert(
          "",
          messages.IA5001(),
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

    /************************************************
     * 利用開始ボタン押下時の処理
     ************************************************/
    const btnSend = async () =>{
      await logUserAction(`ボタン押下: 利用開始(WA1030)`);      

      // モーダル表示
      setModalVisible(true);
      try{
        const responseIFA0030 = await IFA0030();
        const realm = await getInstance()
        //【アプリ更新】＝"1"
        if(responseIFA0030.data && responseIFA0030.data.isAppUpd && responseIFA0030.data.isAppUpd == "1"){
          const IA5004_choise = await new Promise((resolve) => {Alert.alert(
              "",messages.IA5004(),
              [
                {text: "いいえ",style: "cancel",onPress: () => resolve('no')}, // 「いいえ」を選んだ場合、resolveを呼ぶ
                {text: "はい",onPress: () => resolve('yes') }// 「はい」を選んだ場合、resolveを呼ぶ
              ],{ cancelable: false });});

          // ユーザーの選択に応じた処理
          if (IA5004_choise === 'yes') {
            // ユーザーが「はい」を選んだ場合、IFA0050を呼び出す
            const responseIFA0050 = await IFA0050();
            // バイナリーデータのBASE64デコード
            const responseIFA0050dec=atob(responseIFA0050.data)
            // apkファイルとして保存する  
            const filePath = RNFS.DocumentDirectoryPath + '/IFA0050_BinaryData.apk';
            RNFS.writeFile(filePath, binaryData, 'base64')
              .then(() => {
                console.log('File written to', filePath);
              })
              .catch(error => {
                console.error(error);
              });
            // バージョンアップ報告を要で更新
            await saveToKeystore("verupRep",{verupRep: "1",});//★バージョンアップ報告の物理名不明
            Alert.alert(
              "",messages.IA5008(),[
                {text: "はい",onPress: () => {RNRestart.Restart();}}//アプリ再起動
              ],{ cancelable: false }
            );
          } else {
            console.log('利用開始を中止しました。');
            setModalVisible(false); // モーダルを非表示にする
            return; // ここで処理を終了
          }

        //【設定ファイル更新】＝"1"　
        }else if(responseIFA0030.data && responseIFA0030.data.isSetUpd && responseIFA0030.data.isSetUpd == "1"){
          const IA5009_choise = await new Promise((resolve) => {Alert.alert(
            "",messages.IA5009(),
            [
              {text: "いいえ",style: "cancel",onPress: () => resolve('no')}, // 「いいえ」を選んだ場合、resolveを呼ぶ
              {text: "はい",onPress: () => resolve('yes') }// 「はい」を選んだ場合、resolveを呼ぶ
            ],{ cancelable: false });});
            // ユーザーの選択に応じた処理
          if (IA5009_choise === 'yes') {
            // ユーザーが「はい」を選んだ場合、FA0040_端末設定ファイル配信を呼び出す
            const responseIFA0040 = await IFA0040();
            // バイナリーデータのBASE64デコード
            const responseIFA0040dec=atob(responseIFA0040.data)
            // realmの設定ファイルへ保存する ★どこに保存するか要確認
            let settingsInfo = await realm.objects('settings')[0]
            //★ settingsInfo.xxxx = responseIFA0040dec; //
            realm.write(() => {
              realm.create('settings', {
                id: 1, // プライマリーキーとしてのID
                ...settingsInfo, // スプレッド構文で他のフィールドを展開
              }, Realm.UpdateMode.Modified); 
            });
            // IFA0051_バージョンアップ完了報告を呼び出す
            const responseIFA0050 = await IFA0050();
          }
        }
        // [位置情報取得間隔]の間隔で位置情報の取得を開始する。
        await watchLocation();
        // [ログイン情報]に保存する。
        const userInfo = await realm.objects('user')[0]
        await realm.write(() => {
          // 既に同じユーザIDのデータがあれば上書き、なければ新規作成
          realm.create('login', {
            id: 1,
            loginDt: new Date().toISOString().replace(/[^0-9]/g, "").slice(0,14),
            comId: userInfo.comId,
            userId: userInfo.userId,
            wkplacTyp: Number(wkplacTyp),
            wkplacId: wkplacId,
            logoutFlg: 0,
          }, Realm.UpdateMode.Modified); // Modified は既存のデータがあれば更新、なければ作成
        }); 
        console.log("ログイン情報：",await realm.objects("login") )
        // モーダル非表示
        setModalVisible(false);

        // メニュー画面へ遷移する
        logScreen(`画面遷移: WA1040_メニュー`);        
        navigation.navigate('WA1040');
      } catch (error) {
        // モーダル非表示
        setModalVisible(false);
        console.error('利用開始に失敗しました。', error);
      }
    }
    return (
      <View style={styles.container}>
        {/* ヘッダ */}
        <Header title={"ログイン"}/>

        {/* 中段 */}
        <View  style={[styles.main,styles.topContent]}>
          <Text style={styles.labelText}>利用者：{userName}</Text>
          <TouchableOpacity style={[styles.button]} onPress={btnUserQr}>
            <Text style={styles.buttonText}>QRコード読込</Text>
          </TouchableOpacity>
          <Text style={styles.labelText}>作業場所：{wkplac}</Text>
          <TouchableOpacity style={[styles.button]} onPress={btnWkplac}>
            <Text style={styles.buttonText}>QRコード読込</Text>
          </TouchableOpacity>
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
            <Modal visible={showScannerUsr} onRequestClose={() => setShowScannerUsr(false)}>
                <QRScanner onScan={handleQRCodeScannedForUser} closeModal={() => setShowScannerUsr(false)} isActive={showScannerUsr} errMsg={"利用者QRコード"}/>
            </Modal>
        )}

        {/* 利用者用QRコードスキャナー */}
        {showScannerWkplac && (
            <Modal visible={showScannerWkplac} onRequestClose={() => setShowScannerWkplac(false)}>
                <QRScanner onScan={handleQRCodeScannedForWkplac} closeModal={() => setShowScannerWkplac(false)} isActive={showScannerWkplac}  errMsg={"作業場所QRコード"}/>
            </Modal>
        )}

      </View>

    );
    
};
export default WA1030;