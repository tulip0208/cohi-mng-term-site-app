import React, { useEffect } from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react-native'
import { StackNavigationProp } from '@react-navigation/stack';
import { RecoilRoot } from 'recoil'
import { Text, View } from 'react-native'
import { RootList } from '../src/navigation/AppNavigator';
import WA1090 from '../src/screens/WA1090';
import bundledSettingsPath from '../assets/data/settings.json';
import {
    WA1090PrevScreenId,
} from '../src/atom/atom';
import { atom, atomFamily } from 'recoil';
import { IFA0340 } from '../src/utils/Api'
import {
    ApiResponse,
    IFT0420Response,
    IFT0420ResponseDtl,
    WA1090WkPlacConst,
    WA1091OldTagInfoConst,
    WA1092WtDsConst,
    IFA0340Response,
    IFA0340ResponseDtl
} from '../src/types/type';

let mockScanData =
    '4,端末０１,72b9feea-de53-47ea-b00c-dbda5d8ca53c,db213e42-dd7f-42db-8997-cf58e9575dc1,20231205';

const mockNavigate = jest.fn();
const mockNavigation = {
    navigate: mockNavigate,
} as unknown as StackNavigationProp<RootList, 'WA1090'>; // 型アサーション


const mockShowAlert = jest.fn(() => Promise.resolve(true));
jest.mock('../src/components/AlertContext', () => ({
    useAlert: () => ({
        showAlert: mockShowAlert,
        // 他の必要な関数やプロパティがあればここに追加
    }),
}));
// Api.jsのIFA0010関数をモック化
jest.mock('../src/utils/Api', () => ({
    IFA0340: jest.fn<Promise<ApiResponse<IFA0340Response<IFA0340ResponseDtl>>>, [string]>(),
}));
let mockRealmWrite: (callback: () => void) => void;

let wkplacTyp = 4

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
                            wkplacTyp: wkplacTyp
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

