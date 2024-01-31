import React, {useEffect} from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import WA1020 from '../src/screens/WA1020';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../src/navigation/AppNavigator';
import {RecoilRoot} from 'recoil';
import {Text, View} from 'react-native';
import messages from '../src/utils/messages';

import {act} from '@testing-library/react-native';
import {IFA0010} from '../src/utils/Api';
import {ApiResponse} from '../src/types/type';

const mockNavigate = jest.fn();
// navigationオブジェクトのモック
const mockNavigation = {
  navigate: mockNavigate,
} as unknown as StackNavigationProp<RootList, 'WA1020'>; // 型アサーション

// 外部でデータを定義
let mockScanData =
  'J202200010,端末０１,72b9feea-de53-47ea-b00c-dbda5d8ca53c,db213e42-dd7f-42db-8997-cf58e9575dc1,20231205';

// QRScannerのモック
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
jest.mock('../src/utils/KeyStore', () => ({
  saveToKeystore: jest.fn(),
  loadFromKeystore: jest.fn().mockReturnValue(['activationInfo']),
  clearKeyStore: jest.fn(),
  getEncryptionKeyFromKeystore: jest.fn().mockResolvedValue(new Uint8Array(10)),
  // 他の関数もモック
}));
jest.mock('../src/utils/Security', () => ({
  generateDeviceUniqueKey: jest.fn(),
  encryptWithAES256CBC: jest.fn(),
}));
jest.mock('../src/utils/Realm', () => {
  const mockCreate = jest.fn();
  return {
    getInstance: jest.fn().mockReturnValue({
      objects: jest.fn().mockReturnValue(['user']),
      write: jest.fn(callback => {
        // write メソッドのコールバックで mockCreate を実行
        callback(mockCreate);
      }),
      create: mockCreate,
      // その他必要なメソッド
    }),
  };
});
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
jest.mock('../src/components/AlertContext', () => ({
  useAlert: () => ({
    showAlert: jest.fn(() => Promise.resolve(true)),
    // 他の必要な関数やプロパティがあればここに追加
  }),
}));
jest.mock('react-native-keychain', () => {
  return {
    getGenericPassword: jest.fn(() =>
      Promise.resolve({
        // getGenericPassword が返すべき適切なオブジェクトをモックします
        username: 'example_username',
        password: 'example_password',
      }),
    ),
    setGenericPassword: jest.fn(() => Promise.resolve(true)),
    // その他の必要なメソッド
  };
});
// Api.jsのIFA0010関数をモック化
jest.mock('../src/utils/Api', () => ({
  IFA0010: jest.fn<Promise<ApiResponse<null>>, [string, Uint8Array]>(),
}));

