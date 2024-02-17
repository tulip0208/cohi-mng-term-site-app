import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RecoilRoot} from 'recoil';
import {RootList} from '../src/navigation/AppNavigator';
import WA1091 from '../src/screens/WA1091';
import {IFA0320} from '../src/utils/Api';
import {
  ApiResponse,
  IFA0320Response,
  IFA0320ResponseDtl,
} from '../src/types/type';

const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
} as unknown as StackNavigationProp<RootList, 'WA1091'>; // 型アサーション

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

describe('WA1091 レンダリング', () => {
  //最初のレンダリング
  it('最初のレンダリング', async () => {
    const {getByText, findByText} = render(
      <RecoilRoot>
        <WA1091 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    await waitFor(() => {
      expect(getByText(/新タグID：/i)).toBeTruthy();
      expect(getByText(/旧タグIDを入力して下さい。/i)).toBeTruthy();
    });
  });

  //破棄ボタンをクリックしたとき -> navigation: WA1090
  it('破棄ボタンをクリックしたとき -> navigation: WA1090', async () => {
    const {getByText, findByText} = render(
      <RecoilRoot>
        <WA1091 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const btn = getByText('破棄');
    fireEvent.press(btn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1090');
    });
  });
  //破棄ボタンをクリックしたとき(isBtnEnabledDel: false) -> 次の状態に移行しません
  it('破棄ボタンをクリックしたとき(isBtnEnabledDel: false) -> 次の状態に移行しません', async () => {
    const {getByText, findByText} = render(
      <RecoilRoot>
        <WA1091 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const btn = getByText('破棄');
    fireEvent.press(btn);

    await waitFor(async () => {
      fireEvent.press(btn);

      await waitFor(() => {
        expect(getByText(/新タグID：/i)).toBeTruthy();
      });
    });
  });
  //戻るボタンをクリックしたとき -> navigation: WA1090
  it('戻るボタンをクリックしたとき -> navigation: WA1090', async () => {
    const {getByText, findByText} = render(
      <RecoilRoot>
        <WA1091 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const btn = getByText('戻る');
    fireEvent.press(btn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1090');
    });
  });
  //戻るボタンをクリックしたとき(isBtnEnabledBck: false) -> 次の状態に移行しません
  it('戻るボタンをクリックしたとき(isBtnEnabledBck: false) -> 次の状態に移行しません', async () => {
    const {getByText, findByText} = render(
      <RecoilRoot>
        <WA1091 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const btn = getByText('戻る');
    fireEvent.press(btn);

    await waitFor(async () => {
      fireEvent.press(btn);

      await waitFor(() => {
        expect(getByText(/新タグID：/i)).toBeTruthy();
      });
    });
  });

  //次へボタンをクリックしたとき -> navigation: WA1092
  it('次へボタンをクリックしたとき -> navigation: WA1092', async () => {
    await act(async () => {
      (IFA0320 as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          dtl: [
            {
              oldTagId: 'あ',
              tmpLocId: 'あ',
              tmpLocNm: 'あ',
              ashTyp: 10,
              meaRa: 10,
              conRa: 10,
              surDsRt: 10,
              surDsDt: 'あ',
              surDsWt: 10,
            },
          ],
        },
      });
    });

    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot>
        <WA1091 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const inputText = getByTestId('text0');
    fireEvent.changeText(inputText, 'some text');
    fireEvent(inputText, 'blur');

    await waitFor(async () => {
      const btn = getByText('次へ');
      fireEvent.press(btn);
      await waitFor(async () => {
        expect(mockNavigate).toHaveBeenCalledWith('WA1092');
      });
    });
  });
  //次へボタンをクリックしたとき(isNext: false) -> 次の状態に移行しません
  it('次へボタンをクリックしたとき(isNext: false) -> 次の状態に移行しません', async () => {
    await act(async () => {
      (IFA0320 as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          dtl: [
            {
              oldTagId: 'あ',
              tmpLocId: 'あ',
              tmpLocNm: 'あ',
              ashTyp: 10,
              meaRa: 10,
              conRa: 10,
              surDsRt: 10,
              surDsDt: 'あ',
              surDsWt: 10,
            },
          ],
        },
      });
    });
    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot>
        <WA1091 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const inputText = getByTestId('text0');
    fireEvent.changeText(inputText, '');
    fireEvent(inputText, 'blur');

    await waitFor(async () => {
      const btn = getByText('次へ');
      fireEvent.press(btn);
      await waitFor(async () => {
        fireEvent.press(btn);
        await waitFor(async () => {
          expect(getByText(/新タグID：/i)).toBeTruthy();
        });
      });
    });
  });

  //次へボタンをクリックしたとき -> codeHttp200
  it('次へボタンをクリックしたとき -> codeHttp200', async () => {
    await act(async () => {
      (IFA0320 as jest.Mock).mockResolvedValue({
        success: false,
        error: 'codeHttp200',
      });
    });

    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot>
        <WA1091 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const inputText = getByTestId('text0');
    fireEvent.changeText(inputText, 'some text');
    fireEvent(inputText, 'blur');

    await waitFor(async () => {
      const btn = getByText('次へ');
      fireEvent.press(btn);
      await waitFor(async () => {
        expect(getByText(/新タグID：/i)).toBeTruthy();
      });
    });
  });

  //次へボタンをクリックしたとき -> timeout
  it('次へボタンをクリックしたとき -> codeRsps01', async () => {
    await act(async () => {
      (IFA0320 as jest.Mock).mockResolvedValue({
        success: false,
        error: 'codeRsps01',
      });
    });

    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot>
        <WA1091 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const inputText = getByTestId('text0');
    fireEvent.changeText(inputText, 'some text');
    fireEvent(inputText, 'blur');

    await waitFor(async () => {
      const btn = getByText('次へ');
      fireEvent.press(btn);
      await waitFor(async () => {
        expect(getByText(/新タグID：/i)).toBeTruthy();
      });
    });
  });

  //次へボタンをクリックしたとき -> timeout
  it('次へボタンをクリックしたとき -> timeout', async () => {
    await act(async () => {
      (IFA0320 as jest.Mock).mockResolvedValue({
        success: false,
        error: 'timeout',
      });
    });

    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot>
        <WA1091 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const inputText = getByTestId('text0');
    fireEvent.changeText(inputText, 'some text');
    fireEvent(inputText, 'blur');

    await waitFor(async () => {
      const btn = getByText('次へ');
      fireEvent.press(btn);
      await waitFor(async () => {
        expect(getByText(/新タグID：/i)).toBeTruthy();
      });
    });
  });

  //次へボタンをクリックしたとき -> zero
  it('次へボタンをクリックしたとき -> zero', async () => {
    await act(async () => {
      (IFA0320 as jest.Mock).mockResolvedValue({
        success: false,
        error: 'zero',
      });
    });

    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot>
        <WA1091 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const inputText = getByTestId('text0');
    fireEvent.changeText(inputText, 'some text');
    fireEvent(inputText, 'blur');

    await waitFor(async () => {
      const btn = getByText('次へ');
      fireEvent.press(btn);
      await waitFor(async () => {
        expect(getByText(/新タグID：/i)).toBeTruthy();
      });
    });
  });
});
