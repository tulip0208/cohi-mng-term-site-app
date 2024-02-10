/**-------------------------------------------
 * WA1070 テスト
 * screens/WA1070.tsx
 * ---------------------------------------------*/
import React, {useEffect} from 'react';
import {
  render,
  fireEvent,
  waitFor,
  userEvent,
} from '@testing-library/react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../src/navigation/AppNavigator';
import {RecoilRoot} from 'recoil';
import {Text, View} from 'react-native';
import messages from '../src/utils/messages';
import {act} from '@testing-library/react-native';
import {
  ApiResponse,
  IFA0330Response,
  IFA0330ResponseDtl,
} from '../src/types/type';
import WA1070 from '../src/screens/WA1070';
import bundledSettingsPath from '../assets/data/settings.json';

jest.useFakeTimers();

const mockNavigate = jest.fn();
// navigationオブジェクトのモック
const mockNavigation = {
  navigate: mockNavigate,
} as unknown as StackNavigationProp<RootList, 'WA1070'>; // 型アサーション

// 外部でデータを定義
let mockScanData: string;
let mockApiResponse: ApiResponse<IFA0330Response<IFA0330ResponseDtl>>;

/************************************************
 * モック
 ************************************************/
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

const mockShowAlert = jest.fn(() => Promise.resolve(true));
jest.mock('../src/components/AlertContext', () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
    // 他の必要な関数やプロパティがあればここに追加
  }),
}));

