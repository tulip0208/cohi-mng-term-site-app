/**-------------------------------------------
 * 01-0050_端末設定
 * WA1050
 * ---------------------------------------------*/
// app/screens/WA1050.js
import Header from '../components/Header'; // Headerコンポーネントのインポート
import Footer from '../components/Footer'; // Footerコンポーネントのインポート
import { styles } from '../styles/CommonStyle'; // 共通スタイル
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert,BackHandler,ScrollView } from 'react-native';
import { getInstance } from '../utils/Realm'; // realm.jsから関数をインポート
import messages from '../utils/messages';
import {encryptWithAES256CBC,generateDeviceUniqueKey,decryptWithAES256CBC} from '../utils/Security';
import Realm from "realm";
import QRScanner from '../utils/QRScanner';
import ProcessingModal from '../components/Modal';
import { getEncryptionKeyFromKeystore,saveToKeystore,clearKeyStore,loadFromKeystore } from '../utils/KeyStore'; 
import { IFA0020 } from '../utils/Api'; 
import DeviceInfo from 'react-native-device-info';
import { NativeModules } from 'react-native';
import RNFS from 'react-native-fs';
import Geolocation from '@react-native-community/geolocation';
import { logUserAction, checkLogFile,logScreen,calculateTotalLogSize,deleteLogs,compressLogFiles,deleteLogFile } from '../utils/Log';
import { clearLocation } from '../utils/Position'; 
import { useAlert } from '../components/AlertContext';

const logDirectory = `${RNFS.DocumentDirectoryPath}/logs`;
const {SignalStrengthModule} = NativeModules;


