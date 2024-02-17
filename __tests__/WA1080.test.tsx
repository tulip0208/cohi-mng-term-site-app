/**-------------------------------------------
 * WA1080 旧タグID参照(土壌)
 * screens/WA1080.tsx
 * ---------------------------------------------*/
import React, {useEffect} from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../src/navigation/AppNavigator';
import {RecoilRoot, useSetRecoilState} from 'recoil';
import {Text, View} from 'react-native';
import messages from '../src/utils/messages';
import {act} from '@testing-library/react-native';
import {
  ApiResponse,
  IFA0320Response,
  IFA0330ResponseDtl,
} from '../src/types/type';
import WA1080 from '../src/screens/WA1080';
import bundledSettingsPath from '../assets/data/settings.json';
import {WA1081BackState} from '../src/atom/atom';
import WA1060 from '../src/screens/WA1060';

const mockNavigate = jest.fn();
// navigationオブジェクトのモック
const mockNavigation = {
  navigate: mockNavigate,
} as unknown as StackNavigationProp<RootList, 'WA1080'>; // 型アサーション

// 外部でデータを定義
let mockScanData: string;
let mockApiPromise: () => Promise<
  ApiResponse<IFA0320Response<IFA0330ResponseDtl>>
>;
let mockQRScan: (onScan: (data: string, type: string) => void) => void;
let mockWkplaceTypeQr: number;
let mockRealmWrite: (callback: () => void) => void;

/************************************************
 * モック
 ************************************************/
