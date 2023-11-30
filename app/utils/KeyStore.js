// utils/keyStore.js
import * as Keychain from 'react-native-keychain';

export const checkActivation = async () => {
  try {
    // KeyStoreからアクティベーション情報を取得
    const credentials = await Keychain.getGenericPassword({
      service: 'activationInfo'
    });
    if (credentials) {
      // ここでは、パスワードフィールドにアクティベーション情報を保存していると想定しています。
      const activationInfo = JSON.parse(credentials.password);
      // アクティベーション有無のチェック
      if (activationInfo && activationInfo.actFin === '1:有') {
        return { isActivated: true, activationInfo };
      }
    }
  } catch (error) {
    console.error('Activation check failed', error);
  }
  // アクティベーション情報が存在しない、または無効である場合
  return { isActivated: false };
};
