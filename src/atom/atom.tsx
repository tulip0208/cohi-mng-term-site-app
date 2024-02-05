/**-------------------------------------------
 * 画面間共有変数
 * atom/atom.tsx
 * ---------------------------------------------*/
import {atom, atomFamily} from 'recoil';
import {
  WA1070Const,
  WA1080Const,
  WA1100Const,
  WA1130Const,
  WA1140Const,
  WA1110Const,
  WA1060Const,
  WA1060WkPlacConst,
  WA1060OldTagInfoConst,
  WA1092WtDsConst,
  WA1090WkPlacConst,
  WA1091OldTagInfoConst,
  WA1120Const,
  WA1120WkPlacConst,
  WA1120CarConst,
  WA1120DrvConst,
  WA1120DestConst,
  WA1121NewTagConst,
  WA1121DataConst,
  IFT0640ResponseDtl,
  IFT0640ResponseDtlDtlCheck,
} from '../types/type';
import Realm from 'realm';

//共通 フッタサーバ名用
export const serverNameState = atom<string>({
  key: 'serverNameState',
  default: '',
});

//共通 realm用
export const realmInstanceState = atomFamily<Realm | null, string>({
  key: 'realmInstanceState',
  default: null,
});

//位置情報取得用
export const locationStartedState = atom<boolean>({
  key: 'locationStartedState',
  default: false,
});
export const locationStoppedState = atom<boolean>({
  key: 'locationStoppedState',
  default: false,
});
export const locationErroredState = atom<boolean>({
  key: 'locationErroredState',
  default: false,
});
export const watchIdState = atom<number | null>({
  key: 'watchIdState',
  default: null,
});

