/**-------------------------------------------
 * DB(realm)のスキーマ定義
 * utils/Schemas.tsx
 * ---------------------------------------------*/
/************************************************
 * 設定ファイルのスキーマ定義
 ************************************************/
export const settingsSchema: Realm.ObjectSchema = {
  name: 'settings',
  primaryKey: 'id',
  properties: {
    id: 'int', //ID 1固定
    appVer: 'string', //利用バージョン
    settingFileDt: 'string', //設定ファイル取得日時 YYYY/MM/DD hh:mm:ss
    serverName: 'string', //接続先名称
    serverUrl: 'string', //接続先URL
    logTerm: 'int', //ログファイル保持期間
    logCapacity: 'int', //ログファイル分割容量
    locGetTerm: 'int', //位置情報取得間隔(秒)
    camTimeout: 'int', //カメラタイムアウト時間(秒)
    btnNewTagSoil: 'int', //新タグ紐付(土壌) 0:不使用、1:使用
    btnRefNewTagSoil: 'int', //新タグ参照(土壌) 0:不使用、1:使用
    btnRefOldTagSoil: 'int', //旧タグ参照(土壌) 0:不使用、1:使用
    btnNewTagAsh: 'int', //新タグ紐付(灰) 0:不使用、1:使用
    btnRefNewTagAsh: 'int', //新タグ参照(灰) 0:不使用、1:使用
    btnRefOldTagAsg: 'int', //旧タグ参照(灰) 0:不使用、1:使用
    btnTrnCard: 'int', //輸送カード申請 0:不使用、1:使用
    btnUnload: 'int', //荷下登録 0:不使用、1:使用
    btnStat: 'int', //定置登録 0:不使用、1:使用
    reasonListOldTag: 'string', //旧タグ由来情報理由 旧タグ由来情報の理由をカンマ区切りで保存
    useMethodInnerBag: 'int', //内袋の利用方法(初期)
    packTyp: 'int', //荷姿種別(初期)
    kgThresSoil: 'int', //重量_閾値_除去土壌等
    kgThresAsh: 'int', //重量_閾値_焼却灰
    radioThres: 'int', //線量_閾値 JVシステムでは30
    ldpRadioThres: 'int', //荷台線量_閾値 JVシステムでは10
    ldpRadioThresMax: 'int', //荷台線量_上限閾値 JVシステムでは100
    estRadioThres: 'int', //推定放射能濃度_閾値
    radioConvFact: 'int', //放射能濃度換算係数
    facArriveTerm: 'int', //施設到着予定時間(分)
    selPlants: 'int', //草木類_段数
    thresPlants: 'int', //草木類_閾値
    selCombust: 'int', //可燃廃棄物_段数
    thresCombust: 'int', //可燃廃棄物_閾値
    selSoil: 'int', //土壌等_段数
    thresSoil: 'int', //土壌等_閾値
    selConcrete: 'int', //コン殻_段数
    thresConcrete: 'int', //コン殻_閾値
    selAsphalt: 'int', //アス混_段数
    thresAsphalt: 'int', //アス混_閾値
    selNoncombustMix: 'int', //不燃物・混合物_段数
    thresNoncombustMix: 'int', //不燃物・混合物_閾値
    selAsbestos: 'int', //石綿含有建材_段数
    thresAsbestos: 'int', //石綿含有建材_閾値
    selPlasterboard: 'int', //石膏ボード_段数
    thresPlasterboard: 'int', //石膏ボード_閾値
    selHazard: 'int', //危険物・有害物_段数
    thresHazard: 'int', //危険物・有害物_閾値
    selOutCombust: 'int', //屋外残置_可燃_段数
    thresOutCombust: 'int', //屋外残置_可燃_閾値
    selOutNoncombust: 'int', //屋外残置_不燃_段数
    thresOutNoncombust: 'int', //屋外残置_不燃_閾値
    selTmpCombust: 'int', //仮置場解体_可燃_段数
    thresTmpCombust: 'int', //仮置場解体_可燃_閾値
    selTmpNoncombust: 'int', //仮置場解体_不燃_段数
    thresTmpCNoncombust: 'int', //仮置場解体_不燃_閾値
    selAsh: 'int', //焼却灰_段数
    thresAsh: 'int', //焼却灰_閾値
  },
};

