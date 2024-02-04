/**-------------------------------------------
 * 外部IF通信 (IFAXXXX)
 * utils/api.tsx
 * ---------------------------------------------*/
import {getInstance} from './Realm'; // realm.jsから関数をインポート
import axios, {AxiosError} from 'axios';
import {loadFromKeystore, getEncryptionKeyFromKeystore} from './KeyStore'; // KeyStoreの確認関数
import {decryptWithAES256CBC} from './Security';
import {logCommunication} from './Log';
import {
  AxiosResponse,
  ApiResponse,
  IFA0030Response,
  IFA0110Response,
  IFA0310Response,
  IFA0310ResponseDtl,
  IFA0320Response,
  IFA0320ResponseDtl,
  IFA0330Response,
  IFA0330ResponseDtl,
  IFA0340Response,
  IFA0340ResponseDtl,
  IFT0090Response,
  IFT0090ResponseDtl,
  IFT0120Response,
  IFT0120ResponseDtl1,
  IFT0120ResponseDtl2,
  IFT0130Response,
  IFT0130ResponseDtl1,
  IFT0130ResponseDtl2,
  IFT0140Response,
  IFT0140ResponseDtl,
  IFT0210Response,
  IFT0210ResponseDtl,
  IFT0420Response,
  IFT0420ResponseDtl,
  IFT0640Response,
  IFT0640ResponseDtl,
  IFT0640ResponseDtlDtl,
  IFT0640ResponseDtlDtlCheck,
  ActivationInfo,
  ComId,
  TrmId,
  ApiKey,
  TrmKey,
  WA1060WkPlacConst,
  WA1060OldTagInfoConst,
  WA1060Const,
  WA1090WkPlacConst,
  WA1091OldTagInfoConst,
  WA1092WtDsConst,
  WA1120WkPlacConst,
  WA1120CarConst,
  WA1120DrvConst,
  WA1120DestConst,
  WA1121DataConst,
  WA1121NewTagConst,
  caLgSdBgDsInfoConst,
  WA1130Const,
  WA1140Const,
} from '../types/type';

/************************************************
 * IFA0010_アクティベーション(端末登録)
 ************************************************/
export const IFA0010 = async (
  encryptedKey: string,
  secretKey: Uint8Array,
): Promise<ApiResponse<null>> => {
  try {
    // KeyStoreからアクティベーション情報を取得
    const activationInfo = (await loadFromKeystore(
      'activationInfo',
    )) as ActivationInfo;

    const realm = getInstance();
    // realmからユーザ情報を取得
    const userInfo = realm.objects('user')[0];

    // realmから設定ファイル情報を取得
    const settingsInfo = realm.objects('settings')[0];
    // サーバー通信用のデータを準備
    const requestData = {
      comId: userInfo.comId,
      usrId: userInfo.usrId,
      trmId: activationInfo.trmId,
      apiKey: decryptWithAES256CBC(activationInfo.apiKey, secretKey), // 復号化
      actKey: activationInfo.actKey,
      trmKey: decryptWithAES256CBC(encryptedKey, secretKey), // 復号化
      appTyp: 1,
      appVer: settingsInfo.appVer,
    };
    // サーバー通信処理（Api.js内の関数を呼び出し）
    await sendToServer(requestData, 'IFA0010', '端末登録');
    return {success: true, data: null};
  } catch (error) {
    const e = error as CustomError;
    return {
      success: false,
      error: e.message,
      status: e.status,
      code: e.code,
      api: e.api,
    };
  }
};

/************************************************
 * IFA0020_ログアップロード
 ************************************************/
export const IFA0020 = async (filePath: string): Promise<ApiResponse<null>> => {
  try {
    const secretKey = await getEncryptionKeyFromKeystore(); // AES暗号化のための秘密鍵
    const realm = getInstance();
    const settingsInfo = realm.objects('settings')[0];
    const comId = (await loadFromKeystore('comId')) as ComId;
    const trmId = (await loadFromKeystore('trmId')) as TrmId;
    const apiKey = (await loadFromKeystore('apiKey')) as ApiKey;
    const trmKey = (await loadFromKeystore('trmKey')) as TrmKey;
    const requestData = {
      comId: comId.comId,
      trmId: trmId.trmId,
      apiKey: decryptWithAES256CBC(apiKey.apiKey, secretKey), // 復号化
      trmKey: decryptWithAES256CBC(trmKey.trmKey, secretKey), // 復号化
      appTyp: 1,
      appVer: settingsInfo.appVer,
    };

    // サーバー通信処理（Api.js内の関数を呼び出し）
    await sendFileToServer(
      requestData,
      'IFA0020',
      'ログアップロード',
      filePath,
    );
    return {success: true, data: null};
  } catch (error) {
    const e = error as CustomError;
    return {
      success: false,
      error: e.message,
      status: e.status,
      code: e.code,
      api: e.api,
    };
  }
};

/************************************************
 * IFA0030_端末チェック
 ************************************************/
