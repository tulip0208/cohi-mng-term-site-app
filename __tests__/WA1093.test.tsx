import React from 'react';
import { render, waitFor, act, fireEvent, userEvent } from '@testing-library/react-native';
import { RecoilRoot, atom } from 'recoil';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootList } from '../src/navigation/AppNavigator';
import { View, Text } from 'react-native';
import WA1093 from '../src/screens/WA1093';
import messages from '../src/utils/messages';
import { NativeModules } from 'react-native';
import {
  WA1091BackState,
  WA1090PrevScreenId,
  WA1093MemoState,
} from '../src/atom/atom';

jest.mock('../src/components/AlertContext', () => ({
  useAlert: () => ({
    showAlert: jest.fn(() => Promise.resolve(true)),
    // 他の必要な関数やプロパティがあればここに追加
  }),
}));

let mockRandomUuid: () => any;


jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() =>
      Promise.resolve({
        width: 375,
        height: 812,
        scale: 1,
        fontScale: 1.5,
      }),
    ),
    set: jest.fn(),
  },
}));

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

jest.mock('react-native/Libraries/BatchedBridge/NativeModules', () => {
  return {
    SignalStrengthModule: {
      getSignalStrength: jest.fn(() => Promise.resolve('good')),
    },
    DeviceInfo: {
      getVersion: jest.fn(() => '1.0.0'),
      getModel: jest.fn(() => 'iPhone X'),
      getBuildNumber: jest.fn(() => '1.13.0'),
      getConstants: jest.fn(() => '1.13.0'),
    },
    SettingsManager: {
      getSettings: jest.fn(() => Promise.resolve({})),
      // Add any required methods or properties here for the mock
    },
    JISInputFilter: {
      checkJISText: jest.fn(() => Promise.resolve(true))
    },
    PlatformConstants: jest.fn(() => ''),
  };
});
jest.mock('react-native-device-info', () => {
  return {
    getVersion: jest.fn(() => '1.0'),
    getBuildNumber: jest.fn(() => '100'),
  };
});

jest.mock(
  'react-native/Libraries/Utilities/NativePlatformConstantsIOS',
  () => ({
    ...jest.requireActual(
      'react-native/Libraries/Utilities/NativePlatformConstantsIOS',
    ),
    getConstants: () => ({
      forceTouchAvailable: false,
      interfaceIdiom: 'en',
      isTesting: false,
      osVersion: 'ios',
      reactNativeVersion: { major: 60, minor: 1, patch: 0 },
      systemName: 'ios',
    }),
  }),
);

const mockNavigate = jest.fn();
// navigationオブジェクトのモック
const mockNavigation = {
  navigate: mockNavigate,
} as unknown as StackNavigationProp<RootList, 'WA1093'>; // 型アサーション

jest.mock('../src/utils/Log', () => ({
  logScreen: jest.fn(),
  logUserAction: jest.fn(),
  checkLogFile: jest.fn(() => 2),
  calculateTotalLogSize: jest.fn(),
  deleteLogs: jest.fn(),
  compressLogFiles: jest.fn(),
  deleteLogFile: jest.fn()
}));