/************************************************
 * ログイン情報のスキーマ定義
 ************************************************/
export const loginSchema: Realm.ObjectSchema = {
  name: 'login',
  primaryKey: 'id',
  properties: {
    id: 'int', //ID 1固定
    loginDt: 'string', //ログイン日時
    comId: 'string', //事業者ID
    userId: 'string', //ユーザID
    wkplacTyp: 'int', //作業場所区分 4:仮置場、5:保管場、6:定置場
    wkplacId: 'string', //作業場所ID 仮置場IDまたは保管場ID
    fixPlacId: {type: 'string', optional: true}, //定置場ID 作業場所が定置場の場合使用
    logoutFlg: 'int', //利用終了 0:利用中、1:利用終了
  },
};

/************************************************
 * ユーザのスキーマ定義
 ************************************************/
export const userSchema: Realm.ObjectSchema = {
  name: 'user',
  primaryKey: 'id',
  properties: {
    id: 'int', // ID 1固定
    comId: 'string', // 事業者ID
    comNm: 'string', // 事業者名
    userId: 'string', // ユーザID
    userNm: 'string', // ユーザ名
  },
};

/************************************************
 * 仮置場のスキーマ定義
 ************************************************/
export const temporaryPlacesSchema: Realm.ObjectSchema = {
  name: 'temporary_places',
  primaryKey: 'id',
  properties: {
    id: 'string', // UUIDで設定
    tmpPlacId: {type: 'string', indexed: true}, // 仮置場ID
    tmpPlacNm: 'string', // 仮置場名
    delSrcTyp: {type: 'int', optional: true}, // 搬出元種別
  },
};

/************************************************
 * 保管場のスキーマ定義
 ************************************************/
export const storagePlacesSchema: Realm.ObjectSchema = {
  name: 'storage_places',
  primaryKey: 'id',
  properties: {
    id: 'string', // UUIDで設定
    storPlacId: {type: 'string', indexed: true}, // 保管場ID
    storPlacNm: 'string', // 仮置場名
  },
};

/************************************************
 * 定置場のスキーマ定義
 ************************************************/
export const fixedPlacesSchema: Realm.ObjectSchema = {
  name: 'fixed_places',
  primaryKey: 'id',
  properties: {
    id: 'string', // UUIDで設定
    storPlacId: {type: 'string', indexed: true}, // 保管場ID
    fixPlacId: {type: 'string', indexed: true}, // 定置場ID
    fixPlacNm: 'string', // 定置場名
    facTyp: {type: 'int', optional: true}, // 施設区分
    conTyp: {type: 'int', optional: true}, // 濃度区分
  },
};

/************************************************
 * 定置場情報のスキーマ定義
 ************************************************/
export const fixedPlacesInfoSchema: Realm.ObjectSchema = {
  name: 'fixed_places_info',
  primaryKey: 'id',
  properties: {
    id: 'string', //ID UUID
    useDt: 'date', //利用日時 YYYY/MM/DD hh:mm:ss
    storPlacId: {type: 'string', indexed: true}, // 保管場ID
    fixPlacId: {type: 'string', indexed: true}, // 定置場ID
    stySec: {type: 'string', optional: true}, //定置区画ID
    areNo: {type: 'int', optional: true}, //区域番号
  },
};
/************************************************
 * 位置情報のスキーマ定義
 ************************************************/
export const locationSchema: Realm.ObjectSchema = {
  name: 'location',
  primaryKey: 'id',
  properties: {
    id: 'string', //ID UUID
    schDt: 'date', //取得日時 YYYY/MM/DD hh:mm:ss
    locDt: 'int', //測位日時 Timestampデータ
    latitude: 'string', //緯度
    longitude: 'string', //経度
    sndFlg: 'int', //送信フラグ 0:非採用、1:未送信、2:送信済
    sndJsoIFA0110: 'string', //送信用IFA0110 "送信時のJSONを格納現場アプリでは未使用"
    sndJsonIFT0150: 'string', //送信用IFT0150 "送信時のJSONを格納現場アプリでは未使用"
    alrtCd: 'string', //アラートコード 現場アプリでは未使用
  },
};
