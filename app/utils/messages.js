/**
 * メッセージ(正常・警告・異常)一覧
 * 
 */
//utils/messages
const messages = {
    //info
    IA5001: () => `アプリを終了します。\nよろしいですか？`,
    IA5002: () => `端末登録中`,
    IA5003: () => `利用開始処理中`,
    IA5004: () => `アプリの更新があります。\n更新を行ってもよろしいですか？\n\nいいえが押された場合はアプリの更新ができないため、次の画面に進むことができません。`,
    IA5005: () => `{0}が完了しました。`,
    IA5006: () => `ログのアップロードを行いますか？`,
    IA5007: () => `読み込まれた共通タグが{0}です。\n環境省に連絡してください。`,
    IA5008: () => `アプリのアップデートを開始します。\nアプリが終了した場合にはアプリを再度起動してください。`,
    IA5009: () => `アプリ設定データの更新があります。\nアップデートを行ってもよろしいですか？\n\nいいえが押された場合はアプリ設定データの更新ができないため、次の画面に進むことができません。`,
    IA5010: () => `ログの削除を行いますか？`,
    IA5011: () => `入力内容を破棄してメニューに戻りますか？`,
    IA5012: () => `入力内容を破棄して最初から登録しますか？`,
    IA5013: () => `読み込まれた旧タグIDを全て取り消しますか？`,
    IA5014: () => `前の画面に戻りますか？`,
    IA5015: () => `登録がありません。タグを確認してください。`,
    
    //worn
    WA5001: () => `作業場が仮置場ではありません。\n仮置場の作業場所QRコードを読み込んでから処理を継続してください。`,
    WA5002:	() => `旧タグIDは9件まで設定可能です。\n既に9件設定されているため追加できません。\n誤った旧タグIDが読み込まれている場合は一括取消後に設定しなおしてください。`,
    WA5003:	() => `新タグのタグ色とフレコンの除去土壌等種別が異なります。\nこのままフレコンを新タグに紐付けしますか？`,

    //error
    EA5001: (v1) => `${v1}の読取を確認できませんでした。\n再度やり直しを行うか、ヘルプデスクにお問い合わせください。`,
    EA5002: (v1) => `正しい${v1}QRコードの確認ができませんでした。\nQRコードが正しいか確認し再度やり直しを行うか、ヘルプデスクにお問い合わせください。`,
    EA5003: () => `サーバーに接続できませんでした。\n通信状況を確認し再度やり直しを行うか、ヘルプデスクにお問い合わせください。`,
    EA5004: (v1,v2) => `${v1}でサーバーエラーが発生しました。\nヘルプデスクにお問い合わせください。\n\nHTTPステータス： ${v2}`,
    EA5005: (v1,v2) => `${v1}でシステムエラーが発生しました。\nヘルプデスクにお問い合わせください。\n\nサーバーエラーコード： ${v2}`,
    EA5006: (v1) => `正しい${v1}QRコードの確認ができませんでした。\nQRコードが正しいか確認し再度やり直しを行うか、ヘルプデスクにお問い合わせください。`,
    EA5007: () => `作業場所QRコードが仮置場ではありません。\nQRコードが正しいか確認し再度やり直しを行うか、ヘルプデスクにお問い合わせください。`,
    EA5008: () => `読み取ったコードがバーコードまたはQRコードではありませんでした。\nコードが正しいか確認し再度やり直しを行うか、ヘルプデスクにお問い合わせください。`,
    EA5009: () => `QRコードのデータを正しく読み込めませんでした。\nコードが正しいか確認し再度やり直しを行うか、ヘルプデスクにお問い合わせください。`,
    EA5010: () => `既に読み込まれている旧タグIDの除去土壌等種別と異なる旧タグIDが読み込まれました。\nフレコンが正しいか確認し再度やり直しを行うか、ヘルプデスクにお問い合わせください。`,
    
        // その他のメッセージ
  };
  
  export default messages;