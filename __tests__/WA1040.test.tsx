import React from 'react';
import {render, waitFor, act, fireEvent} from '@testing-library/react-native';
import {RecoilRoot} from 'recoil';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../src/navigation/AppNavigator';
import {View, Text} from 'react-native';
import WA1040 from '../src/screens/WA1040';
import messages from '../src/utils/messages';

// TapFunctionHeaderのモック
jest.mock('../src/components/TapFunctionHeader', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return (
        <View>
          <Text>TapFunctionHeader</Text>
        </View>
      );
    }),
  };
});

jest.mock('../src/components/AlertContext', () => ({
  useAlert: () => ({
    showAlert: jest.fn(() => Promise.resolve(true)),
    // 他の必要な関数やプロパティがあればここに追加
  }),
}));

const mockNavigate = jest.fn();
// navigationオブジェクトのモック
const mockNavigation = {
  navigate: mockNavigate,
} as unknown as StackNavigationProp<RootList, 'WA1040'>; // 型アサーション

jest.mock('../src/utils/Realm', () => {
  const mockCreate = jest.fn();
  let mockSetting = {
    btnNewTagSoil: 1,
    btnRefNewTagSoil: 1,
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

describe('WA1040 screen', () => {
  it('正しくレンダリング', async () => {
    // WA1040 コンポーネントをレンダリング
    const {findByText} = render(
      <RecoilRoot>
        <WA1040 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    await waitFor(async () => {
      expect(findByText('メニュー')).toBeTruthy();
      expect(findByText('新タグ紐付')).toBeTruthy();
      expect(findByText('土壌')).toBeTruthy();
      expect(findByText('新タグ紐付')).toBeTruthy();
      expect(findByText('定置登録')).toBeTruthy();
      expect(findByText('終了')).toBeTruthy();
    });
  });

  it('ボタンクリック 新タグ紐付(土壌)', async () => {
    // WA1040 コンポーネントをレンダリング
    const {getAllByText, findByText} = render(
      <RecoilRoot>
        <WA1040 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const triggerButton = getAllByText(/新タグ紐付/)[0];
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    await waitFor(async () => {
      const expectedMessage = messages.IA5002();
      expect(findByText(expectedMessage)).toBeTruthy();
    });
  });

  it('ボタンクリック 新タグ紐付(灰)', async () => {
    // WA1040 コンポーネントをレンダリング
    const {getAllByText, findByText} = render(
      <RecoilRoot>
        <WA1040 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const triggerButton = getAllByText(/新タグ紐付/)[1];
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    await waitFor(async () => {
      const expectedMessage = messages.IA5002();
      expect(findByText(expectedMessage)).toBeTruthy();
    });
  });

  it('ボタンクリック 新タグ参照(土壌)', async () => {
    // WA1040 コンポーネントをレンダリング
    const {getAllByText, findByText} = render(
      <RecoilRoot>
        <WA1040 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const triggerButton = getAllByText(/新タグ参照/)[0];
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    await waitFor(async () => {
      const expectedMessage = messages.IA5002();
      expect(findByText(expectedMessage)).toBeTruthy();
    });
  });

  it('ボタンクリック 新タグ参照(灰)', async () => {
    // WA1040 コンポーネントをレンダリング
    const {getAllByText, findByText} = render(
      <RecoilRoot>
        <WA1040 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const triggerButton = getAllByText(/新タグ参照/)[1];
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    await waitFor(async () => {
      const expectedMessage = messages.IA5002();
      expect(findByText(expectedMessage)).toBeTruthy();
    });
  });

  it('ボタンクリック 旧タグ参照(土壌)', async () => {
    // WA1040 コンポーネントをレンダリング
    const {getAllByText, findByText} = render(
      <RecoilRoot>
        <WA1040 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const triggerButton = getAllByText(/旧タグ参照/)[0];
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    await waitFor(async () => {
      const expectedMessage = messages.IA5002();
      expect(findByText(expectedMessage)).toBeTruthy();
    });
  });

  it('ボタンクリック 旧タグ参照(灰)', async () => {
    // WA1040 コンポーネントをレンダリング
    const {getAllByText, findByText} = render(
      <RecoilRoot>
        <WA1040 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const triggerButton = getAllByText(/旧タグ紐付/)[0];
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    await waitFor(async () => {
      const expectedMessage = messages.IA5002();
      expect(findByText(expectedMessage)).toBeTruthy();
    });
  });

  it('ボタンクリック 輸送カード(申請)', async () => {
    // WA1040 コンポーネントをレンダリング
    const {getAllByText, findByText} = render(
      <RecoilRoot>
        <WA1040 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const triggerButton = getAllByText(/輸送カード/)[0];
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    await waitFor(async () => {
      const expectedMessage = messages.IA5002();
      expect(findByText(expectedMessage)).toBeTruthy();
    });
  });

  it('ボタンクリック 荷下登録', async () => {
    // WA1040 コンポーネントをレンダリング
    const {getAllByText, findByText} = render(
      <RecoilRoot>
        <WA1040 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const triggerButton = getAllByText(/荷下登録/)[0];
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    await waitFor(async () => {
      const expectedMessage = messages.IA5002();
      expect(findByText(expectedMessage)).toBeTruthy();
    });
  });

  it('ボタンクリック 定置登録', async () => {
    // WA1040 コンポーネントをレンダリング
    const {getAllByText, findByText} = render(
      <RecoilRoot>
        <WA1040 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const triggerButton = getAllByText(/定置登録/)[0];
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    await waitFor(async () => {
      const expectedMessage = messages.IA5002();
      expect(findByText(expectedMessage)).toBeTruthy();
    });
  });

  it('ボタンクリック 終了', async () => {
    // WA1040 コンポーネントをレンダリング
    const {getAllByText, findByText} = render(
      <RecoilRoot>
        <WA1040 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const triggerButton = getAllByText(/終了/)[0];
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    await waitFor(async () => {
      const expectedMessage = messages.IA5002();
      expect(findByText(expectedMessage)).toBeTruthy();
    });
  });
});
