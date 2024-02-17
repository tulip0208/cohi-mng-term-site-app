import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
  act,
  userEvent,
} from '@testing-library/react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RecoilRoot, atom} from 'recoil';
import {RootList} from '../src/navigation/AppNavigator';
import WA1063 from '../src/screens/WA1063';
import {IFA0320} from '../src/utils/Api';
import {
  ApiResponse,
  IFA0320Response,
  IFA0320ResponseDtl,
  WA1060Const,
  WA1060OldTagInfoConst,
} from '../src/types/type';

import {
  WA1061BackState,
  WA1060PrevScreenId,
  WA1060DataState,
  WA1060NewTagIdState,
  WA1060OldTagInfosState,
} from '../src/atom/atom';

const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
} as unknown as StackNavigationProp<RootList, 'WA1063'>; // 型アサーション

const mockShowAlert = jest.fn(() => Promise.resolve(true));
jest.mock('../src/components/AlertContext', () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
    // 他の必要な関数やプロパティがあればここに追加
  }),
}));
// Api.jsのIFA0010関数をモック化
jest.mock('../src/utils/Api', () => ({
  IFA0320: jest.fn<
    Promise<ApiResponse<IFA0320Response<IFA0320ResponseDtl>>>,
    [string, string]
  >(),
}));

jest.mock('../src/utils/Realm', () => {
  const mockCreate = jest.fn();
  let mockSetting = {
    packTyp: 1,
    useMethodInnerBag: 1,
    btnRefOldTagSoil: 1,
    btnNewTagAsh: 1,
    btnRefNewTagAsh: 1,
    btnRefOldTagAsg: 1,
    btnTrnCard: 1,
    btnUnload: 1,
    btnStat: 1,
  };
  return {
    getInstance: jest.fn().mockReturnValue({
      objects: jest.fn().mockReturnValue([mockSetting]),
      write: jest.fn(callback => {
        // write メソッドのコールバックで mockCreate を実行
        callback(mockCreate);
      }),
      create: mockCreate,
      // その他必要なメソッド
    }),
  };
});