export const IFA0030 = async (): Promise<ApiResponse<IFA0030Response>> => {
  try {
    const secretKey = await getEncryptionKeyFromKeystore(); // AES暗号化のための秘密鍵
    const realm = getInstance();
    const userInfo = realm.objects('user')[0];
    const settingsInfo = realm.objects('settings')[0];
    const comId = (await loadFromKeystore('comId')) as ComId;
    const trmId = (await loadFromKeystore('trmId')) as TrmId;
    const apiKey = (await loadFromKeystore('apiKey')) as ApiKey;
    const trmKey = (await loadFromKeystore('trmKey')) as TrmKey;
    const requestData = {
      comId: comId.comId,
      usrId: userInfo.userId,
      trmId: trmId.trmId,
      apiKey: decryptWithAES256CBC(apiKey.apiKey, secretKey), // 復号化
      trmKey: decryptWithAES256CBC(trmKey.trmKey, secretKey), // 復号化
      appTyp: 1,
      appVer: settingsInfo.appVer,
      setdt: settingsInfo.settingFileDt,
    };

    // サーバー通信処理（Api.js内の関数を呼び出し）
    const res = await sendToServer(requestData, 'IFA0030', '端末チェック');
    const response = res as AxiosResponse<IFA0030Response>;
    return {success: true, data: response.data};
  } catch (error) {
    const e = error as CustomError;
    return {
      success: false,
      error: e.message,
      status: e.status,
      code: e.code,
      api: e.api,
    };
  }
};

/************************************************
 * IFA0040_端末設定ファイル配信
 ************************************************/
export const IFA0040 = async (): Promise<ApiResponse<ArrayBuffer>> => {
  try {
    const secretKey = await getEncryptionKeyFromKeystore(); // AES暗号化のための秘密鍵
    const realm = getInstance();
    const userInfo = realm.objects('user')[0];
    const settingsInfo = realm.objects('settings')[0];
    const comId = (await loadFromKeystore('comId')) as ComId;
    const trmId = (await loadFromKeystore('trmId')) as TrmId;
    const apiKey = (await loadFromKeystore('apiKey')) as ApiKey;
    const trmKey = (await loadFromKeystore('trmKey')) as TrmKey;
    const requestData = {
      comId: comId.comId,
      usrId: userInfo.userId,
      trmId: trmId.trmId,
      apiKey: decryptWithAES256CBC(apiKey.apiKey, secretKey), // 復号化
      trmKey: decryptWithAES256CBC(trmKey.trmKey, secretKey), // 復号化
      appTyp: 1,
      appVer: settingsInfo.appVer,
      setdate: settingsInfo.settingFileDt,
    };
    // サーバー通信処理（Api.js内の関数を呼び出し）
    const res = await sendToServer(
      requestData,
      'IFA0040',
      '端末設定ファイル配信',
    );
    const response = res.data as ArrayBuffer;
    return {success: true, data: response};
  } catch (error) {
    const e = error as CustomError;
    return {
      success: false,
      error: e.message,
      status: e.status,
      code: e.code,
      api: e.api,
    };
  }
};

/************************************************
 * IFA0050_更新ファイル配信
 ************************************************/
export const IFA0050 = async (): Promise<ApiResponse<ArrayBuffer>> => {
  try {
    const secretKey = await getEncryptionKeyFromKeystore(); // AES暗号化のための秘密鍵
    const realm = getInstance();
    const userInfo = realm.objects('user')[0];
    const settingsInfo = realm.objects('settings')[0];
    const comId = (await loadFromKeystore('comId')) as ComId;
    const trmId = (await loadFromKeystore('trmId')) as TrmId;
    const apiKey = (await loadFromKeystore('apiKey')) as ApiKey;
    const trmKey = (await loadFromKeystore('trmKey')) as TrmKey;
    const requestData = {
      comId: comId.comId,
      usrId: userInfo.userId,
      trmId: trmId.trmId,
      apiKey: decryptWithAES256CBC(apiKey.apiKey, secretKey), // 復号化
      trmKey: decryptWithAES256CBC(trmKey.trmKey, secretKey), // 復号化
      appTyp: 1,
      appVer: settingsInfo.appVer,
    };
    // サーバー通信処理（Api.js内の関数を呼び出し）
    const res = await sendToServer(requestData, 'IFA0050', '更新ファイル配信');
    const response = res.data as ArrayBuffer;
    return {success: true, data: response};
  } catch (error) {
    const e = error as CustomError;
    return {
      success: false,
      error: e.message,
      status: e.status,
      code: e.code,
      api: e.api,
    };
  }
};

/************************************************
 * IFA0051_バージョンアップ完了報告
 ************************************************/
export const IFA0051 = async (): Promise<ApiResponse<null>> => {
  try {
    const secretKey = await getEncryptionKeyFromKeystore(); // AES暗号化のための秘密鍵
    const realm = getInstance();
    const userInfo = realm.objects('user')[0];
    const settingsInfo = realm.objects('settings')[0];
    const comId = (await loadFromKeystore('comId')) as ComId;
    const trmId = (await loadFromKeystore('trmId')) as TrmId;
    const apiKey = (await loadFromKeystore('apiKey')) as ApiKey;
    const trmKey = (await loadFromKeystore('trmKey')) as TrmKey;
    const requestData = {
      comId: comId.comId,
      usrId: userInfo.userId,
      trmId: trmId.trmId,
      apiKey: decryptWithAES256CBC(apiKey.apiKey, secretKey), // 復号化
      trmKey: decryptWithAES256CBC(trmKey.trmKey, secretKey), // 復号化
      appTyp: 1,
      appVer: settingsInfo.appVer,
      setDt: settingsInfo.settingFileDt,
    };
    // サーバー通信処理（Api.js内の関数を呼び出し）
    await sendToServer(requestData, 'IFA0051', 'バージョンアップ完了報告');
    return {success: true, data: null};
  } catch (error) {
    const e = error as CustomError;
    return {
      success: false,
      error: e.message,
      status: e.status,
      code: e.code,
      api: e.api,
    };
  }
};

