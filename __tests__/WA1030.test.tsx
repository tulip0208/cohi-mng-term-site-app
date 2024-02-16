/**-------------------------------------------
 * WA1030 ログイン機能テスト
 * screens/WA1030.tsx
 * ---------------------------------------------*/
import React, {useEffect} from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../src/navigation/AppNavigator';
import {RecoilRoot} from 'recoil';
import {Text, View} from 'react-native';
import messages from '../src/utils/messages';
import {act} from '@testing-library/react-native';
import {ApiResponse, IFA0030Response} from '../src/types/type';
import WA1030 from '../src/screens/WA1030';
import bundledSettingsPath from '../assets/data/settings.json';

const mockNavigate = jest.fn();
// navigationオブジェクトのモック
const mockNavigation = {
  navigate: mockNavigate,
} as unknown as StackNavigationProp<RootList, 'WA1030'>; // 型アサーション
const enc = new TextEncoder();

// 外部でデータを定義
let mockScanData: string;
let mockApiPromise: Promise<ApiResponse<IFA0030Response>>;
let mockIFA0050ApiPromise: Promise<ApiResponse<ArrayBuffer>>;
let mockIFA0040ApiPromise: Promise<ApiResponse<ArrayBuffer>>;
let mockIFA0051ApiPromise: Promise<ApiResponse<null>>;
let mockComIdQr: string;
let mockWkplaceTypeQr: number;
let mockRealmWrite: (callback: () => void) => void;
let mockRandomUuid: () => any;

/************************************************
 * モック
 ************************************************/
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

