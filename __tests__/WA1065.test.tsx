/**-------------------------------------------
 * WA1065 テスト
 * screens/WA1065.tsx
 * ---------------------------------------------*/
import React, { useEffect } from 'react';
import {
    render,
    fireEvent,
} from '@testing-library/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootList } from '../src/navigation/AppNavigator';
import {
    RecoilRoot,
} from 'recoil';
import { Text, View } from 'react-native';
import { act } from '@testing-library/react-native';
import WA1065 from '../src/screens/WA1065';
import bundledSettingsPath from '../assets/data/settings.json';
import { WA1063MemoAutoState, WA1060PrevScreenId, WA1065MemoState } from '../src/atom/atom';
import {NativeModules} from 'react-native';

const {JISInputFilter} = NativeModules;

const mockNavigate = jest.fn();
// navigationオブジェクトのモック
const mockNavigation = {
    navigate: mockNavigate,
} as unknown as StackNavigationProp<RootList, 'WA1065'>; // 型アサーション

// 外部でデータを定義
let mockScanData: string;
let mockQRScan: (onScan: (data: string, type: string) => void) => void;
let mockLoginData: any;
let mockWA1063MemoAutoState: any;
let mockWA1065MemoState: any;
let mockWA1060PrevScreenId: any;

/************************************************
 * モック
 ************************************************/
jest.mock('../src/utils/QRScanner', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(({ onScan }) => {
            // モックされたQRScannerがレンダリングされた後、自動的にonScanを呼び出す
            useEffect(() => {
                mockQRScan(onScan);
            }, [onScan]);

            // 実際のカメラUIの代わりにダミーの要素を表示
            return (
                <View>
                    <Text>QRScannerモック</Text>
                </View>
            );
        }),
    };
});

