import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RecoilRoot} from 'recoil';
import {RootList} from '../src/navigation/AppNavigator';
import WA1064 from '../src/screens/WA1064';
import {
  WA1091BackState,
  WA1092WtDsState,
  WA1091OldTagInfoState,
  WA1093MemoState,
  WA1060DataState,
} from '../src/atom/atom';
import {atom, atomFamily} from 'recoil';
import {IFT0420} from '../src/utils/Api';
import bundledSettingsPath from '../assets/data/settings.json';
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
} from '../src/types/type';
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
} as unknown as StackNavigationProp<RootList, 'WA1064'>; // 型アサーション

const mockShowAlert = jest.fn(() => Promise.resolve(true));
jest.mock('../src/components/AlertContext', () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
    // 他の必要な関数やプロパティがあればここに追加
  }),
}));
// // Api.jsのIFA0010関数をモック化
// jest.mock('../src/utils/Api', () => ({
//     IFT0420: jest.fn<Promise<ApiResponse<IFT0420Response<IFT0420ResponseDtl>>>, [WA1064WkPlacConst, WA1091OldTagInfoConst, string, string, WA1092WtDsConst, string, string]>(),
// }));
let mockRealmWrite: (callback: () => void) => void;

jest.mock('../src/utils/Realm', () => {
  return {
    getInstance: jest.fn().mockReturnValue({
      objects: jest.fn().mockImplementation(function (schema: string) {
        if (schema === 'user') {
          return [
            {
              comId: 1,
              userId: 1,
            },
          ];
        } else if (schema === 'login') {
          return [
            {
              userId: 1,
            },
          ];
        } else if (schema === 'temporary_places') {
          return [
            {
              id: '72b9feea-de53-47ea-b00c-dbda5d8ca53c',
              tmpPlacId: '2987023', //場所ID
              tmpPlacNm: '大阪', //名前
            },
          ];
        } else if (schema === 'storage_places') {
          return [
            {
              id: '72b9feea-de53-47ea-b00c-dbda5d8ca53c',
              storPlacId: '2987023', //場所ID
              storPlacNm: '大阪', //名前
            },
          ];
        } else if (schema === 'fixed_places') {
          return [
            {
              id: '72b9feea-de53-47ea-b00c-dbda5d8ca53c',
              fixPlacId: '2987023', //場所ID
              fixPlacNm: '大阪', //名前
            },
          ];
        } else if (schema === 'settings') {
          return [bundledSettingsPath];
        }
        return [];
      }),
      write: jest.fn().mockImplementation(callback => mockRealmWrite(callback)),
      create: jest.fn(),
    }),
    deleteRealm: jest.fn(),
  };
});