/************************************************
 * IFA0110_業務データ
 ************************************************/
const setIFA0110RequestData = async <T,>(interFaceName: string, dataDtl: T) => {
  const secretKey = await getEncryptionKeyFromKeystore(); // AES暗号化のための秘密鍵
  const realm = getInstance();
  const userInfo = realm.objects('user')[0];
  const settingsInfo = realm.objects('settings')[0];
  const locationInfo = realm.objects('location')[0];
  // const comId = await loadFromKeystore("comId") as ComId
  const trmId = (await loadFromKeystore('trmId')) as TrmId;
  const apiKey = (await loadFromKeystore('apiKey')) as ApiKey;
  const trmKey = (await loadFromKeystore('trmKey')) as TrmKey;
  const requestData = {
    comId: userInfo.comId,
    usrId: userInfo.userId,
    trmId: trmId.trmId,
    apiKey: decryptWithAES256CBC(apiKey.apiKey, secretKey), // 復号化
    trmKey: decryptWithAES256CBC(trmKey.trmKey, secretKey), // 復号化
    appTyp: 1,
    appVer: settingsInfo.appVer,
    vclLat: locationInfo.latitude,
    vclLon: locationInfo.longitude,
    ifNo: interFaceName,
    gymDt: dataDtl,
  };
  return requestData;
};

/************************************************
 * IFA0310_旧タグ情報照会(除染土壌)
 ************************************************/
export const IFA0310 = async (
  txtOldTagId: string,
  wkPlacId: string,
): Promise<ApiResponse<IFA0310Response<IFA0310ResponseDtl>>> => {
  try {
    const realm = getInstance();
    const loginInfo = realm.objects('login')[0];
    const requestDataDtl = {
      comId: loginInfo.comId,
      dtl: [
        {
          tmpLocId: wkPlacId,
          oldTagId: txtOldTagId,
        },
      ],
    };

    const requestData = await setIFA0110RequestData('IFA0310', requestDataDtl);

    // サーバー通信処理（Api.js内の関数を呼び出し）
    const res = await sendToServer(
      requestData,
      'IFA0110',
      '旧タグ情報照会(除去土壌)',
    );
    const response = res as AxiosResponse<
      IFA0110Response<IFA0310Response<IFA0310ResponseDtl>>
    >;

    //0件の場合
    if (response.data && response.data.sttCd && response.data.gyDt.cnt === 0) {
      return {
        success: false,
        error: 'zero',
        status: null,
        code: null,
        api: null,
        data: null,
      };
    }
    return {success: true, data: response.data.gyDt};
  } catch (error) {
    const e = error as CustomError;
    return {
      success: false,
      error: e.message,
      status: e.status,
      code: e.code,
      api: e.api,
    };
  }
};

/************************************************
 * IFA0320_旧タグ情報照会(焼却灰)
 ************************************************/
export const IFA0320 = async (
  txtOldTagId: string,
  wkPlacId: string,
): Promise<ApiResponse<IFA0320Response<IFA0320ResponseDtl>>> => {
  try {
    const realm = getInstance();
    const loginInfo = realm.objects('login')[0];
    const requestDataDtl = {
      comId: loginInfo.comId,
      dtl: [
        {
          tmpLocId: wkPlacId,
          oldTagId: txtOldTagId,
        },
      ],
    };

    const requestData = await setIFA0110RequestData('IFA0320', requestDataDtl);

    // サーバー通信処理（Api.js内の関数を呼び出し）
    const res = await sendToServer(
      requestData,
      'IFA0110',
      '旧タグ情報照会(除去土壌)',
    );
    const response = res as AxiosResponse<
      IFA0110Response<IFA0320Response<IFA0320ResponseDtl>>
    >;

    //0件の場合
    if (response.data && response.data.sttCd && response.data.gyDt.cnt === 0) {
      return {
        success: false,
        error: 'zero',
        status: null,
        code: null,
        api: null,
        data: null,
      };
    }
    return {success: true, data: response.data.gyDt};
  } catch (error) {
    const e = error as CustomError;
    return {
      success: false,
      error: e.message,
      status: e.status,
      code: e.code,
      api: e.api,
    };
  }
};

/************************************************
 * IFA0330_新タグ情報照会(除去土壌)
 ************************************************/
export const IFA0330 = async (
  txtNewTagId: string,
): Promise<ApiResponse<IFA0320Response<IFA0330ResponseDtl>>> => {
  try {
    const realm = getInstance();
    const loginInfo = realm.objects('login')[0];
    const requestDataDtl = {
      comId: loginInfo.comId,
      dtl: [{newTagId: txtNewTagId}],
    };

    const requestData = await setIFA0110RequestData('IFA0330', requestDataDtl);

    // サーバー通信処理（Api.js内の関数を呼び出し）
    const res = await sendToServer(
      requestData,
      'IFA0110',
      '新タグ情報照会(除去土壌)',
    );
    const response = res as AxiosResponse<
      IFA0110Response<IFA0330Response<IFA0330ResponseDtl>>
    >;

    //0件の場合
    if (response.data && response.data.sttCd && response.data.gyDt.cnt === 0) {
      return {
        success: false,
        error: 'zero',
        status: null,
        code: null,
        api: null,
        data: null,
      };
    }
    return {success: true, data: response.data.gyDt};
  } catch (error) {
    const e = error as CustomError;
    return {
      success: false,
      error: e.message,
      status: e.status,
      code: e.code,
      api: e.api,
    };
  }
};