describe('WA1063 レンダリング', () => {
  //最初のレンダリング
  it('最初のレンダリング', async () => {
    const {getByText, findByText} = render(
      <RecoilRoot>
        <WA1063 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    await waitFor(() => {
      expect(getByText(/新タグID：/i)).toBeTruthy();
      expect(getByText(/旧タグ数：/i)).toBeTruthy();
      expect(getByText(/除去土壌等種別：/i)).toBeTruthy();
      expect(getByText(/荷姿種別：/i)).toBeTruthy();
      expect(getByText(/内袋の利用方法：/i)).toBeTruthy();
      expect(getByText(/津波浸水域由来：/i)).toBeTruthy();
      expect(getByText(/特定施設由来：/i)).toBeTruthy();
      expect(getByText(/アルミ内袋利用：/i)).toBeTruthy();
    });
  });

  //最初のレンダリング color = 1
  it('レンダリング(color=1のとき) -> 111111111確認', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        newTagId: WA1060NewTagIdState,
        WA1060OldTagInfos: WA1060OldTagInfosState,
        prevScreenId: WA1060PrevScreenId,
        WA1060Data: WA1060DataState,
        setBack: WA1061BackState,
      },
    });

    const mockedState = {
      newTagId: atom<string>({
        key: 'WA1060NewTagIdState',
        default: '111111111',
      }),
    };

    const {getByText, findByText} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1063 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    await waitFor(() => {
      expect(getByText(/111111111/i)).toBeTruthy();
    });
  });
  //最初のレンダリング color = 2
  it('レンダリング(color=1のとき) -> 2222222確認', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        newTagId: WA1060NewTagIdState,
        WA1060OldTagInfos: WA1060OldTagInfosState,
        prevScreenId: WA1060PrevScreenId,
        WA1060Data: WA1060DataState,
        setBack: WA1061BackState,
      },
    });

    const mockedState = {
      newTagId: atom<string>({
        key: 'WA1060NewTagIdState',
        default: '2222222',
      }),
    };

    const {getByText, findByText} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1063 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    await waitFor(() => {
      expect(getByText(/2222222/i)).toBeTruthy();
    });
  });
  //最初のレンダリング color = 3
  it('レンダリング(color=1のとき) -> 3333333確認', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        newTagId: WA1060NewTagIdState,
        WA1060OldTagInfos: WA1060OldTagInfosState,
        prevScreenId: WA1060PrevScreenId,
        WA1060Data: WA1060DataState,
        setBack: WA1061BackState,
      },
    });

    const mockedState = {
      newTagId: atom<string>({
        key: 'WA1060NewTagIdState',
        default: '3333333',
      }),
    };

    const {getByText, findByText} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1063 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    await waitFor(() => {
      expect(getByText(/3333333/i)).toBeTruthy();
    });
  });
  //最初のレンダリング color = 4
  it('レンダリング(color=1のとき) -> 44444444確認', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        newTagId: WA1060NewTagIdState,
        WA1060OldTagInfos: WA1060OldTagInfosState,
        prevScreenId: WA1060PrevScreenId,
        WA1060Data: WA1060DataState,
        setBack: WA1061BackState,
      },
    });

    const mockedState = {
      newTagId: atom<string>({
        key: 'WA1060NewTagIdState',
        default: '44444444',
      }),
    };

    const {getByText, findByText} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1063 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    await waitFor(() => {
      expect(getByText(/44444444/i)).toBeTruthy();
    });
  });
  //最初のレンダリング color = 5
  it('レンダリング(color=1のとき) -> 55555555確認', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        newTagId: WA1060NewTagIdState,
        WA1060OldTagInfos: WA1060OldTagInfosState,
        prevScreenId: WA1060PrevScreenId,
        WA1060Data: WA1060DataState,
        setBack: WA1061BackState,
      },
    });

    const mockedState = {
      newTagId: atom<string>({
        key: 'WA1060NewTagIdState',
        default: '55555555',
      }),
    };

    const {getByText, findByText} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1063 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    await waitFor(() => {
      expect(getByText(/55555555/i)).toBeTruthy();
    });
  });
  //最初のレンダリング color = 7
  it('レンダリング(color=1のとき) -> 77777777確認', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        newTagId: WA1060NewTagIdState,
        WA1060OldTagInfos: WA1060OldTagInfosState,
        prevScreenId: WA1060PrevScreenId,
        WA1060Data: WA1060DataState,
        setBack: WA1061BackState,
      },
    });

    const mockedState = {
      newTagId: atom<string>({
        key: 'WA1060NewTagIdState',
        default: '77777777',
      }),
    };

    const {getByText, findByText} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1063 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    await waitFor(() => {
      expect(getByText(/77777777/i)).toBeTruthy();
    });
  });

  //最初のレンダリング WA1060Data
  it('レンダリング (WA1060Dataがある場合)', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        newTagId: WA1060NewTagIdState,
        WA1060OldTagInfos: WA1060OldTagInfosState,
        prevScreenId: WA1060PrevScreenId,
        WA1060Data: WA1060DataState,
        setBack: WA1061BackState,
      },
    });

    const mockedState = {
      WA1060Data: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: 'あああ',
          caLgSdBgDs: 'あああ',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: 'あああ', //オーバーパック有無
          estRa: 'あああ', //推定放射能濃度
        },
      }),
      WA1060OldTagInfos: atom<WA1060OldTagInfoConst[]>({
        key: 'WA1060OldTagInfosState',
        default: [
          {
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
          },
          {
            oldTag: 'あ',
            genbaCheck: 'あ',
            tsuInd: 'あ',
            splFac: 'あ',
            rmSolTyp: 'あ',
            ocLndCla: 'あ',
            pkTyp: 'あ',
            usgInnBg: 'あ',
            usgInnBgNm: 'あ',
            usgAluBg: 'あ',
            vol: 'あ',
            airDsRt: 'あ',
            ocLndUseknd: 'あ',
            ocloc: 'あ',
            rmSolInf: 'あ',
            lnkNewTagDatMem: 'あ',
          },
        ],
      }),
    };

    const {getByText, findByText} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1063 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    await waitFor(() => {
      expect(getByText(/新タグID：/i)).toBeTruthy();
      expect(getByText(/旧タグ数：/i)).toBeTruthy();
      expect(getByText(/除去土壌等種別：/i)).toBeTruthy();
      expect(getByText(/荷姿種別：/i)).toBeTruthy();
      expect(getByText(/内袋の利用方法：/i)).toBeTruthy();
      expect(getByText(/津波浸水域由来：/i)).toBeTruthy();
      expect(getByText(/特定施設由来：/i)).toBeTruthy();
      expect(getByText(/アルミ内袋利用：/i)).toBeTruthy();
    });
  });
  //レンダリング (WA1060Dataがある場合, yesNoOP = null, WA1060OldTagInfos.length <= 1, ) -> checkbox: false
  it('レンダリング (WA1060Dataがある場合, yesNoOP = null, WA1060OldTagInfos.length <= 1, ) -> checkbox: false', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        newTagId: WA1060NewTagIdState,
        WA1060OldTagInfos: WA1060OldTagInfosState,
        prevScreenId: WA1060PrevScreenId,
        WA1060Data: WA1060DataState,
        setBack: WA1061BackState,
      },
    });

    const mockedState = {
      WA1060Data: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: 'あああ',
          caLgSdBgDs: 'あああ',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: '', //オーバーパック有無
          estRa: 'あああ', //推定放射能濃度
        },
      }),
      WA1060OldTagInfos: atom<WA1060OldTagInfoConst[]>({
        key: 'WA1060OldTagInfosState',
        default: [
          {
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
          },
        ],
      }),
    };

    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1063 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const checkbox = getByTestId('checkbox1');
    expect(checkbox.props.accessibilityState.disabled).toBe(false);
  });
  //レンダリング (WA1060Dataがある場合, yesNoOP = null, WA1060OldTagInfos.length <= 1, ) -> checkbox: true
  it('レンダリング (WA1060Dataがある場合, yesNoOP = null, WA1060OldTagInfos.length > 1, ) -> checkbox: true', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        newTagId: WA1060NewTagIdState,
        WA1060OldTagInfos: WA1060OldTagInfosState,
        prevScreenId: WA1060PrevScreenId,
        WA1060Data: WA1060DataState,
        setBack: WA1061BackState,
      },
    });

    const mockedState = {
      WA1060Data: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: 'あああ',
          caLgSdBgDs: 'あああ',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: '', //オーバーパック有無
          estRa: 'あああ', //推定放射能濃度
        },
      }),
      WA1060OldTagInfos: atom<WA1060OldTagInfoConst[]>({
        key: 'WA1060OldTagInfosState',
        default: [
          {
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
          },
          {
            oldTag: 'あ',
            genbaCheck: 'あ',
            tsuInd: 'あ',
            splFac: 'あ',
            rmSolTyp: 'あ',
            ocLndCla: 'あ',
            pkTyp: 'あ',
            usgInnBg: 'あ',
            usgInnBgNm: 'あ',
            usgAluBg: 'あ',
            vol: 'あ',
            airDsRt: 'あ',
            ocLndUseknd: 'あ',
            ocloc: 'あ',
            rmSolInf: 'あ',
            lnkNewTagDatMem: 'あ',
          },
        ],
      }),
    };

    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1063 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const checkbox = getByTestId('checkbox1');
    expect(checkbox.props.accessibilityState.disabled).toBe(true);
  });

  //破棄をクリックしたとき -> navigation: WA1060
  it('破棄をクリックしたとき -> navigation: WA1060', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        newTagId: WA1060NewTagIdState,
        WA1060OldTagInfos: WA1060OldTagInfosState,
        prevScreenId: WA1060PrevScreenId,
        WA1060Data: WA1060DataState,
        setBack: WA1061BackState,
      },
    });

    const mockedState = {
      WA1060Data: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: 'あああ',
          caLgSdBgDs: 'あああ',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: '', //オーバーパック有無
          estRa: 'あああ', //推定放射能濃度
        },
      }),
    };

    const {getByText, findByText} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1063 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const btn = getByText('破棄');
    fireEvent.press(btn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1060');
    });
  });
  //破棄をクリックしたとき(isBtnEnabledDel = null) -> 次の状態に移行しません
  it('破棄をクリックしたとき(isBtnEnabledDel = null) -> 次の状態に移行しません', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        newTagId: WA1060NewTagIdState,
        WA1060OldTagInfos: WA1060OldTagInfosState,
        prevScreenId: WA1060PrevScreenId,
        WA1060Data: WA1060DataState,
        setBack: WA1061BackState,
      },
    });

    const mockedState = {
      WA1060Data: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: 'あああ',
          caLgSdBgDs: 'あああ',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: '', //オーバーパック有無
          estRa: 'あああ', //推定放射能濃度
        },
      }),
    };

    const {getByText, findByText} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1063 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const btn = getByText('破棄');
    fireEvent.press(btn);

    await waitFor(async () => {
      fireEvent.press(btn);

      await waitFor(() => {
        expect(getByText(/新タグID：/i)).toBeTruthy();
        expect(getByText(/旧タグ数：/i)).toBeTruthy();
        expect(getByText(/除去土壌等種別：/i)).toBeTruthy();
        expect(getByText(/荷姿種別：/i)).toBeTruthy();
        expect(getByText(/内袋の利用方法：/i)).toBeTruthy();
        expect(getByText(/津波浸水域由来：/i)).toBeTruthy();
        expect(getByText(/特定施設由来：/i)).toBeTruthy();
        expect(getByText(/アルミ内袋利用：/i)).toBeTruthy();
      });
    });
  });

  //破棄をクリックしたとき -> navigation: WA1061
  it('破棄をクリックしたとき -> navigation: WA1061', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        newTagId: WA1060NewTagIdState,
        WA1060OldTagInfos: WA1060OldTagInfosState,
        prevScreenId: WA1060PrevScreenId,
        WA1060Data: WA1060DataState,
        setBack: WA1061BackState,
      },
    });

    const mockedState = {
      WA1060Data: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: 'あああ',
          caLgSdBgDs: 'あああ',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: '', //オーバーパック有無
          estRa: 'あああ', //推定放射能濃度
        },
      }),
    };

    const {getByText, findByText} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1063 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const btn = getByText('戻る');
    fireEvent.press(btn);

    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1061');
    });
  });
  //破棄をクリックしたとき(isBtnEnabledBck = null) -> 次の状態に移行しません
  it('破棄をクリックしたとき(isBtnEnabledBck = null) -> 次の状態に移行しません', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        newTagId: WA1060NewTagIdState,
        WA1060OldTagInfos: WA1060OldTagInfosState,
        prevScreenId: WA1060PrevScreenId,
        WA1060Data: WA1060DataState,
        setBack: WA1061BackState,
      },
    });

    const mockedState = {
      WA1060Data: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: 'あああ',
          caLgSdBgDs: 'あああ',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: '', //オーバーパック有無
          estRa: 'あああ', //推定放射能濃度
        },
      }),
    };

    const {getByText, findByText} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1063 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const btn = getByText('戻る');
    fireEvent.press(btn);

    await waitFor(async () => {
      fireEvent.press(btn);

      await waitFor(async () => {
        expect(getByText(/新タグID：/i)).toBeTruthy();
        expect(getByText(/旧タグ数：/i)).toBeTruthy();
        expect(getByText(/除去土壌等種別：/i)).toBeTruthy();
        expect(getByText(/荷姿種別：/i)).toBeTruthy();
        expect(getByText(/内袋の利用方法：/i)).toBeTruthy();
        expect(getByText(/津波浸水域由来：/i)).toBeTruthy();
        expect(getByText(/特定施設由来：/i)).toBeTruthy();
        expect(getByText(/アルミ内袋利用：/i)).toBeTruthy();
      });
    });
  });
  //破棄をクリックしたとき(prevScreenId = WA1066) -> navigation: WA1066
  it('破棄をクリックしたとき(prevScreenId = WA1066) -> navigation: WA1066', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        newTagId: WA1060NewTagIdState,
        WA1060OldTagInfos: WA1060OldTagInfosState,
        prevScreenId: WA1060PrevScreenId,
        WA1060Data: WA1060DataState,
        setBack: WA1061BackState,
      },
    });

    const mockedState = {
      WA1060Data: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: 'あああ',
          caLgSdBgDs: 'あああ',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: '', //オーバーパック有無
          estRa: 'あああ', //推定放射能濃度
        },
      }),
      prevScreenId: atom<string>({
        key: 'WA1060PrevScreenId',
        default: 'WA1066',
      }),
    };

    const {getByText, findByText} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1063 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const btn = getByText('戻る');
    fireEvent.press(btn);

    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1066');
    });
  });

  //次へをクリックしたとき -> navigation: WA1064
  it('次へをクリックしたとき -> navigation: WA1064', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        newTagId: WA1060NewTagIdState,
        WA1060OldTagInfos: WA1060OldTagInfosState,
        prevScreenId: WA1060PrevScreenId,
        WA1060Data: WA1060DataState,
        setBack: WA1061BackState,
      },
    });

    const mockedState = {
      WA1060Data: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: 'あああ',
          caLgSdBgDs: 'あああ',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: '', //オーバーパック有無
          estRa: 'あああ', //推定放射能濃度
        },
      }),
      prevScreenId: atom<string>({
        key: 'WA1060PrevScreenId',
        default: 'WA1067',
      }),
    };

    const {getByText, findByText} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1063 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const btn = getByText('次へ');
    fireEvent.press(btn);

    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1064');
    });
  });
  //次へをクリックしたとき(prevScreenId: WA1066) -> navigation: WA1066
  it('次へをクリックしたとき(prevScreenId: WA1066) -> navigation: WA1066', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        newTagId: WA1060NewTagIdState,
        WA1060OldTagInfos: WA1060OldTagInfosState,
        prevScreenId: WA1060PrevScreenId,
        WA1060Data: WA1060DataState,
        setBack: WA1061BackState,
      },
    });

    const mockedState = {
      WA1060Data: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: 'あああ',
          caLgSdBgDs: 'あああ',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: '', //オーバーパック有無
          estRa: 'あああ', //推定放射能濃度
        },
      }),
      prevScreenId: atom<string>({
        key: 'WA1060PrevScreenId',
        default: 'WA1066',
      }),
    };

    const {getByText, findByText} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1063 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const btn = getByText('次へ');
    fireEvent.press(btn);

    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1066');
    });
  });
  //次へをクリックしたとき(次の状態に移行しません = null) -> 次の状態に移行しません
  it('次へをクリックしたとき(次の状態に移行しません = null) -> 次の状態に移行しません', async () => {
    const mockState = atom<any>({
      key: 'mock',
      default: {
        newTagId: WA1060NewTagIdState,
        WA1060OldTagInfos: WA1060OldTagInfosState,
        prevScreenId: WA1060PrevScreenId,
        WA1060Data: WA1060DataState,
        setBack: WA1061BackState,
      },
    });

    const mockedState = {
      WA1060Data: atom<WA1060Const>({
        key: 'WA1060DataState',
        default: {
          tyRegDt: 'あああ',
          caLgSdBgWt: 'あああ',
          caLgSdBgDs: 'あああ',
          rmSolTyp: 'あああ', //除去土壌等種別
          pkTyp: 'あああ', //荷姿種別
          usgInnBg: 'あああ', //内袋の利用方法
          tsuInd: 'あああ', //津波浸水域由来
          splFac: 'あああ', //特定施設由来
          usgAluBg: 'あああ', //アルミ内袋の利用
          yesNoOP: '', //オーバーパック有無
          estRa: 'あああ', //推定放射能濃度
        },
      }),
    };

    const {getByText, findByText} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(mockState, mockedState)}>
        <WA1063 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const btn = getByText('次へ');
    fireEvent.press(btn);

    await waitFor(async () => {
      fireEvent.press(btn);

      await waitFor(async () => {
        expect(getByText(/新タグID：/i)).toBeTruthy();
        expect(getByText(/旧タグ数：/i)).toBeTruthy();
        expect(getByText(/除去土壌等種別：/i)).toBeTruthy();
        expect(getByText(/荷姿種別：/i)).toBeTruthy();
        expect(getByText(/内袋の利用方法：/i)).toBeTruthy();
        expect(getByText(/津波浸水域由来：/i)).toBeTruthy();
        expect(getByText(/特定施設由来：/i)).toBeTruthy();
        expect(getByText(/アルミ内袋利用：/i)).toBeTruthy();
      });
    });
  });
});