let type = 'CODABAR'
jest.mock('../src/utils/QRScanner', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(({ onScan }) => {
            // モックされたQRScannerがレンダリングされた後、自動的にonScanを呼び出す
            useEffect(() => {
                onScan(mockScanData, type);
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

describe('WA1090 レンダリング', () => {

    //最初のレンダリング -> 初期状態検査
    it('最初のレンダリング -> 初期状態検査', async () => {
        const { getByText } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )

        expect(getByText(/作業場所：/i)).toBeTruthy()
        expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()
    })

    //prevScreenId = WA1040のときのレンダリング -> 結果値チェック
    it('prevScreenId = WA1040のときのレンダリング -> 結果値チェック', async () => {
        const { getByText } = render(
            <RecoilRoot initializeState={(snapshot) => snapshot.set(WA1090PrevScreenId, 'WA1040')}>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )

        expect(getByText(/作業場所：/i)).toBeTruthy()
        expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()
    })
    // Feedback pressin 事件発生 -> 結果値チェック
    it('Feedback pressin 事件発生 -> 結果値チェック', async () => {
        jest.useFakeTimers(); // Mock the timers

        const { getByTestId, getByText } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )
        const act0 = getByTestId('act0')
        fireEvent(act0, 'pressIn')

        act(() => {
            jest.advanceTimersByTime(10000); // Advance timers by 1 second
        });

        expect(getByText('新タグIDが読み込めない場合：')).toBeTruthy()

        jest.useRealTimers(); // Restore real timers
    })
    // Feedback pressout 事件発生 -> 結果値チェック
    it('Feedback pressout 事件発生 -> 結果値チェック', async () => {
        jest.useFakeTimers(); // Mock the timers

        const { getByTestId, getByText } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )
        const act0 = getByTestId('act0')
        fireEvent(act0, 'pressIn')

        act(() => {
            jest.advanceTimersByTime(5000); // Advance timers by 1 second
        });

        fireEvent(act0, 'pressOut')

        expect(getByText(/作業場所：/i)).toBeTruthy()
        expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()

        jest.useRealTimers(); // Restore real timers
    })

    // handleInputChange 事件発生 -> 結果値チェック
    it('handleInputChange 事件発生 -> 結果値チェック', async () => {

        jest.useFakeTimers(); // Mock the timers

        const { getByTestId, getByText } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )
        const act0 = getByTestId('act0')
        fireEvent(act0, 'pressIn')

        act(() => {
            jest.advanceTimersByTime(10000); // Advance timers by 1 second
        });

        const btn = getByText('作業場所読込')
        fireEvent.press(btn)

        await waitFor(async () => {
            const input = getByTestId('act1')
            fireEvent(input, 'changeText', 'ああああああ')

            expect(getByText(/作業場所：/i)).toBeTruthy()
            expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()
        })
        jest.useRealTimers(); // Restore real timers

    })
    // handleInputBlur  事件発生 -> 結果値チェック
    it('handleInputBlur  事件発生 -> 結果値チェック', async () => {
        mockScanData = 'jigyosyaid12345,事業者なまえ,userid12345,ユーザなまえ';

        jest.useFakeTimers(); // Mock the timers

        const { getByTestId, getByText } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )
        const act0 = getByTestId('act0')
        fireEvent(act0, 'pressIn')

        act(() => {
            jest.advanceTimersByTime(10000); // Advance timers by 1 second
        });

        const btn = getByText('作業場所読込')
        fireEvent.press(btn)

        await waitFor(async () => {
            const input = getByTestId('act1')
            fireEvent(input, 'blur')

            expect(getByText(/作業場所：/i)).toBeTruthy()
            expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()


        })
        jest.useRealTimers(); // Restore real timers


    })


    // 作業場所読み込みボタンを押したとき 01 -> 結果値チェック
    it('作業場所読み込みボタンを押したとき 01 -> 結果値チェック', async () => {
        mockScanData = '333033333333333'
        const { getByText, getByTestId } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )

        const act2 = getByTestId('act2')
        fireEvent(act2, 'press')

        await waitFor(() => {
            expect(getByText(/作業場所：/i)).toBeTruthy()
            expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()
        })
    })
    // 作業場所読み込みボタンを押したとき(IFA0340.data.dtl: あああああ && type: QR) 02 -> 結果値チェック
    it('作業場所読み込みボタンを押したとき(IFA0340.data.dtl: あああああ && type: QR) 02 -> 結果値チェック', async () => {
        await act(async () => {
            (IFA0340 as jest.Mock).mockResolvedValue({
                success: true,
                data: {
                    dtl: 'あああああ'
                }
            });
        });
        mockScanData = 'sdsdsd'
        type = 'QR'
        const { getByText, getByTestId } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )

        const act2 = getByTestId('act2')
        fireEvent(act2, 'press')

        await waitFor(() => {
            expect(getByText(/作業場所：/i)).toBeTruthy()
            expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()
        })
    })
    // 作業場所読み込みボタンを押したとき(mockScanData: 333033333333333)03 -> 結果値チェック
    it('作業場所読み込みボタンを押したとき(mockScanData: 333033333333333)03 -> 結果値チェック', async () => {
        await act(async () => {
            (IFA0340 as jest.Mock).mockResolvedValue({
                success: true,
                data: {
                    dtl: 'あああああ'
                }
            });
        });
        mockScanData = '333033333333333'
        type = 'CODABAR'
        const { getByText, getByTestId } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )

        const act2 = getByTestId('act2')
        fireEvent(act2, 'press')

        await waitFor(async () => {
            expect(getByText(/作業場所：/i)).toBeTruthy()
            expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()

        })

    })
    // 作業場所読み込みボタンを押したとき(mockScanData: 333033333333333 そして type: CODABAR)04 -> 結果値チェック
    it('作業場所読み込みボタンを押したとき(mockScanData: 333033333333333 そして type: CODABAR)04 -> 結果値チェック', async () => {
        await act(async () => {
            (IFA0340 as jest.Mock).mockResolvedValue({
                success: true,
                data: {
                    dtl: 'あ'
                }
            });
        });

        mockScanData = '333033333333333'
        type = 'CODABAR'
        const { getByText, getByTestId } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )

        const act2 = getByTestId('act2')
        fireEvent(act2, 'press')

        await waitFor(async () => {
            expect(getByText(/作業場所：/i)).toBeTruthy()
            expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()
        })

    })
    // 作業場所読み込みボタンを押したとき(type: QR) 05 -> 結果値チェック
    it('作業場所読み込みボタンを押したとき(type: QR) 05 -> 結果値チェック ', async () => {
        type = 'QR'
        const { getByText, getByTestId } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )

        const act2 = getByTestId('act2')
        fireEvent(act2, 'press')

        await waitFor(() => {
            expect(getByText(/作業場所：/i)).toBeTruthy()
            expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()
        })
    })
    // 作業場所読み込みボタンを押したとき(isBtnEnabledWkp: null) 06 -> 結果値チェック
    it('作業場所読み込みボタンを押したとき(isBtnEnabledWkp: null) 06 -> 結果値チェック', async () => {
        const { getByText, getByTestId } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )

        const act2 = getByTestId('act2')
        fireEvent(act2, 'press')

        await waitFor(async () => {
            fireEvent(act2, 'press')

            await waitFor(() => {
                expect(getByText(/作業場所：/i)).toBeTruthy()
                expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()
            })
        })
    })


    // タグ読み込みをクリックしたとき 01 -> 結果値チェック
    it('タグ読み込みをクリックしたとき 01 -> 結果値チェック', async () => {
        const { getByText, getByTestId } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )

        const btn = getByText('タグ読込')
        fireEvent.press(btn)

        waitFor(async () => {
            const act4 = getByTestId('act4')

            expect(act4.props.visible).toBe(true)
        })

    })
    // タグ読み込みをクリックしたとき(isBtnEnabledTag: null) 02 -> 結果値チェック
    it('タグ読み込みをクリックしたとき(isBtnEnabledTag: null) 02 -> 結果値チェック', async () => {
        const { getByText, getByTestId } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )

        const btn = getByText('タグ読込')
        fireEvent.press(btn)
        fireEvent.press(btn)

        expect(getByText(/作業場所：/i)).toBeTruthy()
        expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()
    })
    // タグ読み込みをクリックしたとき(mockScanData: sdsdsdsd そして type: CODABAR) 03 -> 結果値チェック
    it('タグ読み込みをクリックしたとき(mockScanData: sdsdsdsd そして type: CODABAR) 03 -> 結果値チェック', async () => {
        mockScanData = 'sdsdsdsd'
        type = 'CODABAR'
        const { getByText, getByTestId } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )

        const btn = getByText('タグ読込')
        fireEvent.press(btn)

        expect(getByText(/作業場所：/i)).toBeTruthy()
        expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()
    })
    // タグ読み込みをクリックしたとき(IFA0340.data.dtl: あ そして mockScanData: 333033333333333 そして type: CODABAR) 04 -> 結果値チェック
    it('タグ読み込みをクリックしたとき(IFA0340.data.dtl: あ そして mockScanData: 333033333333333 そして type: CODABAR) 04 -> 結果値チェック', async () => {
        await act(async () => {
            (IFA0340 as jest.Mock).mockResolvedValue({
                success: true,
                data: {
                    dtl: 'あ'
                }
            });
        });
        mockScanData = '333033333333333'
        type = 'CODABAR'
        const { getByText, getByTestId } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )

        const btn = getByText('タグ読込')
        fireEvent.press(btn)

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('WA1094');
        })
    })
    // タグ読み込みをクリックしたとき(IFA0340.data.dtl: ああ そして mockScanData: 333033333333333 そして type: CODABAR) 04 -> 結果値チェック
    it('タグ読み込みをクリックしたとき(IFA0340.data.dtl: ああ そして mockScanData: 333033333333333 そして type: CODABAR) 04 -> 結果値チェック', async () => {
        await act(async () => {
            (IFA0340 as jest.Mock).mockResolvedValue({
                success: true,
                data: {
                    dtl: 'ああ'
                }
            });
        });
        mockScanData = '333033333333333'
        type = 'CODABAR'
        const { getByText, getByTestId } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )

        const btn = getByText('タグ読込')
        fireEvent.press(btn)

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('WA1091');
        })
    })
    // タグ読み込みをクリックしたとき(IFA0340.data.success: false そして IFA0340.data.dtl: ああ そして mockScanData: 333033333333333 そして type: CODABAR) 04 -> 結果値チェック
    it('タグ読み込みをクリックしたとき(IFA0340.data.success: false そして IFA0340.data.dtl: ああ そして mockScanData: 333033333333333 そして type: CODABAR) 04 -> 結果値チェック', async () => {
        await act(async () => {
            (IFA0340 as jest.Mock).mockResolvedValue({
                success: false,
                data: {
                    dtl: 'ああ'
                }
            });
        });
        mockScanData = '333033333333333'
        type = 'CODABAR'
        const { getByText, getByTestId } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )

        const btn = getByText('タグ読込')
        fireEvent.press(btn)

        await waitFor(() => {
            expect(getByText(/作業場所：/i)).toBeTruthy()
            expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()
        })
    })
    // タグ読み込みをクリックしたとき(IFA0340.data.success: true そして IFA0340.data.dtl: あ そして mockScanData: 333033333333333 そして type: CODABAR) 04 -> 結果値チェック
    it('タグ読み込みをクリックしたとき(IFA0340.data.success: true そして IFA0340.data.dtl: あ そして mockScanData: 333033333333333 そして type: CODABAR) 04 -> 結果値チェック', async () => {
        mockShowAlert.mockResolvedValueOnce(false)
        await act(async () => {
            (IFA0340 as jest.Mock).mockResolvedValue({
                success: true,
                data: {
                    dtl: 'あ'
                }
            });
        });
        mockScanData = '333033333333333'
        type = 'CODABAR'
        const { getByText, getByTestId } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )

        const btn = getByText('タグ読込')
        fireEvent.press(btn)

        await waitFor(() => {
            expect(getByText(/作業場所：/i)).toBeTruthy()
            expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()
        })
    })


    //破棄をクリックしたとき 01 -> 結果値チェック
    it('破棄をクリックしたとき 01 -> 結果値チェック', async () => {
        const { getByText, getByTestId } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )

        const btnApp = getByText('破棄')
        fireEvent.press(btnApp)

        waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('WA1090');

        })

    })
    //破棄をクリックしたとき(isBtnEnabledDel: null) 02 -> 結果値チェック
    it('破棄をクリックしたとき(isBtnEnabledDel: null) 02 -> 結果値チェック', async () => {
        const { getByText, getByTestId } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )

        const btnApp = getByText('破棄')
        fireEvent(btnApp, 'press')
        fireEvent(btnApp, 'press')

        expect(getByText(/作業場所：/i)).toBeTruthy()
        expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()
    })

    //戻るをクリックしたとき 01 -> 結果値チェック
    it('戻るをクリックしたとき 01 -> 結果値チェック', async () => {
        const { getByText, getByTestId } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )

        const btnAppBack = getByText('戻る')
        fireEvent.press(btnAppBack)

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('WA1040');
        })
    })
    //戻るをクリックしたとき(isBtnEnabledBck: null) 02 -> 結果値チェック
    it('戻るをクリックしたとき(isBtnEnabledBck: null) 02 -> 結果値チェック', async () => {
        const { getByText, getByTestId } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )

        const btnAppBack = getByText('戻る')
        fireEvent(btnAppBack, 'press')
        fireEvent(btnAppBack, 'press')

        expect(getByText(/作業場所：/i)).toBeTruthy()
        expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()
    })

    //次へをクリックしたとき 01 -> 結果値チェック
    it('次へをクリックしたとき 01 -> 結果値チェック', async () => {
        jest.useFakeTimers(); // Mock the timers
        await act(async () => {
            (IFA0340 as jest.Mock).mockResolvedValue({
                success: true,
                data: {
                    dtl: 'あああああ'
                }
            });
        });

        const { getByTestId, getByText } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )
        const act0 = getByTestId('act0')
        fireEvent(act0, 'pressIn')

        act(() => {
            jest.advanceTimersByTime(10000); // Advance timers by 1 second
        });

        const btnAppNext = getByText('次へ')
        fireEvent(btnAppNext, 'press')

        expect(mockNavigate).toHaveBeenCalledWith('WA1040');

        jest.useRealTimers(); // Restore real timers
    })
    //次へをクリックしたとき(isBtnEnabledNxt: null) 02 -> 結果値チェック
    it('次へをクリックしたとき(isBtnEnabledNxt: null) 02 -> 結果値チェック', async () => {
        jest.useFakeTimers(); // Mock the timers
        await act(async () => {
            (IFA0340 as jest.Mock).mockResolvedValue({
                success: true,
                data: {
                    dtl: 'あああああ'
                }
            });
        });

        const { getByTestId, getByText } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )
        const act0 = getByTestId('act0')
        fireEvent(act0, 'pressIn')

        act(() => {
            jest.advanceTimersByTime(10000); // Advance timers by 1 second
        });

        const btnAppNext = getByText('次へ')
        fireEvent(btnAppNext, 'press')
        fireEvent(btnAppNext, 'press')

        expect(getByText(/作業場所：/i)).toBeTruthy()
        expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()

        jest.useRealTimers(); // Restore real timers
    })
    //次へをクリックしたとき(IFA0340.data.dtl: あ) 03 -> 結果値チェック
    it('次へをクリックしたとき(IFA0340.data.dtl: あ) 03 -> 結果値チェック', async () => {
        jest.useFakeTimers(); // Mock the timers
        await act(async () => {
            (IFA0340 as jest.Mock).mockResolvedValue({
                success: true,
                data: {
                    dtl: 'あ'
                }
            });
        });

        const { getByTestId, getByText } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )
        const act0 = getByTestId('act0')
        fireEvent(act0, 'pressIn')

        act(() => {
            jest.advanceTimersByTime(10000); // Advance timers by 1 second
        });

        const btnAppNext = getByText('次へ')
        fireEvent(btnAppNext, 'press')

        expect(mockNavigate).toHaveBeenCalledWith('WA1094');

        jest.useRealTimers(); // Restore real timers
    })
    //次へをクリックしたとき(showAlert: false) 04 -> 結果値チェック
    it('次へをクリックしたとき(showAlert: false) 04 -> 結果値チェック', async () => {
        mockShowAlert.mockResolvedValueOnce(false)

        jest.useFakeTimers(); // Mock the timers
        await act(async () => {
            (IFA0340 as jest.Mock).mockResolvedValue({
                success: true,
                data: {
                    dtl: 'あ'
                }
            });
        });

        const { getByTestId, getByText } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )
        const act0 = getByTestId('act0')
        fireEvent(act0, 'pressIn')

        act(() => {
            jest.advanceTimersByTime(10000); // Advance timers by 1 second
        });

        const btnAppNext = getByText('次へ')
        fireEvent(btnAppNext, 'press')

        expect(getByText(/作業場所：/i)).toBeTruthy()
        expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()

        jest.useRealTimers(); // Restore real timers
    })
    //次へをクリックしたとき(error: codeHttp200) 05 -> 結果値チェック
    it('次へをクリックしたとき(error: codeHttp200) 05 -> 結果値チェック', async () => {
        mockShowAlert.mockResolvedValueOnce(false)

        jest.useFakeTimers(); // Mock the timers
        await act(async () => {
            (IFA0340 as jest.Mock).mockResolvedValue({
                success: false,
                error: 'codeHttp200'
            });
        });

        const { getByTestId, getByText } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )
        const act0 = getByTestId('act0')
        fireEvent(act0, 'pressIn')

        act(() => {
            jest.advanceTimersByTime(10000); // Advance timers by 1 second
        });

        const btnAppNext = getByText('次へ')
        fireEvent(btnAppNext, 'press')

        expect(getByText(/作業場所：/i)).toBeTruthy()
        expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()

        jest.useRealTimers(); // Restore real timers
    })
    //次へをクリックしたとき(error: codeRsps01) 06 -> 結果値チェック
    it('次へをクリックしたとき(error: codeRsps01) 06 -> 結果値チェック', async () => {
        mockShowAlert.mockResolvedValueOnce(false)

        jest.useFakeTimers(); // Mock the timers
        await act(async () => {
            (IFA0340 as jest.Mock).mockResolvedValue({
                success: false,
                error: 'codeRsps01'
            });
        });

        const { getByTestId, getByText } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )
        const act0 = getByTestId('act0')
        fireEvent(act0, 'pressIn')

        act(() => {
            jest.advanceTimersByTime(10000); // Advance timers by 1 second
        });

        const btnAppNext = getByText('次へ')
        fireEvent(btnAppNext, 'press')

        expect(getByText(/作業場所：/i)).toBeTruthy()
        expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()

        jest.useRealTimers(); // Restore real timers
    })
    //次へをクリックしたとき(error: timeout) 07 -> 結果値チェック
    it('次へをクリックしたとき(error: timeout) 07 -> 結果値チェック', async () => {
        mockShowAlert.mockResolvedValueOnce(false)

        jest.useFakeTimers(); // Mock the timers
        await act(async () => {
            (IFA0340 as jest.Mock).mockResolvedValue({
                success: false,
                error: 'timeout'
            });
        });

        const { getByTestId, getByText } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )
        const act0 = getByTestId('act0')
        fireEvent(act0, 'pressIn')

        act(() => {
            jest.advanceTimersByTime(10000); // Advance timers by 1 second
        });

        const btnAppNext = getByText('次へ')
        fireEvent(btnAppNext, 'press')

        expect(getByText(/作業場所：/i)).toBeTruthy()
        expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()

        jest.useRealTimers(); // Restore real timers
    })
    //次へをクリックしたとき(error: zero) 08 -> 結果値チェック
    it('次へをクリックしたとき(error: zero) 08 -> 結果値チェック', async () => {
        mockShowAlert.mockResolvedValueOnce(false)

        jest.useFakeTimers(); // Mock the timers
        await act(async () => {
            (IFA0340 as jest.Mock).mockResolvedValue({
                success: false,
                error: 'zero'
            });
        });

        const { getByTestId, getByText } = render(
            <RecoilRoot>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )
        const act0 = getByTestId('act0')
        fireEvent(act0, 'pressIn')

        act(() => {
            jest.advanceTimersByTime(10000); // Advance timers by 1 second
        });

        const btnAppNext = getByText('次へ')
        fireEvent(btnAppNext, 'press')

        expect(getByText(/作業場所：/i)).toBeTruthy()
        expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()

        jest.useRealTimers(); // Restore real timers
    })

    //レンダリング(prevScreenId: WA1040 そして loginInfo.wkplacTyp != 4) -> 結果値チェック
    it('レンダリング(prevScreenId: WA1040 そして loginInfo.wkplacTyp != 4) -> 結果値チェック', async () => {
        wkplacTyp = 11111
        const { getByText } = render(
            <RecoilRoot initializeState={(snapshot) => snapshot.set(WA1090PrevScreenId, 'WA1040')}>
                <WA1090 navigation={mockNavigation} />
            </RecoilRoot>
        )

        expect(getByText(/作業場所：/i)).toBeTruthy()
        expect(getByText(/下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。/i)).toBeTruthy()
    })
})