/************************************************
 * IFA0340_新タグ情報照会(焼却灰)
 ************************************************/
export const IFA0340 = async (
  txtNewTagId: string,
): Promise<ApiResponse<IFA0340Response<IFA0340ResponseDtl>>> => {
  try {
    const realm = getInstance();
    const loginInfo = realm.objects('login')[0];
    const requestDataDtl = {
      comId: loginInfo.comId,
      dtl: [{newTagId: txtNewTagId}],
    };

    const requestData = await setIFA0110RequestData('IFA0340', requestDataDtl);

    // サーバー通信処理（Api.js内の関数を呼び出し）
    const res = await sendToServer(
      requestData,
      'IFA0110',
      '新タグ情報照会(焼却灰)',
    );
    const response = res as AxiosResponse<
      IFA0110Response<IFA0340Response<IFA0340ResponseDtl>>
    >;

    //0件の場合
    if (response.data && response.data.sttCd && response.data.gyDt.cnt === 0) {
      return {
        success: false,
        error: 'zero',
        status: null,
        code: null,
        api: null,
        data: null,
      };
    }
    return {success: true, data: response.data.gyDt};
  } catch (error) {
    const e = error as CustomError;
    return {
      success: false,
      error: e.message,
      status: e.status,
      code: e.code,
      api: e.api,
    };
  }
};

/************************************************
 * IFT0090_新タグ紐付データ取込
 ************************************************/
export const IFT0090 = async (
  wlPlac: WA1060WkPlacConst,
  oldTagInfos: WA1060OldTagInfoConst[],
  dateStr: string,
  newTagId: string,
  data: WA1060Const,
  memo: string,
): Promise<ApiResponse<IFT0090Response<IFT0090ResponseDtl>>> => {
  try {
    const realm = getInstance();
    const loginInfo = realm.objects('login')[0];
    const trmId = (await loadFromKeystore('trmId')) as TrmId;
    if (oldTagInfos.length === 0) {
      oldTagInfos.push({
        oldTag: '',
        genbaCheck: '',
        tsuInd: '',
        splFac: '',
        rmSolTyp: '',
        ocLndCla: '',
        pkTyp: '',
        usgInnBg: '',
        usgInnBgNm: '',
        usgAluBg: '',
        vol: '',
        airDsRt: '',
        ocLndUseknd: '',
        ocloc: '',
        rmSolInf: '',
        lnkNewTagDatMem: '',
      });
    }
    const requestDataDtl = {
      comId: loginInfo.comId,
      tmpLocId: wlPlac.wkplacId,
      dtl: [
        oldTagInfos.map((oldTagInfo, index) => ({
          chgKnd: 'I',
          sndId:
            'SH' + trmId.trmId + dateStr.replace(/[^0-9]/g, '').slice(0, 14),
          newTagId: newTagId,
          oldTagId: oldTagInfo.genbaCheck === '1' ? oldTagInfo.oldTag : '',
          sitTagId: oldTagInfo.genbaCheck === '2' ? oldTagInfo.oldTag : '',
          twoOneTrOneBrNum: index,
          caLgSdBgWt: data.caLgSdBgWt,
          caLgSdBgDs: data.caLgSdBgDs,
          tyRegDt: data.tyRegDt,
          pkTyp: data.pkTyp,
          yesNoOP: data.yesNoOP,
          arNm: wlPlac.wkplacNm,
          tsuInd: data.tsuInd,
          splFac: data.splFac,
          rmSolTyp: data.rmSolTyp,
          ocLndCla: oldTagInfo.ocLndCla,
          usgInnBg: data.usgInnBg,
          usgAluBg: data.usgAluBg,
          vol: oldTagInfo.vol,
          airDsRt: oldTagInfo.airDsRt,
          ocLndUseknd: oldTagInfo.ocLndUseknd,
          ocloc: oldTagInfo.ocloc,
          rmSolInf: oldTagInfo.rmSolInf,
          lnkNewTagDatMem: memo,
        })),
      ],
    };

    const requestData = await setIFA0110RequestData('IFT0090', requestDataDtl);

    // サーバー通信処理（Api.js内の関数を呼び出し）
    const res = await sendToServer(
      requestData,
      'IFA0110',
      '新タグ紐付データ取込',
    );
    const response = res as AxiosResponse<
      IFA0110Response<IFT0090Response<IFT0090ResponseDtl>>
    >;

    return {success: true, data: response.data.gyDt};
  } catch (error) {
    const e = error as CustomError;
    return {
      success: false,
      error: e.message,
      status: e.status,
      code: e.code,
      api: e.api,
    };
  }
};

/************************************************
 * IFT0120_車両ステータス更新（保管場定置の場合）（輸送カード申請呼出）
 ************************************************/
export const IFT0120FromWA1120 = async (
  WA1120WkPlac: WA1120WkPlacConst,
  WA1120Car: WA1120CarConst,
  WA1120Drv: WA1120DrvConst,
  dateStr: string,
): Promise<
  ApiResponse<IFT0120Response<IFT0120ResponseDtl1, IFT0120ResponseDtl2>>
