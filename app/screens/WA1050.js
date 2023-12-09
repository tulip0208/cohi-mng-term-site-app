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
            >
              <Text>接続名称：{settings.serverName}</Text>
              <Text>接続先：{settings.serverUrl}</Text>
              <Text>ログ保持期間(日)：{settings.logTerm}</Text>
              <Text>ログファイル分割(MB)：{settings.logCapacity}</Text>
              <Text>位置情報取得間隔(秒)：{settings.locGetTerm}</Text>
              <Text>カメラタイムアウト時間(秒)：{settings.camTimeout}</Text>
              <Text>新タグ紐付(土壌)：{settings.btnNewTagSoil}</Text>
              <Text>新タグ参照(土壌)：{settings.btnRefNewTagSoil}</Text>                                          
              <Text>旧タグ参照(土壌)：{settings.btnRefOldTagSoil}</Text>
              <Text>新タグ紐付(灰)：{settings.btnNewTagAsh}</Text>
              <Text>新タグ参照(灰)：{settings.btnRefNewTagAsh}</Text>
              <Text>旧タグ参照(灰)：{settings.btnRefOldTagAsg}</Text>
              <Text>輸送カード申請：{settings.btnTrnCard}</Text>
              <Text>荷下登録：{settings.btnUnload}</Text>
              <Text>定置登録：{settings.btnStat}</Text>
              <Text>旧タグ由来情報理由：{settings.reasonListOldTag}</Text>
              <Text>内袋の利用方法(初期)：{settings.useMethodInnerBag}</Text>
              <Text>荷姿種別(初期)：{settings.packTyp}</Text>
              <Text>放射能濃度換算係数：{settings.radioConvFact}</Text>
              <Text>施設到着予定時間(分)：{settings.facArriveTerm}</Text>
              <Text>段数―･―･―･―･―･―･―･</Text>
              <Text>草木類</Text>
              <Text>  選択 {settings.selTiersPlants}  閾値 {settings.thresTiersPlants}</Text>
              <Text>可燃廃棄物</Text>
              <Text>  選択 {settings.selTiersCombust}  閾値 {settings.thresTiersCombust}</Text>
              <Text>土壌等</Text>
              <Text>  選択 {settings.selTiersSoil}  閾値 {settings.thresTiersSoil}</Text>
              <Text>コン殻等</Text>
              <Text>  選択 {settings.selTiersConcrete}  閾値 {settings.thresTiersConcrete}</Text>
              <Text>アス混</Text>
              <Text>  選択 {settings.selTiersAsphalt}  閾値 {settings.thresTiersAsphalt}</Text>
              <Text>不燃物・混合物</Text>
              <Text>  選択 {settings.selTiersNoncombustMix}  閾値 {settings.thresTiersNoncombustMix}</Text>
              <Text>石綿含有建材</Text>
              <Text>  選択 {settings.selTiersAsbestos}  閾値 {settings.thresTiersAsbestos}</Text>
              <Text>石膏ボード</Text>
              <Text>  選択 {settings.selTiersPlasterboard}  閾値 {settings.thresTiersPlasterboard}</Text>
              <Text>危険物・有害物</Text>
              <Text>  選択 {settings.selTiersHazard}  閾値 {settings.thresTiersHazard}</Text>
              <Text>屋外残置_可燃</Text>
              <Text>  選択 {settings.selTiersOutCombust}  閾値 {settings.thresTiersOutCombust}</Text>
              <Text>屋外残置_不燃</Text>
              <Text>  選択 {settings.selTiersOutNoncombust}  閾値 {settings.thresTiersOutNoncombust}</Text>
              <Text>仮置場解体_可燃</Text>
              <Text>  選択 {settings.selTiersTmpCombust}  閾値 {settings.thresTiersTmpCombust}</Text>
              <Text>仮置場解体_不燃</Text>
              <Text>  選択 {settings.selTiersTmpNoncombust}  閾値 {settings.thresTiersTmpCNoncombust}</Text>
              <Text>焼却灰</Text>
              <Text>  選択 {settings.selTiersAsh}  閾値 {settings.thresTiersAsh}</Text>
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