jest.mock('../src/utils/QRScanner', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(({onScan}) => {
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

let mockTemporaryPlacesData: () => any;
let mockLoginData: () => any;

jest.mock('../src/utils/Realm', () => {
  return {
    getInstance: jest.fn().mockReturnValue({
      objects: jest.fn().mockImplementation(function (schema: string) {
        if (schema === 'login') {
          return mockLoginData();
        } else if (schema === 'temporary_places') {
          return mockTemporaryPlacesData();
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

let mockAlert: (title: string, message: string, showBtn: boolean) => void;
const mockShowAlert = jest.fn((t, m, s) => mockAlert(t, m, s));
jest.mock('../src/components/AlertContext', () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
    // 他の必要な関数やプロパティがあればここに追加
  }),
}));

// Api.jsのIFA0330関数をモック化
jest.mock('../src/utils/Api', () => ({
  IFA0310: jest.fn(async () => mockApiPromise()),
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
  writeFile: jest.fn(() => Promise.resolve()),
  DocumentDirectoryPath: '',
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
describe('WA1060 Screen', () => {
  beforeEach(() => {
    jest.useFakeTimers();

    mockScanData = '';
    mockQRScan = (onScan: (data: string, type: string) => void) => {
      onScan(mockScanData, 'QR');
    };
    mockApiPromise = () =>
      Promise.resolve({
        success: true,
        data: {
          sttCd: '',
          errCd: '',
          rcvDt: '',
          cnt: 0,
          dtl: [{} as IFA0330ResponseDtl],
        },
        error: '',
      });
    mockWkplaceTypeQr = 4;
    mockRealmWrite = (callback: () => void) => {
      callback();
    };
    mockLoginData = () => [
      {
        userId: 1,
        wkplacTyp: 4,
      },
    ];
    mockTemporaryPlacesData = () => [
      {
        id: '72b9feea-de53-47ea-b00c-dbda5d8ca53c',
        tmpPlacId: '2987023', //場所ID
        tmpPlacNm: '大阪', //名前
        delSrcTyp: 0,
      },
    ];
    mockAlert = () => Promise.resolve(true);
  });

  // 表示
  it('成功 作業場所QRコード読込ボタン、タグ読込ボタン、戻るボタンを表示', async () => {
    const {findByText} = render(
      <RecoilRoot>
        <WA1080 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 作業場所
    expect(findByText('作業場所：仮置場')).toBeTruthy();
    expect(findByText('大阪')).toBeTruthy();
    expect(findByText('作業場所読込')).toBeTruthy();

    // タグ読込
    expect(findByText('タグ読込')).toBeTruthy();

    // 戻るボタン
    expect(findByText('戻る')).toBeTruthy();
  });

  it('成功 初期表示 (WA1081back)', async () => {
    const RecoilUpdate = () => {
      const setState = useSetRecoilState(WA1081BackState);
      setTimeout(() => {
        act(() => {
          setState(true);
        });
      }, 1000);
      return null;
    };

    render(
      <RecoilRoot
        initializeState={snap => {
          snap.set(WA1081BackState, false);
        }}>
        <RecoilUpdate />
        <WA1080 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    jest.advanceTimersByTime(1005);
  });

  it('成功 作業場所種類(4)', async () => {
    mockLoginData = () => [
      {
        userId: 1,
        wkplacTyp: 0,
      },
    ];

    render(
      <RecoilRoot>
        <WA1080 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.WA5001(),
      false,
    );
  });

  //　初期表示時には旧タグID入力と次へボタンは非表示とし、画面上を長押しすることで表示
  it('成功 初期表示時には旧タグID入力と次へボタンは非表示とし、画面上を長押しすることで表示', async () => {
    const {getByText, getByTestId} = render(
      <RecoilRoot>
        <WA1080 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 初期表示時には旧タグID入力と次へボタンは非表示
    expect(
      getByText('旧タグIDが読み込めない場合はここを長押しして下さい。'),
    ).toBeDefined();

    // 長押しする
    await act(async () => {
      fireEvent(getByTestId('info-msg'), 'onPressIn');
      jest.advanceTimersByTime(10005);
      fireEvent(getByTestId('info-msg'), 'onPressOut');
    });

    // 画面上を長押しすることで表示
    expect(getByText('旧タグIDが読み込めない場合：')).toBeTruthy();
    expect(getByTestId('text-input')).toBeTruthy();
  });

  it('失敗 長押しする', async () => {
    const {getByText, getByTestId} = render(
      <RecoilRoot>
        <WA1080 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 初期表示時には旧タグID入力と次へボタンは非表示
    expect(
      getByText('旧タグIDが読み込めない場合はここを長押しして下さい。'),
    ).toBeTruthy();

    // 長押しする
    await act(async () => {
      fireEvent(getByTestId('info-msg'), 'onPressIn');
    });

    await act(async () => {
      fireEvent(getByTestId('info-msg'), 'onPressOut');
    });

    // 旧タグID入力と次へボタンは非表示
    expect(
      getByText('旧タグIDが読み込めない場合はここを長押しして下さい。'),
    ).toBeTruthy();
  });

  it('失敗 作業場所QRコード読み（ID種別が4かどうかを確認）', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1080 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    mockWkplaceTypeQr = 3;
    // 作業場所QRコードが読み
    mockScanData = `${mockWkplaceTypeQr},1,MockTmpPlacName,1`;
    await act(async () => {
      fireEvent.press(getByText('作業場所読込').parent!);
    });

    // error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.EA5007(),
      false,
    );
  });

  it('失敗 作業場所QRコード読み(Realm)', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1080 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 作業場所QRコードが読み
    mockScanData = `${mockWkplaceTypeQr},1,MockTmpPlacName,1`;
    mockRealmWrite = callback => {
      callback();
      throw new Error('mock error');
    };

    await act(async () => {
      fireEvent.press(getByText('作業場所読込').parent!);
    });
  });

  it('成功 作業場所QRコード読み(仮置場)', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1080 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    mockWkplaceTypeQr = 4;
    // 作業場所QRコードが読み
    mockScanData = `${mockWkplaceTypeQr},1,MockTmpPlacName,1`;
    await act(async () => {
      fireEvent.press(getByText('作業場所読込').parent!);
    });

    // 利用者
    await waitFor(async () => {
      expect(getByText('MockTmpPlacName')).toBeTruthy();
    });
  });

  it('失敗 タグの読み(コード)', async () => {
    // 共通タグID
    mockScanData = 'CM,a929091111111111a';
    mockQRScan = (onScan: (data: string, type: string) => void) => {
      onScan(mockScanData, 'BAR');
    };

    const {getByText} = render(
      <RecoilRoot>
        <WA1080 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    await act(async () => {
      fireEvent.press(getByText('タグ読込').parent!);
    });

    // error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.EA5008(),
      false,
    );
  });

  // タグの読み、旧タグIDが未登録の場合
  it('失敗 タグの読み、旧タグIDが未登録の場合、アラート表示', async () => {
    // 共通タグID
    mockScanData = 'BM,a929091111111111a';
    mockApiPromise = () =>
      Promise.resolve({
        success: false,
        data: {sttCd: '', rcvDt: '', cnt: 0, dtl: []},
        error: 'timeout',
      });

    const {getByText} = render(
      <RecoilRoot>
        <WA1080 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByText('タグ読込').parent!;
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // timeout error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.EA5003(),
      false,
    );
  });

  it('失敗 タグの読み、旧タグIDが未登録の場合、アラート表示(codeHttp200)', async () => {
    // 共通タグID
    mockScanData = 'BM,a929091111111111a';
    mockApiPromise = () =>
      Promise.resolve({
        success: false,
        data: {sttCd: '', rcvDt: '', cnt: 0, dtl: []},
        error: 'codeHttp200',
        api: '',
        status: 500,
      });

    const {getByText} = render(
      <RecoilRoot>
        <WA1080 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByText('タグ読込').parent!;
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // codeHttp200 error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.EA5004('', 500),
      false,
    );
  });

  it('失敗 タグの読み、旧タグIDが未登録の場合、アラート表示(codeRsps01)', async () => {
    // 共通タグID
    mockScanData = 'BM,a929091111111111a';
    mockApiPromise = () =>
      Promise.resolve({
        success: false,
        data: {sttCd: '', rcvDt: '', cnt: 0, dtl: []},
        error: 'codeRsps01',
        api: '',
        code: 'ERROR_500',
      });

    const {getByText} = render(
      <RecoilRoot>
        <WA1080 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByText('タグ読込').parent!;
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // codeRsps01 error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.EA5005('', 'ERROR_500'),
      false,
    );
  });

  it('失敗 タグの読み、旧タグIDが未登録の場合、アラート表示(zero)', async () => {
    // 共通タグID
    mockScanData = 'BM,a929091111111111a';
    mockApiPromise = () =>
      Promise.resolve({
        success: false,
        data: {sttCd: '', rcvDt: '', cnt: 0, dtl: []},
        error: 'zero',
      });

    const {getByText} = render(
      <RecoilRoot>
        <WA1080 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByText('タグ読込').parent!;
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // timeout error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.IA5015(),
      false,
    );
  });

  // タグの読み、旧タグIDが登録
  it('成功 タグの読み、旧タグIDが登録(CM)', async () => {
    // 共通タグID
    mockScanData = 'CM,929091111111111';

    const {getByText} = render(
      <RecoilRoot>
        <WA1080 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByText('タグ読込').parent!;
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    //画面コール
    expect(mockNavigate).toHaveBeenCalledWith('WA1081');
  });

  // タグの読み、旧タグIDが登録
  it('成功 タグの読み、旧タグIDが登録(CM以外)', async () => {
    // 共通タグID
    mockScanData = 'BM,929091111111111';

    const {getByText} = render(
      <RecoilRoot>
        <WA1080 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByText('タグ読込').parent!;
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    //画面コール
    expect(mockNavigate).toHaveBeenCalledWith('WA1081');
  });

  // 戻るボタンタップ時
  it('戻るボタンタップ時', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1080 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByText('戻る').parent!;
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    //画面コール
    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1040');
    });
  });

  // タグの手入力、旧タグIDが登録
  it('成功 タグの手入力、旧タグIDが登録', async () => {
    const {getByTestId, getByText} = render(
      <RecoilRoot>
        <WA1080 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    mockScanData = `${mockWkplaceTypeQr},1,MockTmpPlacName,1`;
    await act(async () => {
      fireEvent.press(getByText('作業場所読込').parent!);
    });

    // 長押しする
    await act(async () => {
      fireEvent(getByTestId('info-msg'), 'onPressIn');
      jest.advanceTimersByTime(10005);
    });
    await act(async () => {
      fireEvent(getByTestId('info-msg'), 'onPressOut');
    });

    // 手入力
    await act(async () => {
      fireEvent.changeText(getByTestId('text-input'), '929091111111111');
    });
    await act(async () => {
      fireEvent(getByTestId('text-input'), 'onBlur');
    });

    const nextBtn = getByText('次へ').parent!;

    await act(async () => {
      fireEvent(nextBtn, 'onPress');
    });

    // 画面コール
    expect(mockNavigate).toHaveBeenCalledWith('WA1081');
  });

  // タグの手入力、旧タグIDが登録
  it('失敗 タグの手入力、旧タグIDが登録、アラート表示(zero)', async () => {
    mockApiPromise = () =>
      Promise.resolve({
        success: false,
        data: {sttCd: '', rcvDt: '', cnt: 0, dtl: []},
        error: 'zero',
      });

    const {getByTestId, getByText} = render(
      <RecoilRoot>
        <WA1080 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    mockScanData = `${mockWkplaceTypeQr},1,MockTmpPlacName,1`;
    await act(async () => {
      fireEvent.press(getByText('作業場所読込').parent!);
    });

    // 長押しする
    await act(async () => {
      fireEvent(getByTestId('info-msg'), 'onPressIn');
      jest.advanceTimersByTime(10005);
    });
    await act(async () => {
      fireEvent(getByTestId('info-msg'), 'onPressOut');
    });

    // 手入力
    await act(async () => {
      fireEvent.changeText(getByTestId('text-input'), '929091111111111');
    });
    await act(async () => {
      fireEvent(getByTestId('text-input'), 'onBlur');
    });

    const nextBtn = getByText('次へ').parent!;

    await act(async () => {
      fireEvent(nextBtn, 'onPress');
    });

    // timeout error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.IA5015(),
      false,
    );
  });
});
