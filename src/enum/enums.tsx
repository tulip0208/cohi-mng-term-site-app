/**-------------------------------------------
 * 列挙型定義
 * enum/enums.tsx
 * ---------------------------------------------*/

//外部インターフェース（JSON）ステータスコード
export enum CC0001 {
  '正常終了' = '00',
  '異常終了' = '01',
}

//外部インターフェース連携データ変更区分
export enum CC0002 {
  '新規登録' = 'I',
  '更新' = 'U',
  '削除' = 'D',
}

//外部インターフェース（JSON）連携結果コード
export enum CC0005 {
  '異常データなし' = 0,
  '異常データあり' = 1,
}

//外部インターフェース（JSON）連携データ異常コード
export enum CC0006 {
  '必須エラー' = '01',
  'サイズエラー' = '02',
  '範囲エラー' = '03',
  '書式エラー' = '04',
  'データ状況エラー(重複データ)' = '05',
  'データ状況エラー(更新対象無し)' = '06',
  'データ状況エラー(削除対象無し)' = '07',
}

//外部インターフェース（JSON）連携アラート有無
export enum CC0007 {
  'アラート無し' = 0,
  'アラート有り' = 1,
}

//アラートコード
export enum CC0008 {
  '輸送車両順序チェック' = '01',
  '車両と運転手の組合せチェック' = '02',
  '積載内容チェック(積載重量)' = '03',
  '輸送前車両チェック' = '04',
  '輸送ルート外チェック' = '06',
  '位置停滞のチェック' = '08',
  '閾値超過のチェック' = '10',
  '積載内容チェック(可燃不燃混在)' = '11',
  '積載内容チェック(有害無害混在)' = '12',
  '事故アラート' = '13',
  'お知らせアラート' = '14',
  '日次被ばく線量閾値超過チェック' = '15',
  '3ヶ月累積被ばく線量閾値超過チェック' = '16',
  '年間累積被ばく線量閾値超過チェック' = '17',
  '5年累積被ばく線量閾値超過チェック' = '18',
  'ファイル欠損アラート' = '19',
  '送信ID欠損アラート' = '20',
  '施設予定地境界_空間線量率(連続)_閾値超過アラート' = '21',
  '施設予定地境界_大気中放射性物質濃度(連続)_閾値超過アラート' = '22',
  '輸送路_空間線量率(連続)_閾値超過アラート' = '23',
  '保管場_空間線量率(連続)_閾値超過アラート' = '24',
  '保管場_空間線量率(日次/週次)_閾値超過アラート' = '25',
  '保管場_地下水中放射性物質濃度(週次)_閾値超過アラート' = '26',
  '仮置場出発時刻チェック' = '27',
  '輸送カード発行チェック' = '28',
  '荷下ろし全量チェック' = '29',
  'ログオフチェック(ログオフ誤り)' = '30',
  'ログオフチェック(ログオフ忘れ)' = '31',
  '車両周り線量突出チェック' = '32',
  '積載内容チェック(除去土壌等と焼却灰混在)' = '33',
  '積載内容チェック(主灰と飛灰混在)' = '34',
  '積載内容チェック(輸送可能放射能濃度)' = '35',
  '積載内容チェック(放射能濃度レベル混在)' = 36,
}

//物品種類
export enum CT0002 {
  '可燃' = 0,
  '不燃' = 1,
  '主灰' = 2,
  '飛灰' = 3,
}

//有害物質
export enum CT0003 {
  '無' = 0,
  '有' = 1,
}

//津波浸水
export enum CT0005 {
  '津波浸水域由来' = 1,
  '津波浸水域由来以外' = 2,
}

//特定施設
export enum CT0006 {
  '特定施設由来' = 1,
  '特定施設由来以外' = 2,
}

//除去土壌等種別
export enum CT0007 {
  '草木類' = 1,
  '可燃廃棄物' = 2,
  '土壌等' = 3,
  'コンクリート殻等' = 4,
  'アスファルト混合物' = 5,
  '不燃物・混合物' = 6,
  '石綿含有建材' = 7,
  '石膏ボード' = 8,
  '危険物・有害物' = 9,
  '屋外残置廃棄物_可燃物' = 10,
  '屋外残置廃棄物_不燃物' = 11,
  '仮置場解体発生可燃物' = 12,
  '仮置場解体発生不燃物' = 13,
  '焼却灰' = 14,
}

//発生土地分類
export enum CT0008 {
  '住宅地等' = 1,
  '学校' = 2,
  '公園' = 3,
  '大型施設' = 4,
  '道路' = 5,
  '法面・斜面' = 6,
  '草地、芝地' = 7,
  '農地' = 8,
  '果樹園' = 9,
  '森林' = 10,
  '仮置場' = 11,
}

