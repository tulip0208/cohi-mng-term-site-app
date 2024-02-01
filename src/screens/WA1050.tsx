/**-------------------------------------------
 * 01-0050_端末設定
 * WA1050
 * ---------------------------------------------*/
// app/screens/WA1050.js
import Header from '../components/Header'; // Headerコンポーネントのインポート
import Footer from '../components/Footer'; // Footerコンポーネントのインポート
import {styles} from '../styles/CommonStyle'; // 共通スタイル
import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import {getInstance} from '../utils/Realm'; // realm.jsから関数をインポート
import messages from '../utils/messages';
import ProcessingModal from '../components/Modal';
import {loadFromKeystore} from '../utils/KeyStore';
import {IFA0020} from '../utils/Api';
import DeviceInfo from 'react-native-device-info';
import {NativeModules} from 'react-native';
import {
  logUserAction,
  checkLogFile,
  logScreen,
  calculateTotalLogSize,
  deleteLogs,
  compressLogFiles,
  deleteLogFile,
} from '../utils/Log';
import {clearLocation, watchLocation} from '../utils/Location';
import {useAlert} from '../components/AlertContext';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../navigation/AppNavigator';
import {RouteProp} from '@react-navigation/native';
import {TrmId, ApiResponse} from '../types/type';

const {SignalStrengthModule} = NativeModules;
// WA1050 用の navigation 型
type NavigationProp = StackNavigationProp<RootList, 'WA1050'>;
// WA1050 用の route 型
type RoutePropTmp = RouteProp<RootList, 'WA1050'>;
interface Props {
  navigation: NavigationProp;
  route: RoutePropTmp; // routeをPropsに追加
}

