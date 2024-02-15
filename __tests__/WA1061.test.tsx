import React, {useEffect} from 'react';
import {render, waitFor, act, fireEvent} from '@testing-library/react-native';
import WA1061 from '../src/screens/WA1061';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../src/navigation/AppNavigator';
import {RecoilRoot} from 'recoil';
import bundledSettingsPath from '../assets/data/settings.json';
import {View, Text} from 'react-native';
import {IFA0310} from '../src/utils/Api';
import {ApiResponse} from '../src/types/type';
import {WA1060NewTagIdState, WA1060OldTagInfosState} from '../src/atom/atom';
import {useAlert} from '../src/components/AlertContext.tsx';

const mockNavigate = jest.fn();
// navigationオブジェクトのモック
const mockNavigation = {
  navigate: mockNavigate,
} as unknown as StackNavigationProp<RootList, 'WA1061'>; // 型アサーション

let mockScanData: string;
let mockQRScan: (onScan: (data: string, type: string) => void) => void;

let mockWA1060NewTagIdState = 'a1111111111a';
let mockWA1060OldTagInfosState = [
  {
    oldTag: '',
    genbaCheck: '',
    tsuInd: '',
    splFac: '',
    rmSolTyp: '1',
    ocLndCla: '',
    pkTyp: '',
    usgInnBg: '',
    usgInnBgNm: '',
    usgAluBg: '',
    vol: '',
    airDsRt: '',
    ocLndUseknd: '',
    ocloc: '',
    rmSolInf: '',
    lnkNewTagDatMem: '',
  },
];

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

let mockShowAlert = jest.fn(() => Promise.resolve(true));
jest.mock('../src/components/AlertContext', () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
    // 他の必要な関数やプロパティがあればここに追加
  }),
}));

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

jest.mock('../src/utils/Api', () => ({
  IFA0310: jest.fn<Promise<ApiResponse<null>>, [string]>(),
}));

jest.mock('../src/utils/KeyStore', () => ({
  saveToKeystore: jest.fn(),
  loadFromKeystore: jest.fn().mockReturnValue({comId: ''}),
  clearKeyStore: jest.fn(),
  getEncryptionKeyFromKeystore: jest.fn().mockResolvedValue(new Uint8Array(10)),
  // 他の関数もモック
}));

