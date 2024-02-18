import React from 'react';
import {render, waitFor, act, fireEvent} from '@testing-library/react-native';
import {RecoilRoot} from 'recoil';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../src/navigation/AppNavigator';
import {RouteProp} from '@react-navigation/native';
import bundledSettingsPath from '../assets/data/settings.json';
import WA1050 from '../src/screens/WA1050';
import {checkLogFile} from '../src/utils/Log';
import messages from '../src/utils/messages';
import {IFA0020} from '../src/utils/Api';
import {ApiResponse} from '../src/types/type';

const mockNavigate = jest.fn();
// navigationオブジェクトのモック
const mockNavigation = {
  navigate: mockNavigate,
} as unknown as StackNavigationProp<RootList, 'WA1050'>; // 型アサーション

// routeオブジェクトのモック
const mockRoute = jest.fn().mockReturnValue({
  sourceScreenId: 'ID',
});

const mockRouter = {
  params: mockRoute,
} as unknown as RouteProp<RootList, 'WA1050'>;

// jest.mock('react-native-rem-stylesheet');

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
    PlatformConstants: jest.fn(() => ''),
  };
});

// Location モジュールのモック
jest.mock('../src/utils/Location', () => ({
  clearLocation: jest.fn().mockReturnValue(''),
  watchLocation: jest.fn().mockReturnValue(''),
}));

jest.mock('../src/utils/Realm', () => {
  return {
    getInstance: jest.fn().mockReturnValue({
      objects: jest.fn().mockImplementation(function (schema: string) {
        if (schema === 'login') {
          return [
            {
              id: 1,
              loginDt: new Date()
                .toISOString()
                .replace(/[^0-9]/g, '')
                .slice(0, 14),
              comId: 'J202200010',
              userId: 1,
              wkplacTyp: 4,
              wkplacId: 1,
              fixPlacId: 1,
              logoutFlg: 0,
            },
          ];
        } else if (schema === 'temporary_places') {
          return [
            {
              id: '72b9feea-de53-47ea-b00c-dbda5d8ca53c',
              tmpPlacId: '2987023', //場所ID
              tmpPlacNm: '大阪', //名前
              delSrcTyp: 0,
            },
          ];
        } else if (schema === 'settings') {
          return [bundledSettingsPath];
        }
        return [];
      }),
    }),
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
      reactNativeVersion: {major: 60, minor: 1, patch: 0},
      systemName: 'ios',
    }),
  }),
);

jest.mock('../src/utils/KeyStore', () => ({
  saveToKeystore: jest.fn(),
  loadFromKeystore: jest.fn().mockReturnValue(['activationInfo']),
  clearKeyStore: jest.fn(),
  getEncryptionKeyFromKeystore: jest.fn().mockResolvedValue(new Uint8Array(10)),
  // 他の関数もモック
}));

jest.mock('../src/components/AlertContext', () => ({
  useAlert: () => ({
    showAlert: jest.fn(() => Promise.resolve(true)),
    // 他の必要な関数やプロパティがあればここに追加
  }),
}));

jest.mock('../src/utils/Log', () => ({
  logScreen: jest.fn(),
  logUserAction: jest.fn(),
  checkLogFile: jest.fn(() => 2),
  calculateTotalLogSize: jest.fn(),
  deleteLogs: jest.fn(callback => callback(jest.fn())),
  compressLogFiles: jest.fn(),
  deleteLogFile: jest.fn(),
}));

jest.mock('../src/utils/Api', () => ({
  IFA0020: jest.fn<Promise<ApiResponse<null>>, [string]>(),
}));

