/**-------------------------------------------
 * インターフェース定義
 * utils/type.tsx
 * ---------------------------------------------*/
/******************
 * Schemas
 ******************/
//設定ファイル
export interface Settings {
  id: number;
  appVer: string;
  settingFileDt: string;
  serverName: string;
  serverUrl: string;
  logTerm: number;
  logCapacity: number;
  locGetTerm: number;
  camTimeout: number;
  btnNewTagSoil: number;
  btnRefNewTagSoil: number;
  btnRefOldTagSoil: number;
  btnNewTagAsh: number;
  btnRefNewTagAsh: number;
  btnRefOldTagAsg: number;
  btnTrnCard: number;
  btnUnload: number;
  btnStat: number;
  reasonListOldTag: string;
  useMethodInnerBag: number;
  packTyp: number;
  kgThresSoil: number;
  kgThresAsh: number;
  radioThres: number;
  ldpRadioThres: number;
  ldpRadioThresMax: number;
  estRadioThres: number;
  radioConvFact: number;
  facArriveTerm: number;
  selPlants: number;
  thresPlants: number;
  selCombust: number;
  thresCombust: number;
  selSoil: number;
  thresSoil: number;
  selConcrete: number;
  thresConcrete: number;
  selAsphalt: number;
  thresAsphalt: number;
  selNoncombustMix: number;
  thresNoncombustMix: number;
  selAsbestos: number;
  thresAsbestos: number;
  selPlasterboard: number;
  thresPlasterboard: number;
  selHazard: number;
  thresHazard: number;
  selOutCombust: number;
  thresOutCombust: number;
  selOutNoncombust: number;
  thresOutNoncombust: number;
  selTmpCombust: number;
  thresTmpCombust: number;
  selTmpNoncombust: number;
  thresTmpCNoncombust: number;
  selAsh: number;
  thresAsh: number;
}
//ログイン情報
export interface Login {
  id: number;
  loginDt: string;
  comId: string;
  userId: string;
  wkplacTyp: number;
  wkplacId: string;
  fixPlacId: string;
  logoutFlg: number;
}
//ユーザ
export interface User {
  id: string;
  comId: string;
  comNm: string;
  userId: string;
  userNm: string;
}
//仮置場
export interface TemporaryPlaces {
  id: string;
  tmpPlacId: string;
  tmpPlacNm: string;
  delSrcTyp: number | null;
}
//保管場
export interface StoragePlaces {
  id: string;
  storPlacId: string;
  storPlacNm: string;
}
//定置場
export interface FixedPlaces {
  id: string;
  storPlacId: string | null;
  fixPlacId: string;
  fixPlacNm: string;
  facTyp: number | null;
  conTyp: number | null;
}
//定置場情報
export interface FixedPlacesInfo {
  id: string;
  useDt: string;
  storPlacId: string;
  fixPlacId: string;
  stySec: string;
  areNo: number;
}
//位置情報
export interface Position {
  id: string;
  schDt: Date;
  locDt: number;
  latitude: string;
  longitude: string;
  sndFlg: number;
  sndJsoIFA0110: string;
  sndJsonIFT0150: string;
  alrtCd: string;
}

/******************
 * KeyStore
 ******************/
//アクティベーション情報
export interface ActivationInfo {
  comId: string;
  trmId: string;
  apiKey: string;
  actKey: string;
  actFin: number;
}
//事業者ID
export interface ComId {
  comId: string;
}
//端末ID
export interface TrmId {
  trmId: string;
}
//端末APIキー
export interface ApiKey {
  apiKey: string;
}
//端末固有キー
export interface TrmKey {
  trmKey: string;
}
//バージョンアップ報告
export interface verUpRep {
  verUpRep: number;
}

/******************
 * Log
 ******************/
export interface FileEntry {
  path: string;
  isFile: () => boolean;
  ctime: Date;
  name: string;
}
/******************
 * screens
 ******************/
