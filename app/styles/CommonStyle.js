/**
 * 共通_スタイルシート
 * 
 */
//styles/CommonStyle
import { StyleSheet } from 'react-native';

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
    padding: 15,
    backgroundColor: '#1E74BD', // ヘッダの背景色
    height: 60,
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
    borderRadius: 20,
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
  startButton: {
    backgroundColor: '#70AD47', // 抹茶色（エクセルの淡い黄緑）
    padding: 10,
    flex: 1,
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
    height: 30,
  },
  serverNameText: {
    textAlign: 'left',
  },
  copyrightText: {
    textAlign: 'right',
  },  
});