> => {
  try {
    const realm = getInstance();
    const loginInfo = realm.objects('login')[0];
    const trmId = (await loadFromKeystore('trmId')) as TrmId;
    const requestDataDtl = {
      comId: loginInfo.comId,
      dtl: [
        {
          chgKnd: 'I',
          sndId:
            'SS' + trmId.trmId + dateStr.replace(/[^0-9]/g, '').slice(0, 14),
          vclId: WA1120Car.carId,
          crdNo: '',
          drvId: WA1120Drv.drvId,
          trpSttKnd: '02',
          trpSttChgDt: dateStr,
          vclWt: '',
          unLgSdBgDtl: [],
          scMaxDen: '',
          trpComId: '',
          tmpLocId: WA1120WkPlac.wkplacId,
        },
      ],
    };

    const requestData = await setIFA0110RequestData('IFT0120', requestDataDtl);

    // サーバー通信処理（Api.js内の関数を呼び出し）
    const res = await sendToServer(
      requestData,
      'IFA0110',
      '車両ステータス更新（保管場定置の場合）',
    );
    const response = res as AxiosResponse<
      IFA0110Response<IFT0120Response<IFT0120ResponseDtl1, IFT0120ResponseDtl2>>
    >;

    return {success: true, data: response.data.gyDt};
  } catch (error) {
    const e = error as CustomError;
    return {
      success: false,
      error: e.message,
      status: e.status,
      code: e.code,
      api: e.api,
    };
  }
};

/************************************************
 * IFT0120_車両ステータス更新（保管場定置の場合）
 ************************************************/
export const IFT0120 = async (
  WA1130Data: WA1130Const,
  IFT0640Data: IFT0640ResponseDtl<IFT0640ResponseDtlDtlCheck>,
  dateStr: string,
): Promise<
  ApiResponse<IFT0120Response<IFT0120ResponseDtl1, IFT0120ResponseDtl2>>
> => {
  try {
    const realm = getInstance();
    const loginInfo = realm.objects('login')[0];
    const trmId = (await loadFromKeystore('trmId')) as TrmId;
    const requestDataDtl = {
      comId: loginInfo.comId,
      dtl: [
        {
          chgKnd: 'I',
          sndId:
            'SS' + trmId.trmId + dateStr.replace(/[^0-9]/g, '').slice(0, 14),
          vclId: IFT0640Data.vclId,
          crdNo: IFT0640Data.crdNo,
          drvId: IFT0640Data.drvId,
          trpSttKnd: WA1130Data.trpStatus,
          trpSttChgDt: dateStr,
          vclWt: '',
          unLgSdBgDtl: [
            IFT0640Data.lgSdBgDtl.map(item => ({newTagId: item.newTagId})),
          ],
          scMaxDen: '',
          trpComId: loginInfo.comId,
          tmpLocId: '',
        },
      ],
    };

    const requestData = await setIFA0110RequestData('IFT0120', requestDataDtl);

    // サーバー通信処理（Api.js内の関数を呼び出し）
    const res = await sendToServer(
      requestData,
      'IFA0110',
      '車両ステータス更新（保管場定置の場合）',
    );
    const response = res as AxiosResponse<
      IFA0110Response<IFT0120Response<IFT0120ResponseDtl1, IFT0120ResponseDtl2>>
    >;

    return {success: true, data: response.data.gyDt};
  } catch (error) {
    const e = error as CustomError;
    return {
      success: false,
      error: e.message,
      status: e.status,
      code: e.code,
      api: e.api,
    };
  }
};

/************************************************
 * IFT0130_輸送カード申請
 ************************************************/
export const IFT0130 = async (
  WA1120WkPlac: WA1120WkPlacConst,
  WA1120Car: WA1120CarConst,
  WA1120Drv: WA1120DrvConst,
  WA1120Dest: WA1120DestConst,
  WA1121Data: WA1121DataConst<WA1121NewTagConst>,
  dateStr: string,
  caLgSdBgDsInfo: caLgSdBgDsInfoConst,
): Promise<
  ApiResponse<IFT0130Response<IFT0130ResponseDtl1, IFT0130ResponseDtl2>>
> => {
  try {
    const realm = getInstance();
    const loginInfo = realm.objects('login')[0];
    const trmId = (await loadFromKeystore('trmId')) as TrmId;
    const requestDataDtl = {
      comId: loginInfo.comId,
      dtl: [
        {
          chgKnd: 'I',
          sndId:
            'YC' + trmId.trmId + dateStr.replace(/[^0-9]/g, '').slice(0, 14),
          crdNo:
            'd' +
            trmId.trmId +
            dateStr.replace(/[^0-9]/g, '').slice(0, 14) +
            'd',
          vclId: WA1120Car.carId,
          drvId: WA1120Drv.drvId,
          trpSttKnd: 0,
          trpSttDt: dateStr,
          gdsKnd: WA1121Data.monoTyp,
          hfSbt: WA1121Data.gai,
          lgSdBgDtl: [
            WA1121Data.trpCardTagInfoList.map(item => ({
              newTagId: item.newTagId,
            })),
          ],
          vclRdtDsFr: '',
          vclRdtDsRe: '',
          vclRdtDsLe: '',
          vclRdtDsRi: '',
          lctRdtDsFr: caLgSdBgDsInfo.front,
          lctRdtDsRe: caLgSdBgDsInfo.back,
          lctRdtDsLe: caLgSdBgDsInfo.left,
          lctRdtDsRi: caLgSdBgDsInfo.right,
          plcArvDt: dateStr,
          stgLocId: WA1120Dest.storPlacId,
          acpSrtFctId: WA1120Dest.fixPlacId,
          tmpLocId: WA1120WkPlac.wkplacId,
        },
      ],
    };

    const requestData = await setIFA0110RequestData('IFT0130', requestDataDtl);

    // サーバー通信処理（Api.js内の関数を呼び出し）
    const res = await sendToServer(requestData, 'IFA0110', '輸送カード申請');
    const response = res as AxiosResponse<
      IFA0110Response<IFT0130Response<IFT0130ResponseDtl1, IFT0130ResponseDtl2>>
    >;

    return {success: true, data: response.data.gyDt};
  } catch (error) {
    const e = error as CustomError;
    return {
      success: false,
      error: e.message,
      status: e.status,
      code: e.code,
      api: e.api,
    };
  }
};

