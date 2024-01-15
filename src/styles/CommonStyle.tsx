/**-------------------------------------------
 * 共通_スタイルシート
 * styles/CommonStyle.tsx
 * ---------------------------------------------*/
import { StyleSheet } from 'react-native';
// import StyleSheet from "react-native-rem-stylesheet";
// 基準サイズ
const baseSize = 16;

export const styles = StyleSheet.create({
  fontAndColor:{
    color: '#000',
    fontFamily:"ipaexg",
  },
  //--------メイン--------
  container: {
    flex: 1,
    justifyContent: 'space-between', // 3つのセクションを縦に均等に配置
    backgroundColor: '#fff', // 背景色は白
  },
  containerWithKeybord: {
    justifyContent: 'center' ,
    backgroundColor: '#fff', // 背景色は白
  },  
  main:{
    marginRight:30,
    marginLeft:30,
  },
  textareaContainer:{
    marginRight:10,
    marginLeft:10,
  },
  textareaContainerSecond:{
    maxHeight:"20%"
  },  
  middleContent: {
    flex: 1,
    justifyContent: 'center',
  },  
  topContent: {
    flex: 1,
 //   justifyContent: 'center',
  }, 
  centerContent:{
    textAlign:'center',
  },  
  bottomContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },  
  center:{
    alignItems: 'center',
    justifyContent: 'center', // 子要素を垂直方向に中央揃え    
  },
  middleContainer:{
    paddingTop:10,
  },
  narrow:{
    marginTop:-20,
    marginBottom:-20,
  },  
  //--------------------  
  //--------ヘッダ--------
  headerContainer: {
    padding: 5,
    backgroundColor: '#1E74BD', // ヘッダの背景色
    height: 40,
    zIndex:1,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontFamily:"ipaexg",
  },
  //--------------------
  //--------機能ヘッダ--------
  functionHeaderContainer: {
    padding: 5,
    flexDirection: 'row',
    flexWrap: 'wrap', // 子要素が親要素の幅を超えたら折り返す
    justifyContent: 'space-between',  
    alignItems: 'center',      
    backgroundColor: '#1E74BD', // ヘッダの背景色
    height: 40,
    zIndex:1,
  },
  functionHeaderLeft: {
    fontSize: 16,
    marginLeft: 10, // 適切な余白を設定
    color: 'white',
    fontWeight: 'bold',
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    flex: 1, // この行を追加
    textAlign: 'left', // 左寄せ
    fontFamily:"ipaexg",
  },
  functionHeaderMiddle: {
    fontSize: 20,
    alignSelf: 'center',
    color: 'white',
    fontWeight: 'bold',
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    flex: 1, // この行を追加
    textAlign: 'center', // 中央寄せ    
    fontFamily:"ipaexg",
  },
  functionHeaderRight: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    flex: 1, // この行を追加
    textAlign: 'right', // 右寄せ
    fontFamily:"ipaexg",
  },
  //--------------------  
  //--------ラベル-------
  labelText: {
    fontSize: 15,
    marginTop: 10,
    marginBottom: 5,
    fontFamily:"ipaexg",
    color:'#000'
  },
  labelTextPlace: {
    marginLeft: 75,
    fontFamily:"ipaexg",
  },
  alignRight: {
    textAlign:"right",
  },
  alignLeft: {
    textAlign:"left",
  },  
  labelTextNarrow: {
    fontSize: 15,
    marginTop: 2,
    marginBottom: 5,
    fontFamily:"ipaexg",
    color:'#000'
  },
  labelTextNarrowMore: {
    fontSize: 15,
    marginTop: 0,
    marginBottom: 0,
    fontFamily:"ipaexg",
    color:'#000'
  },  
  //--------------------
  //--------テキスト-------
  inputContainer: {
    alignItems: 'center',
    flexDirection: 'row', // 子要素を横並びにする
    justifyContent: 'center', // 子要素を親要素の左端に揃える
  },
  inputWithText: {
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
    fontFamily:"ipaexg",
    color:'#000',
  },  
  input: {
    borderWidth: 1, // 枠線の幅
    borderColor: 'black', // 枠線の色
    padding: 10,
    height: 40, 
    minWidth: 200, // テキストボックスの最小幅
    textAlign: 'center',
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
  },
  inputNarrow: {
    borderWidth: 1, // 枠線の幅
    borderColor: 'black', // 枠線の色
    padding: 0,
    height: 20,
    minWidth: 200, // テキストボックスの最小幅
    textAlign: 'center',
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
  },
  inputWhite:{
    backgroundColor: 'white',    
  },
  inputDisabled: {
    backgroundColor: '#ccc', // 無効化したときの背景色
  },
  textArea: {
    // テキストエリアのスタイル
    height: 100, // 高さを設定
    width: '100%', // 幅を親要素に合わせて設定
    borderColor: 'black', // 枠線の色
    borderWidth: 1, // 枠線の太さ
    padding: 5, // 内側の余白
    textAlignVertical: 'top', // Androidの場合はテキストを上に揃えます
  },
  textAreaInput: {
    flex: 1,
    textAlignVertical: 'top',
    padding: 5,
    width: '100%', // 幅を親要素に合わせて設定
    borderColor: 'black', // 枠線の色
    borderWidth: 1, // 枠線の太さ
  },
  inputWt: {
    borderWidth: 1,
    borderColor: 'black',
    height: 40, // テキストサイズに適したサイズに
    flex: 1, // これにより、各入力が兄弟要素との関係でフレックスします
    textAlign: 'center',
    // その他必要に応じたスタイル
  },
  // 小数入力と小数点のためのコンテナのスタイル
  decimalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // その他必要に応じたスタイル
  },

  // 小数点のスタイル
  dotStyle: {
    fontSize: 15,
    marginHorizontal: 5,
  },

  // 小数入力のためのスタイルを調整
  inputDs: {
    borderWidth: 1,
    borderColor: 'black',
    height: 40, // テキストサイズに適したサイズに
    flex: 1, // これにより、各入力が兄弟要素との関係でフレックスします
    textAlign: 'center',
    // その他必要に応じたスタイル
  },
  inputIntDecNarrow: {
    borderWidth: 1,
    borderColor: 'black',
    height: 30, // テキストサイズに適したサイズに
    flex: 1, // これにより、各入力が兄弟要素との関係でフレックスします
    textAlign: 'center',
    padding:0,
    maxWidth:50,
    // その他必要に応じたスタイル
  },  

  //--------------------
  //--------テキスト-------
  inputReasonContainer: {
    maxHeight: 200, // コンテナの最大高さを設定
    padding: 10,
  },
  inputReasonScrollContainer: {
    flex: 1,
    maxHeight: "100%", // ScrollViewの最大高さを設定
    width: '100%', // スクロールビューの幅を親要素に合わせる
    padding: 10,
  },
  
  inputReasonScrollViewStyle: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  
  inputReason: {
    height: 100, // TextInputの高さを固定値に設定
    textAlignVertical: 'top', // 複数行のテキストを上から表示
    fontFamily: "ipaexg", // フォントファミリー
  },
  memoScrollContainer:{
    borderColor: 'black',
    borderWidth: 1,
    padding:1,
  },
  memoScroll:{
    height: 200, 
    overflow: 'hidden'
  },
  memo: {
    textAlignVertical: 'top',
    padding: 5,
  },
  
  
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
  buttonNarrow: {
    backgroundColor: '#548236', // パステルな水色
    padding: 5,
    margin: 5,
    borderRadius: 15,
    height: 60,
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
    width:'45%'
  },
  buttonMoreNarrow: {
    backgroundColor: '#548236', // パステルな水色
    padding: 1,
    borderRadius: 5,
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
    width:'35%'
  },
  button50: {
    maxWidth:'50%',
  },
  buttonNarrower: {
    backgroundColor: '#548236', // パステルな水色
    padding: 5,
    margin: 0,
    borderRadius: 15,
    height: 50,
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
    width:'45%'
  },  
  buttonRead: {
    marginRight:'10%',
    marginLeft:'10%',
  },  
  buttonSmall: {
    marginRight:'20%',
    marginLeft:'20%',
  },
  buttonText: {
    fontSize: 20,
    color: 'white',
    fontFamily:"ipaexg",
  },
  buttonTextNarrow: {
    fontSize: 15,
    color: 'white',
    fontFamily:"ipaexg",
  },  
  centerButton:{
    alignItems: 'center', // 子要素を水平方向に中央揃え
    margin: 20,
  },
  centerButtonNarrow:{
    alignItems: 'center', // 子要素を水平方向に中央揃え
  },  
  dummyTagButton:{
    backgroundColor: '#7030a0',
  },
  allCancelButton:{
    backgroundColor:'#bb8b38',
    fontSize: 15,
    padding:5,
  },
  startButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',    
    fontFamily:"ipaexg",
  },
  endButtonText: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily:"ipaexg",
  },
  detailButtonText: {
    fontSize: 15,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily:"ipaexg",
  },
  settingButtonText: {
    color: 'white',
  },  
  endButton: {
    backgroundColor: '#F1D2C1',
    padding: 5,
    flex: 1,
    maxWidth:"50%",
  },
  destroyButton: {
    backgroundColor: '#F1D2C1',
    padding: 5,
    flex: 1,
    maxWidth:"15%",
  },  
  endButtonSmall: {
    backgroundColor: '#F1D2C1',
    padding: 5,
    height:50,
    width:"48%"
  },  
  startButton: {
    backgroundColor: '#1e74bd', 
    padding: 10,
    flex: 1,
  },
  detailButton: {
    margin: 5,
    marginLeft: 20,
    borderRadius: 10,
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
    backgroundColor: '#d9d9d9', 
    padding: 10,
    flex: 1,
  },
  detailButtonNarrow: {
    margin: 5,
    marginLeft: 30,
    borderRadius: 10,
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
    backgroundColor: '#d9d9d9', 
    padding: 5,
    flex: 1,
  },
  updateButton:{
    backgroundColor: '#1e74bd', 
  },
  popupCloseButton: {
    height:"10%",
    backgroundColor: '#1e74bd', 
    color:"#FFF",
  },  
  buttonHalf: {    
    width:"50%",
  },
  buttonMaxHalf: {    
    maxWidth:"50%",
  },
  updownMargin:{
    marginTop:10,
    marginBottom:10,
  },
  textBlack:{
    color:'black',
    fontFamily:"ipaexg",    
  },
  //--------------------
  //--------カメラ-------
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshair: {
    position: 'absolute',
    width: 2,
    height: '30%',
    backgroundColor: 'white',
    opacity: 0.5, //透明度50%
  },
  crosshairHorizontal: {
    position: 'absolute',
    width: '40%',
    height: 2,
    backgroundColor: 'white',
    opacity: 0.5, //透明度50%
  },
  camera: {
    flex: 1,
  },
  cameraBottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 5,
    zIndex:1,
    backgroundColor: "#000"
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
    backgroundColor: '#548236', // パステルな水色
    marginBottom: 2,
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
    fontFamily:"ipaexg",
  }, 
  menuButtonText2: {
    fontSize: 18,
    color: 'black',
    fontFamily:"ipaexg",
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
    backgroundColor: '#1e74bd', // パステルな水色
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
    fontFamily:"ipaexg",
  },
  labelTextSetting: {
    fontSize: 15,
    marginTop:1,
    marginBottom:1,
    fontFamily:"ipaexg",
    color:"#000"
  },  
  labelTextSettingDtl: {
    marginLeft: 10,
    fontFamily:"ipaexg",
  }, 
  scrollContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:3,
    marginBottom:3,
  },
  scrollContainerSecond: {
    maxHeight:"30%"
  },  
  scrollViewStyle: {
    width: 'auto', // または必要な幅に設定
    maxWidth:'100%',
    minWidth: '90%', // または必要な幅に設定
    borderWidth: 1, // 枠線の幅
    borderColor: '#000', // 枠線の色
    borderRadius: 5, // 枠の角を丸くする場合
    paddingLeft:5,
    paddingRight:5,
    minHeight: '80%',
  },
  scrollPushSection: {
    flex:1,
    justifyContent: 'flex-start',
  },
  scrollPushContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:3,
    marginBottom:3,
    minHeight: 220,
    maxHeight: 220,
  },
  scrollPushContainerNarrow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:3,
    marginBottom:3,
    minHeight: 120,
    maxHeight: 120,
  },  
  scrollPushViewStyle: {
    width: 'auto', // または必要な幅に設定
    maxWidth:'100%',
    minWidth: '90%', // または必要な幅に設定
    borderWidth: 1, // 枠線の幅
    borderColor: '#000', // 枠線の色
    borderRadius: 5, // 枠の角を丸くする場合
    paddingLeft:5,
    paddingRight:5,
  },  
  scrollViewStyleSecond: {
    height:"30%"
  },    
  scrollViewStyleTop: {
  },  
  innerScrollViewStyle: {
    width: "100%", // または必要な幅に設定
  },
  //--------------------  
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 5,
    zIndex:1,
  },
  detailSection: {
    padding: 5,
    flexDirection: 'row',
    // justifyContent: 'space-around',
     justifyContent: 'center', // 子要素を垂直方向に中央揃え
     alignItems: 'center', // 子要素を水平方向に中央揃え
  },  
  bottomSectionNarrow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center', // 子要素を水平方向に中央揃え
    paddingBottom: 5,
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
  //--------------------    
  //--------テーブル-------
  tableMain: {
    width: '100%', // テーブルの幅を指定
    // 他のスタイル
  },
  tableRow: {
    flexDirection: 'row', // 行のスタイル
  },
  tableCell: {
    flex: 1, // セルのスタイル
  },
  tableCell1: {
    flex: 1, // セルのスタイル
  },
  tableCell2: {
    flex: 2, // セルのスタイル
  },    
  tableCell3: {
    flex: 3, // セルのスタイル
  },    
  tableCell4: {
    flex: 4, // セルのスタイル
  },    
  tableCell5: {
    flex: 5, // セルのスタイル
  },    
  checkBox: {
    transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] // 1.5倍に拡大
  },
  disabled: {
    color: '#ccc', // 無効化したときの背景色
  },
  //--------------------    
  //--------PICKER-------
  pickerContainer:{
    alignItems: 'center', // 子要素を水平方向に中央揃え
    flexDirection: 'row', // 子要素を横並びにする
  },
  pickerStyle:{
    borderWidth: 1, // 枠線の幅
    borderColor: 'black', // 枠線の色
    height:30,
    marginTop:  -12,
    marginBottom: -12,

  },
  pickerFixStyle:{
    borderWidth: 1, // 枠線の幅
    borderColor: 'black', // 枠線の色
    height:30,

  },  
  pickerLabelText: {
    marginEnd: 10, // ピッカーとの間隔を設定    
    fontSize: 15,
    marginTop: 10,
    marginBottom: 5,
    fontFamily:"ipaexg",
    color:'#000'
  },
  checkboxContainer:{
    flexDirection: 'row',
    alignItems: 'center', // 子要素を垂直方向に中央揃えにする
    justifyContent: 'flex-start', // 子要素を水平方向に左揃えにする
  },
  inputLabelText: {
    //height: 30, // ラベルの高さをピッカーと同じにする
    //lineHeight: 30, // テキストをラベルの高さの中央に揃える
    marginEnd: 10, // ピッカーとの間隔を設定    
    fontSize: 15,
    marginTop: 10,
    marginBottom: 5,
    fontFamily:"ipaexg",
    color:'#000'
  },
  //--------------------    
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
  //--------------------    
  //--------ポップアップ-------  
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 透明度を持たせた黒でオーバーレイ
  },
  modalView: {
    height:"90%",
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,    
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButtonBottom: {
    marginTop: 20,
    padding: 10,
  },
  modalInputView: {
    height:180,
    width: '80%',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 10,    
  },  
  //--------------------    
  //--------カスタムアラート-------
  block: {
    width: 10, // 四角形の幅
    height: 10, // 四角形の高さ
    borderColor: 'black', // 枠線の色
    borderWidth: 1, // 枠線の太さ  
  },
  //--------------------    
  //--------カスタムアラート-------
  alertView: {
    width:'50%',
    backgroundColor: "#f2f2f2",
  },
  alertButtonContainer: {
    borderTopColor: '#000', // ボーダーの色をグレーに設定
    borderTopWidth: 1, // ボーダーの太さを1に設定
    flexDirection: 'row',
    alignItems: "center",
  },
  alertButton: {
    flex: 1,// ボタンに利用可能なスペースを等分に使用
    borderRadius: 7,
    padding: 10,
    margin:1,
    marginLeft:2,
    marginRight:2,
    width:'45%',
  },
  alertButtonCancel: {
    backgroundColor: "#f1d2c1", // 薄いピンク    
  },
  alertButtonConfirm: {
    backgroundColor: "#007AFF", // 青色    
  },
  alertTitleBar: {
    backgroundColor: '#1e74bd', // 青色
    height: 40,
    padding: 10,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    justifyContent: 'center', 
  },
  alertTitle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily:"ipaexg",
  },
  alertMessage: {
    fontFamily:"ipaexg",
    color: "black", // テキストが黒色の場合
    paddingTop: 5,
    paddingBottom: 40,
    fontWeight: "bold",
    textAlign: "center",
  },  
  alertTextConfirm: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily:"ipaexg",
  },  
  alertTextCancel: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily:"ipaexg",
  },
  //--------------------        
  //--------色--------  
  bgYellow: {
    backgroundColor: 'yellow'
  },  
  //--------------------        
  //--------フッタ--------
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#000', // フッターの背景色
    zIndex:2,
  },
  footerText: {
    fontSize: 15,
    color: '#fff',
    height: 20,
    fontFamily:"ipaexg",
  },
  serverNameText: {
    textAlign: 'left',
  },
  copyrightText: {
    textAlign: 'right',
  },  
  //--------------------    
});