const WA1050 = ({route, navigation}: Props) => {
  // route.paramsに遷移時に渡されたパラメータが含まれる
  const {sourceScreenId} = route.params; // 遷移元画面
  const [versionTt, setVrsionTt] = useState<string>(''); // アプリバージョン
  const [buildVersion, setBuildVersion] = useState<string>(''); // ビルドバージョン
  const [revision, setRvision] = useState<string>(''); // 端末ID
  const [sttCom, setSttCom] = useState<string>(''); // 通信状態
  const [logCap, setLogCap] = useState<number>(0); // ログ(MB)
  const [isDisabled, setIsDisabled] = useState<boolean>(true); // ログ消去・送信ボタン 活性・非活性
  const [modalVisible, setModalVisible] = useState<boolean>(false); //処理中モーダルの状態
  const {showAlert} = useAlert();

  /************************************************
   * 初期表示設定
   ************************************************/
  useEffect(() => {
    const contentsViews = async () => {
      const realm = getInstance();
      let settings = realm.objects('settings')[0];
      const versionName = DeviceInfo.getVersion();
      const buildNumber = DeviceInfo.getBuildNumber();
      const trmId = (await loadFromKeystore('trmId')) as TrmId;
      const connectionQuality = await SignalStrengthModule.getSignalStrength();
      const logSize = await calculateTotalLogSize();
      const logFileNum = (await checkLogFile()) as number;
      //アプリバージョン
      setVrsionTt(settings.appVer as string);
      //ビルドバージョン
      setBuildVersion(`${versionName} (${buildNumber})`);
      //端末ID
      setRvision(trmId.trmId);
      //通信品質
      setSttCom(connectionQuality);
      //ログファイルサイズ
      setLogCap(logSize as number);
      //画面テキストエリア部分の設定ファイル表示内容
      // setSettings(settingsInfo);
      //ログファイル数を確認してボタン表示有無を設定
      if (logFileNum > 0) {
        setIsDisabled(false);
      }
    };
    contentsViews();
  }, []);

  /************************************************
   * ログ消去ボタン
   ************************************************/
  const btnDelLog = async () => {
    await logUserAction('ボタン押下:ログ消去');
    const IA5010_choise = await showAlert('確認', messages.IA5010(), true);
    // ユーザーの選択に応じた処理
    if (IA5010_choise) {
      //util内ではレンダリング処理ができないため、コールバックによりカスタム通知を実現
      await deleteLogs(async (title, message, showCancel) => {
        await showAlert(title, message, showCancel);
      });
      const logSize = await calculateTotalLogSize();
      setLogCap(logSize);
    }
  };

  /************************************************
   * ログ送信ボタン
   ************************************************/
  const btnUpLog = async () => {
    await logUserAction('ボタン押下:ログ送信');
    const IA5006_choise = await showAlert('確認', messages.IA5006(), true);
    // ユーザーの選択に応じた処理
    if (IA5006_choise) {
      // モーダル表示
      setModalVisible(true);
      // 位置情報取得を停止
      if (global.locationStarted) {
        await clearLocation();
      }
      // ログファイルを圧縮してファイルパスを取得
      const filePath = (await compressLogFiles()) as string;
      // ログファイルアップロード通信を実施
      const responseIFA0020 = await IFA0020(filePath);
      if (await apiIsError(responseIFA0020)) {
        return;
      }

      // 実施完了メッセージ
      await showAlert('通知', messages.IA5005('ログのアップロード'), false);
      // アップロード用zipファイルの削除
      await deleteLogFile(filePath);
      // 位置情報取得を停止した場合再開する
      if (global.locationStopped) {
        await watchLocation();
      }
      // モーダル非表示
      setModalVisible(false);
    }
  };

  /************************************************
   * 戻るボタン
   ************************************************/
  const btnBack = async () => {
    await logUserAction('ボタン押下:戻る');
    await logScreen(`画面遷移: ${sourceScreenId}`);
    navigation.navigate(sourceScreenId as 'WA1030' | 'WA1040');
  };

  /************************************************
   * ボタン表示・非表示判断
   ************************************************/
  const getButtonStyle = (isBtn: number) => {
    if (isBtn === 1) {
      return isDisabled
        ? [styles.button, styles.settingButton, styles.settingButtonDisabled]
        : [styles.button, styles.settingButton, styles.settingButton1];
    } else {
      return isDisabled
        ? [styles.button, styles.settingButton, styles.settingButtonDisabled]
        : [styles.button, styles.settingButton, styles.settingButton];
    }
  };
  const getTextStyle = () => {
    return isDisabled
      ? [styles.endButtonText, styles.settingButtonText1]
      : [styles.endButtonText];
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

  /************************************************
   * settings のキーと値をループで表示するための関数
   ************************************************/
  const renderSettings = () => {
    const realm = getInstance();
    const settings = realm.objects('settings')[0];
    return settings
      ? Object.entries(settings).map(([key, value]) => (
          <Text
            key={key}
            style={styles.fontAndColor}>{`${key}：${value}`}</Text>
        ))
      : null;
  };

  return (
    <View style={styles.container}>
      {/* ヘッダ */}
      <Header title={'端末ID設定'} />

      {/* 中段 */}
      <View style={[styles.main, styles.topContent]}>
        <Text style={styles.labelTextSetting}>[アプリ情報]</Text>
        <Text style={[styles.labelTextSetting, styles.labelTextSettingDtl]}>
          アプリバージョン：{versionTt}
        </Text>
        <Text style={[styles.labelTextSetting, styles.labelTextSettingDtl]}>
          ビルドバージョン：{buildVersion}
        </Text>
        <Text style={[styles.labelTextSetting, styles.labelTextSettingDtl]}>
          端末ID：{revision}
        </Text>
        <Text style={styles.labelTextSetting}>[通信状態]</Text>
        <Text style={[styles.labelTextSetting, styles.labelTextSettingDtl]}>
          {sttCom}
        </Text>
        <Text style={styles.labelTextSetting}>[設定情報]</Text>
        <View style={styles.scrollContainer}>
          <ScrollView
            style={styles.scrollViewStyle}
            showsVerticalScrollIndicator={true}
            showsHorizontalScrollIndicator={true}
            horizontal={true}>
            <ScrollView>
              <View style={styles.innerScrollViewStyle}>
                {renderSettings()}
              </View>
            </ScrollView>
          </ScrollView>
        </View>
        <Text style={styles.labelTextSetting}>[ログ] {logCap}MB</Text>
      </View>

      {/* 下段 */}
      <View
        style={[
          styles.bottomSection,
          styles.settingMain,
          styles.justifyContentCenter,
        ]}>
        <TouchableOpacity
          style={getButtonStyle(1)}
          onPress={btnDelLog}
          disabled={isDisabled}>
          <Text style={getTextStyle()}>ログ消去</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={getButtonStyle(2)}
          onPress={btnUpLog}
          disabled={isDisabled}>
          <Text style={[styles.endButtonText, styles.settingButtonText1]}>
            ログ送信
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.settingButton, styles.settingButton3]}
          onPress={btnBack}>
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