/************************************************
 * IFT0140_定置ステータス更新(荷下登録呼び出し)
 ************************************************/
export const IFT0140FromWA1131 = async (
  WA1130Data: WA1130Const,
  IFT0640Data: IFT0640ResponseDtl<IFT0640ResponseDtlDtlCheck>,
  dateStr: string,
): Promise<ApiResponse<IFT0140Response<IFT0140ResponseDtl>>> => {
  try {
    const realm = getInstance();
    const loginInfo = realm.objects('login')[0];
    const trmId = (await loadFromKeystore('trmId')) as TrmId;
    if (WA1130Data.fixPlacId) {
      WA1130Data.fixPlacId = 'TD' + WA1130Data.fixPlacId.substring(2);
    }
    const requestDataDtl = {
      comId: loginInfo.comId,
      stgLocId: WA1130Data.storPlacId,
      styDt: dateStr,
      dtl: [
        IFT0640Data.lgSdBgDtl.map(item => ({
          chgKnd: 'I',
          sndId:
            'TJ' + trmId.trmId + dateStr.replace(/[^0-9]/g, '').slice(0, 14),
          newTagId: item.newTagId,
          styLocId: WA1130Data.fixPlacId,
          stySec: '1',
          areNo: '1',
          nos: '1',
        })),
      ],
    };

    const requestData = await setIFA0110RequestData('IFT0140', requestDataDtl);

    // サーバー通信処理（Api.js内の関数を呼び出し）
    const res = await sendToServer(
      requestData,
      'IFA0110',
      '荷下定置ステータス更新',
    );
    const response = res as AxiosResponse<
      IFA0110Response<IFT0140Response<IFT0140ResponseDtl>>
    >;

    return {success: true, data: response.data.gyDt};
  } catch (error) {
    const e = error as CustomError;
    return {
      success: false,
      error: e.message,
      status: e.status,
      code: e.code,
      api: e.api,
    };
  }
};

/************************************************
 * IFT0140_定置ステータス更新
 ************************************************/
export const IFT0140 = async (
  WA1140Data: WA1140Const,
  dateStr: string,
): Promise<ApiResponse<IFT0140Response<IFT0140ResponseDtl>>> => {
  try {
    const realm = getInstance();
    const loginInfo = realm.objects('login')[0];
    const trmId = (await loadFromKeystore('trmId')) as TrmId;
    const requestDataDtl = {
      comId: loginInfo.comId,
      stgLocId: WA1140Data.storPlacId,
      styDt: dateStr,
      dtl: [
        {
          chgKnd: 'I',
          sndId:
            'TJ' + trmId.trmId + dateStr.replace(/[^0-9]/g, '').slice(0, 14),
          newTagId: WA1140Data.newTagId,
          styLocId: WA1140Data.fixPlacId,
          stySec: WA1140Data.stySec,
          areNo: WA1140Data.areNo,
          nos: WA1140Data.nos,
        },
      ],
    };

    const requestData = await setIFA0110RequestData('IFT0140', requestDataDtl);

    // サーバー通信処理（Api.js内の関数を呼び出し）
    const res = await sendToServer(
      requestData,
      'IFA0110',
      '定置ステータス更新',
    );
    const response = res as AxiosResponse<
      IFA0110Response<IFT0140Response<IFT0140ResponseDtl>>
    >;

    return {success: true, data: response.data.gyDt};
  } catch (error) {
    const e = error as CustomError;
    return {
      success: false,
      error: e.message,
      status: e.status,
      code: e.code,
      api: e.api,
    };
  }
};

/************************************************
 * IFT0210_輸送カード承認状況
 ************************************************/
export const IFT0210 = async (
  trpCardNo: string,
): Promise<ApiResponse<IFT0210Response<IFT0210ResponseDtl>>> => {
  try {
    const realm = getInstance();
    const loginInfo = realm.objects('login')[0];
    const requestDataDtl = {
      comId: loginInfo.comId,
      dtl: [
        {
          crdNo: trpCardNo,
        },
      ],
    };

    const requestData = await setIFA0110RequestData('IFT0210', requestDataDtl);

    // サーバー通信処理（Api.js内の関数を呼び出し）
    const res = await sendToServer(
      requestData,
      'IFA0110',
      '輸送カード承認状況',
    );
    const response = res as AxiosResponse<
      IFA0110Response<IFT0210Response<IFT0210ResponseDtl>>
    >;

    return {success: true, data: response.data.gyDt};
  } catch (error) {
    const e = error as CustomError;
    return {
      success: false,
      error: e.message,
      status: e.status,
      code: e.code,
      api: e.api,
    };
  }
};