describe('WA1050 screen', () => {
  it('正しくレンダリング', async () => {
    // WA1050 コンポーネントをレンダリング
    const {findByText} = render(
      <RecoilRoot>
        <WA1050 route={mockRouter} navigation={mockNavigation} />
      </RecoilRoot>,
    );
    await waitFor(async () => {
      expect(findByText('メニュー')).toBeTruthy();
      expect(findByText('新タグ紐付')).toBeTruthy();
      expect(findByText('土壌')).toBeTruthy();
      expect(findByText('新タグ紐付')).toBeTruthy();
      expect(findByText('定置登録')).toBeTruthy();
      expect(findByText('終了')).toBeTruthy();
      expect(findByText('ログ消去')).toBeTruthy();
      expect(findByText('ログ送信')).toBeTruthy();
      expect(findByText('戻る')).toBeTruthy();
    });
  });

  it('ログファイル数を確認してボタン表示有無を設定', async () => {
    (checkLogFile as jest.Mock).mockResolvedValue(2);
    // WA1050 コンポーネントをレンダリング
    const {findByText} = render(
      <RecoilRoot>
        <WA1050 route={mockRouter} navigation={mockNavigation} />
      </RecoilRoot>,
    );
    await waitFor(async () => {
      expect(findByText('ログ消去')).toBeTruthy();
    });
  });

  it('ボタンクリック 戻るボタン', async () => {
    // WA1050 コンポーネントをレンダリング
    const {getByText, findByText} = render(
      <RecoilRoot>
        <WA1050 route={mockRouter} navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const triggerButton = getByText(/戻る/);
    await act(async () => {
      fireEvent.press(triggerButton);
    });
    await waitFor(async () => {
      expect(findByText('戻る')).toBeTruthy();
    });
  });

  it('ボタンクリック ログ消去', async () => {
    // (checkLogFile as jest.Mock).mockResolvedValue(0);
    // WA1040 コンポーネントをレンダリング
    const {getByTestId, findByText} = render(
      <RecoilRoot>
        <WA1050 route={mockRouter} navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByTestId('logDelete');
    await act(async () => {
      fireEvent(triggerButton, 'accessibilityAction', {disabled: false});
    });

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    await waitFor(async () => {
      const expectedMessage = messages.IA5005('ログのアップロード');
      expect(findByText(expectedMessage)).toBeTruthy();
    });
  });

  it('ボタンクリック ログ送信', async () => {
    global.locationStarted = true;
    global.locationStopped = true;
    // モック関数を失敗するレスポンスで設定
    await act(async () => {
      (IFA0020 as jest.Mock).mockResolvedValue({
        success: true,
      });
    });
    // WA1050 コンポーネントをレンダリング
    const {getByText, findByText} = render(
      <RecoilRoot>
        <WA1050 route={mockRouter} navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const triggerButton = getByText(/ログ送信/);

    await act(async () => {
      fireEvent(triggerButton, 'accessibilityAction', {disabled: false});
    });

    await act(async () => {
      fireEvent.press(triggerButton);
    });
    await waitFor(async () => {
      const expectedMessage = messages.IA5006();
      expect(findByText(expectedMessage)).toBeTruthy();
    });
  });

  it('送信ボタンON IFA0020失敗1', async () => {
    // モック関数を失敗するレスポンスで設定
    await act(async () => {
      (IFA0020 as jest.Mock).mockResolvedValue({
        success: false,
        error: 'codeHttp200',
      });
    });
    // 初期状態では送信ボタンが非活性化されていることを確認
    const {getByText} = render(
      <RecoilRoot>
        <WA1050 route={mockRouter} navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 送信ボタンが活性化されていることを確認
    const triggerButton = getByText(/ログ送信/);

    await act(async () => {
      fireEvent(triggerButton, 'accessibilityAction', {disabled: false});
    });

    await act(async () => {
      fireEvent.press(triggerButton);
    });
  });

  it('送信ボタンON IFA0020失敗2', async () => {
    // モック関数を失敗するレスポンスで設定
    await act(async () => {
      (IFA0020 as jest.Mock).mockResolvedValue({
        success: false,
        error: 'codeRsps01',
      });
    });
    // 初期状態では送信ボタンが非活性化されていることを確認
    const {getByText} = render(
      <RecoilRoot>
        <WA1050 route={mockRouter} navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 送信ボタンが活性化されていることを確認
    const triggerButton = getByText(/ログ送信/);

    await act(async () => {
      fireEvent(triggerButton, 'accessibilityAction', {disabled: false});
    });

    await act(async () => {
      fireEvent.press(triggerButton);
    });
  });

  it('送信ボタンON IFA0020失敗3', async () => {
    // モック関数を失敗するレスポンスで設定
    await act(async () => {
      (IFA0020 as jest.Mock).mockResolvedValue({
        success: false,
        error: 'timeout',
      });
    });
    // 初期状態では送信ボタンが非活性化されていることを確認
    const {getByText} = render(
      <RecoilRoot>
        <WA1050 route={mockRouter} navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 送信ボタンが活性化されていることを確認
    const triggerButton = getByText(/ログ送信/);

    await act(async () => {
      fireEvent(triggerButton, 'accessibilityAction', {disabled: false});
    });

    await act(async () => {
      fireEvent.press(triggerButton);
    });
  });

  it('送信ボタンON IFA0010失敗4 exception', async () => {
    // 初期状態では送信ボタンが非活性化されていることを確認
    const {getByText} = render(
      <RecoilRoot>
        <WA1050 route={mockRouter} navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 送信ボタンが活性化されていることを確認
    const triggerButton = getByText(/ログ送信/);

    await act(async () => {
      fireEvent(triggerButton, 'accessibilityAction', {disabled: false});
    });

    await act(async () => {
      fireEvent.press(triggerButton);
    });
  });
});
