/**-------------------------------------------
 * 画面間共有変数
 * atom/atom.tsx
 * ---------------------------------------------*/
import { atom, atomFamily } from "recoil";
import {WA1070Const,WA1080Const,WA1100Const,WA1140Const,WA1110Const,WA1060Const,WA1060WkPlacConst,WA1060OldTagInfoConst,WA1092WtDsConst,WA1090WkPlacConst,WA1091OldTagInfoConst} from "../types/type"
import Realm from "realm";

//共通 フッタサーバ名用
export const serverNameState = atom<string>({key: "serverNameState",default: "",});

//共通 realm用
export const realmInstanceState = atomFamily<Realm | null, string>({key: "realmInstanceState",default: null,});

//位置情報取得用
export const locationStartedState = atom<boolean>({key: "locationStartedState",default: false,});
export const locationStoppedState = atom<boolean>({key: "locationStoppedState",default: false,});
export const locationErroredState = atom<boolean>({key: "locationErroredState",default: false,});
export const watchIdState = atom<number|null>({key: "watchIdState",default: null,});

//WA1060用
export const WA1060NewTagIdState = atom<string>({key: "WA1060NewTagIdState",default: "",});
export const WA1060CmnTagFlgState = atom<string>({key: "WA1060CmnTagFlgState",default: "",});
export const WA1060DataState = atom<WA1060Const>({key: "WA1060DataState",default:{
    tyRegDt: '', 
    caLgSdBgWt: '',
    caLgSdBgDs: '',
    rmSolTyp: '',//除去土壌等種別
    pkTyp: '',//荷姿種別
    usgInnBg: '', //内袋の利用方法
    tsuInd: '',//津波浸水域由来
    splFac: '',//特定施設由来
    usgAluBg: '',//アルミ内袋の利用
    yesNoOP: '',//オーバーパック有無
    estRa:'',//推定放射能濃度
  }});
export const WA1060OldTagInfosState = atom<WA1060OldTagInfoConst[]>({key: "WA1060OldTagInfosState",default:[]});
export const WA1060PrevScreenId = atom<string>({key: "WA1060PrevScreenId",default: "",});
export const WA1060WkPlacState = atom<WA1060WkPlacConst>({key: "WA1060WkPlacState",default: {
    idTyp:'',//ID種別
    wkplacId:'',//作業場所ID
    wkplacNm:'',//作業場所名
    delSrcTyp:'',//搬出元種別
    wkplac:'',//作業場所
  }});
export const WA1061BackState = atom<boolean>({key: "WA1061BackState",default: false,});
export const WA1061TagIdState = atom<[string,string]>({key: "WA1061TagIdState",default: ["",""],});
export const WA1063MemoAutoState = atom<string>({key: "WA1063MemoAutoState",default: "",});
export const WA1065MemoState = atom<string>({key: "WA1065MemoState",default: "",});
//WA1070用
export const WA1070DataState = atom<WA1070Const|null>({key: "WA1070DataState",default: null,});
export const WA1071BackState = atom<boolean>({key: "WA1071BackState",default: false,});
//WA1080用
export const WA1080DataState = atom<WA1080Const|null>({key: "WA1080DataState",default: null,});
export const WA1081BackState = atom<boolean>({key: "WA1081BackState",default: false,});
//WA1090用
export const WA1090NewTagIdState = atom<string>({key: "WA1090NewTagIdState",default: "",});
export const WA1091OldTagInfoState = atom<WA1091OldTagInfoConst>({key: "WA1091OldTagInfoState",default: {
  oldTagId:'', //旧タグID
  ashTyp: '',  // 焼却灰種別、半角英数字
  meaRa: '',  // 測定濃度（焼却時）、半角数値
  conRa: '',  // 換算濃度（焼却時）、半角数値
  surDsRt: '',  // 表面線量率（焼却時）、半角数値（オプショナル）
  surDsDt: '',  // 表面線量率測定日（焼却時）、日付（オプショナル）
  surDsWt: '',  // 表面線量率測定時重量（焼却時）、半角数値（オプショナル）
}});
export const WA1092WtDsState = atom<WA1092WtDsConst>({key: "WA1092WtDsState",default:{
    caLgSdBgWt: '',
    caLgSdBgDs: '',
  }});
export const WA1090PrevScreenId = atom<string>({key: "WA1090PrevScreenId",default: "",});
export const WA1090WkPlacState = atom<WA1090WkPlacConst>({key: "WA1090WkPlacState",default: {
    idTyp:'',//ID種別
    wkplacId:'',//作業場所ID
    wkplacNm:'',//作業場所名
    delSrcTyp:'',//搬出元種別
    wkplac:'',//作業場所
  }});
export const WA1091BackState = atom<boolean>({key: "WA1091BackState",default: false,});
export const WA1093MemoState = atom<string>({key: "WA1093MemoState",default: "",});
//WA1100用
export const WA1100DataState = atom<WA1100Const|null>({key: "WA1100DataState",default: null,});
export const WA1101BackState = atom<boolean>({key: "WA1101BackState",default: false,});
//WA1110用
export const WA1110DataState = atom<WA1110Const|null>({key: "WA1110DataState",default: null,});
export const WA1111BackState = atom<boolean>({key: "WA1111BackState",default: false,});
//WA1140用
export const WA1140DataState = atom<WA1140Const>({key: "WA1140DataState",default: {
  storPlacId:'',//保管場ID
  fixPlacId:'',//定置場ID
  wkplcTyp: '',
  wkplc: '',
  newTagId: '',
  rmSolTyp:'',
  stySec:'',
  areNo:'',
  nos:'',
},});
export const WA1140PrevScreenId = atom<string>({key: "WA1140PrevScreenId",default: "",});
export const WA1141BackState = atom<boolean>({key: "WA1141BackState",default: false,});