/************************************************
 * IFT0420_新タグ紐付データ取込（焼却灰）
 ************************************************/
export const IFT0420 = async (
  wlPlac: WA1090WkPlacConst,
  oldTagInfo: WA1091OldTagInfoConst,
  dateStr: string,
  newTagId: string,
  data: WA1092WtDsConst,
  memo: string,
): Promise<ApiResponse<IFT0420Response<IFT0420ResponseDtl>>> => {
  try {
    const realm = getInstance();
    const loginInfo = realm.objects('login')[0];
    const trmId = (await loadFromKeystore('trmId')) as TrmId;
    const requestDataDtl = {
      comId: loginInfo.comId,
      tmpLocId: wlPlac.wkplacId,
      dtl: [
        {
          chgKnd: 'I',
          sndId:
            'SH' + trmId.trmId + dateStr.replace(/[^0-9]/g, '').slice(0, 14),
          newTagId: newTagId,
          oldTagId: oldTagInfo.oldTagId,
          tyRegDt: dateStr, //YYYY/MM/DD HH:mm:ss
          lnkNewTagDatMem: memo,
          ashTyp: oldTagInfo.ashTyp,
          meaRa: oldTagInfo.meaRa,
          conRa: oldTagInfo.conRa,
          surDsRt: data.caLgSdBgDs,
          surDsDt: dateStr.slice(0, 10), //YYYY/MM/DD
          surDsWt: data.caLgSdBgWt,
        },
      ],
    };

    const requestData = await setIFA0110RequestData('IFT0420', requestDataDtl);

    // サーバー通信処理（Api.js内の関数を呼び出し）
    const res = await sendToServer(
      requestData,
      'IFA0110',
      '新タグ紐付データ取込(焼却灰)',
    );
    const response = res as AxiosResponse<
      IFA0110Response<IFT0420Response<IFT0420ResponseDtl>>
    >;

    return {success: true, data: response.data.gyDt};
  } catch (error) {
    const e = error as CustomError;
    return {
      success: false,
      error: e.message,
      status: e.status,
      code: e.code,
      api: e.api,
    };
  }
};

/************************************************
 * IFT0640_輸送カード情報連携
 ************************************************/
export const IFT0640 = async (
  WA1130Data: WA1130Const,
): Promise<
  ApiResponse<IFT0640Response<IFT0640ResponseDtl<IFT0640ResponseDtlDtl>>>
> => {
  try {
    const realm = getInstance();
    const loginInfo = realm.objects('login')[0];
    const requestDataDtl = {
      comId: loginInfo.comId,
      dtl: [
        {
          trpComId: WA1130Data.trpComId,
          crdNo: WA1130Data.trpCrdNo,
        },
      ],
    };

    const requestData = await setIFA0110RequestData('IFT0640', requestDataDtl);

    // サーバー通信処理（Api.js内の関数を呼び出し）
    const res = await sendToServer(
      requestData,
      'IFA0110',
      '輸送カード情報連携',
    );
    const response = res as AxiosResponse<
      IFA0110Response<
        IFT0640Response<IFT0640ResponseDtl<IFT0640ResponseDtlDtl>>
      >
    >;

    return {success: true, data: response.data.gyDt};
  } catch (error) {
    const e = error as CustomError;
    return {
      success: false,
      error: e.message,
      status: e.status,
      code: e.code,
      api: e.api,
    };
  }
};

/************************************************
 * サーバー通信を行う関数
 * @param {*} requestData
 * @param {*} endpoint エンドポイント
 * @param {*} msg インターフェース名
 ************************************************/
