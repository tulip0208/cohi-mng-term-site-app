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
import {encryptWithAES256CBC,generateDeviceUniqueKey,decryptWithAES256CBC} from '../utils/Security';
import Realm from "realm";
import QRScanner from '../utils/QRScanner';
import ProcessingModal from '../components/Modal';
import { getEncryptionKeyFromKeystore,saveToKeystore,clearKeyStore,loadFromKeystore } from '../utils/KeyStore'; 
import { IFA0030 } from '../utils/Api'; 


const WA1030 = ({closeModal}) => {
    const [userName, setUserName] = useState('');  //利用者
    const [wkplac, setWkplac] = useState(''); // 作業場所
    const [wkplacId, setWkplacId] = useState(''); // 作業場所種別ID
    const [isReadyToSend, setIsReadyToSend] = useState(false); // 送信準備完了状態
    const [showScannerUsr, setShowScannerUsr] = useState(false); // カメラ表示用の状態
    const [showScannerWkplac, setShowScannerWkplac] = useState(false); // カメラ表示用の状態
    const [modalVisible, setModalVisible] = useState(false);

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
                console.log('save realm : user => ',realm.objects('user')[0])
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
        const type = parts[0];//ID
        if (type == "4" || type == "5" || type == "6") {
            const id = parts[1];//場所ID
            const name = parts[2];//名前
            console.log(parts)
            let db=null;
            let schema=null;
            //仮置場
            if (type == "4"){
              schema = "temporary_places";
              db = {
                id: "1",//★一旦保留
                tmpPlacId: id,
                tmpPlacNm: name,
                delSrcTyp: 0,//★一旦保留
              }
            //保管場
            }else if(type == "5"){
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
                console.log('save realm : ',schema, ' => ',realm.objects(schema)[0])

                // 別途保存しているユーザー名ステートがある場合はその更新も行う
                setWkplac(name);
                setWkplacId(id);
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
    const btnUserQr = () => {
      setShowScannerUsr(true);
    };
    // 作業場所QRコードスキャンボタン押下時の処理
    const btnWkplac = () => {
        setShowScannerWkplac(true);
    };    
    // useEffect フックを使用してステートが変更されるたびにチェック
    useEffect(() => {
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
    const btnAppClose = () => {
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
      // モーダル表示
      setModalVisible(true);
      try{
        const responseIFA0030 = await IFA0030();
        if(responseIFA0030.data && responseIFA0030.data.isAppUpd && responseIFA0030.data.isAppUpd == "1"){
          Alert.alert(
            "",
            messages.IA5004(),
            [
              {
                text: "いいえ",
                style: "cancel",
                onPress: () => {
                  // 「いいえ」を選択した場合の処理
                  console.log('更新を中止しました。');
                  // モーダル非表示
                  setModalVisible(false);                  
                  return false;
                }
              },
              {
                text: "はい",
                onPress: () => {
                  // 「はい」を選択した場合の処理
                  
                }
              }
            ],
            { cancelable: false }
          );
        }
      
        // モーダル非表示
        setModalVisible(false);

        // ログイン画面へ遷移する
        navigation.navigate('WA1030');
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