//WA1060
export interface WA1060WkPlacConst {
  idTyp: string; //ID種別
  wkplacId: string; //作業場所ID
  wkplacNm: string; //作業場所名
  delSrcTyp: string; //搬出元種別
  wkplac: string; //作業場所
}
export interface WA1060Const {
  tyRegDt: string; //紐付登録日時
  caLgSdBgWt: string; //重量
  caLgSdBgDs: string; //線量
  rmSolTyp: string; //去土壌等種別
  pkTyp: string; //荷姿種別
  usgInnBg: string; //内袋の利用方法
  tsuInd: string; //津波浸水域由来
  splFac: string; //特定施設由来
  usgAluBg: string; //アルミ内袋の有無
  yesNoOP: string; //オーバーパック有無
  estRa: string; //推定放射能濃度
}
export interface WA1060OldTagInfoConst {
  oldTag: string; //旧タグID
  genbaCheck: string; //現場確認
  tsuInd: string; //津波浸水
  splFac: string; //特定施設由来
  rmSolTyp: string; //去土壌等種別
  ocLndCla: string; //発生土地分類
  pkTyp: string; //荷姿種別
  usgInnBg: string; //内袋の利用方法
  usgInnBgNm: string; //内袋の利用方法名
  usgAluBg: string; //アルミ内袋の有無
  vol: string; //容積
  airDsRt: string; //空間線量率
  ocLndUseknd: string; //発生土地の利用区分
  ocloc: string; //発生場所
  rmSolInf: string; //備考(除去土壌情報)
  lnkNewTagDatMem: string; //除染時データメモ
}
//WA1070
export interface WA1070Const {
  head: {
    wkplcTyp: string;
    wkplc: string;
    newTagId: string;
  };
  data: {
    newTagId: string;
    rmSolTyp: number;
    pkTyp: number;
    splFac: number;
    tsuInd: number;
    usgInnBg: number;
    usgAluBg: number;
    yesNoOP: number;
    caLgSdBgWt: number;
    caLgSdBgDs: number;
    estRa: number;
    lnkNewTagDatMem?: string;
  };
  oldTag: {
    oldTagId: number;
    oldTagIdList: string[];
  };
}
//WA1080
export interface WA1080Const {
  head: {
    wkplcTyp: string;
    wkplc: string;
    oldTagId: string;
  };
  data: {
    rmSolTyp: number;
    weight?: string;
    airDsRt: number;
    rcvDt: string;
    splFac: number;
    tsuInd: number;
    pkTyp: number;
    usgInnBg: number;
    usgAluBg: number;
    vol: number;
    arNm: string;
    ocLndCla: number;
    ocLndUseknd: string;
    ocloc: string;
    rmSolInf: string;
    lnkNewTagDatMem: string;
  };
}
//WA1090
export interface WA1090WkPlacConst {
  idTyp: string; //ID種別
  wkplacId: string; //作業場所ID
  wkplacNm: string; //作業場所名
  delSrcTyp: string; //搬出元種別
  wkplac: string; //作業場所
}
export interface WA1091OldTagInfoConst {
  oldTagId: string; //旧タグID
  ashTyp: string; // 焼却灰種別、半角英数字
  meaRa: string; // 測定濃度（焼却時）、半角数値
  conRa: string; // 換算濃度（焼却時）、半角数値
  surDsRt: string; // 表面線量率（焼却時）、半角数値（オプショナル）
  surDsDt: string; // 表面線量率測定日（焼却時）、日付（オプショナル）
  surDsWt: string; // 表面線量率測定時重量（焼却時）、半角数値（オプショナル）
}
export interface WA1092WtDsConst {
  caLgSdBgWt: string; //重量
  caLgSdBgDs: string; //線量
}
//WA1100
export interface WA1100Const {
  head: {
    wkplcTyp: string;
    wkplc: string;
    newTagId: string;
  };
  data: {
    newTagId: string;
    oldTagId: string;
    tmpLocId: string;
    tmpLocNm: string;
    tyRegDt: string;
    lnkNewTagDatMem?: string;
    ashTyp: number;
    meaRa: number;
    surDsRt: number;
    surDsDt?: string | null;
    surDsWt: number;
    sndId?: string | null;
  };
}
//WA1110
export interface WA1110Const {
  head: {
    wkplcTyp: string;
    wkplc: string;
    oldTagId: string;
  };
  data: {
    ashTyp: number; // 焼却灰種別、半角英数字
    meaRa: number; // 測定濃度（焼却時）、半角数値
    conRa?: number; // 換算濃度（焼却時）、半角数値
    surDsRt: number | null; // 表面線量率（焼却時）、半角数値（オプショナル）
    surDsDt?: string | null; // 表面線量率測定日（焼却時）、日付（オプショナル）
    surDsWt: number | null; // 表面線量率測定時重量（焼却時）、半角数値（オプショナル）
  };
}
//WA1120
export interface WA1120Const {
  wkplcTyp: string;
  wkplc: string;
}
export interface WA1120WkPlacConst {
  //作業場所
  idTyp: string; //ID種別
  wkplacId: string; //作業場所ID
  wkplacNm: string; //作業場所名
  delSrcTyp: string; //搬出元種別
  wkplac: string; //作業場所
}
export interface WA1120CarConst {
  //車両
  idTyp: string; //ID種別
  carId: string; //車両ID
  carNm: string; //車両名称
  carNo: string; //車両番号
  maxWt: string; //最大積載量
  carWt: string; //車両重量
  empCarWt: string; //空車重量
}
export interface WA1120DrvConst {
  //運転手
  idTyp: string; //ID種別
  drvId: string; //運転手ID
  drvNm: string; //運転手名
}
export interface WA1120DestConst {
  //行先
  idTyp: string; //ID種別
  storPlacId: string; //保管場ID
  fixPlacId: string; //定置場ID
  fixPlacNm: string; //定置場名
  facTyp: string; //施設区分
  raKbn: string; //濃度区分
}
export interface WA1121NewTagConst {
  //新タグID情報
  newTagId: string; //新タグID
  rmSolTyp: string; //除去土壌等種別
  ashTyp: string; //焼却灰種別
  caLgSdBgWt: string; //重量
  caLgSdBgDs: string; //線量
  estRa: string; //濃度
  raKbn: string; //濃度区分
  class: string; //分類
  newTagIdRed: boolean; //新タグIDを赤文字にするかどうか
  caLgSdBgDsRed: boolean; //線量を赤文字にするかどうか
}
export interface WA1121DataConst<T> {
  freJudTyp: string; //フレコン判定種別
  freJudNen: string; //フレコン判定不燃可燃
  freJudGai: string; //フレコン判定有害無害
  freJudNod: string; //フレコン判定濃度
  freJudWt: string; //フレコン判定重量
  freTyp: string; //フレコン種別
  udNoMb: string; //高低濃度混載
  nenMb: string; //不燃可燃混載
  haiMb: string; //主灰飛灰混載
  monoTyp: string; //物品種類
  gai: string; //有害・無害
  trpCardTagInfoList: T[]; //輸送カード新タグID(配列)
  flamNm: string; //可燃
  nonFlamNm: string; //不燃
  bottomAshNm: string; //主灰
  flyAshNm: string; //飛灰
  surDsRt: string; //表面線量率(最大)
  maxEstRa: string; //放射能濃度(最大)
  possibleWt: string; //積載可能重量
  sumWt: string; //累計積載量
  trpCardApRslt: string; //輸送カード申請結果
  leftWt: string; //残り積載可能
}
export interface caLgSdBgDsInfoConst {
  //線量情報
  front: string; //放射線量 前
  back: string; //放射線量 後
  right: string; //放射線量 右
  left: string; //放射線量 左
}
//WA1130
export interface WA1130Const {
  facTyp: string; //施設区分
  trpStatus: string; //輸送ステータス区分
  newTagId: string;
  storPlacId: string; //保管場ID
  fixPlacId: string; //定置場ID
  wkplcTyp: string;
  wkplc: string;
  trpComId: string; //輸送事業者ID
  trpCrdNo: string; //輸送カード番号
  listNewTag: string[]; //新タグID一覧
}
//WA1140
export interface WA1140Const {
  newTagId: string;
  storPlacId: string; //保管場ID
  fixPlacId: string; //定置場ID
  wkplcTyp: string;
  wkplc: string;
  rmSolTyp: string;
  stySec: string;
  areNo: string;
  nos: string;
}

