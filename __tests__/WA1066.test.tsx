/**-------------------------------------------
 * WA1066 テスト
 * screens/WA1066.tsx
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
import WA1066 from '../src/screens/WA1066';
import bundledSettingsPath from '../assets/data/settings.json';
import { WA1060CmnTagFlgState, WA1063MemoAutoState, WA1065MemoState, WA1060OldTagInfosState } from '../src/atom/atom';
import { IFT0090 } from '../src/utils/Api';

const mockNavigate = jest.fn();
// navigationオブジェクトのモック
const mockNavigation = {
    navigate: mockNavigate,
} as unknown as StackNavigationProp<RootList, 'WA1066'>; // 型アサーション

// 外部でデータを定義
let mockQRScan: (onScan: (data: string, type: string) => void) => void;
let mockLoginData: any;
let mockApiPromise: any;
let mockWA1060CmnTagFlgState: any;
let mockWA1063MemoAutoState: any;
let mockWA1065MemoState: any;
let mockWA1060OldTagInfosState: any;

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

jest.mock('../src/utils/Api', () => ({
    IFT0090: jest.fn(async () => mockApiPromise),
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

/************************************************
 * テストコード
 ************************************************/
describe('WA1066 Screen', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    beforeEach(() => {
        jest.useFakeTimers();
        mockApiPromise = new Promise(resolve =>
            setTimeout(
                () =>
                    resolve({
                        success: true,
                        data: {
                            sttCd: '',
                            rcvDt: '',
                            datNum: '',
                            invCnt: 1,
                            vldCnt: 1,
                            yesNoAlt: 1,
                            altDatDtl: [],
                            itcRstCd: 1,
                            invDatDtl: [{
                                sndId: '0',
                                invCd: 1,
                            }],
                        },
                        error: '',
                    }),
                1000,
            ),
        );
    });


    // 破棄ボタン処理
    it('成功 破棄ボタン処理1', async () => {
        mockWA1060OldTagInfosState = [
            {
                oldTag: '',
            },
        ];
        const { getByText } = render(
            <RecoilRoot
            initializeState={(snap: any) => {
                snap.set(WA1060OldTagInfosState, mockWA1060OldTagInfosState);
            }}
        >
                <WA1066 navigation={mockNavigation} />
            </RecoilRoot>,
        );

        const triggerButton = getByText(/破棄/);
        await act(async () => {
            fireEvent.press(triggerButton);
        });
    
    });

    it('成功 破棄ボタン処理2', async () => {
        mockWA1060OldTagInfosState = [
            {
                oldTag: '',
            },
        ];
        const { getByText } = render(
            <RecoilRoot
            initializeState={(snap: any) => {
                snap.set(WA1060OldTagInfosState, mockWA1060OldTagInfosState);
            }}
        >
                <WA1066 navigation={mockNavigation} />
            </RecoilRoot>,
        );

        const triggerButton = getByText(/詳細/);
        await act(async () => {
            fireEvent.press(triggerButton);
        });
    
    });

    // 送信ボタン処理
    it('成功 送信ボタン処理', async () => {
        const { getByText } = render(
            <RecoilRoot>
                <WA1066 navigation={mockNavigation} />
            </RecoilRoot>,
        );

        const triggerButton = getByText(/送信/);
        await act(async () => {
            fireEvent.press(triggerButton);
        });
    });

    it('成功 共通タグが2:新タグの場合 紐付登録日時を更新', async () => {
        mockWA1060CmnTagFlgState = '2';
        const { getByText } = render(
            <RecoilRoot
                initializeState={(snap: any) => {
                    snap.set(WA1060CmnTagFlgState, mockWA1060CmnTagFlgState);
                }}
            >
                <WA1066 navigation={mockNavigation} />
            </RecoilRoot>,
        );
        
        const triggerButton = getByText(/送信/);
        await act(async () => {
            fireEvent.press(triggerButton);
        });
    });

    it('成功 メモの上限文字数以降カット', async () => {
        mockWA1063MemoAutoState =  '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';
        mockWA1065MemoState = '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';
        const { getByText } = render(
            <RecoilRoot
                initializeState={(snap: any) => {
                    snap.set(WA1063MemoAutoState, mockWA1063MemoAutoState);
                    snap.set(WA1065MemoState,mockWA1065MemoState);
                }}
            >
                <WA1066 navigation={mockNavigation} />
            </RecoilRoot>,
        );
        
        const triggerButton = getByText(/送信/);
        await act(async () => {
            fireEvent.press(triggerButton);
        });
    });

    // 必須情報編集ボタン処理
    it('成功 必須情報編集ボタン処理', async () => {
        const { getByText } = render(
            <RecoilRoot>
                <WA1066 navigation={mockNavigation} />
            </RecoilRoot>,
        );

        const triggerButton = getByText(/必須情報編集/);
        await act(async () => {
            fireEvent.press(triggerButton);
        });
    });

    // 重量・線量編集ボタン処理
    it('成功 重量・線量編集ボタン処理', async () => {
        const { getByText } = render(
            <RecoilRoot>
                <WA1066 navigation={mockNavigation} />
            </RecoilRoot>,
        );

        const triggerButton = getByText(/重量・線量編集/);
        await act(async () => {
            fireEvent.press(triggerButton);
        });
    });

    //メモ編集ボタン処理
    it('成功 メモ編集ボタン処理', async () => {
        const { getByText } = render(
            <RecoilRoot>
                <WA1066 navigation={mockNavigation} />
            </RecoilRoot>,
        );

        const triggerButton = getByText(/メモ編集/);
        await act(async () => {
            fireEvent.press(triggerButton);
        });
    });

    //API通信処理エラー有無確認・エラーハンドリング
    it('失敗 タグの読み、新タグIDが未登録の場合、アラート表示(codeHttp200)', async () => {
        (IFT0090 as jest.Mock)
            .mockImplementationOnce(() => ({
                success: false,
                error: 'codeHttp200',
            }));
        const { getByText } = render(
            <RecoilRoot>
                <WA1066 navigation={mockNavigation} />
            </RecoilRoot>,
        );

        const triggerButton = getByText(/送信/);
        await act(async () => {
            fireEvent.press(triggerButton);
        });
    });

    it('失敗 タグの読み、新タグIDが未登録の場合、アラート表示(codeRsps01)', async () => {
        (IFT0090 as jest.Mock)
            .mockImplementationOnce(() => ({
                success: false,
                error: 'codeRsps01',
            }));
        const { getByText } = render(
            <RecoilRoot>
                <WA1066 navigation={mockNavigation} />
            </RecoilRoot>,
        );

        const triggerButton = getByText(/送信/);
        await act(async () => {
            fireEvent.press(triggerButton);
        });
    });

    it('失敗 タグの読み、新タグIDが未登録の場合、アラート表示(timeout)', async () => {
        (IFT0090 as jest.Mock)
            .mockImplementationOnce(() => ({
                success: false,
                error: 'timeout',
            }));
        const { getByText } = render(
            <RecoilRoot>
                <WA1066 navigation={mockNavigation} />
            </RecoilRoot>,
        );

        const triggerButton = getByText(/送信/);
        await act(async () => {
            fireEvent.press(triggerButton);
        });
    });

    it('成功 API通信処理エラー有無確認・エラーハンドリング', async () => {
        (IFT0090 as jest.Mock)
            .mockImplementationOnce(() => ({
                success: true,
            }));
        const { getByText } = render(
            <RecoilRoot>
                <WA1066 navigation={mockNavigation} />
            </RecoilRoot>,
        );

        const triggerButton = getByText(/送信/);
        await act(async () => {
            fireEvent.press(triggerButton);
        });
    });

});


