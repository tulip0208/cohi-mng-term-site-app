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
export interface TemporaryPlaces{
    id: string;
    tmpPlacId: string;
    tmpPlacNm: string;
    delSrcTyp: number|null;
}
//保管場
export interface StoragePlaces{
    id: string;
    storPlacId: string;
    storPlacNm: string;
}
//定置場
export interface FixedPlaces{
    id: string;
    storPlacId: string|null;
    fixPlacId: string;
    fixPlacNm: string;
    facTyp: number|null;
    conTyp: number|null;
}
//定置場情報
export interface FixedPlacesInfo{
    id: string;
    useDt: string;
    storPlacId: string;
    fixPlacId: string;
    stySec: string;
    areNo: number;    
}
//位置情報
export interface Position{
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
    actExpDt: string;
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
export interface WA1070Const{
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
}

/******************
 * Api
 ******************/
// axiosレスポンス
export interface AxiosResponse<T>{
    data: T; // 実際の応答データ
    status: number; // HTTP ステータスコード
    statusText: string; // HTTP ステータステキスト
}
// IFレスポンスヘッダ
export interface ApiResponse<T>{
    success : boolean;
    error? : string | null;
    status? : number | null;
    code? : string | null;
    api? : string | null;
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
export interface IFA0050Response {

}
export interface IFA0330Response {
    sttCd: string;
    errCd?: string | null; // オプショナルでnullも許容
    rcvDt: string;
    cnt: number;
    dtl: IFA0330ResponseDtl[]; // Detail型の配列
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
