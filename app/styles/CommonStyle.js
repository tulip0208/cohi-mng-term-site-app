/**
 * 共通_スタイルシート
 * 
 */
//styles/CommonStyle
import { StyleSheet } from 'react-native';
// 基準サイズ
const baseSize = 16;

// ピクセルをremに変換する関数
const rem = (px) => px / baseSize;

export const styles = StyleSheet.create({
  //--------メイン--------
  container: {
    flex: 1,
    justifyContent: 'space-between', // 3つのセクションを縦に均等に配置
    backgroundColor: '#fff', // 背景色は白
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  main:{
    marginRight:30,
    marginLeft:30,
  },
  middleContent: {
    flex: 1,
    justifyContent: 'center',
  },  
  topContent: {
    flex: 1,
 //   justifyContent: 'center',
  }, 
  //--------------------  
  //--------ヘッダ--------
  headerContainer: {
    padding: 5,
    backgroundColor: '#1E74BD', // ヘッダの背景色
    height: 40,
  },
  headerText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
  },
  //--------------------
  //--------ラベル-------
  labelText: {
    fontSize: 15,
    marginTop: 10,
    marginBottom: 5,
  },
  //--------------------
  //--------ボタン-------
  button: {
    backgroundColor: '#548236', // パステルな水色
    padding: 5,
    margin: 5,
    borderRadius: 15,
    height: 60,
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
  },
  buttonText: {
    fontSize: 20,
    color: 'white',
  },  
  startButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',    
  },
  endButtonText: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  endButton: {
    backgroundColor: '#F1D2C1', // 淡いグレー
    padding: 5,
    flex: 1, // ボタンの幅を画面いっぱいに広げる
  },
  endButtonSmall: {
    backgroundColor: '#F1D2C1', // 淡いグレー
    padding: 5,
    height:50,
    width:"48%"
  },  
  startButton: {
    backgroundColor: '#70AD47', // 抹茶色（エクセルの淡い黄緑）
    padding: 10,
    flex: 1,
  },
  //--------------------
  //--------メニュー-------
  menuMain: {
    flexDirection: 'row', // 子要素を横並びにする
    flexWrap: 'wrap', // 子要素が親要素の幅を超えたら折り返す
    justifyContent: 'flex-start', // 子要素を親要素の左端に揃える
    paddingTop:10,
    paddingLeft:45,
    paddingRight:45,
  },
  menuButton: {
    width: '48%', // 画面幅の半分のサイズ
    height: 80,
    marginRight: 'auto', // 右のマージンを自動調整
    marginLeft: 'auto', // 左のマージンを自動調整  },
    backgroundColor: '#548236', // パステルな水色
    marginBottom: 5,
    padding: 15,
    borderRadius: 15,
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
    marginLeft:2,
    marginRight:2,
  },
  menuButtonText1: {
    fontSize: 18,
    color: 'white',
  }, 
  menuButtonText2: {
    fontSize: 18,
    color: 'black',
  }, 
  menuButton1:{
    backgroundColor: '#6f4b3e', 
  },
  menuButton2:{
    backgroundColor: '#767171', 
  },
  menuButton3:{
    backgroundColor: '#7b4d28', 
  },
  menuButton4:{
    backgroundColor: '#8497b0', 
  },
  menuButton5:{
    backgroundColor: '#c39143', 
  },
  menuButton6:{
    backgroundColor: '#d0cece', 
  },
  menuButton7:{
    backgroundColor: '#4e76ce', 
  },
  menuButton8:{
    backgroundColor: '#2cae2c', 
  },
  menuButton9:{
    backgroundColor: '#ffd966', 
  },                
  //--------------------
  //--------端末設定-------
  settingMain: {
    flexDirection: 'row', // 子要素を横並びにする
    flexWrap: 'wrap', // 子要素が親要素の幅を超えたら折り返す
    justifyContent: 'flex-start', // 子要素を親要素の左端に揃える
    paddingTop:10,
    paddingLeft:10,
    paddingRight:10,
  },
  settingButton: {
    width: '45%', // 画面幅の半分のサイズ
    height: 60,
    marginRight: 'auto', // 右のマージンを自動調整
    marginLeft: 'auto', // 左のマージンを自動調整  },
    backgroundColor: '#548236', // パステルな水色
    marginBottom: 5,
    padding: 0,
    borderRadius: 15,
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
  },
  settingButton1: {
    backgroundColor: '#fff2cc'
  },
  settingButton2: {
    backgroundColor: '#1e74bd'
  },
  settingButton3: {
    backgroundColor: '#f1d2c1'
  },
  settingButtonDisabled: {
    backgroundColor: '#ccc', // 無効化したときの背景色
    color: '#999', // 無効化したときのテキスト色
  },
  settingButtonText1: {
    color: 'white',
  },
  labelTextSetting: {
    fontSize: 15,
    marginTop:1,
    marginBottom:1,
  },  
  labelTextSettingDtl: {
    marginLeft: 10,
  }, 
  scrollContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:3,
    marginBottom:3,
  },
  scrollViewStyle: {
    width: '100%', // または必要な幅に設定
    borderWidth: 1, // 枠線の幅
    borderColor: '#000', // 枠線の色
    borderRadius: 5, // 枠の角を丸くする場合
    paddingLeft:5,
    paddingRight:5,
  },  
  //--------------------  
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 10,
  },
  // 送信ボタンが無効の時のスタイル
  disabledButton:{
    backgroundColor: '#ccc', // 無効化したときの背景色
    color: '#999', // 無効化したときのテキスト色
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  camera: {
    flex: 1,
  },


  //--------モーダル-------
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#00000040',
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    height: 100,
    width: 100,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  modalMessage: {
    textAlign: 'center',
  },
    
  //--------フッタ--------
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#000', // フッターの背景色
  },
  footerText: {
    fontSize: 15,
    color: '#fff',
    height: 20,
  },
  serverNameText: {
    textAlign: 'left',
  },
  copyrightText: {
    textAlign: 'right',
  },  
});
