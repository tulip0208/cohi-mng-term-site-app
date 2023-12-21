/**-------------------------------------------
 * 画面間共有変数
 * atom/atom.tsx
 * ---------------------------------------------*/
import { atom, atomFamily } from "recoil";
import {WA1070Const,WA1080Const} from "../types/type"
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

//WA1070用
export const WA1070DataState = atom<WA1070Const|null>({key: "WA1070DataState",default: null,});
//WA1080用
export const WA1080DataState = atom<WA1080Const|null>({key: "WA1080DataState",default: null,});