//WA1060用
export const WA1060NewTagIdState = atom<string>({
  key: 'WA1060NewTagIdState',
  default: '',
});
export const WA1060CmnTagFlgState = atom<string>({
  key: 'WA1060CmnTagFlgState',
  default: '',
});
export const WA1060DataState = atom<WA1060Const>({
  key: 'WA1060DataState',
  default: {
    tyRegDt: '',
    caLgSdBgWt: '',
    caLgSdBgDs: '',
    rmSolTyp: '', //除去土壌等種別
    pkTyp: '', //荷姿種別
    usgInnBg: '', //内袋の利用方法
    tsuInd: '', //津波浸水域由来
    splFac: '', //特定施設由来
    usgAluBg: '', //アルミ内袋の利用
    yesNoOP: '', //オーバーパック有無
    estRa: '', //推定放射能濃度
  },
});
export const WA1060OldTagInfosState = atom<WA1060OldTagInfoConst[]>({
  key: 'WA1060OldTagInfosState',
  default: [],
});
export const WA1060PrevScreenId = atom<string>({
  key: 'WA1060PrevScreenId',
  default: '',
});
export const WA1060WkPlacState = atom<WA1060WkPlacConst>({
  key: 'WA1060WkPlacState',
  default: {
    idTyp: '', //ID種別
    wkplacId: '', //作業場所ID
    wkplacNm: '', //作業場所名
    delSrcTyp: '', //搬出元種別
    wkplac: '', //作業場所
  },
});
export const WA1061BackState = atom<boolean>({
  key: 'WA1061BackState',
  default: false,
});
export const WA1061TagIdState = atom<[string, string]>({
  key: 'WA1061TagIdState',
  default: ['', ''],
});
export const WA1063MemoAutoState = atom<string>({
  key: 'WA1063MemoAutoState',
  default: '',
});
export const WA1065MemoState = atom<string>({
  key: 'WA1065MemoState',
  default: '',
});
//WA1070用
export const WA1070DataState = atom<WA1070Const | null>({
  key: 'WA1070DataState',
  default: null,
});
export const WA1071BackState = atom<boolean>({
  key: 'WA1071BackState',
  default: false,
});
//WA1080用
export const WA1080DataState = atom<WA1080Const | null>({
  key: 'WA1080DataState',
  default: null,
});
export const WA1081BackState = atom<boolean>({
  key: 'WA1081BackState',
  default: false,
});
//WA1090用
export const WA1090NewTagIdState = atom<string>({
  key: 'WA1090NewTagIdState',
  default: '',
});
export const WA1091OldTagInfoState = atom<WA1091OldTagInfoConst>({
  key: 'WA1091OldTagInfoState',
  default: {
    oldTagId: '', //旧タグID
    ashTyp: '', // 焼却灰種別、半角英数字
    meaRa: '', // 測定濃度（焼却時）、半角数値
    conRa: '', // 換算濃度（焼却時）、半角数値
    surDsRt: '', // 表面線量率（焼却時）、半角数値（オプショナル）
    surDsDt: '', // 表面線量率測定日（焼却時）、日付（オプショナル）
    surDsWt: '', // 表面線量率測定時重量（焼却時）、半角数値（オプショナル）
  },
});
export const WA1092WtDsState = atom<WA1092WtDsConst>({
  key: 'WA1092WtDsState',
  default: {
    caLgSdBgWt: '',
    caLgSdBgDs: '',
  },
});
export const WA1090PrevScreenId = atom<string>({
  key: 'WA1090PrevScreenId',
  default: '',
});
export const WA1090WkPlacState = atom<WA1090WkPlacConst>({
  key: 'WA1090WkPlacState',
  default: {
    idTyp: '', //ID種別
    wkplacId: '', //作業場所ID
    wkplacNm: '', //作業場所名
    delSrcTyp: '', //搬出元種別
    wkplac: '', //作業場所
  },
});
export const WA1091BackState = atom<boolean>({
  key: 'WA1091BackState',
  default: false,
});
export const WA1093MemoState = atom<string>({
  key: 'WA1093MemoState',
  default: '',
});
//WA1100用
export const WA1100DataState = atom<WA1100Const | null>({
  key: 'WA1100DataState',
  default: null,
});
export const WA1101BackState = atom<boolean>({
  key: 'WA1101BackState',
  default: false,
});
//WA1110用
export const WA1110DataState = atom<WA1110Const | null>({
  key: 'WA1110DataState',
  default: null,
});
export const WA1111BackState = atom<boolean>({
  key: 'WA1111BackState',
  default: false,
});
//WA1120用
export const WA1120DataState = atom<WA1120Const>({
  key: 'WA1120DataState',
  default: {
    wkplcTyp: '',
    wkplc: '',
  },
});
export const WA1120BackState = atom<boolean>({
  key: 'WA1120BackState',
  default: false,
});
export const WA1120TrpCardNoState = atom<string>({
  key: 'WA1120TrpCardNoState',
  default: '',
});
export const WA1120PrevScreenId = atom<string>({
  key: 'WA1120PrevScreenId',
  default: '',
});
export const WA1120WkPlacState = atom<WA1120WkPlacConst>({
  key: 'WA1120WkPlacState',
  default: {
    idTyp: '', //ID種別
    wkplacId: '', //作業場所ID
    wkplacNm: '', //作業場所名
    delSrcTyp: '', //搬出元種別
    wkplac: '', //作業場所
  },
});
export const WA1120CarState = atom<WA1120CarConst>({
  key: 'WA1120CarState',
  default: {
    idTyp: '', //ID種別
    carId: '', //車両ID
    carNm: '', //車両名称
    carNo: '', //車両番号
    maxWt: '', //最大積載量
    carWt: '', //車両重量
    empCarWt: '', //空車重量
  },
});
export const WA1120DrvState = atom<WA1120DrvConst>({
  key: 'WA1120DrvState',
  default: {
    idTyp: '', //ID種別
    drvId: '', //運転手ID
    drvNm: '', //運転手名
  },
});
export const WA1120DestState = atom<WA1120DestConst>({
  key: 'WA1120DestState',
  default: {
    idTyp: '', //ID種別
    storPlacId: '', //保管場ID
    fixPlacId: '', //定置場ID
    fixPlacNm: '', //定置場名
    facTyp: '', //施設区分
    raKbn: '', //濃度区分
  },
});
export const WA1121NewTagListState = atom<[WA1121NewTagConst]>({
  key: 'WA1121NewTagListState',
  default: [
    {
      newTagId: '', //新タグID
      rmSolTyp: '', //除去土壌等種別
      ashTyp: '', //焼却灰種別
      caLgSdBgWt: '', //重量
      caLgSdBgDs: '', //線量
      estRa: '', //濃度
      raKbn: '', //濃度区分
      class: '', //分類
      newTagIdRed: false, //新タグIDを赤文字にするかどうか
      caLgSdBgDsRed: false, //線量を赤文字にするかどうか
    },
  ],
});
export const WA1121DataState = atom<WA1121DataConst<WA1121NewTagConst>>({
  key: 'WA1121DataState',
  default: {
    freJudTyp: '0', //フレコン判定種別
    freJudNen: '0', //フレコン判定不燃可燃
    freJudGai: '0', //フレコン判定有害無害
    freJudNod: '0', //フレコン判定濃度
    freJudWt: '0', //フレコン判定重量
    freTyp: '0', //フレコン種別
    udNoMb: '0', //高低濃度混載
    nenMb: '0', //不燃可燃混載
    haiMb: '0', //主灰飛灰混載
    monoTyp: '0', //物品種類
    gai: '0', //有害・無害
    trpCardTagInfoList: [], //輸送カード新タグID(配列)
    flamNm: '0', //可燃
    nonFlamNm: '0', //不燃
    bottomAshNm: '0', //主灰
    flyAshNm: '0', //飛灰
    surDsRt: '', //表面線量率(最大)
    maxEstRa: '', //放射能濃度(最大)
    possibleWt: '0', //積載可能重量
    sumWt: '0', //累計積載量
    trpCardApRslt: '0', //輸送カード申請結果
    leftWt: '0', //残り積載可能
  },
});
//WA1130用
export const WA1130DataState = atom<WA1130Const>({
  key: 'WA1130DataState',
  default: {
    facTyp: '', //施設区分
    trpStatus: '', //輸送ステータス区分
    storPlacId: '', //保管場ID
    fixPlacId: '', //定置場ID
    wkplcTyp: '',
    wkplc: '',
    newTagId: '',
    trpComId: '',
    trpCrdNo: '', //輸送カード番号
    listNewTag: [], //新タグID一覧
  },
});
export const WA1130PrevScreenId = atom<string>({
  key: 'WA1130PrevScreenId',
  default: '',
});
export const WA1131BackState = atom<boolean>({
  key: 'WA1131BackState',
  default: false,
});
//WA1140用
export const WA1140DataState = atom<WA1140Const>({
  key: 'WA1140DataState',
  default: {
    storPlacId: '', //保管場ID
    fixPlacId: '', //定置場ID
    wkplcTyp: '',
    wkplc: '',
    newTagId: '',
    rmSolTyp: '',
    stySec: '',
    areNo: '',
    nos: '',
  },
});
export const IFT0640DataState = atom<
  IFT0640ResponseDtl<IFT0640ResponseDtlDtlCheck>
>({
  key: 'IFT0640DataState',
  default: {
    trpComId: '',
    crdNo: '',
    tmpLocId: '',
    vclId: '',
    vclNum: '',
    drvId: '',
    drvName: '',
    stgLocId: '',
    acpSrtFctId: '',
    lgSdBgDtl: [],
    vclRdtDsFr: '',
    vclRdtDsRe: '',
    vclRdtDsLe: '',
    vclRdtDsRi: '',
    lctRdtDsFr: '',
    lctRdtDsRe: '',
    lctRdtDsLe: '',
    lctRdtDsRi: '',
  },
});
export const WA1140PrevScreenId = atom<string>({
  key: 'WA1140PrevScreenId',
  default: '',
});
export const WA1141BackState = atom<boolean>({
  key: 'WA1141BackState',
  default: false,
});