describe('WA1093 screen', () => {
  //
  it('初期レンダリング', async () => {
    const { getByText, findByText } = render(
      <RecoilRoot initializeState={(snapshot) => snapshot.set(WA1093MemoState, 'WA1093')}>
        <WA1093 navigation={mockNavigation} />
      </RecoilRoot>
    );

    await waitFor(() => {
      expect(getByText(/新タグID：/i)).toBeTruthy();
      expect(getByText(/メモを入力して下さい。/i)).toBeTruthy();
      expect(getByText(/破棄/i)).toBeTruthy();
      expect(getByText(/戻る/i)).toBeTruthy();
      expect(getByText(/次へ/i)).toBeTruthy();
    })

  });

  //
  it('破棄ボタンを押したとき -> 01 -> 結果値の確認(mockNavigate: WA1090)', async () => {
    // WA1093 コンポーネントをレンダリング
    const { getAllByText, findByText, getByText } = render(
      <RecoilRoot>
        <WA1093 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const triggerButton = getByText(/破棄/i);
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1090');
    });
  });

  it('破棄ボタンをクリックすると(isBtnEnabledDel: null) -> 02 -> 結果値の確認', async () => {
    // WA1093 コンポーネントをレンダリング
    const { getAllByText, findByText, getByText } = render(
      <RecoilRoot>
        <WA1093 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const triggerButton = getByText(/破棄/i);
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    await waitFor(async () => {
      fireEvent.press(triggerButton);

      await waitFor(async () => {
        expect(getByText(/新タグID：/i)).toBeTruthy();
        expect(getByText(/メモを入力して下さい。/i)).toBeTruthy();
        expect(getByText(/破棄/i)).toBeTruthy();
        expect(getByText(/戻る/i)).toBeTruthy();
        expect(getByText(/次へ/i)).toBeTruthy();
      });
    });
  });

  //
  it('戻るボタンをクリックすると -> 01 -> 結果値の確認(mockNavigate: WA1092)', async () => {
    const { getByText, findByText } = render(
      <RecoilRoot>
        <WA1093 navigation={mockNavigation} />
      </RecoilRoot>
    )

    const triggerButton = getByText(/戻る/i);
    await act(async () => {
      fireEvent.press(triggerButton)
    })

    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1092');
    })
  })

  it('戻るボタンをクリックすると(isBtnEnabledBck: null) -> 02 -> 結果値の確認', async () => {
    const { getByText, findByText } = render(
      <RecoilRoot>
        <WA1093 navigation={mockNavigation} />
      </RecoilRoot>
    )

    const triggerButton = getByText(/戻る/i);
    await act(async () => {
      fireEvent.press(triggerButton)
    })

    await waitFor(async () => {
      fireEvent.press(triggerButton)

      await waitFor(async () => {
        expect(getByText(/新タグID：/i)).toBeTruthy();
        expect(getByText(/メモを入力して下さい。/i)).toBeTruthy();
        expect(getByText(/破棄/i)).toBeTruthy();
        expect(getByText(/戻る/i)).toBeTruthy();
        expect(getByText(/次へ/i)).toBeTruthy();
      })

    })
  })

  //
  it('次へボタンをクリックすると -> 01 -> 結果値の確認(mockNavigate: WA1094)', async () => {
    const { getByText, findByText } = render(
      <RecoilRoot>
        <WA1093 navigation={mockNavigation} />
      </RecoilRoot>
    )

    const triggerButton = getByText(/次へ/i);
    await act(async () => {
      fireEvent.press(triggerButton)
    })
    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1094');
    })

  })

  it('次へボタンをクリックすると(isBtnEnabledNxt: null) -> 02 -> 結果値の確認', async () => {
    const { getByText, findByText } = render(
      <RecoilRoot>
        <WA1093 navigation={mockNavigation} />
      </RecoilRoot>
    )

    const triggerButton = getByText(/次へ/i);
    await act(async () => {
      fireEvent.press(triggerButton)
    })
    await waitFor(async () => {
      fireEvent.press(triggerButton)
      await waitFor(async () => {
        expect(getByText(/新タグID：/i)).toBeTruthy();
        expect(getByText(/メモを入力して下さい。/i)).toBeTruthy();
        expect(getByText(/破棄/i)).toBeTruthy();
        expect(getByText(/戻る/i)).toBeTruthy();
        expect(getByText(/次へ/i)).toBeTruthy();
      })
    })

  })

  //
  it('本文欄で入力値が変更された場合 -> 01 -> 結果値の確認', async () => {
    const { getByText, getByTestId, queryByText } = render(
      <RecoilRoot>
        <WA1093 navigation={mockNavigation} />
      </RecoilRoot>
    )

    const textinput = getByTestId('act0');
    NativeModules.JISInputFilter.checkJISText.mockResolvedValue('filteredText');

    await act(async () => {
      fireEvent.changeText(textinput, "text change")
    })

    await waitFor(async () => {
      expect(getByText(/新タグID：/i)).toBeTruthy();
      expect(getByText(/メモを入力して下さい。/i)).toBeTruthy();
      expect(getByText(/破棄/i)).toBeTruthy();
      expect(getByText(/戻る/i)).toBeTruthy();
      expect(getByText(/次へ/i)).toBeTruthy();
    })

  })

  it('本文欄で入力値が変更された場合(エラー発生) -> 02 -> 結果値の確認', async () => {
    const { getByText, getByTestId, findByText } = render(
      <RecoilRoot>
        <WA1093 navigation={mockNavigation} />
      </RecoilRoot>
    )

    const textinput = getByTestId('act0');
    await act(async () => {
      fireEvent.changeText(textinput, "text change")
    })

    NativeModules.JISInputFilter.checkJISText.mockRejectedValueOnce(new Error('Simulated error'));
    await act(async () => {
      fireEvent.changeText(textinput, null)
    })
    await waitFor(async () => {
      expect(getByText(/新タグID：/i)).toBeTruthy();
      expect(getByText(/メモを入力して下さい。/i)).toBeTruthy();
      expect(getByText(/破棄/i)).toBeTruthy();
      expect(getByText(/戻る/i)).toBeTruthy();
      expect(getByText(/次へ/i)).toBeTruthy();
    })
  })


  it('本文欄で入力値が変更された場合(checkJISText: return null) -> 03 -> 結果値の確認', async () => {
    const { getByText, getByTestId, findByText } = render(
      <RecoilRoot>
        <WA1093 navigation={mockNavigation} />
      </RecoilRoot>
    )
    NativeModules.JISInputFilter.checkJISText.mockResolvedValue(null);

    const textinput = getByTestId('act0');
    await act(async () => {
      fireEvent.changeText(textinput, "text change")
    })

    await waitFor(async () => {
      expect(getByText(/新タグID：/i)).toBeTruthy();
      expect(getByText(/メモを入力して下さい。/i)).toBeTruthy();
      expect(getByText(/破棄/i)).toBeTruthy();
      expect(getByText(/戻る/i)).toBeTruthy();
      expect(getByText(/次へ/i)).toBeTruthy();
    })
  })



  it('preScreenIdがWA1094のとき, 戻るボタンを押したとき -> 結果値の確認(mockNavigate: WA1094)', async () => {
    const { getByText, findByText } = render(
      <RecoilRoot initializeState={(snapshot) => snapshot.set(WA1090PrevScreenId, 'WA1094')}>
        <WA1093 navigation={mockNavigation} />
      </RecoilRoot>
    )

    const triggerButton = getByText(/戻る/i);
    await act(async () => {
      fireEvent.press(triggerButton)
    })

    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1094');
    })

  })

  it('blur事件発生 -> 01 -> 結果値の確認', async () => {
    const { getByText, getByTestId, findByText } = render(
      <RecoilRoot>
        <WA1093 navigation={mockNavigation} />
      </RecoilRoot>
    )

    NativeModules.JISInputFilter.checkJISText.mockResolvedValue('');

    const textInput = getByTestId('act0')
    await act(async () => {
      fireEvent(textInput, "blur")
    })

    await waitFor(async () => {
      expect(getByText(/新タグID：/i)).toBeTruthy();
      expect(getByText(/メモを入力して下さい。/i)).toBeTruthy();
      expect(getByText(/破棄/i)).toBeTruthy();
      expect(getByText(/戻る/i)).toBeTruthy();
      expect(getByText(/次へ/i)).toBeTruthy();
    })
  })

  it('blur事件発生(エラー発生) -> 02 -> 結果値の確認', async () => {

    const { getByText, getByTestId, findByText } = render(
      <RecoilRoot>
        <WA1093 navigation={mockNavigation} />
      </RecoilRoot>
    )

    NativeModules.JISInputFilter.checkJISText.mockRejectedValueOnce(new Error('Simulated error'));

    const textInput = getByTestId('act0')
    await act(async () => {
      fireEvent(textInput, "blur")
    })

    await waitFor(async () => {
      expect(getByText(/新タグID：/i)).toBeTruthy();
      expect(getByText(/メモを入力して下さい。/i)).toBeTruthy();
      expect(getByText(/破棄/i)).toBeTruthy();
      expect(getByText(/戻る/i)).toBeTruthy();
      expect(getByText(/次へ/i)).toBeTruthy();
    })
  })


});
