/**-------------------------------------------
 * WA1060 新タグID参照(土壌)
 * screens/WA1060.tsx
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
import WA1060 from '../src/screens/WA1060';
import bundledSettingsPath from '../assets/data/settings.json';
import {WA1060PrevScreenId, WA1061BackState} from '../src/atom/atom';

const mockNavigate = jest.fn();
// navigationオブジェクトのモック
const mockNavigation = {
  navigate: mockNavigate,
} as unknown as StackNavigationProp<RootList, 'WA1060'>; // 型アサーション

// 外部でデータを定義
let mockScanData: string;
let mockApiPromise: () => Promise<
  ApiResponse<IFA0320Response<IFA0330ResponseDtl>>
>;
let mockQRScan: (onScan: (data: string, type: string) => void) => void;
let mockComIdQr: string;
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

jest.mock('../src/utils/KeyStore', () => ({
  saveToKeystore: jest.fn(),
  loadFromKeystore: () => ({comId: mockComIdQr}),
  clearKeyStore: jest.fn(),
  getEncryptionKeyFromKeystore: jest.fn().mockResolvedValue(new Uint8Array(10)),
  // 他の関数もモック
}));

// Api.jsのIFA0330関数をモック化
jest.mock('../src/utils/Api', () => ({
  IFA0330: jest.fn(async () => mockApiPromise()),
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
    mockComIdQr = '1';
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
  it('成功 作業場所QRコード読込ボタン、タグ読込ボタン、破棄ボタン、戻るボタンを表示', async () => {
    const {findByText} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 作業場所
    expect(findByText('作業場所：仮置場')).toBeTruthy();
    expect(findByText('大阪')).toBeTruthy();
    expect(findByText('作業場所読込')).toBeTruthy();

    // タグ読込
    expect(findByText('タグ読込')).toBeTruthy();

    // 破棄、戻るボタン
    expect(findByText('破棄')).toBeTruthy();
    expect(findByText('戻る')).toBeTruthy();
  });

  // 初期表示
  it('成功 初期表示 (WA1040)', async () => {
    render(
      <RecoilRoot
        initializeState={snap => {
          snap.set(WA1060PrevScreenId, 'WA1040');
        }}>
        <WA1060 navigation={mockNavigation} />
      </RecoilRoot>,
    );
  });

  it('成功 初期表示 (WA1040, WA1061)', async () => {
    const RecoilUpdate = () => {
      const setState = useSetRecoilState(WA1061BackState);
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
          snap.set(WA1060PrevScreenId, 'WA1040');
          snap.set(WA1061BackState, false);
        }}>
        <RecoilUpdate />
        <WA1060 navigation={mockNavigation} />
      </RecoilRoot>,
    );
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
        <WA1060 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.WA5001(),
      false,
    );
  });

  //　初期表示時には新タグID入力と次へボタンは非表示とし、画面上を長押しすることで表示
  it('成功 初期表示時には新タグID入力と次へボタンは非表示とし、画面上を長押しすることで表示', async () => {
    const {getByText, getByTestId} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 初期表示時には新タグID入力と次へボタンは非表示
    expect(
      getByText('新タグIDが読み込めない場合はここを長押しして下さい。'),
    ).toBeDefined();

    // 長押しする
    await act(async () => {
      fireEvent(getByTestId('info-msg'), 'onPressIn');
      jest.advanceTimersByTime(10005);
      fireEvent(getByTestId('info-msg'), 'onPressOut');
    });

    // 画面上を長押しすることで表示
    expect(getByText('新タグIDが読み込めない場合：')).toBeTruthy();
    expect(getByTestId('text-input')).toBeTruthy();
  });

  it('失敗 長押しする', async () => {
    const {getByText, getByTestId} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 初期表示時には新タグID入力と次へボタンは非表示
    expect(
      getByText('新タグIDが読み込めない場合はここを長押しして下さい。'),
    ).toBeTruthy();

    // 長押しする
    await act(async () => {
      fireEvent(getByTestId('info-msg'), 'onPressIn');
    });

    await act(async () => {
      fireEvent(getByTestId('info-msg'), 'onPressOut');
    });

    // 新タグID入力と次へボタンは非表示
    expect(
      getByText('新タグIDが読み込めない場合はここを長押しして下さい。'),
    ).toBeTruthy();
  });

  it('失敗 作業場所QRコード読み（ID種別が4かどうかを確認）', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
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
        <WA1060 navigation={mockNavigation} />
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
        <WA1060 navigation={mockNavigation} />
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

  // タグの読み、新タグIDが登録
  it('成功 タグの読み、新タグID参照 (WA1066)', async () => {
    // 共通タグID
    mockScanData = 'CM,a929091111111111a';

    const {getByText} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByText('タグ読込').parent!;
    await act(async () => {
      fireEvent.press(triggerButton);

      // API call
      jest.advanceTimersByTime(500);
    });

    //レスポンス1件(共通)
    expect(mockShowAlert).toHaveBeenCalledWith('確認', messages.IA5017(), true);

    //画面コール
    expect(mockNavigate).toHaveBeenCalledWith('WA1066');
  });

  it('成功 タグの読み、新タグID参照 (WA1063)', async () => {
    // 共通タグID
    mockScanData = '929091111111111';
    mockQRScan = (onScan: (data: string, type: string) => void) => {
      onScan(mockScanData, 'CODABAR');
    };
    mockTemporaryPlacesData = () => [
      {
        id: '72b9feea-de53-47ea-b00c-dbda5d8ca53c',
        tmpPlacId: '2987023', //場所ID
        tmpPlacNm: '大阪', //名前
        delSrcTyp: 1,
      },
    ];
    mockApiPromise = () =>
      Promise.resolve({
        success: true,
        data: {
          sttCd: '',
          errCd: '',
          rcvDt: '',
          cnt: 0,
          dtl: [],
        },
        error: '',
      });

    const {getByText} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByText('タグ読込').parent!;
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    //画面コール
    expect(mockNavigate).toHaveBeenCalledWith('WA1066');
  });

  it('成功 タグの読み、新タグID参照 (WA1061)', async () => {
    // 共通タグID
    mockScanData = '929091111111111';
    mockQRScan = (onScan: (data: string, type: string) => void) => {
      onScan(mockScanData, 'CODABAR');
    };

    const {getByText} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    mockApiPromise = () =>
      Promise.resolve({
        success: true,
        data: {
          sttCd: '',
          errCd: '',
          rcvDt: '',
          cnt: 0,
          dtl: [],
        },
        error: '',
      });

    const triggerButton = getByText('タグ読込').parent!;
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    //画面コール
    expect(mockNavigate).toHaveBeenCalledWith('WA1066');
  });

  // タグの読み、新タグIDが未登録の場合
  it('失敗 タグの読み、新タグIDが未登録の場合、アラート表示', async () => {
    // 共通タグID
    mockScanData = 'CM,a929091111111111a';
    mockApiPromise = () =>
      Promise.resolve({
        success: false,
        data: {sttCd: '', rcvDt: '', cnt: 0, dtl: []},
        error: 'timeout',
      });

    const {getByText} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByText('タグ読込').parent!;
    await act(async () => {
      fireEvent.press(triggerButton);
      jest.advanceTimersByTime(1005);
    });

    // timeout error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.EA5003(),
      false,
    );
  });

  it('失敗 タグの読み、新タグIDが未登録の場合、アラート表示(codeHttp200)', async () => {
    // 共通タグID
    mockScanData = 'CM,a929091111111111a';
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
        <WA1060 navigation={mockNavigation} />
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

  it('失敗 タグの読み、新タグIDが未登録の場合、アラート表示(codeRsps01)', async () => {
    // 共通タグID
    mockScanData = 'CM,a929091111111111a';
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
        <WA1060 navigation={mockNavigation} />
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

  it('失敗 タグの読み、新タグIDが未登録の場合、アラート表示(zero)', async () => {
    // 共通タグID
    mockScanData = 'CM,a929091111111111a';
    mockApiPromise = () =>
      Promise.resolve({
        success: false,
        data: {sttCd: '', rcvDt: '', cnt: 0, dtl: []},
        error: 'zero',
      });

    const {getByText} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
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

  it('失敗 タグの読み(タグID)', async () => {
    // タグID
    mockScanData = 'DM,a929091111111111a';

    const {getByText} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByText('タグ読込').parent!;
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.EA5009(),
      false,
    );
  });

  it('失敗 タグの読み(CODABAR-フォーマットチェック)', async () => {
    // タグID
    mockScanData = '909091111111111';
    mockQRScan = (onScan: (data: string, type: string) => void) => {
      onScan(mockScanData, 'CODABAR');
    };

    const {getByText} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByText('タグ読込').parent!;
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.EA5017(mockScanData),
      false,
    );
  });

  // タグの読み、新タグIDが登録
  it('成功 タグの読み(CODABAR)、新タグIDが登録', async () => {
    // 共通タグID
    mockScanData = '929091111111111';

    const {getByText} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByText('タグ読込').parent!;
    await act(async () => {
      fireEvent.press(triggerButton);

      // API call
      jest.advanceTimersByTime(1005);
    });

    //画面コール
    expect(mockNavigate).toHaveBeenCalledWith('WA1066');
  });

  // 戻るボタンタップ時
  it('戻るボタンタップ時', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByText('戻る').parent!;
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    expect(mockShowAlert).toHaveBeenCalledWith('確認', messages.IA5011(), true);

    //画面コール
    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1040');
    });
  });

  // タグの手入力、新タグIDが登録
  it('成功 タグの手入力、新タグIDが登録', async () => {
    const {getByTestId, getByText} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
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
    expect(mockNavigate).toHaveBeenCalledWith('WA1066');
  });

  it('成功 次へボタンタップ時(WA1063)', async () => {
    mockTemporaryPlacesData = () => [
      {
        id: '72b9feea-de53-47ea-b00c-dbda5d8ca53c',
        tmpPlacId: '2987023', //場所ID
        tmpPlacNm: '大阪', //名前
        delSrcTyp: 1,
      },
    ];
    mockApiPromise = () =>
      Promise.resolve({
        success: true,
        data: {
          sttCd: '',
          errCd: '',
          rcvDt: '',
          cnt: 0,
          dtl: [],
        },
        error: '',
      });

    const {getByText, getByTestId} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
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
    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1063');
    });
  });

  it('成功 次へボタンタップ時(WA1061)', async () => {
    mockTemporaryPlacesData = () => [
      {
        id: '72b9feea-de53-47ea-b00c-dbda5d8ca53c',
        tmpPlacId: '2987023', //場所ID
        tmpPlacNm: '大阪', //名前
        delSrcTyp: 0,
      },
    ];
    mockApiPromise = () =>
      Promise.resolve({
        success: true,
        data: {
          sttCd: '',
          errCd: '',
          rcvDt: '',
          cnt: 0,
          dtl: [],
        },
        error: '',
      });

    const {getByText, getByTestId} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    mockScanData = `${mockWkplaceTypeQr},1,MockTmpPlacName,0`;
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
    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1061');
    });
  });

  it('成功 次へボタンタップ時(NON)', async () => {
    const {getByText, getByTestId} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
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

    mockAlert = () => Promise.resolve(false);
    await act(async () => {
      fireEvent(nextBtn, 'onPress');
    });
  });

  it('成功 タグの手入力、チェック、アラート表示', async () => {
    const errorCode = '919091111111111';

    const {getByTestId, getByText} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
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
      fireEvent.changeText(getByTestId('text-input'), errorCode);
    });
    await act(async () => {
      fireEvent(getByTestId('text-input'), 'onBlur');
    });

    // フォーマットチェック
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.EA5017(errorCode),
      false,
    );
  });

  // タグの手入力、除去土壌
  it('成功 タグの手入力、除去土壌、アラート表示', async () => {
    const errorCode = '629091111111111';

    const {getByTestId, getByText} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
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
      fireEvent.changeText(getByTestId('text-input'), errorCode);
    });
    await act(async () => {
      fireEvent(getByTestId('text-input'), 'onBlur');
    });

    // フォーマットチェック
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.EA5022('土壌', '新タグ参照(灰)', errorCode),
      false,
    );
  });

  it('失敗 タグの読み(コード)', async () => {
    // 共通タグID
    mockScanData = 'CM,a929091111111111a';
    mockQRScan = (onScan: (data: string, type: string) => void) => {
      onScan(mockScanData, 'BAR');
    };

    const {getByText} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
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

  it('失敗 7カラム目の津波浸水が1の場合', async () => {
    // 共通タグID
    mockScanData = 'CM,a929091111111111a,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1';
    mockQRScan = (onScan: (data: string, type: string) => void) => {
      onScan(mockScanData, 'QR');
    };

    const {getByText} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    mockAlert = () => Promise.resolve(false);
    await act(async () => {
      fireEvent.press(getByText('タグ読込').parent!);
    });

    expect(mockShowAlert).toHaveBeenCalledWith(
      '確認',
      messages.IA5007('津波浸水'),
      true,
    );
  });

  it('失敗 8カラム目の特定施設由来が1の場合', async () => {
    // 共通タグID
    mockScanData = 'CM,a929091111111111a,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1';
    mockQRScan = (onScan: (data: string, type: string) => void) => {
      onScan(mockScanData, 'QR');
    };

    const {getByText} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    mockAlert = () => Promise.resolve(false);
    await act(async () => {
      fireEvent.press(getByText('タグ読込').parent!);
    });

    expect(mockShowAlert).toHaveBeenCalledWith(
      '確認',
      messages.IA5007('特定施設由来'),
      true,
    );
  });

  it('失敗 8カラム目の特定施設由来が1の場合_1', async () => {
    // 共通タグID
    mockScanData = 'CM,a929091111111111a,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1';
    mockQRScan = (onScan: (data: string, type: string) => void) => {
      onScan(mockScanData, 'QR');
    };

    const {getByText} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    mockAlert = (title, message) =>
      Promise.resolve(message !== messages.IA5019());
    await act(async () => {
      fireEvent.press(getByText('タグ読込').parent!);
    });

    expect(mockShowAlert).toHaveBeenCalledWith(
      '確認',
      messages.IA5007('特定施設由来'),
      true,
    );
  });

  it('失敗 8カラム目の特定施設由来が1の場合_2', async () => {
    // 共通タグID
    mockScanData = 'CM,a929091111111111a,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1';
    mockQRScan = (onScan: (data: string, type: string) => void) => {
      onScan(mockScanData, 'QR');
    };

    const {getByText} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    await act(async () => {
      fireEvent.press(getByText('タグ読込').parent!);
    });

    expect(mockShowAlert).toHaveBeenCalledWith(
      '確認',
      messages.IA5007('特定施設由来'),
      true,
    );
  });

  // 破棄ボタンタップ時
  it('破棄ボタンタップ時', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1060 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByText('破棄').parent!;
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    expect(mockShowAlert).toHaveBeenCalledWith('確認', messages.IA5011(), true);

    //画面コール
    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1040');
    });
  });
});