jest.mock('../src/utils/QRScanner', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(({onScan}) => {
      // モックされたQRScannerがレンダリングされた後、自動的にonScanを呼び出す
      useEffect(() => {
        onScan(mockScanData, 'QR');
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

let mockAlert = () => Promise.resolve(true);
const mockShowAlert = jest.fn(() => mockAlert());
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
  IFA0030: jest.fn(async () => mockApiPromise),
  IFA0050: jest.fn(async () => mockIFA0050ApiPromise),
  IFA0040: jest.fn(async () => mockIFA0040ApiPromise),
  IFA0051: jest.fn(async () => mockIFA0051ApiPromise),
}));

// 位置情報を監視するをモック化
jest.mock('../src/utils/Location', () => ({
  watchLocation: jest.fn(),
}));

// 位置情報を監視するをモック化
jest.mock('react-native-aes-crypto', () => ({
  randomUuid: jest.fn(() => mockRandomUuid()),
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

// APKファイルをモック
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.NativeModules.ApkInstaller = {installApk: jest.fn()};
  return RN;
});

jest.mock('react-native-restart', () => ({
  Restart: jest.fn(),
}));

/************************************************
 * テストコード
 ************************************************/
describe('WA1030 Screen', () => {
  beforeEach(() => {
    mockScanData = '';
    mockApiPromise = Promise.resolve({
      success: true,
      data: {
        sttCd: '',
        errCd: '',
        rcvDt: '',
        isAppUpd: 0,
        isSetUpd: 0,
      },
      error: '',
    });
    mockIFA0050ApiPromise = Promise.resolve({
      success: true,
      data: enc.encode('mock binary data'),
    });
    mockIFA0040ApiPromise = Promise.resolve({
      success: true,
      data: enc.encode('{"id":1}'),
    });
    mockIFA0051ApiPromise = Promise.resolve({
      success: true,
      data: null,
    });
    mockComIdQr = '1';
    mockWkplaceTypeQr = 4;
    mockRealmWrite = (callback: () => void) => {
      callback();
    };
    mockRandomUuid = () => Promise.resolve('uuid');
    mockAlert = () => Promise.resolve(true);
  });

  // 表示
  it('成功 利用者QRコード読込ボタン、作業場所QRコード読込ボタン、開始ボタン、終了ボタンを表示', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 利用者読込ボタン
    await waitFor(async () => {
      expect(getByText('利用者読込')).toBeTruthy();
    });

    // 作業場所読込ボタン
    await waitFor(async () => {
      expect(getByText('作業場所読込')).toBeTruthy();
    });

    // 終了ボタン
    await waitFor(async () => {
      expect(getByText('終了')).toBeTruthy();
    });

    // 利用開始ボタン
    await waitFor(async () => {
      expect(getByText('利用開始')).toBeTruthy();
    });
  });

  it('成功 利用開始ボタンは初期表示は非活性、利用者QRコード、作業場所QRコードが読み込まれた後活性とする', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 利用開始ボタンは初期表示は非活性
    await waitFor(async () => {
      expect(
        getByText('利用開始').parent!.parent!.props.accessibilityState.disabled,
      ).toBeTruthy();
    });

    // 利用者QRコードが読み
    mockScanData = `1,${mockComIdQr},MockCompName,1,MockUserName`;
    await act(async () => {
      fireEvent.press(getByText('利用者読込').parent!);
    });

    // 作業場所QRコードが読み
    mockScanData = `${mockWkplaceTypeQr},1,MockTmpPlacName`;
    await act(async () => {
      fireEvent.press(getByText('作業場所読込').parent!);
    });

    // 利用開始ボタンは活性
    await waitFor(async () => {
      expect(
        getByText('利用開始').parent!.parent!.props.accessibilityState.disabled,
      ).toBeFalsy();
    });
  });

  // 利用者QRコードが読み
  it('失敗 利用者QRコードが読み（5つの部分があるか）', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 利用者QRコードが読み
    mockScanData = `1,${mockComIdQr},MockCompName,1`;
    await act(async () => {
      fireEvent.press(getByText('利用者読込').parent!);
    });

    // error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.EA5002('利用者'),
      false,
    );
  });

  it('失敗 利用者QRコードが読み(ID種別が1かどうかを確認)', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 利用者QRコードが読み
    mockScanData = `2,${mockComIdQr},MockCompName,1,MockUserName`;
    await act(async () => {
      fireEvent.press(getByText('利用者読込').parent!);
    });

    // error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.EA5002('利用者'),
      false,
    );
  });

  it('失敗 利用者QRコードが読み(keyStoreから事業者IDを確認)', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    mockComIdQr = '1';
    // 利用者QRコードが読み
    mockScanData = `1,2,MockCompName,1,MockUserName`;
    await act(async () => {
      fireEvent.press(getByText('利用者読込').parent!);
    });

    // error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.EA5006('利用者'),
      false,
    );
  });

  it('失敗 利用者QRコードが読み(Realm)', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 利用者QRコードが読み
    mockScanData = `1,${mockComIdQr},MockCompName,1,MockUserName`;
    mockRealmWrite = callback => {
      callback();
      throw new Error('mock error');
    };

    await act(async () => {
      fireEvent.press(getByText('利用者読込').parent!);
    });
  });

  it('成功 利用者QRコードが読み', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 利用者QRコードが読み
    mockScanData = `1,${mockComIdQr},MockCompName,1,MockUserName`;
    await act(async () => {
      fireEvent.press(getByText('利用者読込').parent!);
    });

    // 利用者
    await waitFor(async () => {
      expect(getByText('利用者：MockUserName')).toBeTruthy();
    });
  });

  // 作業場所QRコード読み
  it('失敗 作業場所QRコード読み（internal error）', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 作業場所QRコードが読み
    mockWkplaceTypeQr = 4;
    mockScanData = `${mockWkplaceTypeQr},1,MockTmpPlacName,4`;
    mockRandomUuid = () => {
      throw new Error('mock error');
    };

    await act(async () => {
      fireEvent.press(getByText('作業場所読込').parent!);
    });

    // error
    await waitFor(async () => {
      expect(mockShowAlert).toHaveBeenCalledWith(
        '通知',
        messages.EA5002('作業場所'),
        false,
      );
    });
  });

  it('失敗 作業場所QRコード読み（ID種別が4~6かどうかを確認）', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    mockWkplaceTypeQr = 3;
    // 作業場所QRコードが読み
    mockScanData = `${mockWkplaceTypeQr},1,MockTmpPlacName,4`;
    await act(async () => {
      fireEvent.press(getByText('作業場所読込').parent!);
    });

    // error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.EA5002('作業場所'),
      false,
    );
  });

  it('失敗 作業場所QRコード読み(Realm)', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 作業場所QRコードが読み
    mockScanData = `${mockWkplaceTypeQr},1,MockTmpPlacName,4`;
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
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    mockWkplaceTypeQr = 4;
    // 作業場所QRコードが読み
    mockScanData = `${mockWkplaceTypeQr},1,MockTmpPlacName,4`;
    await act(async () => {
      fireEvent.press(getByText('作業場所読込').parent!);
    });

    // 利用者
    await waitFor(async () => {
      expect(getByText('作業場所：MockTmpPlacName')).toBeTruthy();
    });
  });

  it('成功 作業場所QRコード読み(保管場)', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    mockWkplaceTypeQr = 5;
    // 作業場所QRコードが読み
    mockScanData = `${mockWkplaceTypeQr},MockStorePlacName,1`;
    await act(async () => {
      fireEvent.press(getByText('作業場所読込').parent!);
    });

    // 利用者
    await waitFor(async () => {
      expect(getByText('作業場所：MockStorePlacName')).toBeTruthy();
    });
  });

  it('成功 作業場所QRコード読み(定置場)', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    mockWkplaceTypeQr = 6;
    // 作業場所QRコードが読み
    mockScanData = `${mockWkplaceTypeQr},1,MockStorePlacName,1,1,1`;
    await act(async () => {
      fireEvent.press(getByText('作業場所読込').parent!);
    });

    // 利用者
    await waitFor(async () => {
      expect(getByText('作業場所：MockStorePlacName')).toBeTruthy();
    });
  });

  // 戻るボタンタップ時
  it('戻るボタンタップ時には以下の制御を行う。', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByText('終了').parent!;
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    expect(mockShowAlert).toHaveBeenCalledWith('確認', messages.IA5001(), true);
  });

  it('成功 利用開始する(【アプリ更新】＝"0")', async () => {
    jest.useFakeTimers();

    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 利用者QRコードが読み
    mockScanData = `1,${mockComIdQr},MockCompName,1,MockUserName`;
    await act(async () => {
      fireEvent.press(getByText('利用者読込').parent!);
    });

    // 作業場所QRコードが読み
    mockScanData = `${mockWkplaceTypeQr},1,MockTmpPlacName`;
    await act(async () => {
      fireEvent.press(getByText('作業場所読込').parent!);
    });

    // 利用開始する
    await act(async () => {
      fireEvent.press(getByText('利用開始').parent!);
    });

    //画面コール
    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1040');
    });
  });

  it('成功 利用開始する(【アプリ更新】＝"1")', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 利用者QRコードが読み
    mockScanData = `1,${mockComIdQr},MockCompName,1,MockUserName`;
    await act(async () => {
      fireEvent.press(getByText('利用者読込').parent!);
    });

    // 作業場所QRコードが読み
    mockScanData = `${mockWkplaceTypeQr},1,MockTmpPlacName`;
    await act(async () => {
      fireEvent.press(getByText('作業場所読込').parent!);
    });

    mockApiPromise = Promise.resolve({
      success: true,
      data: {
        sttCd: '',
        errCd: '',
        rcvDt: '',
        isAppUpd: 1,
        isSetUpd: 0,
      },
      error: '',
    });

    // 利用開始する
    await act(async () => {
      fireEvent.press(getByText('利用開始').parent!);
    });

    // アプリの更新の選択
    await waitFor(async () => {
      expect(mockShowAlert).toHaveBeenCalledWith(
        '確認',
        messages.IA5004(),
        true,
      );
    });

    // APKインストール
    await waitFor(async () => {
      expect(mockShowAlert).toHaveBeenCalledWith(
        '通知',
        messages.IA5008(),
        false,
      );
    });
  });

  it('失敗 利用開始する(【アプリ更新】＝"1")-ユーザーの選択中止', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 利用者QRコードが読み
    mockScanData = `1,${mockComIdQr},MockCompName,1,MockUserName`;
    await act(async () => {
      fireEvent.press(getByText('利用者読込').parent!);
    });

    // 作業場所QRコードが読み
    mockScanData = `${mockWkplaceTypeQr},1,MockTmpPlacName`;
    await act(async () => {
      fireEvent.press(getByText('作業場所読込').parent!);
    });

    mockApiPromise = Promise.resolve({
      success: true,
      data: {
        sttCd: '',
        errCd: '',
        rcvDt: '',
        isAppUpd: 1,
        isSetUpd: 0,
      },
      error: '',
    });
    mockAlert = () => Promise.resolve(false);

    // 利用開始する
    await act(async () => {
      fireEvent.press(getByText('利用開始').parent!);
    });
  });

  it('失敗 利用開始する(【アプリ更新】＝"1")-API-codeHttp200', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 利用者QRコードが読み
    mockScanData = `1,${mockComIdQr},MockCompName,1,MockUserName`;
    await act(async () => {
      fireEvent.press(getByText('利用者読込').parent!);
    });

    // 作業場所QRコードが読み
    mockScanData = `${mockWkplaceTypeQr},1,MockTmpPlacName`;
    await act(async () => {
      fireEvent.press(getByText('作業場所読込').parent!);
    });

    mockApiPromise = Promise.resolve({
      success: false,
      data: {
        sttCd: '',
        errCd: '',
        rcvDt: '',
        isAppUpd: 1,
        isSetUpd: 0,
      },
      error: 'codeHttp200',
      api: '',
      status: 500,
    });

    // 利用開始する
    await act(async () => {
      fireEvent.press(getByText('利用開始').parent!);
    });

    // codeHttp200 error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.EA5004('', 500),
      false,
    );
  });

  it('失敗 利用開始する(【アプリ更新】＝"1")-API-codeRsps01', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 利用者QRコードが読み
    mockScanData = `1,${mockComIdQr},MockCompName,1,MockUserName`;
    await act(async () => {
      fireEvent.press(getByText('利用者読込').parent!);
    });

    // 作業場所QRコードが読み
    mockScanData = `${mockWkplaceTypeQr},1,MockTmpPlacName`;
    await act(async () => {
      fireEvent.press(getByText('作業場所読込').parent!);
    });

    mockApiPromise = Promise.resolve({
      success: false,
      data: {
        sttCd: '',
        errCd: '',
        rcvDt: '',
        isAppUpd: 1,
        isSetUpd: 0,
      },
      error: 'codeRsps01',
      api: '',
      code: 'ERROR_500',
    });

    // 利用開始する
    await act(async () => {
      fireEvent.press(getByText('利用開始').parent!);
    });

    // codeRsps01 error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.EA5005('', 'ERROR_500'),
      false,
    );
  });

  it('失敗 利用開始する(【アプリ更新】＝"1")-API-timeout', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 利用者QRコードが読み
    mockScanData = `1,${mockComIdQr},MockCompName,1,MockUserName`;
    await act(async () => {
      fireEvent.press(getByText('利用者読込').parent!);
    });

    // 作業場所QRコードが読み
    mockScanData = `${mockWkplaceTypeQr},1,MockTmpPlacName`;
    await act(async () => {
      fireEvent.press(getByText('作業場所読込').parent!);
    });

    mockApiPromise = Promise.resolve({
      success: false,
      data: {
        sttCd: '',
        errCd: '',
        rcvDt: '',
        isAppUpd: 1,
        isSetUpd: 0,
      },
      error: 'timeout',
    });

    // 利用開始する
    await act(async () => {
      fireEvent.press(getByText('利用開始').parent!);
    });

    // timeout error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.EA5003(),
      false,
    );
  });

  it('失敗 利用開始する(【アプリ更新】＝"1")-API-IFA0050-error', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 利用者QRコードが読み
    mockScanData = `1,${mockComIdQr},MockCompName,1,MockUserName`;
    await act(async () => {
      fireEvent.press(getByText('利用者読込').parent!);
    });

    // 作業場所QRコードが読み
    mockScanData = `${mockWkplaceTypeQr},1,MockTmpPlacName`;
    await act(async () => {
      fireEvent.press(getByText('作業場所読込').parent!);
    });

    mockApiPromise = Promise.resolve({
      success: true,
      data: {
        sttCd: '',
        errCd: '',
        rcvDt: '',
        isAppUpd: 1,
        isSetUpd: 0,
      },
      error: '',
    });
    mockIFA0050ApiPromise = Promise.resolve({
      success: false,
      data: enc.encode(''),
      error: 'timeout',
    });

    // 利用開始する
    await act(async () => {
      fireEvent.press(getByText('利用開始').parent!);
    });

    // timeout error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.EA5003(),
      false,
    );
  });

  // 【設定ファイル更新】＝"1"
  it('成功 利用開始する(【設定ファイル更新】＝"1")', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 利用者QRコードが読み
    mockScanData = `1,${mockComIdQr},MockCompName,1,MockUserName`;
    await act(async () => {
      fireEvent.press(getByText('利用者読込').parent!);
    });

    // 作業場所QRコードが読み
    mockScanData = `${mockWkplaceTypeQr},1,MockTmpPlacName`;
    await act(async () => {
      fireEvent.press(getByText('作業場所読込').parent!);
    });

    mockApiPromise = Promise.resolve({
      success: true,
      data: {
        sttCd: '',
        errCd: '',
        rcvDt: '',
        isAppUpd: 0,
        isSetUpd: 1,
      },
      error: '',
    });

    // 利用開始する
    await act(async () => {
      fireEvent.press(getByText('利用開始').parent!);
    });

    expect(mockShowAlert).toHaveBeenCalledWith('確認', messages.IA5009(), true);

    //画面コール
    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1040');
    });
  });

  it('失敗 利用開始する(【設定ファイル更新】＝"1")-API-ERROR-0040', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 利用者QRコードが読み
    mockScanData = `1,${mockComIdQr},MockCompName,1,MockUserName`;
    await act(async () => {
      fireEvent.press(getByText('利用者読込').parent!);
    });

    // 作業場所QRコードが読み
    mockScanData = `${mockWkplaceTypeQr},1,MockTmpPlacName`;
    await act(async () => {
      fireEvent.press(getByText('作業場所読込').parent!);
    });

    mockApiPromise = Promise.resolve({
      success: true,
      data: {
        sttCd: '',
        errCd: '',
        rcvDt: '',
        isAppUpd: 0,
        isSetUpd: 1,
      },
      error: '',
    });
    mockIFA0040ApiPromise = Promise.resolve({
      success: false,
      data: enc.encode('mock binary data'),
      error: 'timeout',
    });

    // 利用開始する
    await act(async () => {
      fireEvent.press(getByText('利用開始').parent!);
    });

    // timeout error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.EA5003(),
      false,
    );
  });

  it('失敗 利用開始する(【設定ファイル更新】＝"1")-API-ERROR-0051', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 利用者QRコードが読み
    mockScanData = `1,${mockComIdQr},MockCompName,1,MockUserName`;
    await act(async () => {
      fireEvent.press(getByText('利用者読込').parent!);
    });

    // 作業場所QRコードが読み
    mockScanData = `${mockWkplaceTypeQr},1,MockTmpPlacName`;
    await act(async () => {
      fireEvent.press(getByText('作業場所読込').parent!);
    });

    mockApiPromise = Promise.resolve({
      success: true,
      data: {
        sttCd: '',
        errCd: '',
        rcvDt: '',
        isAppUpd: 0,
        isSetUpd: 1,
      },
      error: '',
    });
    mockIFA0051ApiPromise = Promise.resolve({
      success: false,
      data: null,
      error: 'timeout',
    });

    // 利用開始する
    await act(async () => {
      fireEvent.press(getByText('利用開始').parent!);
    });

    // timeout error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.EA5003(),
      false,
    );
  });

  it('失敗 利用開始する(【設定ファイル更新】＝"1")-API-Exception', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1030 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 利用者QRコードが読み
    mockScanData = `1,${mockComIdQr},MockCompName,1,MockUserName`;
    await act(async () => {
      fireEvent.press(getByText('利用者読込').parent!);
    });

    // 作業場所QRコードが読み
    mockScanData = `${mockWkplaceTypeQr},1,MockTmpPlacName`;
    await act(async () => {
      fireEvent.press(getByText('作業場所読込').parent!);
    });

    mockApiPromise = Promise.resolve({
      success: true,
      data: {
        sttCd: '',
        errCd: '',
        rcvDt: '',
        isAppUpd: 0,
        isSetUpd: 1,
      },
      error: '',
    });

    mockAlert = () => {
      throw new Error('mock alert exception');
    };

    // 利用開始する
    await act(async () => {
      fireEvent.press(getByText('利用開始').parent!);
    });
  });
});
