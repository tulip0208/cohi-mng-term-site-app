/**-------------------------------------------
 * 画面間共有変数
 * atom/atom.tsx
 * ---------------------------------------------*/
import { atom } from "recoil";
import {WA1070Const} from "../types/type"

//WA1070用
export const WA1070DataState = atom<WA1070Const|null>({
    key: "WA1070DataState",
    default: null,
});