//荷姿種別
export enum CT0009 {
  '耐候性大型土のう' = 1,
  'クロス型大型土のう袋等' = 2,
  'ランニング型大型土のう袋等_Ⅰ' = 3,
  'ランニング型大型土のう袋等_Ⅱ' = 4,
  'フレキシブルコンテナ耐候性（3年）' = 5,
  'フレキシブルコンテナ耐水・耐候性（3年）' = 6,
  'その他' = 7,
  '耐候（オーバーパック）' = 8,
  '耐水・耐候（オーバーパック）' = 9,
}

export enum CT0009_2 {
  '耐候性大型' = 1,
  'クロス大型' = 2,
  'ラン_Ⅰ' = 3,
  'ラン_Ⅱ' = 4,
  '耐候性' = 5,
  '耐水耐候3' = 6,
  'その他' = 7,
  '耐候OP' = 8,
  '耐水耐候O' = 9,
}

//内袋利用方法
export enum CT0010 {
  '内袋なし' = 1,
  '1重内袋' = 2,
  '2重内袋（内袋をあらかじめ2重にした後に内容物を格納）' = 3,
  '2重内袋（1重の内袋に内容物を格納した後に2重化）' = 4,
  'アルミ内袋' = 5,
  'ポリエチレン内袋_二重以上' = 6,
  'ポリエチレン内袋_一重' = 7,
  'その他内袋_二重以上' = 8,
  'その他内袋_一重' = 9,
}

//内袋材質種別
export enum CT0011 {
  'アルミ内袋利用あり' = 1,
  'アルミ内袋利用なし' = 2,
}

export enum CT0011_2 {
  '利用あり' = 1,
  '利用なし' = 2,
}

//輸送ステータス区分
export enum CT0014 {
  '輸送開始' = '01',
  '積込開始' = '02',
  '輸送カード発行申請' = '03',
  '輸送カード発行承認済' = '04',
  '輸送カード強制発行承認済' = '05',
  '輸送カード発行済' = '06',
  '仮置場出発' = '07',
  '保管場到着' = '08',
  '荷下ろし完了(全数量確認)' = '10',
  'スクリーニング完了' = '11',
  '保管場出発' = '12',
  '輸送終了' = '13',
  '施設受入（輻輳無）／一時保管場荷下ろし（輻輳無）' = '14',
  '施設受入（輻輳有）／一時保管場荷下ろし（輻輳有）' = '15',
}

//輸送カード申請結果
export enum CT0015 {
  '承認' = 0,
  '否認' = 1,
  '強制承認待ち' = 2,
}

//イベント種類
export enum CT0022 {
  '急ブレーキ' = 0,
  '一般道最高速度' = 1,
  '高速度最高速度' = 2,
  '急加速' = 3,
  '急減速' = 4,
}

//運行状態
export enum CT0028 {
  '計画中' = 0,
  '実施中' = 1,
  '終了' = 2,
}

//検索対象フラグ
export enum CT0040 {
  '有効' = 0,
  '無効' = 1,
}

//オーバーパック有無
export enum CT0042 {
  'オーバーパック無し' = 0,
  'オーバーパック有り' = 1,
}

//区画区分
export enum CT0043 {
  '可燃' = 1,
  '不燃' = 2,
  '有害物質' = 3,
  '主灰' = 4,
  '飛灰' = 5,
}

//搬出元種別
export enum CT0044 {
  '仮置場' = 0,
  '保管場' = 1,
  '焼却炉' = 2,
}

//焼却灰種別
export enum CT0054 {
  '主灰' = 1,
  '飛灰' = 2,
}

//施設区分
export enum CT0062 {
  '定置場' = 0,
  '受入・分別施設' = 1,
}

//濃度区分
export enum CT0063 {
  '高濃度' = 0,
  '低濃度' = 1,
  '高濃度／低濃度' = 2,
}

//作業者区分
export enum CR0002 {
  '監督支援者' = 'CM000001',
  '工事監督者' = 'CM000002',
  '仮置場工事作業者' = 'LD000001',
  '仮置場警備員' = 'LD000002',
  '焼却灰仮置場作業者' = 'LD000003',
  '保管場工事作業者' = 'UN000001',
  '保管場警備員' = 'UN000002',
  '線量低減工事作業者1' = 'UN000003',
  '運転者' = 'DR000001',
  '焼却灰輸送運転者' = 'DR000002',
  '線量低減工事作業者2' = 'SS000001',
  '施設建設工事作業者' = 'SS000002',
  '受入・分別施設作業者' = 'SS000003',
  '土壌貯蔵施設作業者' = 'SS000004',
  '未登録（予約）1' = 'SS000005',
  '未登録（予約）2' = 'SS000006',
  '施設警備員' = 'SS000007',
  '施設間運搬者' = 'SS000008',
  '道路補修工事作業者' = 'OT000001',
  'モニタリング作業者' = 'OT000002',
  'その他警備員' = 'OT000003',
}

//四半期区分
export enum CR0005 {
  '4,5,6月の累積報告' = 1,
  '7,8,9月の累積報告' = 2,
  '10,11,12月の累積報告' = 3,
  '1,2,3月の累積報告' = 4,
}