const WA1050 = ({closeModal,route,navigation }) => {
    // route.paramsに遷移時に渡されたパラメータが含まれる
    const { sourceScreenId } = route.params;
    const [versionTt,setVrsionTt] = useState('');
    const [buildVersion,setBuildVersion] = useState('');
    const [revision,setRvision] = useState('');
    const [sttCom, setSttCom] = useState('');
    const [logCap, setLogCap] = useState('');
    const [settings, setSettings] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const { showAlert } = useAlert();

    /************************************************
     * 初期表示設定
     ************************************************/   
    useEffect(() => {
      const contentsViews = async () => {
        const realm = await getInstance();
        let settings = realm.objects('settings')[0];
        const versionName = DeviceInfo.getVersion();
        const buildNumber = DeviceInfo.getBuildNumber();
        const trmId = await loadFromKeystore('trmId')
        const connectionQuality = await SignalStrengthModule.getSignalStrength();
        const logSize = await calculateTotalLogSize();
        const logFileNum = await checkLogFile();
        //アプリバージョン
        setVrsionTt(settings.appVer);
        //ビルドバージョン
        setBuildVersion(`${versionName} (${buildNumber})`)
        //端末ID
        setRvision(trmId.trmId)
        //通信品質
        setSttCom(connectionQuality);
        //ログファイルサイズ
        setLogCap(logSize);
        //画面テキストエリア部分の設定ファイル表示内容
        setSettings(settings);
        //ログファイル数を確認してボタン表示有無を設定
        if(logFileNum > 0){
          setIsDisabled(false);
        }
      } 
      contentsViews();      
    }, []);


    /************************************************
     * ログ消去ボタン
     ************************************************/    
    const btnDelLog = async () => {
      await logUserAction(`ボタン押下:ログ消去`);
      const IA5010_choise = await showAlert("確認", messages.IA5010(), true);
      // ユーザーの選択に応じた処理
      if (IA5010_choise) {
        //util内ではレンダリング処理ができないため、コールバックによりカスタム通知を実現
        await deleteLogs((title, message, showCancel) => showAlert(title, message, showCancel));
        const logSize = await calculateTotalLogSize();
        setLogCap(logSize);
      }
    };

    /************************************************
     * ログ送信ボタン
     ************************************************/    
    const btnUpLog = async () => {
      await logUserAction(`ボタン押下:ログ送信`);
      const IA5006_choise = await showAlert("確認", messages.IA5006(), true);
      // ユーザーの選択に応じた処理
      if (IA5006_choise) {
        // モーダル表示
        setModalVisible(true);
        // 位置情報取得を停止
        await clearLocation();
        // ログファイルを圧縮してファイルパスを取得
        const filePath = await compressLogFiles();
        // ログファイルアップロード通信を実施
        const responseIFA0020 = await IFA0020(filePath);
        if(await apiIsError(responseIFA0020)) return;
        
        // 実施完了メッセージ
        const IA5005_choise = await showAlert("通知", messages.IA5005("ログのアップロード"), false);
        // アップロード用zipファイルの削除
        await deleteLogFile(filePath)
        // モーダル非表示
        setModalVisible(false);
      }
    };
    
    /************************************************
     * 戻るボタン
     ************************************************/    
    const btnBack = async () => {
      await logUserAction(`ボタン押下:戻る`);
      await logScreen(`画面遷移: `,sourceScreenId);  
      navigation.navigate(sourceScreenId)
    };

    /************************************************
     * ボタン表示・非表示判断
     ************************************************/   
    const getButtonStyle = (isBtn) => {
      if(isBtn === 1){
        return (isDisabled) ? [styles.button, styles.settingButton,styles.settingButtonDisabled] : [styles.button, styles.settingButton,styles.settingButton1]
      }else{
        return (isDisabled) ? [styles.button, styles.settingButton,styles.settingButtonDisabled] : [styles.button, styles.settingButton,styles.settingButton]
      }
    };
    const getTextStyle = () => {
      return (isDisabled) ? [styles.endButtonText,styles.settingButtonText1] : [styles.endButtonText];
    };

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
        <Header title={"端末ID設定"}/>
  
        {/* 中段 */}
        <View  style={[styles.main,styles.topContent]}>
          <Text style={styles.labelTextSetting}>[アプリ情報]</Text>
          <Text style={[styles.labelTextSetting,styles.labelTextSettingDtl]}>アプリバージョン：{versionTt}</Text>
          <Text style={[styles.labelTextSetting,styles.labelTextSettingDtl]}>ビルドバージョン：{buildVersion}</Text>
          <Text style={[styles.labelTextSetting,styles.labelTextSettingDtl]}>端末ID：{revision}</Text>
          <Text style={styles.labelTextSetting}>[通信状態]</Text>
          <Text style={[styles.labelTextSetting,styles.labelTextSettingDtl]}>{sttCom}</Text>
          <Text style={styles.labelTextSetting}>[設定情報]</Text>
          <View style={styles.scrollContainer}>
            <ScrollView 
                style={styles.scrollViewStyle}
                showsVerticalScrollIndicator={true}
                showsHorizontalScrollIndicator={true}
                horizontal={true}
            >
              <ScrollView>
                <View style={styles.innerScrollViewStyle}>
                  <Text>appVer：{settings.appVer}</Text>
                  <Text>settingFileDt：{settings.settingFileDt}</Text>
                  <Text>serverName：{settings.serverName}</Text>
                  <Text>serverUrl：{settings.serverUrl}</Text>
                  <Text>logTerm：{settings.logTerm}</Text>
                  <Text>logCapacity：{settings.logCapacity}</Text>
                  <Text>locGetTerm：{settings.locGetTerm}</Text>
                  <Text>camTimeout：{settings.camTimeout}</Text>
                  <Text>btnNewTagSoil：{settings.btnNewTagSoil}</Text>
                  <Text>btnRefNewTagSoil：{settings.btnRefNewTagSoil}</Text>
                  <Text>btnRefOldTagSoil：{settings.btnRefOldTagSoil}</Text>
                  <Text>btnNewTagAsh：{settings.btnNewTagAsh}</Text>
                  <Text>btnRefNewTagAsh：{settings.btnRefNewTagAsh}</Text>
                  <Text>btnRefOldTagAsg：{settings.btnRefOldTagAsg}</Text>
                  <Text>btnTrnCard：{settings.btnTrnCard}</Text>
                  <Text>btnUnload：{settings.btnUnload}</Text>
                  <Text>btnStat：{settings.btnStat}</Text>
                  <Text>reasonListOldTag：{settings.reasonListOldTag}</Text>
                  <Text>useMethodInnerBag：{settings.useMethodInnerBag}</Text>
                  <Text>packTyp：{settings.packTyp}</Text>
                  <Text>radioConvFact：{settings.radioConvFact}</Text>
                  <Text>facArriveTerm：{settings.facArriveTerm}</Text>
                  <Text>selTiersPlants：{settings.selTiersPlants}</Text>
                  <Text>thresTiersPlants：{settings.thresTiersPlants}</Text>
                  <Text>selTiersCombust：{settings.selTiersCombust}</Text>
                  <Text>thresTiersCombust：{settings.thresTiersCombust}</Text>
                  <Text>selTiersSoil：{settings.selTiersSoil}</Text>
                  <Text>thresTiersSoil：{settings.thresTiersSoil}</Text>
                  <Text>selTiersConcrete：{settings.selTiersConcrete}</Text>
                  <Text>thresTiersConcrete：{settings.thresTiersConcrete}</Text>
                  <Text>selTiersAsphalt：{settings.selTiersAsphalt}</Text>
                  <Text>thresTiersAsphalt：{settings.thresTiersAsphalt}</Text>
                  <Text>selTiersNoncombustMix：{settings.selTiersNoncombustMix}</Text>
                  <Text>thresTiersNoncombustMix：{settings.thresTiersNoncombustMix}</Text>
                  <Text>selTiersAsbestos：{settings.selTiersAsbestos}</Text>
                  <Text>thresTiersAsbestos：{settings.thresTiersAsbestos}</Text>
                  <Text>selTiersPlasterboard：{settings.selTiersPlasterboard}</Text>
                  <Text>thresTiersPlasterboard：{settings.thresTiersPlasterboard}</Text>
                  <Text>selTiersHazard：{settings.selTiersHazard}</Text>
                  <Text>thresTiersHazard：{settings.thresTiersHazard}</Text>
                  <Text>selTiersOutCombust：{settings.selTiersOutCombust}</Text>
                  <Text>thresTiersOutCombust：{settings.thresTiersOutCombust}</Text>
                  <Text>selTiersOutNoncombust：{settings.selTiersOutNoncombust}</Text>
                  <Text>thresTiersOutNoncombust：{settings.thresTiersOutNoncombust}</Text>
                  <Text>selTiersTmpCombust：{settings.selTiersTmpCombust}</Text>
                  <Text>thresTiersTmpCombust：{settings.thresTiersTmpCombust}</Text>
                  <Text>selTiersTmpNoncombust：{settings.selTiersTmpNoncombust}</Text>
                  <Text>thresTiersTmpCNoncombust：{settings.thresTiersTmpCNoncombust}</Text>
                  <Text>selTiersAsh：{settings.selTiersAsh}</Text>
                  <Text>thresTiersAsh：{settings.thresTiersAsh}</Text>
                </View>
              </ScrollView>
            </ScrollView>          
          </View>
          <Text style={styles.labelTextSetting}>[ログ]  {logCap}MB</Text>
        </View>  

        {/* 下段 */}
        <View style={[styles.bottomSection,styles.settingMain]}>
          <TouchableOpacity style={getButtonStyle(1)} onPress={btnDelLog} disabled={isDisabled}>
            <Text style={getTextStyle(1)}>ログ消去</Text>
          </TouchableOpacity>
          <TouchableOpacity style={getButtonStyle(2)} onPress={btnUpLog} disabled={isDisabled}>
            <Text style={[styles.endButtonText,styles.settingButtonText1]}>ログ送信</Text>
          </TouchableOpacity>                    
          <TouchableOpacity style={[styles.button, styles.settingButton,styles.settingButton3]} onPress={btnBack} navigation={navigation}>
            <Text style={styles.endButtonText}>戻る</Text>
          </TouchableOpacity>
        </View>

        {/* 処理中モーダル */}
        <ProcessingModal
          visible={modalVisible}
          message={messages.IA5016()}
          onClose={() => setModalVisible(false)}
        />

        {/* フッタ */}
        <Footer /> 

      </View>

    );
    
};
export default WA1050;