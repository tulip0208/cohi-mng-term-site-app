import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RecoilRoot} from 'recoil';
import {RootList} from '../src/navigation/AppNavigator';
import WA1094 from '../src/screens/WA1094';
import {
  WA1091BackState,
  WA1090PrevScreenId,
  WA1092WtDsState,
  WA1090NewTagIdState,
  WA1091OldTagInfoState,
  WA1093MemoState,
  WA1090WkPlacState,
  WA1090KbnState,
  WA1094LnkNewTagDatMem,
} from '../src/atom/atom';
import {atom, atomFamily} from 'recoil';
import {IFT0420} from '../src/utils/Api';
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
} from '../src/types/type';
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
} as unknown as StackNavigationProp<RootList, 'WA1094'>; // 型アサーション

const mockShowAlert = jest.fn(() => Promise.resolve(true));
jest.mock('../src/components/AlertContext', () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
    // 他の必要な関数やプロパティがあればここに追加
  }),
}));
// Api.jsのIFA0010関数をモック化
jest.mock('../src/utils/Api', () => ({
  IFT0420: jest.fn<
    Promise<ApiResponse<IFT0420Response<IFT0420ResponseDtl>>>,
    [
      WA1090WkPlacConst,
      WA1091OldTagInfoConst,
      string,
      string,
      WA1092WtDsConst,
      string,
      string,
    ]
  >(),
}));

describe('WA1094 レンダリング', () => {
  //最初のレンダリング
  it('最初のレンダリング', async () => {
    const {getByText, findByText} = render(
      <RecoilRoot>
        <WA1094 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    await waitFor(() => {
      expect(getByText(/作業場所：/i)).toBeTruthy();
      expect(getByText(/新タグID：/i)).toBeTruthy();
      expect(getByText(/旧タグID：/i)).toBeTruthy();
    });
  });

  //破棄プレスイベント
  it('破棄プレスイベント', async () => {
    const {getByText, findByText} = render(
      <RecoilRoot>
        <WA1094 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const btn = getByText('破棄');
    fireEvent.press(btn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1090');
    });
  });

  //送信プレスイベント
  it('送信プレスイベント', async () => {
    await act(async () => {
      (IFT0420 as jest.Mock).mockResolvedValue({
        success: true,
      });
    });

    const userState = atom<any>({
      key: 'mock',
      default: {
        lnkNewTagDatMem: WA1094LnkNewTagDatMem,
        WA1093Memo: WA1093MemoState,
      },
    });

    var test_text = '本文本文本文';
    for (var i = 1; i < 1000; i++) {
      test_text += '本文本文本文';
    }

    const mockedState = {
      WA1093Memo: atom<any>({
        key: 'WA1093MemoState',
        default: test_text,
      }),
    };

    const {getByText, findByText} = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(userState, mockedState)}>
        <WA1094 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const btn = getByText('送信');
    fireEvent.press(btn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1090');
    });
  });

  //重量・線量編集イベント発生
  it('重量・線量編集イベント発生', async () => {
    const {getByText, findByText} = render(
      <RecoilRoot>
        <WA1094 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const btn = getByText('重量・線量編集');
    fireEvent.press(btn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1092');
    });
  });

  //メモ編集イベント発生
  it('メモ編集イベント発生', async () => {
    const {getByText, findByText} = render(
      <RecoilRoot>
        <WA1094 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const btn = getByText('メモ編集');
    fireEvent.press(btn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1093');
    });
  });

  //送信プレスイベント -> codeHttp200
  it('送信プレスイベント -> codeHttp200', async () => {
    await act(async () => {
      (IFT0420 as jest.Mock).mockResolvedValue({
        success: false,
        error: 'codeHttp200',
      });
    });

    const {getByText, findByText} = render(
      <RecoilRoot>
        <WA1094 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const btn = getByText('送信');
    fireEvent.press(btn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1090');
    });
  });
  //送信プレスイベント -> codeRsps01
  it('送信プレスイベント -> codeRsps01', async () => {
    await act(async () => {
      (IFT0420 as jest.Mock).mockResolvedValue({
        success: false,
        error: 'codeRsps01',
      });
    });

    const {getByText, findByText} = render(
      <RecoilRoot>
        <WA1094 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const btn = getByText('送信');
    fireEvent.press(btn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1090');
    });
  });
  //送信プレスイベント -> timeout
  it('送信プレスイベント -> timeout', async () => {
    await act(async () => {
      (IFT0420 as jest.Mock).mockResolvedValue({
        success: false,
        error: 'timeout',
      });
    });

    const {getByText, findByText} = render(
      <RecoilRoot>
        <WA1094 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const btn = getByText('送信');
    fireEvent.press(btn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1090');
    });
  });
});