describe('WA1064 レンダリング', () => {
  //最初のレンダリング
  it('最初のレンダリング', async () => {
    const {getByText, findByText} = render(
      <RecoilRoot>
        <WA1064 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    await waitFor(() => {
      expect(getByText(/新タグID：/i)).toBeTruthy();
      expect(getByText(/旧タグ数：/i)).toBeTruthy();
      expect(getByText(/重量、線量を入力して下さい。/i)).toBeTruthy();
      expect(getByText(/推定放射能濃度：/i)).toBeTruthy();
    });
  });
  //レンダリング
  it('レンダリング (WA1060Data が null ではない)', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        WA1060Data: WA1060DataState,
      },
    });

    const mockedState = {
      newTagId: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: '99999999',
          caLgSdBgDs: '11.11.11.11',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: 'あああ', //オーバーパック有無
          estRa: 'あああ',
        },
      }),
    };

    const {getByText, findByText} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1064 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    await waitFor(() => {
      expect(getByText(/新タグID：/i)).toBeTruthy();
      expect(getByText(/旧タグ数：/i)).toBeTruthy();
      expect(getByText(/重量、線量を入力して下さい。/i)).toBeTruthy();
      expect(getByText(/推定放射能濃度：/i)).toBeTruthy();
    });
  });
  //レンダリング
  it('レンダリング (WA1060Data が null ではありません), caLgSdBgWt = 0)', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        WA1060Data: WA1060DataState,
      },
    });

    const mockedState = {
      newTagId: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: '0',
          caLgSdBgDs: 'あ.あ.あ.あ',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: 'あああ', //オーバーパック有無
          estRa: 'あああ',
        },
      }),
    };

    const {getByText, findByText} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1064 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    await waitFor(() => {
      expect(getByText(/新タグID：/i)).toBeTruthy();
      expect(getByText(/旧タグ数：/i)).toBeTruthy();
      expect(getByText(/重量、線量を入力して下さい。/i)).toBeTruthy();
      expect(getByText(/推定放射能濃度：/i)).toBeTruthy();
    });
  });

  //レンダリング
  it('ブラーイベント', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        WA1060Data: WA1060DataState,
      },
    });

    const mockedState = {
      newTagId: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: '99999999',
          caLgSdBgDs: '11.1.11.11',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: 'あああ', //オーバーパック有無
          estRa: 'あああ',
        },
      }),
    };

    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1064 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const textInput = getByTestId('input_text0');
    fireEvent(textInput, 'blur');

    await waitFor(() => {
      expect(getByText(/新タグID：/i)).toBeTruthy();
      expect(getByText(/旧タグ数：/i)).toBeTruthy();
      expect(getByText(/重量、線量を入力して下さい。/i)).toBeTruthy();
      expect(getByText(/推定放射能濃度：/i)).toBeTruthy();
    });
  });

  //btnAppDestroy -> 01
  it('btnAppDestroy クリックイベント', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        WA1060Data: WA1060DataState,
      },
    });

    const mockedState = {
      newTagId: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: '99999999',
          caLgSdBgDs: '11.1.11.11',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: 'あああ', //オーバーパック有無
          estRa: 'あああ',
        },
      }),
    };

    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1064 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const btn = getByText('破棄');
    fireEvent.press(btn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1060');
    });
  });

  //btnAppDestroy -> 02
  it('btnAppDestroy クリックイベント, 02', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        WA1060Data: WA1060DataState,
      },
    });

    const mockedState = {
      newTagId: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: '99999999',
          caLgSdBgDs: '11.1.11.11',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: 'あああ', //オーバーパック有無
          estRa: 'あああ',
        },
      }),
    };

    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1064 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const btn = getByText('破棄');
    fireEvent.press(btn);

    await waitFor(async () => {
      fireEvent.press(btn);

      await waitFor(() => {
        expect(getByText(/新タグID：/i)).toBeTruthy();
        expect(getByText(/旧タグ数：/i)).toBeTruthy();
        expect(getByText(/重量、線量を入力して下さい。/i)).toBeTruthy();
        expect(getByText(/推定放射能濃度：/i)).toBeTruthy();
      });
    });
  });

  //btnAppBack -> 01
  it('btnAppBack クリックイベント', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        WA1060Data: WA1060DataState,
      },
    });

    const mockedState = {
      newTagId: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: '99999999',
          caLgSdBgDs: '11.1.11.11',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: 'あああ', //オーバーパック有無
          estRa: 'あああ',
        },
      }),
    };

    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1064 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const btn = getByText('戻る');
    fireEvent.press(btn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1063');
    });
  });
  //btnAppBack -> 02 prevScreenId: WA1066
  it('btnAppBack クリックイベント', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        WA1060Data: WA1060DataState,
      },
    });

    const mockedState = {
      newTagId: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: '99999999',
          caLgSdBgDs: '11.1.11.11',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: 'あああ', //オーバーパック有無
          estRa: 'あああ',
        },
      }),
      prevScreenId: atom<string>({
        key: 'WA1060PrevScreenId',
        default: 'WA1066',
      }),
    };

    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1064 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const btn = getByText('戻る');
    fireEvent.press(btn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1066');
    });
  });
  //btnAppBack -> 03 return
  it('btnAppBack クリックイベント', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        WA1060Data: WA1060DataState,
      },
    });

    const mockedState = {
      newTagId: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: '99999999',
          caLgSdBgDs: '11.1.11.11',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: 'あああ', //オーバーパック有無
          estRa: 'あああ',
        },
      }),
    };

    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1064 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const btn = getByText('戻る');
    fireEvent.press(btn);

    await waitFor(async () => {
      fireEvent.press(btn);

      await waitFor(() => {
        expect(getByText(/新タグID：/i)).toBeTruthy();
        expect(getByText(/旧タグ数：/i)).toBeTruthy();
        expect(getByText(/重量、線量を入力して下さい。/i)).toBeTruthy();
        expect(getByText(/推定放射能濃度：/i)).toBeTruthy();
      });
    });
  });

  //btnAppNext -> 05 prevScreenId != ''
  it('btnAppNext クリックイベント', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        WA1060Data: WA1060DataState,
      },
    });

    const mockedState = {
      newTagId: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: '99999999',
          caLgSdBgDs: '11.1.11.11',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: 'あああ', //オーバーパック有無
          estRa: 'あああ',
        },
      }),
      prevScreenId: atom<string>({
        key: 'WA1060PrevScreenId',
        default: '',
      }),
    };

    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1064 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const btn = getByText('次へ');
    fireEvent.press(btn);

    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1066');
    });
  });
  //btnAppNext -> 01
  it('btnAppNext クリックイベント', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        WA1060Data: WA1060DataState,
      },
    });

    const mockedState = {
      newTagId: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: '99999999',
          caLgSdBgDs: '11.1.11.11',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: 'あああ', //オーバーパック有無
          estRa: 'あああ',
        },
      }),
      prevScreenId: atom<string>({
        key: 'WA1060PrevScreenId',
        default: 'WA1069',
      }),
    };

    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1064 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const btn = getByText('次へ');
    fireEvent.press(btn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1066');
    });
  });
  //btnAppNext -> 02 return
  it('btnAppNext クリックイベント', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        WA1060Data: WA1060DataState,
      },
    });

    const mockedState = {
      newTagId: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: '99999999',
          caLgSdBgDs: '11.1.11.11',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: 'あああ', //オーバーパック有無
          estRa: 'あああ',
        },
      }),
    };

    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1064 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const btn = getByText('次へ');
    fireEvent.press(btn);

    await waitFor(async () => {
      fireEvent.press(btn);

      await waitFor(() => {
        expect(getByText(/新タグID：/i)).toBeTruthy();
        expect(getByText(/旧タグ数：/i)).toBeTruthy();
        expect(getByText(/重量、線量を入力して下さい。/i)).toBeTruthy();
        expect(getByText(/推定放射能濃度：/i)).toBeTruthy();
      });
    });
  });
  //btnAppNext -> 03 showAlert: false
  it('btnAppNext クリックイベント', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        WA1060Data: WA1060DataState,
      },
    });

    const mockedState = {
      newTagId: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: '99999999',
          caLgSdBgDs: '11.1.11.11',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: 'あああ', //オーバーパック有無
          estRa: 'あああ',
        },
      }),
    };

    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1064 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    mockShowAlert.mockResolvedValue(false);

    const btn = getByText('次へ');
    fireEvent.press(btn);

    await waitFor(async () => {
      expect(getByText(/新タグID：/i)).toBeTruthy();
      expect(getByText(/旧タグ数：/i)).toBeTruthy();
      expect(getByText(/重量、線量を入力して下さい。/i)).toBeTruthy();
      expect(getByText(/推定放射能濃度：/i)).toBeTruthy();
    });
  });
  //btnAppNext -> 04 Number(caLgSdBgDsInt) + Number('0.' + caLgSdBgDsDec) > Number(settings.radioThres)
  it('btnAppNext クリックイベント', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        WA1060Data: WA1060DataState,
      },
    });

    const mockedState = {
      newTagId: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: '99999999',
          caLgSdBgDs: '12211.1.11.11',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: 'あああ', //オーバーパック有無
          estRa: 'あああ',
        },
      }),
    };

    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1064 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    mockShowAlert.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    const btn = getByText('次へ');
    fireEvent.press(btn);

    await waitFor(async () => {
      expect(getByText(/新タグID：/i)).toBeTruthy();
      expect(getByText(/旧タグ数：/i)).toBeTruthy();
      expect(getByText(/重量、線量を入力して下さい。/i)).toBeTruthy();
      expect(getByText(/推定放射能濃度：/i)).toBeTruthy();
    });
  });

  //input_text1 変更イベント
  it('input_text1 変更イベント', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        WA1060Data: WA1060DataState,
      },
    });

    const mockedState = {
      newTagId: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: '99999999',
          caLgSdBgDs: '12211.1.11.11',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: 'あああ', //オーバーパック有無
          estRa: 'あああ',
        },
      }),
    };

    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1064 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    mockShowAlert.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    const input_text1 = getByTestId('input_text1');
    fireEvent(input_text1, 'changeText', 'あああ');

    await waitFor(async () => {
      expect(getByText(/新タグID：/i)).toBeTruthy();
      expect(getByText(/旧タグ数：/i)).toBeTruthy();
      expect(getByText(/重量、線量を入力して下さい。/i)).toBeTruthy();
      expect(getByText(/推定放射能濃度：/i)).toBeTruthy();
    });
  });
});