export const sendToServer = async <TRequest, TResponse>(
  requestData: TRequest,
  endpoint: string,
  msg: string,
): Promise<AxiosResponse<TResponse>> => {
  // 設定ファイルから接続先URLを取得
  const retURL = await getBaseURL(endpoint);
  const URI = retURL.connectionURL;

  // リクエスト送信前にログ記録
  await logCommunication(
    'SEND',
    URI,
    null,
    endpoint + ' : ' + JSON.stringify(requestData),
  );

  // Axiosリクエストの設定
  const config = {
    method: 'post',
    url: URI,
    data: JSON.stringify(requestData), // 通信を行うインターフェース内容
    timeout: 30000, // タイムアウト時間を30秒で指定
    validateStatus: function (status: number) {
      return status >= 100 && status <= 599; // 全てのHTTPステータスコードを例外としない
    },
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Axiosでサーバー通信を行う
  let response = null;
  try {
    response = await axios(config);
  } catch (e) {
    const error = e as AxiosError;
    const errorMessage = error.response
      ? `Status: ${error.response.status}, Body: ${JSON.stringify(
          error.response.data,
        )}`
      : error.message;
    // エラー時にログ記録
    await logCommunication('ERROR', URI, null, errorMessage);
    if (error.code === 'ECONNABORTED') {
      // タイムアウト処理
      console.log('Communication timed out', error);
      throw new CustomError('timeout', null, null, msg);
    } else {
      // その他の異常処理
      console.log('An error occurred during communication', error);
      throw new CustomError('error', null, null, msg);
    }
  }
  // HTTPステータスコードが200以外の場合は異常処理
  if (response.status !== 200) {
    console.log('Server returned status code ', response.status);
    throw new CustomError('codeHttp200', response.status, null, msg);
    //【応答データ】.【ステータスコード】＝"01:異常"　の場合
  } else if (
    (response.data && response.data.sttCd && response.data.sttCd === '01') ||
    (response.data &&
      endpoint === 'IFA0110' &&
      response.data.gyDt &&
      response.data.gyDt.sttCd &&
      response.data.gyDt.sttCd === '01')
  ) {
    if (response.data && response.data.sttCd && response.data.sttCd === '01') {
      console.log('Server returned data sttCd ', response.data.sttCd);
    } else {
      console.log('Server returned data gyDt sttCd ', response.data.gyDt.sttCd);
    }
    // 応答受信後にログ記録
    await logCommunication(
      'RECV',
      URI,
      response.status,
      endpoint + ' : ' + JSON.stringify(response.data),
    );
    throw new CustomError(
      'codeRsps01',
      response.status,
      response.data.sttCd,
      msg,
    );
  }

  // 応答受信後にログ記録
  await logCommunication(
    'RECV',
    URI,
    response.status,
    endpoint + ' : ' + JSON.stringify(response.data),
  );
  return response;
};

/************************************************
 * サーバー通信を行う関数(ファイル送信)
 * @param {*} requestData
 * @param {*} endpoint エンドポイント
 * @param {*} msg インターフェース名
 * @param {*} filePath ファイルパス
 ************************************************/
export const sendFileToServer = async <TRequest, TResponse>(
  requestData: TRequest,
  endpoint: string,
  msg: string,
  filePath: string,
): Promise<AxiosResponse<TResponse>> => {
  const formData = new FormData();
  formData.append('file', {
    uri: `file://${filePath}`,
    type: 'multipart/form-data',
    name: filePath.split('/').pop(),
  });
  // JSONデータをFormDataに追加
  for (const key in requestData) {
    formData.append(key, requestData[key]);
  }
  // 設定ファイルから接続先URLを取得
  const retURL = await getBaseURL(endpoint);
  const URI = retURL.connectionURL;

  // リクエスト送信前にログ記録
  await logCommunication(
    'SEND',
    URI,
    null,
    endpoint + ' : ' + `${JSON.stringify(requestData)} filePath:${filePath}`,
  );

  // Axiosリクエストの設定
  const config = {
    method: 'post',
    url: URI,
    data: formData, // 通信を行うインターフェース内容
    timeout: 30000, // タイムアウト時間を30秒で指定
    validateStatus: function (status: number) {
      return status >= 100 && status <= 599; // 全てのHTTPステータスコードを例外としない
    },
    headers: {
      'Content-Type': 'multipart/form-data', // ログファイル送信時
      //React Nativeのネットワーキングは、適切なContent-Typeヘッダーとバウンダリを自動的に扱うことができるため
      //multipart/form-dataを扱う際には、バウンダリを設定せずで問題無し
    },
  };

  // Axiosでサーバー通信を行う
  let response = null;
  try {
    response = await axios(config);
  } catch (e) {
    const error = e as AxiosError;
    const errorMessage = error.response
      ? `Status: ${error.response.status}, Body: ${JSON.stringify(
          error.response.data,
        )}`
      : error.message;
    // エラー時にログ記録
    await logCommunication('ERROR', URI, null, errorMessage);
    if (error.code === 'ECONNABORTED') {
      // タイムアウト処理
      console.log('Communication timed out', errorMessage);
      throw new CustomError('timeout', null, null, msg);
    } else {
      // その他の異常処理
      console.log('An error occurred during communication', errorMessage);
      throw new CustomError('error', null, null, msg);
    }
  }
  // HTTPステータスコードが200以外の場合は異常処理
  if (response.status !== 200) {
    console.log('Server returned status code ', response.status);
    throw new CustomError('codeHttp200', response.status, null, msg);
    //【応答データ】.【ステータスコード】＝"01:異常"　の場合
  } else if (
    (response.data && response.data.sttCd && response.data.sttCd === '01') ||
    (response.data &&
      endpoint === 'IFA0110' &&
      response.data.gyDt &&
      response.data.gyDt.sttCd &&
      response.data.gyDt.sttCd === '01')
  ) {
    if (response.data && response.data.sttCd && response.data.sttCd === '01') {
      console.log('Server returned data sttCd ', response.data.sttCd);
    } else {
      console.log('Server returned data gyDt sttCd ', response.data.gyDt.sttCd);
    }
    // 応答受信後にログ記録
    await logCommunication(
      'RECV',
      URI,
      response.status,
      endpoint + ' : ' + JSON.stringify(response.data),
    );
    throw new CustomError(
      'codeRsps01',
      response.status,
      response.data.sttCd,
      msg,
    );
  }

  // 応答受信後にログ記録
  await logCommunication(
    'RECV',
    URI,
    response.status,
    endpoint + ' : ' + JSON.stringify(response.data),
  );
  return response;
};

/************************************************
 * 設定ファイルの読み込み関数
 * @returns
 ************************************************/
const getBaseURL = async (endpoint: string) => {
  const realm = getInstance();
  const settingsInfo = realm.objects('settings')[0];

  let baseUrl = settingsInfo.serverUrl as string;
  return {
    connectionURL: baseUrl + endpoint,
  };
};

/************************************************
 * カスタムエラークラス
 * @returns
 ************************************************/
class CustomError extends Error {
  status: number | null;
  code: string | null;
  api: string;
  constructor(
    message: string,
    status: number | null,
    code: string | null,
    api: string,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.api = api;
  }
}
