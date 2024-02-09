/**-------------------------------------------
 * 共通_スタイルシート
 * styles/CommonStyle.tsx
 * ---------------------------------------------*/
// import { StyleSheet } from 'react-native';
import StyleSheet from 'react-native-rem-stylesheet';
import {Dimensions} from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export const styles = StyleSheet.create({
  fontAndColor: {
    color: '#000',
    fontFamily: 'ipaexg',
  },
  //--------メイン--------
  container: {
    flex: 1,
    justifyContent: 'space-between', // 3つのセクションを縦に均等に配置
    backgroundColor: '#fff', // 背景色は白
  },
  containerWithKeybord: {
    justifyContent: 'center',
    backgroundColor: '#fff', // 背景色は白
  },
  main: {
    marginRight: 20,
    marginLeft: 20,
  },
  textareaContainer: {
    marginRight: 10,
    marginLeft: 10,
  },
  textareaContainerSecond: {
    maxHeight: windowWidth * 0.2,
  },
  middleContent: {
    flex: 1,
    justifyContent: 'center',
  },
  topContent: {
    flex: 1,
    //   justifyContent: 'center',
  },
  centerContent: {
    textAlign: 'center',
  },
  bottomContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
  },
  left: {
    alignItems: 'left',
    justifyContent: 'left', // 子要素を垂直方向に中央揃え
  },
  middleContainer: {
    paddingTop: 10,
  },
  narrow: {
    marginTop: -20,
    marginBottom: -20,
  },
  //--------------------
  //--------ヘッダ--------
  headerContainer: {
    padding: 5,
    backgroundColor: '#1E74BD', // ヘッダの背景色
    height: 25,
    zIndex: 1,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'ipaexg',
  },
  //--------------------
  //--------機能ヘッダ--------
  functionHeaderContainer: {
    padding: 2,
    flexDirection: 'row',
    flexWrap: 'wrap', // 子要素が親要素の幅を超えたら折り返す
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E74BD', // ヘッダの背景色
    height: 25,
    zIndex: 1,
  },
  functionHeaderLeft: {
    fontSize: 13,
    marginLeft: 5, // 適切な余白を設定
    color: 'white',
    fontWeight: 'bold',
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    flex: 1, // この行を追加
    textAlign: 'left', // 左寄せ
    fontFamily: 'ipaexg',
  },
  functionHeaderMiddle: {
    fontSize: 15,
    alignSelf: 'center',
    color: 'white',
    fontWeight: 'bold',
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    flex: 1, // この行を追加
    textAlign: 'center', // 中央寄せ
    fontFamily: 'ipaexg',
  },
  functionHeaderRight: {
    fontSize: 13,
    marginRight: 5, // 適切な余白を設定
    color: 'white',
    fontWeight: 'bold',
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    flex: 1, // この行を追加
    textAlign: 'right', // 右寄せ
    fontFamily: 'ipaexg',
  },
  //--------------------
  //--------ラベル-------
  labelText: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 3,
    fontFamily: 'ipaexg',
    color: '#000',
  },
  marginLeft: {
    marginLeft: -5,
  },
  labelCheck: {
    fontSize: 14,
  },
  bold: {
    fontWeight: 'bold',
  },
  labelTextPlace: {
    marginLeft: 70,
    fontFamily: 'ipaexg',
  },
  alignRight: {
    textAlign: 'right',
  },
  alignLeft: {
    textAlign: 'left',
  },
  justifyContentCenter: {
    justifyContent: 'center', // 子要素を親要素の中央に揃える
  },
  labelTextNarrow: {
    fontSize: 14,
    marginTop: 2,
    marginBottom: 3,
    fontFamily: 'ipaexg',
    color: '#000',
  },
  labelTextNarrowMore: {
    fontSize: 14,
    marginTop: 0,
    marginBottom: 0,
    fontFamily: 'ipaexg',
    color: '#000',
  },
  labelSmall: {
    fontSize: 10,
  },
  //--------------------
  //--------テキスト-------
  inputContainer: {
    alignItems: 'center',
    flexDirection: 'row', // 子要素を横並びにする
    justifyContent: 'center', // 子要素を親要素の中央に揃える
  },
  inputContainerLeft: {
    alignItems: 'center',
    flexDirection: 'row', // 子要素を横並びにする
    justifyContent: 'left', // 子要素を親要素の左端に揃える
  },
  inputWithText: {
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
    fontFamily: 'ipaexg',
    color: '#000',
    fontSize: 14,
  },
  input: {
    fontSize: 14,
    borderWidth: 1, // 枠線の幅
    borderColor: 'black', // 枠線の色
    padding: 0,
    height: 25,
    width: windowWidth * 0.5, // テキストボックスの最小幅
    textAlign: 'center',
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
  },
  inputNarrow: {
    fontSize: 14,
    borderWidth: 1, // 枠線の幅
    borderColor: 'black', // 枠線の色
    padding: 0,
    height: 20,
    minWidth: windowWidth * 0.5, // テキストボックスの最小幅
    textAlign: 'center',
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
  },
  inputWhite: {
    backgroundColor: 'white',
  },
  inputDisabled: {
    backgroundColor: '#ccc', // 無効化したときの背景色
  },
  textArea: {
    // テキストエリアのスタイル
    height: 100, // 高さを設定
    width: windowWidth, // 幅を親要素に合わせて設定
    borderColor: 'black', // 枠線の色
    borderWidth: 1, // 枠線の太さ
    padding: 5, // 内側の余白
    textAlignVertical: 'top', // Androidの場合はテキストを上に揃えます
  },
  textAreaInput: {
    flex: 1,
    textAlignVertical: 'top',
    padding: 5,
    // width: windowWidth, // 幅を親要素に合わせて設定
    borderColor: 'black', // 枠線の色
    borderWidth: 1, // 枠線の太さ
  },
  textAreaInput09: {
    flex: 1,
    textAlignVertical: 'top',
    padding: 5,
    width: windowWidth * 0.9, // 幅を親要素に合わせて設定
    borderColor: 'black', // 枠線の色
    borderWidth: 1, // 枠線の太さ
  },
  inputWt: {
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'black',
    height: 30, // テキストサイズに適したサイズに
    flex: 1, // これにより、各入力が兄弟要素との関係でフレックスします
    textAlign: 'center',
    padding: 0,
  },
  // 小数入力と小数点のためのコンテナのスタイル
  decimalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 小数点のスタイル
  dotStyle: {
    fontSize: 15,
    marginHorizontal: 5,
  },

  // 小数入力のためのスタイルを調整
  inputDs: {
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'black',
    height: 30, // テキストサイズに適したサイズに
    flex: 1, // これにより、各入力が兄弟要素との関係でフレックスします
    textAlign: 'center',
    padding: 0,
  },
  inputIntDecNarrow: {
    borderWidth: 1,
    borderColor: 'black',
    height: 30, // テキストサイズに適したサイズに
    flex: 1, // これにより、各入力が兄弟要素との関係でフレックスします
    textAlign: 'center',
    padding: 0,
    maxWidth: 50,
  },

  //--------------------
  //--------テキスト-------
  inputReasonContainer: {
    maxHeight: 200, // コンテナの最大高さを設定
    padding: 10,
  },
  inputReasonScrollContainer: {
    flex: 1,
    padding: 10,
  },

  inputReasonScrollViewStyle: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },

  inputReason: {
    height: 100, // TextInputの高さを固定値に設定
    textAlignVertical: 'top', // 複数行のテキストを上から表示
    fontFamily: 'ipaexg', // フォントファミリー
  },
  memoScrollContainer: {
    borderColor: 'black',
    borderWidth: 1,
    padding: 1,
  },
  memoScrollSmallContainer: {
    borderColor: 'black',
    borderWidth: 1,
    padding: 1,
    flex: 1,
    maxHeight: 80,
  },
  memoScroll: {
    overflow: 'hidden',
  },
  memoScrollSmall: {
    overflow: 'hidden',
  },
  memo: {
    textAlignVertical: 'top',
    padding: 5,
  },
  red: {
    color: 'red',
  },

  //--------ボタン-------
  zIndex: {
    zIndex: 1,
  },
  button: {
    backgroundColor: '#548236', // パステルな水色
    padding: 5,
    margin: 5,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
    zIndex: 1,
  },
  buttonNarrow: {
    backgroundColor: '#548236', // パステルな水色
    padding: 5,
    margin: 5,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
    width: windowWidth * 0.4,
  },
  buttonMoreNarrow: {
    backgroundColor: '#548236', // パステルな水色
    padding: 1,
    borderRadius: 5,
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
    width: windowWidth * 0.35,
  },
  button50: {
    maxWidth: windowWidth * 0.5,
  },
  buttonNarrower: {
    backgroundColor: '#548236', // パステルな水色
    padding: 5,
    margin: 0,
    borderRadius: 10,
    height: 40,
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
    width: windowWidth * 0.4,
  },
  buttonRead: {
    marginRight: windowWidth * 0.15,
    marginLeft: windowWidth * 0.15,
  },
  buttonSmall: {
    marginRight: windowWidth * 0.2,
    marginLeft: windowWidth * 0.2,
  },
  buttonText: {
    fontSize: 15,
    color: 'white',
    fontFamily: 'ipaexg',
    fontWeight: 'bold',
  },
  buttonTextNarrow: {
    fontSize: 15,
    color: 'white',
    fontFamily: 'ipaexg',
    fontWeight: 'bold',
  },
  centerButton: {
    alignItems: 'center', // 子要素を水平方向に中央揃え
    margin: 20,
  },
  centerButtonNarrow: {
    alignItems: 'center', // 子要素を水平方向に中央揃え
  },
  dummyTagButton: {
    backgroundColor: '#7030a0',
  },
  allCancelButton: {
    backgroundColor: '#bb8b38',
    fontSize: 15,
    padding: 5,
  },
  startButtonText: {
    fontSize: 15,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'ipaexg',
  },
  endButtonText: {
    fontSize: 15,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'ipaexg',
  },
  detailButtonText: {
    fontSize: 15,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'ipaexg',
  },
  settingButtonText: {
    color: 'white',
  },
  endButton: {
    backgroundColor: '#F1D2C1',
    padding: 5,
    flex: 1,
    maxWidth: windowWidth * 0.5,
  },
  destroyButton: {
    backgroundColor: '#ffcbb3',
    padding: 5,
    flex: 1,
    maxWidth: windowWidth * 0.15,
  },
  endButtonSmall: {
    backgroundColor: '#F1D2C1',
    padding: 5,
    height: 40,
    width: windowWidth * 0.35,
  },
  startButton: {
    backgroundColor: '#1e74bd',
    padding: 10,
    flex: 1,
  },
  detailButton: {
    width: windowWidth * 0.2,
    height: 35,
    margin: 2,
    marginLeft: 10,
    borderRadius: 10,
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
    backgroundColor: '#d9d9d9',
    padding: 5,
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
  updateButton: {
    backgroundColor: '#1e74bd',
  },
  popupCloseButton: {
    height: windowWidth * 0.1,
    backgroundColor: '#1e74bd',
    color: '#FFF',
  },
  buttonHalf: {
    width: windowWidth * 0.5,
  },
  buttonMaxHalf: {
    maxWidth: windowWidth * 0.5,
  },
  updownMargin: {
    marginTop: 5,
    marginBottom: 5,
  },
  upMargin: {
    marginTop: 15,
  },
  textBlack: {
    color: 'black',
    fontFamily: 'ipaexg',
  },
  marginSide: {
    marginRight: windowWidth * 0.05,
    marginLeft: windowWidth * 0.05,
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
    height: windowWidth * 0.3,
    backgroundColor: 'white',
    opacity: 0.5, //透明度50%
  },
  crosshairHorizontal: {
    position: 'absolute',
    width: windowWidth * 0.3,
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
    zIndex: 1,
    backgroundColor: '#000',
  },
  //--------------------
  //--------メニュー-------
  menuMain: {
    flexDirection: 'row', // 子要素を横並びにする
    flexWrap: 'wrap', // 子要素が親要素の幅を超えたら折り返す
    justifyContent: 'flex-start', // 子要素を親要素の左端に揃える
    paddingTop: 10,
    paddingLeft: 40,
    paddingRight: 40,
  },
  menuButton: {
    width: windowWidth * 0.3,
    height: windowHeight * 0.12,
    backgroundColor: '#548236', // パステルな水色
    marginBottom: 2,
    padding: 15,
    borderRadius: 15,
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
    marginLeft: 2,
    marginRight: 2,
  },
  menuButtonText1: {
    fontSize: 15,
    color: 'white',
    fontFamily: 'ipaexg',
  },
  menuButtonText2: {
    fontSize: 15,
    color: 'black',
    fontFamily: 'ipaexg',
  },
  menuButton1: {
    backgroundColor: '#6f4b3e',
  },
  menuButton2: {
    backgroundColor: '#767171',
  },
  menuButton3: {
    backgroundColor: '#7b4d28',
  },
  menuButton4: {
    backgroundColor: '#8497b0',
  },
  menuButton5: {
    backgroundColor: '#c39143',
  },
  menuButton6: {
    backgroundColor: '#d0cece',
  },
  menuButton7: {
    backgroundColor: '#4e76ce',
  },
  menuButton8: {
    backgroundColor: '#2cae2c',
  },
  menuButton9: {
    backgroundColor: '#ffd966',
  },
  //--------------------
  //--------端末設定-------
  settingMain: {
    flexDirection: 'row', // 子要素を横並びにする
    flexWrap: 'wrap', // 子要素が親要素の幅を超えたら折り返す
    justifyContent: 'flex-start', // 子要素を親要素の左端に揃える
    paddingTop: 10,
    paddingLeft: 5,
    paddingRight: 5,
  },
  settingButton: {
    width: windowWidth * 0.4, // 画面幅の半分のサイズ
    height: 60,
    //★marginRight: 'auto', // 右のマージンを自動調整
    //marginLeft: 'auto', // 左のマージンを自動調整  },
    backgroundColor: '#1e74bd', // パステルな水色
    marginBottom: 5,
    padding: 0,
    borderRadius: 15,
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
  },
  popupSettingButton: {
    width: windowWidth * 0.3, // 画面幅の半分のサイズ
    height: 60,
    //★marginRight: 'auto', // 右のマージンを自動調整
    //marginLeft: 'auto', // 左のマージンを自動調整  },
    backgroundColor: '#1e74bd', // パステルな水色
    marginBottom: 5,
    padding: 0,
    borderRadius: 15,
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
  },
  settingButton1: {
    backgroundColor: '#fff2cc',
  },
  settingButton2: {
    backgroundColor: '#1e74bd',
  },
  settingButton3: {
    backgroundColor: '#f1d2c1',
  },
  settingButtonDisabled: {
    backgroundColor: '#ccc', // 無効化したときの背景色
    color: '#999', // 無効化したときのテキスト色
  },
  settingButtonText1: {
    color: 'white',
    fontFamily: 'ipaexg',
  },
  labelTextSetting: {
    fontSize: 14,
    marginTop: 1,
    marginBottom: 1,
    fontFamily: 'ipaexg',
    color: '#000',
  },
  labelTextSettingDtl: {
    marginLeft: 10,
    fontFamily: 'ipaexg',
  },
  scrollContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
    marginBottom: 3,
  },
  scrollContainerSecond: {
    maxHeight: windowWidth * 0.3,
  },
  scrollViewStyle: {
    maxWidth: windowWidth * 0.83,
    minWidth: windowWidth * 0.83, // または必要な幅に設定
    borderWidth: 1, // 枠線の幅
    borderColor: '#000', // 枠線の色
    borderRadius: 5, // 枠の角を丸くする場合
    paddingLeft: 5,
    paddingRight: 5,
  },
  scrollViewMiddleContentStyle: {
    maxWidth: windowWidth * 0.7,
    minWidth: windowWidth * 0.7, // または必要な幅に設定
    borderWidth: 1, // 枠線の幅
    borderColor: '#000', // 枠線の色
    borderRadius: 5, // 枠の角を丸くする場合
    paddingLeft: 5,
    paddingRight: 5,
  },
  scrollPushSection: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  scrollPushContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
    marginBottom: 3,
    minHeight: 220,
    maxHeight: 220,
  },
  scrollPushContainerNarrow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
    marginBottom: 3,
    minHeight: 140,
    maxHeight: 140,
  },
  scrollPushViewStyle: {
    //★width: 'auto', // または必要な幅に設定
    maxWidth: windowWidth,
    minWidth: windowWidth * 0.9, // または必要な幅に設定
    borderWidth: 1, // 枠線の幅
    borderColor: '#000', // 枠線の色
    borderRadius: 5, // 枠の角を丸くする場合
    paddingLeft: 10,
    paddingRight: 10,
  },
  scrollViewStyleSecond: {
    height: windowWidth * 0.3,
  },
  scrollViewStyleTop: {},
  innerScrollViewStyle: {
    width: windowWidth, // または必要な幅に設定
  },
  //--------------------
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 2,
    zIndex: 1,
  },
  detailSection: {
    padding: 0,
    flexDirection: 'row',
    // justifyContent: 'space-around',
    justifyContent: 'center', // 子要素を垂直方向に中央揃え
    alignItems: 'center', // 子要素を水平方向に中央揃え
  },
  detailSectionList: {
    padding: 0,
    flexDirection: 'row',
    // justifyContent: 'space-around',
    //justifyContent: 'center', // 子要素を垂直方向に中央揃え
    //alignItems: 'center', // 子要素を水平方向に中央揃え
  },
  bottomSectionNarrow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center', // 子要素を水平方向に中央揃え
    paddingBottom: 5,
  },
  // 送信ボタンが無効の時のスタイル
  disabledButton: {
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
    width: windowWidth * 0.8, // テーブルの幅を指定
    // 他のスタイル
  },
  tableMiddleContent1: {
    width: windowWidth * 0.78, // テーブルの幅を指定
    // 他のスタイル
  },
  tableMiddleContent2: {
    width: windowWidth * 0.75, // テーブルの幅を指定
    // 他のスタイル
  },
  tableMiddleContent3: {
    width: windowWidth * 0.73, // テーブルの幅を指定
    // 他のスタイル
  },
  tableMiddleContent4: {
    width: windowWidth * 0.4, // テーブルの幅を指定
    // 他のスタイル
  },
  tableRow: {
    flexDirection: 'row', // 行のスタイル
  },
  tableCell0_5: {
    flex: windowWidth * 0.5, // セルのスタイル
  },
  tableCell0_3: {
    flex: windowWidth * 0.3, // セルのスタイル
  },
  tableCell0_7: {
    flex: windowWidth * 0.7, // セルのスタイル
  },
  tableCell0_2: {
    flex: windowWidth * 0.2, // セルのスタイル
  },
  tableCell: {
    flex: 1, // セルのスタイル
  },
  tableCell08: {
    flex: 0.8, // セルのスタイル
  },
  tableCell07: {
    flex: 0.7, // セルのスタイル
  },

  tableCell03: {
    flex: 0.3, // セルのスタイル
  },
  tableCell1: {
    flex: 1,
  },
  tableCell2: {
    flex: 2,
  },
  tableCell3: {
    flex: 3,
  },
  tableCell4: {
    flex: 4,
  },
  tableCell5: {
    flex: 5,
  },
  checkBox: {
    transform: [{scaleX: 1.3}, {scaleY: 1.3}], // 1.5倍に拡大
  },
  disabled: {
    color: '#ccc', // 無効化したときの背景色
  },
  //--------------------
  //--------PICKER-------
  pickerContainer: {
    alignItems: 'center', // 子要素を水平方向に中央揃え
    flexDirection: 'row', // 子要素を横並びにする
  },
  pickerStyle: {
    borderWidth: 1, // 枠線の幅
    borderColor: 'black', // 枠線の色
    height: 28,
    marginTop: -12,
    marginBottom: -12,
  },
  pickerFixStyle: {
    borderWidth: 1, // 枠線の幅
    borderColor: 'black', // 枠線の色
    height: 28,
  },
  pickerLabelText: {
    marginEnd: 10, // ピッカーとの間隔を設定
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5,
    fontFamily: 'ipaexg',
    color: '#000',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center', // 子要素を垂直方向に中央揃えにする
    justifyContent: 'flex-start', // 子要素を水平方向に左揃えにする
  },
  centerContainer: {
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
    fontFamily: 'ipaexg',
    color: '#000',
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
    justifyContent: 'space-around',
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
    height: windowHeight * 0.8,
    width: windowWidth * 0.8,
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
    height: 180,
    width: windowWidth * 0.8,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 10,
  },
  //--------------------
  //--------WA1121用 四角-------
  block: {
    width: 25, // 四角形の幅
    height: 25, // 四角形の高さ
    borderColor: 'black', // 枠線の色
    borderWidth: 1, // 枠線の太さ
  },
  //--------------------
  //--------カスタムアラート-------
  alertView: {
    width: windowWidth * 0.5,
    backgroundColor: '#f2f2f2',
  },
  alertButtonContainer: {
    borderTopColor: '#000', // ボーダーの色をグレーに設定
    borderTopWidth: 1, // ボーダーの太さを1に設定
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertButton: {
    flex: 1, // ボタンに利用可能なスペースを等分に使用
    borderRadius: 7,
    padding: 10,
    margin: 1,
    marginLeft: 2,
    marginRight: 2,
    width: windowWidth * 0.45,
  },
  alertButtonCancel: {
    backgroundColor: '#f1d2c1', // 薄いピンク
  },
  alertButtonConfirm: {
    backgroundColor: '#007AFF', // 青色
  },
  alertTitleBar: {
    backgroundColor: '#1e74bd', // 青色
    height: 40,
    padding: 10,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'ipaexg',
  },
  alertMessage: {
    fontFamily: 'ipaexg',
    color: 'black', // テキストが黒色の場合
    paddingTop: 5,
    paddingBottom: 40,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  alertTextConfirm: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'ipaexg',
  },
  alertTextCancel: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'ipaexg',
  },
  //--------------------
  //--------色--------
  bgYellow: {
    backgroundColor: 'yellow',
  },
  //--------------------
  //--------カスタムコンボボックス--------
  containerCdi: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    height: 28,
  },
  inputCdi: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: 0,
  },
  iconCdi: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50, // ▼アイコンの横幅を広げる
  },
  iconTextCdi: {
    fontSize: 12, // アイコンサイズ調整が必要に応じて
  },
  modalOverlayCdi: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentCdi: {
    width: windowWidth * 0.7,
    backgroundColor: 'white',
    padding: 20,
    elevation: 5,
  },
  itemTextCdi: {
    padding: 10,
    fontSize: 16,
  },
  //--------------------
  //--------フッタ--------
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#000', // フッターの背景色
    padding: 2,
    zIndex: 2,
  },
  footerText: {
    color: '#fff',
    height: 20,
    fontFamily: 'ipaexg',
  },
  serverNameText: {
    paddingLeft: 5,
    padding: 1,
    fontSize: 15,
    textAlign: 'left',
  },
  copyrightText: {
    padding: 1,
    fontSize: 12,
    textAlign: 'right',
  },
  //--------------------
  //--------調整--------
  flex1: {
    flex: 1,
  },
  flexGrow1: {
    flexGrow: 1,
  },
  //--------------------
});