/******************
 * Api
 ******************/
// axiosレスポンス
export interface AxiosResponse<T> {
  data: T; // 実際の応答データ
  status: number; // HTTP ステータスコード
  statusText: string; // HTTP ステータステキスト
}
// IFレスポンスヘッダ
export interface ApiResponse<T> {
  success: boolean;
  error?: string | null;
  status?: number | null;
  code?: string | null;
  api?: string | null;
  data?: T | null;
}
// 各IFレスポンス
export interface IFA0030Response {
  sttCd: string;
  errCd?: string | null; // オプショナルでnullも許容
  rcvDt: string;
  isAppUpd: number;
  isSetUpd: number;
}
export interface IFA0110Response<T> {
  sttCd: string;
  errCd?: string | null; // オプショナルでnullも許容
  rcvDt: string;
  itcRstCd: number;
  gyDt: T; //jsonオブジェクト
}
export interface IFA0310Response<T> {
  sttCd: string;
  errCd?: string | null; // オプショナルでnullも許容
  rcvDt: string;
  cnt: number;
  dtl: T[]; // Detail型の配列
}
export interface IFA0310ResponseDtl {
  oldTagId: string;
  tmpLocId: string;
  tmpLocNm?: string | null;
  arNm: string;
  tsuInd: string;
  splFac: string;
  rmSolTyp?: string | null;
  ocLndCla: string;
  pkTyp: string;
  usgInnBg?: string | null;
  usgInnBgNm: string;
  usgAluBg?: string | null;
  vol?: number | null;
  airDsRt?: number | null;
  ocLndUseknd?: string | null;
  ocloc?: string | null;
  rmSolInf?: string | null;
  lnkNewTagDatMem?: string | null;
}
export interface IFA0320Response<T> {
  sttCd: string;
  errCd?: string | null; // オプショナルでnullも許容
  rcvDt: string;
  cnt: number;
  dtl: T[]; // Detail型の配列
}
export interface IFA0320ResponseDtl {
  oldTagId: string; // 旧タグID、全角混在が可能
  tmpLocId: string; // 仮置場ID、半角英数字
  tmpLocNm?: string | null; // 仮置場名、全角混在が可能（オプショナル）
  ashTyp: number; // 焼却灰種別、半角英数字
  meaRa: number; // 測定濃度（焼却時）、半角数値
  conRa?: number; // 換算濃度（焼却時）、半角数値
  surDsRt: number | null; // 表面線量率（焼却時）、半角数値（オプショナル）
  surDsDt?: string | null; // 表面線量率測定日（焼却時）、日付（オプショナル）
  surDsWt: number | null; // 表面線量率測定時重量（焼却時）、半角数値（オプショナル）
}
export interface IFA0330Response<T> {
  sttCd: string;
  errCd?: string | null; // オプショナルでnullも許容
  rcvDt: string;
  cnt: number;
  dtl: T[]; // Detail型の配列
}
export interface IFA0330ResponseDtl {
  newTagId: string;
  tmpLocId: string;
  tmpLocNm: string;
  oldTagId?: string | null; // オプショナルでnullも許容
  sitTagId?: string | null; // オプショナルでnullも許容
  twoOneTrOneBrNum: number;
  caLgSdBgWt: number;
  caLgSdBgDs: number;
  estRa: number;
  tyRegDt: string;
  pkTyp: number;
  yesNoOP: number;
  arNm: string;
  tsuInd: number;
  splFac: number;
  rmSolTyp: number;
  ocLndCla: number;
  usgInnBg: number;
  usgAluBg: number;
  vol: number;
  airDsRt: number;
  ocLndUseknd?: string | null; // オプショナルでnullも許容
  ocloc?: string | null; // オプショナルでnullも許容
  rmSolInf?: string | null; // オプショナルでnullも許容
  lnkNewTagDatMem?: string;
  sndId: string;
}
export interface IFA0340Response<T> {
  sttCd: string;
  errCd?: string | null; // オプショナルでnullも許容
  rcvDt: string;
  cnt: number;
  dtl: T[]; // Detail型の配列
}
export interface IFA0340ResponseDtl {
  newTagId: string;
  oldTagId: string;
  tmpLocId: string;
  tmpLocNm: string;
  tyRegDt: string;
  lnkNewTagDatMem?: string;
  ashTyp: number;
  meaRa: number;
  surDsRt: number;
  surDsDt?: string | null;
  surDsWt: number;
  sndId?: string | null;
}
export interface IFT0090Response<T> {
  sttCd: string;
  errCd?: string | null; // オプショナルでnullも許容
  rcvDt: string;
  datNum: string;
  itcRstCd: number;
  vldCnt: number;
  invCnt: number;
  invDatDtl: T[]; // Detail型の配列
}
export interface IFT0090ResponseDtl {
  sndId?: string | null;
  datElm?: string | null;
  invCd?: number | null;
}
export interface IFT0120Response<T1, T2> {
  sttCd: string;
  errCd?: string | null; // オプショナルでnullも許容
  rcvDt: string;
  datNum: string;
  yesNoAlt: number;
  altDatDtl: T1[]; // Detail型の配列
  itcRstCd: number;
  vldCnt: number;
  invCnt: number;
  invDatDtl: T2[]; // Detail型の配列
}
export interface IFT0120ResponseDtl1 {
  vclId?: string | null;
  sndId?: string | null;
  altCd?: number | null;
}
export interface IFT0120ResponseDtl2 {
  sndId?: string | null;
  datElm?: string | null;
  invCd?: number | null;
}
export interface IFT0130Response<T1, T2> {
  sttCd: string;
  errCd?: string | null; // オプショナルでnullも許容
  rcvDt: string;
  datNum: string;
  dtl: T1[];
  itcRstCd: number;
  vldCnt: number;
  invCnt: number;
  invDatDtl: T2[]; // Detail型の配列
}
export interface IFT0130ResponseDtl1 {
  crdNo: string;
  sndId: string;
  trpCdAplRst: number;
  yesNoAlt: number;
  altCd?: string | null;
}
export interface IFT0130ResponseDtl2 {
  sndId?: string | null;
  datElm?: string | null;
  invCd?: number | null;
}
export interface IFT0140Response<T> {
  sttCd: string;
  errCd?: string | null; // オプショナルでnullも許容
  rcvDt: string;
  datNum: string;
  itcRstCd: number;
  vldCnt: number;
  invCnt: number;
  invDatDtl: T[]; // Detail型の配列
}
export interface IFT0140ResponseDtl {
  sndId?: string | null;
  datElm?: string | null;
  invCd?: number | null;
}
export interface IFT0210Response<T> {
  sttCd: string;
  errCd?: string | null; // オプショナルでnullも許容
  rcvDt: string;
  cnt: string;
  dtl: T[]; // Detail型の配列
}
export interface IFT0210ResponseDtl {
  crdNo?: string | null;
  crdIsRlt: number;
}
export interface IFT0420Response<T> {
  sttCd: string;
  errCd?: string | null; // オプショナルでnullも許容
  rcvDt: string;
  datNum: string;
  itcRstCd: number;
  vldCnt: number;
  invCnt: number;
  invDatDtl: T[]; // Detail型の配列
}
export interface IFT0420ResponseDtl {
  sndId?: string | null;
  datElm?: string | null;
  invCd?: number | null;
}
export interface IFT0640Response<T> {
  sttCd: string;
  errCd?: string | null; // オプショナルでnullも許容
  rcvDt: string;
  cnt: number;
  dtl: T[]; // Detail型の配列
}
export interface IFT0640ResponseDtl<T> {
  trpComId: string;
  crdNo: string;
  tmpLocId: string;
  vclId: string;
  vclNum: string;
  drvId: string;
  drvName: string;
  stgLocId: string;
  acpSrtFctId: string;
  lgSdBgDtl: T[];
  vclRdtDsFr: string;
  vclRdtDsRe: string;
  vclRdtDsLe: string;
  vclRdtDsRi: string;
  lctRdtDsFr: string;
  lctRdtDsRe: string;
  lctRdtDsLe: string;
  lctRdtDsRi: string;
}
export interface IFT0640ResponseDtlDtl {
  newTagId: string;
  tagCol: string;
  rmSolTyp: string;
  caLgSdBgWt: string;
  caLgSdBgDs: string;
  radCon: string;
}
export interface IFT0640ResponseDtlDtlCheck {
  newTagId: string;
  tagCol: string;
  rmSolTyp: string;
  caLgSdBgWt: string;
  caLgSdBgDs: string;
  radCon: string;
  check: boolean;
}