// Api.jsのIFA0330関数をモック化
jest.mock('../src/utils/Api', () => ({
  IFA0330: jest.fn(() => Promise.resolve(mockApiResponse)),
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
describe('WA1070 Screen', () => {
  beforeEach(() => {
    // 共通タグID
    mockScanData = 'CM,a929091111111111a';
    mockApiResponse = {
      success: true,
      data: {
        sttCd: '',
        rcvDt: '',
        cnt: 0,
        dtl: [
          {
            newTagId: '236543643',
            tmpLocId: '32464',
            tmpLocNm: '',
            oldTagId: '34644',
            sitTagId: '34644',
            twoOneTrOneBrNum: 0,
            caLgSdBgWt: 0,
            caLgSdBgDs: 0,
            estRa: 0,
            tyRegDt: '',
            pkTyp: 0,
            yesNoOP: 0,
            arNm: '',
            tsuInd: 0,
            splFac: 0,
            rmSolTyp: 0,
            ocLndCla: 0,
            usgInnBg: 0,
            usgAluBg: 0,
            vol: 0,
            airDsRt: 0,
            ocLndUseknd: '',
            ocloc: '',
            rmSolInf: '',
            lnkNewTagDatMem: '',
            sndId: '',
          },
        ],
      },
      error: '',
    };
  });

  // 表示
  it('成功 ログイン時の作業場所（作業場所種類、作業場所名）、タグ読込ボタン、戻るボタン', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1070 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 作業場所種類
    await waitFor(async () => {
      expect(getByText('作業場所：仮置場')).toBeTruthy();
    });

    // 作業場所名
    await waitFor(async () => {
      expect(getByText('大阪')).toBeTruthy();
    });

    // タグ読込
    await waitFor(async () => {
      expect(getByText('タグ読込')).toBeTruthy();
    });

    // 戻る
    await waitFor(async () => {
      expect(getByText('戻る')).toBeTruthy();
    });
  });

  //　初期表示時には新タグID入力と次へボタンは非表示とし、画面上を長押しすることで表示
  it('成功 初期表示時には新タグID入力と次へボタンは非表示とし、画面上を長押しすることで表示', async () => {
    const {getByText, getByTestId} = render(
      <RecoilRoot>
        <WA1070 navigation={mockNavigation} />
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
    expect(getByTestId('input-container')).toBeTruthy();
  });

  // タグの読み、新タグIDが登録
  it('成功 タグの読み、新タグIDが登録', async () => {
    // 共通タグID
    mockScanData = 'CM,a929091111111111a';

    const {getByTestId} = render(
      <RecoilRoot>
        <WA1070 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByTestId('tag-read-btn');
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    //画面コール
    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1071');
    });
  });

  // タグの読み、新タグIDが未登録の場合
  it('成功 タグの読み、新タグIDが未登録の場合、アラート表示', async () => {
    // 共通タグID
    mockScanData = 'CM,a929091111111111a';
    mockApiResponse = {
      success: false,
      data: {sttCd: '', rcvDt: '', cnt: 0, dtl: []},
      error: 'timeout',
    };

    const {getByTestId} = render(
      <RecoilRoot>
        <WA1070 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByTestId('tag-read-btn');
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // timeout error
    await waitFor(async () => {
      expect(mockShowAlert).toHaveBeenCalledWith(
        '通知',
        messages.EA5003(),
        false,
      );
    });
  });

  // 戻るボタンタップ時
  it('戻るボタンタップ時には以下の制御を行う。', async () => {
    const {getByTestId} = render(
      <RecoilRoot>
        <WA1070 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByTestId('back-btn');
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // メニュー画面コール
    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1040');
    });
  });

  // 次へボタンが表示された場合、初期表示は非活性
  it('次へボタンが表示された場合、初期表示は非活性とする。', async () => {
    const {getByTestId} = render(
      <RecoilRoot>
        <WA1070 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 長押しする
    await act(async () => {
      fireEvent(getByTestId('info-msg'), 'onPressIn');
      jest.advanceTimersByTime(10005);
      fireEvent(getByTestId('info-msg'), 'onPressOut');
    });

    // 次へボタンが表示
    const nextBtn = getByTestId('next-btn');
    expect(nextBtn).toBeDefined();
    expect(nextBtn.props.accessibilityState.disabled).toBeTruthy();
  });

  // タグの手入力、新タグIDが登録
  it('成功 タグの手入力、新タグIDが登録', async () => {
    const {getByTestId} = render(
      <RecoilRoot>
        <WA1070 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 長押しする
    await act(async () => {
      fireEvent(getByTestId('info-msg'), 'onPressIn');
      jest.advanceTimersByTime(10005);
      fireEvent(getByTestId('info-msg'), 'onPressOut');
    });

    // 手入力
    await act(async () => {
      fireEvent.changeText(getByTestId('text-input'), '929091111111111');
      fireEvent(getByTestId('text-input'), 'onBlur');
    });

    const nextBtn = getByTestId('next-btn');
    fireEvent.press(nextBtn);

    //画面コール
    expect(mockNavigate).toHaveBeenCalledWith('WA1071');
  });

  // タグの手入力、新タグIDが未登録の場合
  it('成功 タグの手入力、新タグIDが未登録の場合、アラート表示', async () => {
    // 共通タグID
    mockApiResponse = {
      success: false,
      data: {sttCd: '', rcvDt: '', cnt: 0, dtl: []},
      error: 'timeout',
    };

    const {getByTestId} = render(
      <RecoilRoot>
        <WA1070 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 長押しする
    await act(async () => {
      fireEvent(getByTestId('info-msg'), 'onPressIn');
      jest.advanceTimersByTime(10005);
      fireEvent(getByTestId('info-msg'), 'onPressOut');
    });

    // 手入力
    await act(async () => {
      fireEvent.changeText(getByTestId('text-input'), '929091111111111');
      fireEvent(getByTestId('text-input'), 'onBlur');
    });

    // timeout error
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.EA5003(),
      false,
    );
  });

  // タグの手入力、正規表現チェック
  it('成功 タグの手入力、チェック、アラート表示', async () => {
    const errorCode = '919091111111111';

    const {getByTestId} = render(
      <RecoilRoot>
        <WA1070 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 長押しする
    await act(async () => {
      fireEvent(getByTestId('info-msg'), 'onPressIn');
      jest.advanceTimersByTime(10005);
      fireEvent(getByTestId('info-msg'), 'onPressOut');
    });

    // 手入力
    await act(async () => {
      await userEvent.type(getByTestId('text-input'), errorCode);
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

    const {getByTestId} = render(
      <RecoilRoot>
        <WA1070 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 長押しする
    await act(async () => {
      fireEvent(getByTestId('info-msg'), 'onPressIn');
      jest.advanceTimersByTime(10005);
      fireEvent(getByTestId('info-msg'), 'onPressOut');
    });

    // 手入力
    await act(async () => {
      await userEvent.type(getByTestId('text-input'), errorCode);
      fireEvent(getByTestId('text-input'), 'onBlur');
    });

    // フォーマットチェック
    expect(mockShowAlert).toHaveBeenCalledWith(
      '通知',
      messages.EA5022('土壌', '新タグ参照(灰)', errorCode),
      false,
    );
  });
});