describe('WA1020 Screen', () => {
  beforeEach(() => {
    // 各テストの前にデフォルト値にリセット
    mockScanData =
      'J202200010,端末０１,72b9feea-de53-47ea-b00c-dbda5d8ca53c,db213e42-dd7f-42db-8997-cf58e9575dc1,20231205';
  });

  // 非同期のテストケースで async キーワードを使用
  it('成功 アクティベーション', async () => {
    mockScanData =
      'J202200010,端末０１,72b9feea-de53-47ea-b00c-dbda5d8ca53c,db213e42-dd7f-42db-8997-cf58e9575dc1,20231205';

    const {findByText, getByTestId} = render(
      <RecoilRoot>
        <WA1020 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByTestId('act');
    await act(async () => {
      fireEvent.press(triggerButton);
    });
    await waitFor(async () => {
      expect(findByText('端末ID：端末０１')).toBeTruthy();
    });
  });

  it('成功 ユーザ', async () => {
    mockScanData = '1,jigyosyaid12345,事業者なまえ,userid12345,ユーザなまえ';

    // WA1020 コンポーネントをレンダリング
    const {findByText, getByText} = render(
      //, debug} = render(
      <RecoilRoot>
        <WA1020 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // QRコードスキャンをトリガーするボタンを探す（例: 'QRコード読込'ボタン）
    const triggerButton = getByText(/利用者読込/);
    await act(async () => {
      fireEvent.press(triggerButton);
    });
    expect(findByText('事業者：事業者なまえ')).toBeTruthy();
  });

  it('失敗 ユーザ1', async () => {
    mockScanData = '2,jigyosyaid12345,事業者なまえ,userid12345,ユーザなまえ';

    // WA1020 コンポーネントをレンダリング
    const {findByText, getByText} = render(
      //, debug} = render(
      <RecoilRoot>
        <WA1020 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // QRコードスキャンをトリガーするボタンを探す（例: 'QRコード読込'ボタン）
    const triggerButton = getByText(/利用者読込/);
    await act(async () => {
      fireEvent.press(triggerButton);
    });
    // エラーメッセージが表示されるのを待つ
    await waitFor(async () => {
      const expectedMessage = messages.EA5002('利用者');
      expect(findByText(expectedMessage)).toBeTruthy();
    });
  });

  it('失敗 ユーザ2', async () => {
    mockScanData = 'jigyosyaid12345,事業者なまえ,userid12345,ユーザなまえ';

    // WA1020 コンポーネントをレンダリング
    const {findByText, getByText} = render(
      <RecoilRoot>
        <WA1020 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // QRコードスキャンをトリガーするボタンを探す（例: 'QRコード読込'ボタン）
    const triggerButton = getByText(/利用者読込/);
    await act(async () => {
      fireEvent.press(triggerButton);
    });
    // エラーメッセージが表示されるのを待つ
    await waitFor(async () => {
      const expectedMessage = messages.EA5002('利用者');
      expect(findByText(expectedMessage)).toBeTruthy();
    });
  });

  it('失敗1 アクティベーション', async () => {
    mockScanData =
      'J202200010,端末０１,72b9feea-de53-47ea-b00c-dbda5d8ca53c,db213e42-dd7f-42db-8997-cf58e9575dc1';

    // WA1020 コンポーネントをレンダリング
    const {findByText, getByTestId} = render(
      <RecoilRoot>
        <WA1020 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const triggerButton = getByTestId('act');
    await act(async () => {
      fireEvent.press(triggerButton);
    });
    // エラーメッセージが表示されるのを待つ
    await waitFor(async () => {
      const expectedMessage = messages.EA5002('アクティベーション');
      expect(findByText(expectedMessage)).toBeTruthy();
    });
  });

  it('失敗2 アクティベーション', async () => {
    mockScanData =
      'D202200010,端末０１,72b9feea-de53-47ea-b00c-dbda5d8ca53c,db213e42-dd7f-42db-8997-cf58e9575dc1,20231205';

    // WA1020 コンポーネントをレンダリング
    const {findByText, getByTestId} = render(
      <RecoilRoot>
        <WA1020 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const triggerButton = getByTestId('act');
    await act(async () => {
      fireEvent.press(triggerButton);
    });
    // エラーメッセージが表示されるのを待つ
    await waitFor(async () => {
      const expectedMessage = messages.EA5002('アクティベーション');
      expect(findByText(expectedMessage)).toBeTruthy();
    });
  });

  it('成功 送信ボタン活性', async () => {
    // 初期状態では送信ボタンが非活性化されていることを確認
    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot>
        <WA1020 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 送信ボタンが活性化されていることを確認
    let sendButton = getByText(/送信/);

    // QRコードスキャンをトリガーするアクション（ユーザ名とアクティベーションフラグが設定されるように）
    mockScanData = '1,jigyosyaid12345,事業者なまえ,userid12345,ユーザなまえ';
    await act(async () => {
      fireEvent.press(getByText('利用者読込'));
    });
    mockScanData =
      'J202200010,端末０１,72b9feea-de53-47ea-b00c-dbda5d8ca53c,db213e42-dd7f-42db-8997-cf58e9575dc1,20231205';
    await act(async () => {
      fireEvent.press(getByTestId('act'));
    });

    // ステートが更新されるのを待つ
    await waitFor(async () => {
      expect(findByText('利用者：ユーザなまえ')).toBeTruthy();
      expect(findByText('アクティベーションコード読込：済')).toBeTruthy();
      expect(findByText('端末ID：端末０１')).toBeTruthy();
      expect(findByText('事業者：事業者なまえ')).toBeTruthy();
    });
    // 送信ボタンが活性化されていることを確認
    sendButton = getByText(/送信/);
    await waitFor(async () => {
      expect(sendButton.props.disabled).toBeFalsy();
    });
  });

  it('成功 終了ボタンON', async () => {
    // 初期状態では送信ボタンが非活性化されていることを確認
    const {getByText, findByText} = render(
      <RecoilRoot>
        <WA1020 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 終了ボタンを探す
    const triggerButton = getByText(/終了/);
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // エラーメッセージが表示されるのを待つ
    await waitFor(async () => {
      const expectedMessage = messages.IA5002();
      expect(findByText(expectedMessage)).toBeTruthy();
    });

    //アラートはモックにてtrue返却 終了へ遷移
  });

  it('送信ボタンON IFA0010失敗1', async () => {
    // モック関数を失敗するレスポンスで設定
    await act(async () => {
      (IFA0010 as jest.Mock).mockResolvedValue({
        success: false,
        error: 'codeHttp200',
      });
    });
    // 初期状態では送信ボタンが非活性化されていることを確認
    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot>
        <WA1020 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 送信ボタンが活性化されていることを確認
    let sendButton = getByText(/送信/);

    // QRコードスキャンをトリガーするアクション（ユーザ名とアクティベーションフラグが設定されるように）
    mockScanData = '1,jigyosyaid12345,事業者なまえ,userid12345,ユーザなまえ';
    await act(async () => {
      fireEvent.press(getByText('利用者読込'));
    });
    mockScanData =
      'J202200010,端末０１,72b9feea-de53-47ea-b00c-dbda5d8ca53c,db213e42-dd7f-42db-8997-cf58e9575dc1,20231205';
    await act(async () => {
      fireEvent.press(getByTestId('act'));
    });

    // ステートが更新されるのを待つ
    await waitFor(async () => {
      expect(findByText('利用者：ユーザなまえ')).toBeTruthy();
      expect(findByText('アクティベーションコード読込：済')).toBeTruthy();
      expect(findByText('端末ID：端末０１')).toBeTruthy();
      expect(findByText('事業者：事業者なまえ')).toBeTruthy();
    });
    // 送信ボタンが活性化されていることを確認
    sendButton = getByText(/送信/);
    await waitFor(async () => {
      expect(sendButton.props.disabled).toBeFalsy();
    });

    // 終了ボタンを探す
    const triggerButton = getByText(/送信/);
    await act(async () => {
      fireEvent.press(triggerButton);
    });
  });

  it('送信ボタンON IFA0010失敗2', async () => {
    // モック関数を失敗するレスポンスで設定
    await act(async () => {
      (IFA0010 as jest.Mock).mockResolvedValue({
        success: false,
        error: 'codeRsps01',
      });
    });
    // 初期状態では送信ボタンが非活性化されていることを確認
    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot>
        <WA1020 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 送信ボタンが活性化されていることを確認
    let sendButton = getByText(/送信/);

    // QRコードスキャンをトリガーするアクション（ユーザ名とアクティベーションフラグが設定されるように）
    mockScanData = '1,jigyosyaid12345,事業者なまえ,userid12345,ユーザなまえ';
    await act(async () => {
      fireEvent.press(getByText('利用者読込'));
    });
    mockScanData =
      'J202200010,端末０１,72b9feea-de53-47ea-b00c-dbda5d8ca53c,db213e42-dd7f-42db-8997-cf58e9575dc1,20231205';
    await act(async () => {
      fireEvent.press(getByTestId('act'));
    });

    // ステートが更新されるのを待つ
    await waitFor(async () => {
      expect(findByText('利用者：ユーザなまえ')).toBeTruthy();
      expect(findByText('アクティベーションコード読込：済')).toBeTruthy();
      expect(findByText('端末ID：端末０１')).toBeTruthy();
      expect(findByText('事業者：事業者なまえ')).toBeTruthy();
    });
    // 送信ボタンが活性化されていることを確認
    sendButton = getByText(/送信/);
    await waitFor(async () => {
      expect(sendButton.props.disabled).toBeFalsy();
    });

    // 終了ボタンを探す
    const triggerButton = getByText(/送信/);
    await act(async () => {
      fireEvent.press(triggerButton);
    });
  });

  it('送信ボタンON IFA0010失敗3', async () => {
    // モック関数を失敗するレスポンスで設定
    await act(async () => {
      (IFA0010 as jest.Mock).mockResolvedValue({
        success: false,
        error: 'timeout',
      });
    });
    // 初期状態では送信ボタンが非活性化されていることを確認
    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot>
        <WA1020 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 送信ボタンが活性化されていることを確認
    let sendButton = getByText(/送信/);

    // QRコードスキャンをトリガーするアクション（ユーザ名とアクティベーションフラグが設定されるように）
    mockScanData = '1,jigyosyaid12345,事業者なまえ,userid12345,ユーザなまえ';
    await act(async () => {
      fireEvent.press(getByText('利用者読込'));
    });
    mockScanData =
      'J202200010,端末０１,72b9feea-de53-47ea-b00c-dbda5d8ca53c,db213e42-dd7f-42db-8997-cf58e9575dc1,20231205';
    await act(async () => {
      fireEvent.press(getByTestId('act'));
    });

    // ステートが更新されるのを待つ
    await waitFor(async () => {
      expect(findByText('利用者：ユーザなまえ')).toBeTruthy();
      expect(findByText('アクティベーションコード読込：済')).toBeTruthy();
      expect(findByText('端末ID：端末０１')).toBeTruthy();
      expect(findByText('事業者：事業者なまえ')).toBeTruthy();
    });
    // 送信ボタンが活性化されていることを確認
    sendButton = getByText(/送信/);
    await waitFor(async () => {
      expect(sendButton.props.disabled).toBeFalsy();
    });

    // 終了ボタンを探す
    const triggerButton = getByText(/送信/);
    await act(async () => {
      fireEvent.press(triggerButton);
    });
  });

  it('送信ボタンON IFA0010失敗4 exception', async () => {
    // モック関数を失敗するレスポンスで設定
    await act(async () => {
      (IFA0010 as jest.Mock).mockResolvedValue({
        success: false,
        error: 'timeout',
      });
      // (getEncryptionKeyFromKeystore as jest.Mock).mockImplementation(() => {
      //   throw new Error('Failed to save to keystore');
      // });
    });

    // 初期状態では送信ボタンが非活性化されていることを確認
    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot>
        <WA1020 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 送信ボタンが活性化されていることを確認
    let sendButton = getByText(/送信/);

    // QRコードスキャンをトリガーするアクション（ユーザ名とアクティベーションフラグが設定されるように）
    mockScanData = '1,jigyosyaid12345,事業者なまえ,userid12345,ユーザなまえ';
    await act(async () => {
      fireEvent.press(getByText('利用者読込'));
    });
    mockScanData =
      'J202200010,端末０１,72b9feea-de53-47ea-b00c-dbda5d8ca53c,db213e42-dd7f-42db-8997-cf58e9575dc1,20231205';
    await act(async () => {
      fireEvent.press(getByTestId('act'));
    });

    // ステートが更新されるのを待つ
    await waitFor(async () => {
      expect(findByText('利用者：ユーザなまえ')).toBeTruthy();
      expect(findByText('アクティベーションコード読込：済')).toBeTruthy();
      expect(findByText('端末ID：端末０１')).toBeTruthy();
      expect(findByText('事業者：事業者なまえ')).toBeTruthy();
    });
    // 送信ボタンが活性化されていることを確認
    sendButton = getByText(/送信/);
    await waitFor(async () => {
      expect(sendButton.props.disabled).toBeFalsy();
    });

    // 終了ボタンを探す
    const triggerButton = getByText(/送信/);
    await act(async () => {
      fireEvent.press(triggerButton);
    });
  });

  it('送信ボタンON IFA0010成功', async () => {
    // モック関数を成功するレスポンスで設定
    (IFA0010 as jest.Mock).mockResolvedValue({success: true});
    // 初期状態では送信ボタンが非活性化されていることを確認
    const {getByText, findByText, getByTestId} = render(
      <RecoilRoot>
        <WA1020 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 送信ボタンが活性化されていることを確認
    let sendButton = getByText(/送信/);

    // QRコードスキャンをトリガーするアクション（ユーザ名とアクティベーションフラグが設定されるように）
    mockScanData = '1,jigyosyaid12345,事業者なまえ,userid12345,ユーザなまえ';
    await act(async () => {
      fireEvent.press(getByText('利用者読込'));
    });
    mockScanData =
      'J202200010,端末０１,72b9feea-de53-47ea-b00c-dbda5d8ca53c,db213e42-dd7f-42db-8997-cf58e9575dc1,20231205';
    await act(async () => {
      fireEvent.press(getByTestId('act'));
    });

    // ステートが更新されるのを待つ
    await waitFor(async () => {
      expect(findByText('利用者：ユーザなまえ')).toBeTruthy();
      expect(findByText('アクティベーションコード読込：済')).toBeTruthy();
      expect(findByText('端末ID：端末０１')).toBeTruthy();
      expect(findByText('事業者：事業者なまえ')).toBeTruthy();
    });
    // 送信ボタンが活性化されていることを確認
    sendButton = getByText(/送信/);
    await waitFor(async () => {
      expect(sendButton.props.disabled).toBeFalsy();
    });

    // 終了ボタンを探す
    const triggerButton = getByText(/送信/);
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    //画面コール
    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1030');
    });
  });
  it('無効なQRコードデータのテスト', async () => {
    // テスト用の無効なQRコードデータを設定
    mockScanData = '無効なデータ';

    // ...テストの実行...
  });
});
