// Schemas.js
import Realm from 'realm';

// 設定ファイルのスキーマ定義
export const settingsSchema = {
    name: 'settings',
    primaryKey: 'id',
    properties: {
        id: 'int', //1固定
        appVer: 'string', //利用バージョン	
        settingFileDt: 'string', //設定ファイル取得日時	
        serverName: 'string', //接続先名称	
        serverUrl: 'string', //接続先URL	
        logTerm: 'int', //ログファイル保持期間	
        logCapacity: 'int', //ログファイル分割容量	
        locGetTerm: 'int', //位置情報取得間隔(秒)	
        camTimeout: 'int', //カメラタイムアウト時間(秒)	
        btnNewTagSoil: 'int', //新タグ紐付(土壌)	0:不使用、1:使用
        btnRefNewTagSoil: 'int', //新タグ参照(土壌)	0:不使用、1:使用
        btnRefOldTagSoil: 'int', //旧タグ参照(土壌)	0:不使用、1:使用
        btnNewTagAsh: 'int', //新タグ紐付(灰)	0:不使用、1:使用
        btnRefNewTagAsh: 'int', //新タグ参照(灰)	0:不使用、1:使用
        btnRefOldTagAsg: 'int', //旧タグ参照(灰)	0:不使用、1:使用
        btnTrnCard: 'int', //輸送カード申請	0:不使用、1:使用
        btnUnload: 'int', //荷下登録	0:不使用、1:使用
        btnStat: 'int', //定置登録	0:不使用、1:使用
        reasonListOldTag: 'string', //旧タグ由来情報理由	旧タグ由来情報の理由をカンマ区切りで保存
        useMethodInnerBag: 'int', //内袋の利用方法(初期)	
        packTyp: 'int', //荷姿種別(初期)	
        radioConvFact: 'int', //放射能濃度換算係数	
        facArriveTerm: 'int', //施設到着予定時間(分)	
        selTiersPlants: 'int', //段数選択 草木類	
        thresTiersPlants: 'int', //段数閾値 草木類	
        selTiersCombust: 'int', //段数選択 可燃廃棄物	
        thresTiersCombust: 'int', //段数閾値 可燃廃棄物	
        selTiersSoil: 'int', //段数選択 土壌等	
        thresTiersSoil: 'int', //段数閾値 土壌等	
        selTiersConcrete: 'int', //段数選択 コンクリート殻等	
        thresTiersConcrete: 'int', //段数閾値 コンクリート殻等	
        selTiersAsphalt: 'int', //段数選択 アスファルト混合物	
        thresTiersAsphalt: 'int', //段数閾値 アスファルト混合物	
        selTiersNoncombustMix: 'int', //段数選択 不燃物・混合物	
        thresTiersNoncombustMix: 'int', //段数閾値 不燃物・混合物	
        selTiersAsbestos: 'int', //段数選択 石綿含有建材	
        thresTiersAsbestos: 'int', //段数閾値 石綿含有建材	
        selTiersPlasterboard: 'int', //段数選択 石膏ボード	
        thresTiersPlasterboard: 'int', //段数閾値 石膏ボード	
        selTiersHazard: 'int', //段数選択 危険物・有害物	
        thresTiersHazard: 'int', //段数閾値 危険物・有害物	
        selTiersOutCombust: 'int', //段数選択 屋外残置廃棄物_可燃物	
        thresTiersOutCombust: 'int', //段数閾値 屋外残置廃棄物_可燃物	
        selTiersOutNoncombust: 'int', //段数選択 屋外残置廃棄物_不燃物	
        thresTiersOutNoncombust: 'int', //段数閾値 屋外残置廃棄物_不燃物	
        selTiersTmpCombust: 'int', //段数選択 仮置場解体発生可燃物	
        thresTiersTmpCombust: 'int', //段数閾値 仮置場解体発生可燃物	
        selTiersTmpNoncombust: 'int', //段数選択 仮置場解体発生不燃物	
        thresTiersTmpCNoncombust: 'int', //段数閾値 仮置場解体発生不燃物	
        selTiersAsh: 'int', //段数選択 焼却灰	
        thresTiersAsh: 'int', //段数閾値 焼却灰	
        
    }
  };

  // ログイン情報のスキーマ定義
export const loginSchema = {
    name: 'login',
    primaryKey: 'id',
    properties: {
      id: 'int', // ID 1固定
      loginDt: 'string', // ログイン日時							
      comId: 'string', // 事業者ID	
      userId: 'string', // ユーザID
      wkplacTyp: 'int', //作業場所区分 4:仮置場、5:保管場、6:定置場
      wkplacId: 'string', //作業場所ID
      logoutFlg: 'int', //利用終了 0:利用中、1:利用終了
    }
  };
  
  // ユーザのスキーマ定義
export const userSchema = {
    name: 'user',
    primaryKey: 'id',
    properties: {
      id: 'int', // ID 1固定
      comId: 'string', // 事業者ID
      comNm: 'string', // 事業者名
      userId: 'string', // ユーザID
      userNm: 'string', // ユーザ名
    }
  };
  