describe('wA1061 screen', () => {
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
    // mockLoginData = {
    //   id: 1,
    //   loginDt: new Date()
    //     .toISOString()
    //     .replace(/[^0-9]/g, '')
    //     .slice(0, 14),
    //   comId: 'J202200010',
    //   userId: 1,
    //   wkplacTyp: 4,
    //   wkplacId: 1,
    //   fixPlacId: 1,
    //   logoutFlg: 0,
    // };
  });

  it('正しくレンダリング', async () => {
    // WA1061 コンポーネントをレンダリング
    const {findByText} = render(
      <RecoilRoot>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    await waitFor(async () => {
      expect(findByText('新タグID：')).toBeTruthy();
      expect(findByText('タグ読込')).toBeTruthy();
      expect(findByText('ダミータグ')).toBeTruthy();
      expect(findByText('一括取消')).toBeTruthy();
      expect(findByText('破棄')).toBeTruthy();
      expect(findByText('戻る')).toBeTruthy();
      expect(findByText('次へ')).toBeTruthy();
    });
  });

  it('ボタンクリック ダミータグボタン', async () => {
    // WA1061 コンポーネントをレンダリング
    const {getByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060OldTagInfosState, mockWA1060OldTagInfosState);
        }}>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // タグ読込ボタンが活性化されていることを確認
    const triggerButton = getByText(/ダミータグ/);

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('次へ')).toBeTruthy();
    });
  });

  it('ボタンクリック タグ読込ボタン1', async () => {
    mockWA1060OldTagInfosState = [];
    (useAlert().showAlert as jest.Mock).mockReturnValue(false);
    // WA1061 コンポーネントをレンダリング
    const {getAllByText, getByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060OldTagInfosState, mockWA1060OldTagInfosState);
        }}>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // タグ読込ボタンが活性化されていることを確認
    const triggerButton = getAllByText(/タグ読込/)[1];

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('タグ読込')).toBeTruthy();
    });
  });

  it('ボタンクリック タグ読込ボタン1', async () => {
    mockWA1060OldTagInfosState = [
      {
        oldTag: '',
        genbaCheck: '',
        tsuInd: '',
        splFac: '',
        rmSolTyp: '1',
        ocLndCla: '',
        pkTyp: '',
        usgInnBg: '',
        usgInnBgNm: '',
        usgAluBg: '',
        vol: '',
        airDsRt: '',
        ocLndUseknd: '',
        ocloc: '',
        rmSolInf: '',
        lnkNewTagDatMem: '',
      },
    ];
    (useAlert().showAlert as jest.Mock).mockReturnValue(false);
    // WA1061 コンポーネントをレンダリング
    const {getAllByText, getByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060OldTagInfosState, mockWA1060OldTagInfosState);
        }}>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // タグ読込ボタンが活性化されていることを確認
    const triggerButton = getAllByText(/タグ読込/)[1];

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('タグ読込')).toBeTruthy();
    });
  });

  it('ボタンクリック タグ読込ボタン2', async () => {
    mockWA1060OldTagInfosState = [
      {
        oldTag: '',
        genbaCheck: '',
        tsuInd: '',
        splFac: '',
        rmSolTyp: '1',
        ocLndCla: '',
        pkTyp: '',
        usgInnBg: '',
        usgInnBgNm: '',
        usgAluBg: '',
        vol: '',
        airDsRt: '',
        ocLndUseknd: '',
        ocloc: '',
        rmSolInf: '',
        lnkNewTagDatMem: '',
      },
      {
        oldTag: '',
        genbaCheck: '',
        tsuInd: '',
        splFac: '',
        rmSolTyp: '',
        ocLndCla: '',
        pkTyp: '',
        usgInnBg: '',
        usgInnBgNm: '',
        usgAluBg: '',
        vol: '',
        airDsRt: '',
        ocLndUseknd: '',
        ocloc: '',
        rmSolInf: '',
        lnkNewTagDatMem: '',
      },
      {
        oldTag: '',
        genbaCheck: '',
        tsuInd: '',
        splFac: '',
        rmSolTyp: '',
        ocLndCla: '',
        pkTyp: '',
        usgInnBg: '',
        usgInnBgNm: '',
        usgAluBg: '',
        vol: '',
        airDsRt: '',
        ocLndUseknd: '',
        ocloc: '',
        rmSolInf: '',
        lnkNewTagDatMem: '',
      },
      {
        oldTag: '',
        genbaCheck: '',
        tsuInd: '',
        splFac: '',
        rmSolTyp: '',
        ocLndCla: '',
        pkTyp: '',
        usgInnBg: '',
        usgInnBgNm: '',
        usgAluBg: '',
        vol: '',
        airDsRt: '',
        ocLndUseknd: '',
        ocloc: '',
        rmSolInf: '',
        lnkNewTagDatMem: '',
      },
      {
        oldTag: '',
        genbaCheck: '',
        tsuInd: '',
        splFac: '',
        rmSolTyp: '',
        ocLndCla: '',
        pkTyp: '',
        usgInnBg: '',
        usgInnBgNm: '',
        usgAluBg: '',
        vol: '',
        airDsRt: '',
        ocLndUseknd: '',
        ocloc: '',
        rmSolInf: '',
        lnkNewTagDatMem: '',
      },
      {
        oldTag: '',
        genbaCheck: '',
        tsuInd: '',
        splFac: '',
        rmSolTyp: '',
        ocLndCla: '',
        pkTyp: '',
        usgInnBg: '',
        usgInnBgNm: '',
        usgAluBg: '',
        vol: '',
        airDsRt: '',
        ocLndUseknd: '',
        ocloc: '',
        rmSolInf: '',
        lnkNewTagDatMem: '',
      },
      {
        oldTag: '',
        genbaCheck: '',
        tsuInd: '',
        splFac: '',
        rmSolTyp: '',
        ocLndCla: '',
        pkTyp: '',
        usgInnBg: '',
        usgInnBgNm: '',
        usgAluBg: '',
        vol: '',
        airDsRt: '',
        ocLndUseknd: '',
        ocloc: '',
        rmSolInf: '',
        lnkNewTagDatMem: '',
      },
      {
        oldTag: '',
        genbaCheck: '',
        tsuInd: '',
        splFac: '',
        rmSolTyp: '',
        ocLndCla: '',
        pkTyp: '',
        usgInnBg: '',
        usgInnBgNm: '',
        usgAluBg: '',
        vol: '',
        airDsRt: '',
        ocLndUseknd: '',
        ocloc: '',
        rmSolInf: '',
        lnkNewTagDatMem: '',
      },
      {
        oldTag: '',
        genbaCheck: '',
        tsuInd: '',
        splFac: '',
        rmSolTyp: '',
        ocLndCla: '',
        pkTyp: '',
        usgInnBg: '',
        usgInnBgNm: '',
        usgAluBg: '',
        vol: '',
        airDsRt: '',
        ocLndUseknd: '',
        ocloc: '',
        rmSolInf: '',
        lnkNewTagDatMem: '',
      },
      {
        oldTag: '',
        genbaCheck: '',
        tsuInd: '',
        splFac: '',
        rmSolTyp: '',
        ocLndCla: '',
        pkTyp: '',
        usgInnBg: '',
        usgInnBgNm: '',
        usgAluBg: '',
        vol: '',
        airDsRt: '',
        ocLndUseknd: '',
        ocloc: '',
        rmSolInf: '',
        lnkNewTagDatMem: '',
      },
      {
        oldTag: '',
        genbaCheck: '',
        tsuInd: '',
        splFac: '',
        rmSolTyp: '',
        ocLndCla: '',
        pkTyp: '',
        usgInnBg: '',
        usgInnBgNm: '',
        usgAluBg: '',
        vol: '',
        airDsRt: '',
        ocLndUseknd: '',
        ocloc: '',
        rmSolInf: '',
        lnkNewTagDatMem: '',
      },
      {
        oldTag: '',
        genbaCheck: '',
        tsuInd: '',
        splFac: '',
        rmSolTyp: '',
        ocLndCla: '',
        pkTyp: '',
        usgInnBg: '',
        usgInnBgNm: '',
        usgAluBg: '',
        vol: '',
        airDsRt: '',
        ocLndUseknd: '',
        ocloc: '',
        rmSolInf: '',
        lnkNewTagDatMem: '',
      },
      {
        oldTag: '',
        genbaCheck: '',
        tsuInd: '',
        splFac: '',
        rmSolTyp: '',
        ocLndCla: '',
        pkTyp: '',
        usgInnBg: '',
        usgInnBgNm: '',
        usgAluBg: '',
        vol: '',
        airDsRt: '',
        ocLndUseknd: '',
        ocloc: '',
        rmSolInf: '',
        lnkNewTagDatMem: '',
      },
      {
        oldTag: '',
        genbaCheck: '',
        tsuInd: '',
        splFac: '',
        rmSolTyp: '',
        ocLndCla: '',
        pkTyp: '',
        usgInnBg: '',
        usgInnBgNm: '',
        usgAluBg: '',
        vol: '',
        airDsRt: '',
        ocLndUseknd: '',
        ocloc: '',
        rmSolInf: '',
        lnkNewTagDatMem: '',
      },
    ];
    (useAlert().showAlert as jest.Mock).mockReturnValue(false);
    // WA1061 コンポーネントをレンダリング
    const {getAllByText, getByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060OldTagInfosState, mockWA1060OldTagInfosState);
        }}>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // タグ読込ボタンが活性化されていることを確認
    const triggerButton = getAllByText(/タグ読込/)[1];

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('タグ読込')).toBeTruthy();
    });
  });

  it('ボタンクリック ダミータグボタン', async () => {
    // WA1061 コンポーネントをレンダリング
    const {getByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060OldTagInfosState, mockWA1060OldTagInfosState);
        }}>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // タグ読込ボタンが活性化されていることを確認
    const triggerButton = getByText(/ダミータグ/);

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('次へ')).toBeTruthy();
    });
  });

  it('ボタンクリック 一括取消ボタン', async () => {
    (useAlert().showAlert as jest.Mock).mockReturnValue(true);
    // WA1061 コンポーネントをレンダリング
    const {getByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagIdState);
          snap.set(WA1060OldTagInfosState, mockWA1060OldTagInfosState);
        }}>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 一括取消ボタンが活性化されていることを確認
    const triggerButton = getByText(/一括取消/);

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('次へ')).toBeTruthy();
    });
  });

  it('ボタンクリック 破棄ボタン', async () => {
    // WA1061 コンポーネントをレンダリング
    const {getByText} = render(
      <RecoilRoot>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 破棄ボタンが活性化されていることを確認
    const triggerButton = getByText(/破棄/);

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('次へ')).toBeTruthy();
    });
  });

  it('ボタンクリック 戻るボタン', async () => {
    // WA1061 コンポーネントをレンダリング
    const {getByText} = render(
      <RecoilRoot>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 戻るボタンが活性化されていることを確認
    const triggerButton = getByText(/戻る/);

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('次へ')).toBeTruthy();
    });
  });

  it('ボタンクリック 次へボタン', async () => {
    // WA1061 コンポーネントをレンダリング
    const {getByText} = render(
      <RecoilRoot>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 次へボタンが活性化されていることを確認
    const triggerButton = getByText(/次へ/);

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('次へ')).toBeTruthy();
    });
  });

  it('ボタンクリック 詳細ボタン1', async () => {
    // WA1061 コンポーネントをレンダリング
    const {getAllByText, getByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagIdState);
          snap.set(WA1060OldTagInfosState, mockWA1060OldTagInfosState);
        }}>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 詳細ボタンが活性化されていることを確認
    const triggerButton = getAllByText(/詳細/)[0];

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('次へ')).toBeTruthy();
    });
  });

  it('ボタンクリック 設定ボタン1', async () => {
    await act(async () => {
      (IFA0310 as jest.Mock).mockResolvedValue({
        success: true,
        data: {dtl: [{rmSolTyp: '1'}]},
      });
    });
    // WA1061 コンポーネントをレンダリング
    const {getByText} = render(
      <RecoilRoot>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 設定ボタンが活性化されていることを確認
    const triggerButton = getByText(/設定/);

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('設定')).toBeTruthy();
    });
  });

  it('ボタンクリック 設定ボタン2', async () => {
    mockWA1060OldTagInfosState = [
      {
        oldTag: '',
        genbaCheck: '',
        tsuInd: '',
        splFac: '',
        rmSolTyp: '1',
        ocLndCla: '',
        pkTyp: '',
        usgInnBg: '',
        usgInnBgNm: '',
        usgAluBg: '',
        vol: '',
        airDsRt: '',
        ocLndUseknd: '',
        ocloc: '',
        rmSolInf: '',
        lnkNewTagDatMem: '',
      },
    ];
    await act(async () => {
      (IFA0310 as jest.Mock).mockResolvedValue({
        success: true,
        data: {dtl: [{rmSolTyp: 'aaa'}]},
      });
    });
    // WA1061 コンポーネントをレンダリング
    const {getByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060OldTagInfosState, mockWA1060OldTagInfosState);
        }}>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 設定ボタンが活性化されていることを確認
    const triggerButton = getByText(/設定/);

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('設定')).toBeTruthy();
    });
  });

  it('ボタンクリック 設定ボタン2', async () => {
    await act(async () => {
      (IFA0310 as jest.Mock).mockResolvedValue({
        success: false,
        error: 'zero',
      });
    });
    // WA1061 コンポーネントをレンダリング
    const {getByText} = render(
      <RecoilRoot>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // タグ読込ボタンが活性化されていることを確認
    const triggerButton = getByText(/設定/);

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('設定')).toBeTruthy();
    });
  });

  it('QR・バーコードではない場合1', async () => {
    mockScanData = 'CM,a929091111111111b,1,1,1,1,1,1,1';
    mockQRScan = (onScan: (data: string, type: string) => void) => {
      onScan(mockScanData, 'QC');
    };
    // WA1061 コンポーネントをレンダリング
    const {getAllByText, getByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagIdState);
        }}>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // タグ読込ボタンが活性化されていることを確認
    const triggerButton = getAllByText(/タグ読込/)[1];

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('タグ読込')).toBeTruthy();
    });
  });

  it('QR・バーコードではない場合2', async () => {
    await act(async () => {
      (IFA0310 as jest.Mock).mockResolvedValue({
        success: false,
        error: 'zero',
      });
    });
    mockScanData = 'CE,a929091111111111b,1,1,1,1,1,1,1';
    mockQRScan = (onScan: (data: string, type: string) => void) => {
      onScan(mockScanData, 'QR');
    };
    // WA1061 コンポーネントをレンダリング
    const {getAllByText, getByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagIdState);
        }}>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // タグ読込ボタンが活性化されていることを確認
    const triggerButton = getAllByText(/タグ読込/)[1];

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('タグ読込')).toBeTruthy();
    });
  });

  it('QR・バーコードではない場合3', async () => {
    await act(async () => {
      (IFA0310 as jest.Mock).mockResolvedValue({
        success: false,
        error: 'codeHttp200',
      });
    });
    mockScanData = 'CE,a929091111111111b,1,1,1,1,1,1,1';
    mockQRScan = (onScan: (data: string, type: string) => void) => {
      onScan(mockScanData, 'QR');
    };
    // WA1061 コンポーネントをレンダリング
    const {getAllByText, getByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagIdState);
        }}>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // タグ読込ボタンが活性化されていることを確認
    const triggerButton = getAllByText(/タグ読込/)[1];

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('タグ読込')).toBeTruthy();
    });
  });

  it('QR・バーコードではない場合4', async () => {
    await act(async () => {
      (IFA0310 as jest.Mock).mockResolvedValue({
        success: false,
        error: 'codeRsps01',
      });
    });
    mockScanData = 'CE,a929091111111111b,1,1,1,1,1,1,1';
    mockQRScan = (onScan: (data: string, type: string) => void) => {
      onScan(mockScanData, 'QR');
    };
    // WA1061 コンポーネントをレンダリング
    const {getAllByText, getByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagIdState);
        }}>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // タグ読込ボタンが活性化されていることを確認
    const triggerButton = getAllByText(/タグ読込/)[1];

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('タグ読込')).toBeTruthy();
    });
  });

  it('QR・バーコードではない場合5', async () => {
    await act(async () => {
      (IFA0310 as jest.Mock).mockResolvedValue({
        success: false,
        error: 'timeout',
      });
    });
    mockScanData = 'CE,a929091111111111b,1,1,1,1,1,1,1';
    mockQRScan = (onScan: (data: string, type: string) => void) => {
      onScan(mockScanData, 'QR');
    };
    (useAlert().showAlert as jest.Mock).mockResolvedValue(false);
    // WA1061 コンポーネントをレンダリング
    const {getAllByText, getByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagIdState);
        }}>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // タグ読込ボタンが活性化されていることを確認
    const triggerButton = getAllByText(/タグ読込/)[1];

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('タグ読込')).toBeTruthy();
    });
  });

  it('QR・バーコードではない場合6', async () => {
    await act(async () => {
      (IFA0310 as jest.Mock).mockResolvedValue({
        success: false,
        error: 'codeRsps01',
      });
    });
    mockScanData = 'CM,a929091111111111b,1,1,1,1,1,1,1';
    mockQRScan = (onScan: (data: string, type: string) => void) => {
      onScan(mockScanData, 'QR');
    };
    (useAlert().showAlert as jest.Mock).mockReturnValue(false);
    // WA1061 コンポーネントをレンダリング
    const {getAllByText, getByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagIdState);
        }}>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // タグ読込ボタンが活性化されていることを確認
    const triggerButton = getAllByText(/タグ読込/)[1];

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('タグ読込')).toBeTruthy();
    });
  });

  it('タグ色に応じた旧タグ由来情報の除去土壌等種別判定1', async () => {
    await act(async () => {
      (IFA0310 as jest.Mock).mockResolvedValue({
        success: true,
        data: {dtl: [{rmSolTyp: '1'}]},
      });
    });
    mockScanData = 'CE,a929091111111111b,1,1,1,1,1,1,1';
    mockQRScan = (onScan: (data: string, type: string) => void) => {
      onScan(mockScanData, 'QR');
    };
    mockWA1060NewTagIdState = 'a1111111111a';
    // WA1061 コンポーネントをレンダリング
    const {getAllByText, getByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagIdState);
        }}>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // タグ読込ボタンが活性化されていることを確認
    const triggerButton = getAllByText(/タグ読込/)[1];

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('タグ読込')).toBeTruthy();
    });
  });

  it('タグ色に応じた旧タグ由来情報の除去土壌等種別判定2', async () => {
    await act(async () => {
      (IFA0310 as jest.Mock).mockResolvedValue({
        success: true,
        data: {dtl: [{rmSolTyp: '1'}]},
      });
    });
    mockScanData = 'CE,a929091111111111b,1,1,1,1,1,1,1';
    mockQRScan = (onScan: (data: string, type: string) => void) => {
      onScan(mockScanData, 'QR');
    };
    mockWA1060NewTagIdState = 'a2111111111a';
    // WA1061 コンポーネントをレンダリング
    const {getAllByText, getByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagIdState);
        }}>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // タグ読込ボタンが活性化されていることを確認
    const triggerButton = getAllByText(/タグ読込/)[1];

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('タグ読込')).toBeTruthy();
    });
  });

  it('タグ色に応じた旧タグ由来情報の除去土壌等種別判定3', async () => {
    await act(async () => {
      (IFA0310 as jest.Mock).mockResolvedValue({
        success: true,
        data: {dtl: [{rmSolTyp: '1'}]},
      });
    });
    mockScanData = 'CE,a929091111111111b,1,1,1,1,1,1,1';
    mockQRScan = (onScan: (data: string, type: string) => void) => {
      onScan(mockScanData, 'QR');
    };
    mockWA1060NewTagIdState = 'a3111111111a';
    // WA1061 コンポーネントをレンダリング
    const {getAllByText, getByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagIdState);
        }}>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // タグ読込ボタンが活性化されていることを確認
    const triggerButton = getAllByText(/タグ読込/)[1];

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('タグ読込')).toBeTruthy();
    });
  });

  it('タグ色に応じた旧タグ由来情報の除去土壌等種別判定4', async () => {
    await act(async () => {
      (IFA0310 as jest.Mock).mockResolvedValue({
        success: true,
        data: {dtl: [{rmSolTyp: '1'}]},
      });
    });
    mockScanData = 'CE,a929091111111111b,1,1,1,1,1,1,1';
    mockQRScan = (onScan: (data: string, type: string) => void) => {
      onScan(mockScanData, 'QR');
    };
    mockWA1060NewTagIdState = 'a4111111111a';
    // WA1061 コンポーネントをレンダリング
    const {getAllByText, getByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagIdState);
        }}>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // タグ読込ボタンが活性化されていることを確認
    const triggerButton = getAllByText(/タグ読込/)[1];

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('タグ読込')).toBeTruthy();
    });
  });

  it('タグ色に応じた旧タグ由来情報の除去土壌等種別判定5', async () => {
    await act(async () => {
      (IFA0310 as jest.Mock).mockResolvedValue({
        success: true,
        data: {dtl: [{rmSolTyp: '1'}]},
      });
    });
    mockScanData = 'CE,a929091111111111b,1,1,1,1,1,1,1';
    mockQRScan = (onScan: (data: string, type: string) => void) => {
      onScan(mockScanData, 'QR');
    };
    mockWA1060NewTagIdState = 'a5111111111a';
    // WA1061 コンポーネントをレンダリング
    const {getAllByText, getByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagIdState);
        }}>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // タグ読込ボタンが活性化されていることを確認
    const triggerButton = getAllByText(/タグ読込/)[1];

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('タグ読込')).toBeTruthy();
    });
  });

  it('タグ色に応じた旧タグ由来情報の除去土壌等種別判定6', async () => {
    await act(async () => {
      (IFA0310 as jest.Mock).mockResolvedValue({
        success: true,
        data: {dtl: [{rmSolTyp: '1'}]},
      });
    });
    mockScanData = 'CE,a929091111111111b,1,1,1,1,1,1,1';
    mockQRScan = (onScan: (data: string, type: string) => void) => {
      onScan(mockScanData, 'QR');
    };
    mockWA1060NewTagIdState = 'a7111111111a';
    // WA1061 コンポーネントをレンダリング
    const {getAllByText, getByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagIdState);
        }}>
        <WA1061 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // タグ読込ボタンが活性化されていることを確認
    const triggerButton = getAllByText(/タグ読込/)[1];

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('タグ読込')).toBeTruthy();
    });
  });
});