jest.mock('../src/utils/Realm', () => {
    return {
        getInstance: jest.fn().mockReturnValue({
            objects: jest.fn().mockImplementation(function (schema: string) {
                if (schema === 'login') {
                    return [mockLoginData];
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
        }),
    };
});

const mockShowAlert = jest.fn(() => Promise.resolve(true));
jest.mock('../src/components/AlertContext', () => ({
    useAlert: () => ({
        showAlert: mockShowAlert,
        // 他の必要な関数やプロパティがあればここに追加
    }),
}));


jest.mock('react-native-fs', () => ({
    // 他のモック関数とともに追加
    stat: jest.fn(() =>
        Promise.resolve({
            // stat 関数が返すべき適切なオブジェクトをモックします
            // 以下は例です。必要に応じて調整してください
            size: 1024,
            isFile: () => true,
            isDirectory: () => false,
            mtime: new Date(),
            ctime: new Date(),
            // その他の必要なプロパティ
        }),
    ),
    exists: jest.fn(() => Promise.resolve(true)),
    appendFile: jest.fn(() => Promise.resolve()),
    readDir: jest.fn(() => Promise.resolve([])),
    // その他必要なメソッドをモック
}));

// RNCameraをモック
jest.mock('react-native-camera', () => ({
    RNCamera: {
        Constants: {
            BarCodeType: {
                qr: 'QR',
            },
        },
    },
}));

jest.mock('react-native/Libraries/BatchedBridge/NativeModules', () => {
  return {
    JISInputFilter: {
        checkJISText: jest.fn(() => Promise.resolve('')),
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

/************************************************
 * テストコード
 ************************************************/
describe('WA1065 Screen', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    beforeEach(() => {
        jest.useFakeTimers();

        // 共通タグID
        mockScanData = 'CM,a929091111111111a';
        mockQRScan = (onScan: (data: string, type: string) => void) => {
            onScan(mockScanData, 'QR');
        };
        mockLoginData = {
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
        };
    });


    //　初期表示設定
    it('成功 文字数：400-一時記憶メモ字数を表示', async () => {
        mockWA1063MemoAutoState = '123';
        const {} = render(
            <RecoilRoot
                initializeState={(snap: any) => {
                    snap.set(WA1063MemoAutoState, mockWA1063MemoAutoState);
                }}
            >
                <WA1065 navigation={mockNavigation} />
            </RecoilRoot>,
        );
    });

    it('成功 メモ：一時記憶メモを表示', async () => {
        mockWA1065MemoState = '123';
        const {} = render(
            <RecoilRoot
                initializeState={(snap: any) => {
                    snap.set(WA1065MemoState, mockWA1065MemoState);
                }}
            >
                <WA1065 navigation={mockNavigation} />
            </RecoilRoot>,
        );
    });

    //破棄ボタン処理
    it('成功 破棄ボタン処理', async () => {
        const { getByText } = render(
            <RecoilRoot            >
                <WA1065 navigation={mockNavigation} />
            </RecoilRoot>,
        );
        const triggerButton = getByText(/破棄/);
        await act(async () => {
            fireEvent.press(triggerButton);
        });
    });

    //戻るボタン処理
    it('成功 戻るボタン処理 遷移元画面IDを設定', async () => {
        mockWA1060PrevScreenId = 'WA1066';
        const { getByText } = render(
            <RecoilRoot
                initializeState={(snap: any) => {
                    snap.set(WA1060PrevScreenId, mockWA1060PrevScreenId);
                }}
            >
                <WA1065 navigation={mockNavigation} />
            </RecoilRoot>,
        );
        const triggerButton = getByText(/戻る/);
        await act(async () => {
            fireEvent.press(triggerButton);
        });
    });

    it('失敗 戻るボタン処理 遷移元画面IDを設定', async () => {
        mockWA1060PrevScreenId = 'W';
        const { getByText } = render(
            <RecoilRoot
                initializeState={(snap: any) => {
                    snap.set(WA1060PrevScreenId, mockWA1060PrevScreenId);
                }}
            >
                <WA1065 navigation={mockNavigation} />
            </RecoilRoot>,
        );
        const triggerButton = getByText(/戻る/);
        await act(async () => {
            fireEvent.press(triggerButton);
        });
    });

    //次へボタン処理
    it('成功 次へボタン処理', async () => {
        const { getByText } = render(
            <RecoilRoot            >
                <WA1065 navigation={mockNavigation} />
            </RecoilRoot>,
        );
        const triggerButton = getByText(/次へ/);
        await act(async () => {
            fireEvent.press(triggerButton);
        });
    });

    //入力されたときのハンドラー
    it('成功 入力されたときのハンドラー', async () => {
        const { getByTestId } = render(
            <RecoilRoot            >
                <WA1065 navigation={mockNavigation} />
            </RecoilRoot>,
        );
        await act(async () => {
            fireEvent.changeText(getByTestId('text-input'), null);
        });
    });

    it('成功 入力されたときのハンドラー ', async () => {
        const { getByTestId } = render(
            <RecoilRoot            >
                <WA1065 navigation={mockNavigation} />
            </RecoilRoot>,
        );
        await act(async () => {
            fireEvent.changeText(getByTestId('text-input'), '1234');
        });
    });

    it('失敗 入力されたときのハンドラー ', async () => {
        (JISInputFilter.checkJISText as jest.Mock).mockImplementation(() => {
            throw new Error('Error');
        });
        const { getByTestId } = render(
            <RecoilRoot            >
                <WA1065 navigation={mockNavigation} />
            </RecoilRoot>,
        );
        await act(async () => {
            fireEvent.changeText(getByTestId('text-input'), '1234');
        });
    });


    // 入力がフォーカスアウトされたときのハンドラー
    it('成功 入力がフォーカスアウトされたときのハンドラー', async () => {
        (JISInputFilter.checkJISText as jest.Mock).mockImplementation(() => {
            return null;
        });
        const { getByTestId } = render(
            <RecoilRoot>
                <WA1065 navigation={mockNavigation} />
            </RecoilRoot>,
        );
        await act(async () => {
            fireEvent(getByTestId('text-input'), 'blur');
        });
    });

    it('失敗 入力がフォーカスアウトされたときのハンドラー', async () => {
        (JISInputFilter.checkJISText as jest.Mock).mockImplementation(() => {
            throw new Error('Error');
        });
        const { getByTestId } = render(
            <RecoilRoot>
                <WA1065 navigation={mockNavigation} />
            </RecoilRoot>,
        );
        await act(async () => {
            fireEvent.changeText(getByTestId('text-input'), '');
        });
        await act(async () => {
            fireEvent(getByTestId('text-input'), 'blur');
        });
    });

    it('失敗 入力がフォーカスアウトされたときのハンドラー 1', async () => {
        (JISInputFilter.checkJISText as jest.Mock).mockImplementation(() => {
            return null;
        });
        const { getByTestId } = render(
            <RecoilRoot>
                <WA1065 navigation={mockNavigation} />
            </RecoilRoot>,
        );
        await act(async () => {
            fireEvent.changeText(getByTestId('text-input'), '');
        });
        await act(async () => {
            fireEvent(getByTestId('text-input'), 'blur');
        });
    });

    it('失敗 入力がフォーカスアウトされたときのハンドラー 2', async () => {
        (JISInputFilter.checkJISText as jest.Mock).mockImplementation(() => {
            return null;
        });
        const mockStateValue = null;
        jest.spyOn(React, 'useState').mockImplementationOnce(() => ([mockStateValue, jest.fn()]));
        const { getByTestId } = render(
            <RecoilRoot>
                <WA1065 navigation={mockNavigation} /> 
            </RecoilRoot>
        );

        await act(async () => {
            fireEvent.changeText(getByTestId('text-input'), '');
        });
        await act(async () => {
            fireEvent(getByTestId('text-input'), 'blur');
        });
    });

});


