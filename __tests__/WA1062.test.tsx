/**-------------------------------------------
 * WA1062 新タグID参照(土壌)テスト
 * screens/WA1062.tsx
 * ---------------------------------------------*/
import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../src/navigation/AppNavigator';
import {RecoilRoot} from 'recoil';
import messages from '../src/utils/messages';
import {act} from '@testing-library/react-native';
import WA1062 from '../src/screens/WA1062';
import bundledSettingsPath from '../assets/data/settings.json';
import {
  WA1060NewTagIdState,
  WA1061TagIdState,
  WA1063MemoAutoState,
} from '../src/atom/atom';

const mockNavigate = jest.fn();
// navigationオブジェクトのモック
const mockNavigation = {
  navigate: mockNavigate,
} as unknown as StackNavigationProp<RootList, 'WA1062'>; // 型アサーション

// 外部でデータを定義
let mockRealmWrite: (callback: () => void) => void;
let mockWA1060NewTagId: string;
let mockWA1061TagId: [string, string];

/************************************************
 * モック
 ************************************************/
jest.mock('../src/utils/Realm', () => {
  return {
    getInstance: jest.fn().mockReturnValue({
      objects: jest.fn().mockImplementation(function (schema: string) {
        if (schema === 'settings') {
          return [bundledSettingsPath];
        }
        return [];
      }),
      write: jest.fn().mockImplementation(callback => mockRealmWrite(callback)),
      create: jest.fn(),
    }),
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

let mockCheckJISText = (text: string) => text;
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.NativeModules.JISInputFilter = {
    checkJISText: jest
      .fn()
      .mockImplementation((text: string) => mockCheckJISText(text)),
  };
  return RN;
});

/************************************************
 * テストコード
 ************************************************/
describe('WA1062 Screen', () => {
  beforeEach(() => {
    mockRealmWrite = (callback: () => void) => {
      callback();
    };
    mockAlert = () => Promise.resolve(true);
    mockWA1060NewTagId = '';
    mockWA1061TagId = ['', ''];
    mockCheckJISText = (text: string) => text;
  });

  // 初期表示
  it('成功 初期表示設定', async () => {
    mockWA1060NewTagId = '11';
    mockWA1061TagId = ['1', 'dummyTag'];

    const {getByTestId, findByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagId);
          snap.set(WA1061TagIdState, mockWA1061TagId);
        }}>
        <WA1062 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 新タグID表示
    expect(findByText(`新タグID：${mockWA1060NewTagId}`)).toBeTruthy();

    // タグID表示
    expect(
      findByText(
        `${mockWA1061TagId[1] === 'dummyTag' ? 'ダミー' : '旧'}タグID：${
          mockWA1061TagId[0]
        }`,
      ),
    ).toBeTruthy();
    expect(
      findByText(
        `${
          mockWA1061TagId[1] === 'dummyTag' ? 'ダミー' : '旧'
        }タグ情報を選択してください。}`,
      ),
    ).toBeTruthy();

    // 除去土壌等種別
    expect(findByText('除去土壌等種別：')).toBeTruthy();
    expect(getByTestId('rm-sol-type-select')).toBeTruthy();
    // 緑色
    expect(findByText('1:草木類')).toBeTruthy();

    // アルミ内袋の利用
    expect(findByText('アルミ内袋の利用：')).toBeTruthy();
    expect(getByTestId('usg-alu-bg-select')).toBeTruthy();
    expect(findByText('未選択')).toBeTruthy();
    expect(findByText('利用あり')).toBeTruthy();
    expect(findByText('利用なし')).toBeTruthy();

    // 発行理由
    expect(findByText('発行理由：')).toBeTruthy();
    expect(findByText('その他')).toBeTruthy();

    // その他発行理由
    expect(findByText('その他発行理由：')).toBeTruthy();

    // 入力
    expect(getByTestId('new-tag-data-mem-input')).toBeTruthy();

    // 戻る、メニュー
    expect(findByText('戻る')).toBeTruthy();
    expect(findByText('設定')).toBeTruthy();
  });

  it('成功 初期表示設定-黄色', async () => {
    mockWA1060NewTagId = '12';
    mockWA1061TagId = ['1', 'dummyTag'];

    const {getByTestId, findByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagId);
          snap.set(WA1061TagIdState, mockWA1061TagId);
        }}>
        <WA1062 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    expect(getByTestId('rm-sol-type-select').props.items.length).toBe(4);
    expect(findByText('2:1以外の可燃廃棄物')).toBeTruthy();
  });

  it('成功 初期表示設定-白色', async () => {
    mockWA1060NewTagId = '13';
    mockWA1061TagId = ['1', 'dummyTag'];

    const {findByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagId);
          snap.set(WA1061TagIdState, mockWA1061TagId);
        }}>
        <WA1062 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    expect(findByText('3:土壌等')).toBeTruthy();
  });

  it('成功 初期表示設定-青色', async () => {
    mockWA1060NewTagId = '14';
    mockWA1061TagId = ['1', 'dummyTag'];

    const {findByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagId);
          snap.set(WA1061TagIdState, mockWA1061TagId);
        }}>
        <WA1062 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    expect(findByText('4:コンクリート殻等')).toBeTruthy();
  });

  it('成功 初期表示設定-赤色', async () => {
    mockWA1060NewTagId = '15';
    mockWA1061TagId = ['1', 'dummyTag'];

    const {findByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagId);
          snap.set(WA1061TagIdState, mockWA1061TagId);
        }}>
        <WA1062 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    expect(findByText('7:石綿含有建材')).toBeTruthy();
  });

  it('成功 初期表示設定-橙色', async () => {
    mockWA1060NewTagId = '17';
    mockWA1061TagId = ['1', 'dummyTag'];

    const {findByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagId);
          snap.set(WA1061TagIdState, mockWA1061TagId);
        }}>
        <WA1062 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    expect(findByText('13:仮置場解体発生不燃物')).toBeTruthy();
  });

  // 戻るボタンタップ時
  it('戻るボタンタップ時には旧タグ読込(土壌)画面を行う。', async () => {
    const {getByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagId);
          snap.set(WA1061TagIdState, mockWA1061TagId);
        }}>
        <WA1062 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    await act(async () => {
      fireEvent.press(getByText('戻る').parent!);
    });

    // 確認
    expect(mockShowAlert).toHaveBeenCalledWith('確認', messages.IA5014(), true);

    // 旧タグ読込(土壌)画面遷移
    expect(mockNavigate).toHaveBeenCalledWith('WA1061');
  });

  // 設定ボタンタップ時
  it('設定ボタンタップ時には旧タグ読込(土壌)画面を行う。', async () => {
    const {getByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagId);
          snap.set(WA1061TagIdState, mockWA1061TagId);
        }}>
        <WA1062 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    await act(async () => {
      fireEvent.press(getByText('設定').parent!);
    });

    // 旧タグ読込(土壌)画面遷移
    expect(mockNavigate).toHaveBeenCalledWith('WA1061');
  });

  it('設定ボタンタップ時に除去土壌等種別が変更された場合1', async () => {
    mockWA1060NewTagId = '17';
    mockWA1061TagId = ['1', 'tag'];
    const mockWA1063MemoAuto = '';

    const {getByText, getByTestId} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagId);
          snap.set(WA1061TagIdState, mockWA1061TagId);
          snap.set(WA1063MemoAutoState, mockWA1063MemoAuto);
        }}>
        <WA1062 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 除去土壌等種別が変更
    await act(async () => {
      fireEvent(getByTestId('rm-sol-type-select'), 'onValueChange', '3');
    });

    // アルミ内袋の利用が変更
    await act(async () => {
      fireEvent(getByTestId('usg-alu-bg-select'), 'onValueChange', '1');
    });

    await act(async () => {
      fireEvent.press(getByText('設定').parent!);
    });

    // 旧タグ読込(土壌)画面遷移
    expect(mockNavigate).toHaveBeenCalledWith('WA1061');
  });

  it('設定ボタンタップ時に除去土壌等種別が変更された場合2', async () => {
    mockWA1060NewTagId = '17';
    mockWA1061TagId = ['1', 'tag'];
    const mockWA1063MemoAuto = '1:除去土壌等種別が異なる';

    const {getByText, getByTestId} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagId);
          snap.set(WA1061TagIdState, mockWA1061TagId);
          snap.set(WA1063MemoAutoState, mockWA1063MemoAuto);
        }}>
        <WA1062 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 除去土壌等種別が変更
    await act(async () => {
      fireEvent(getByTestId('rm-sol-type-select'), 'onValueChange', '3');
    });

    await act(async () => {
      fireEvent.press(getByText('設定').parent!);
    });

    // 旧タグ読込(土壌)画面遷移
    expect(mockNavigate).toHaveBeenCalledWith('WA1061');
  });

  // 入力
  it('入力-JIS', async () => {
    const {getByTestId} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1060NewTagIdState, mockWA1060NewTagId);
          snap.set(WA1061TagIdState, mockWA1061TagId);
        }}>
        <WA1062 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // その他
    await act(async () => {
      fireEvent(getByTestId('lnk-new-tag-dat-mem'), 'onValueChange', 'その他');
    });

    // 入力可能
    await waitFor(() => {
      expect(getByTestId('new-tag-data-mem-input').props.editable).toBeTruthy();
    });

    let inputText = 'テスト';
    await act(async () => {
      fireEvent.changeText(getByTestId('new-tag-data-mem-input'), inputText);
    });

    // JIS第一水準、JIS第二水準に含まれない場合、入力された文字を無効
    expect(getByTestId('new-tag-data-mem-input').props.value).toBe(inputText);

    inputText = '';
    await act(async () => {
      fireEvent.changeText(getByTestId('new-tag-data-mem-input'), inputText);
    });

    await act(async () => {
      fireEvent(getByTestId('new-tag-data-mem-input'), 'onChangeText', null);
    });
    await act(async () => {
      fireEvent(getByTestId('new-tag-data-mem-input'), 'onBlur');
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mockCheckJISText = (text: string) => {
      throw new Error('mock check error');
    };
    await act(async () => {
      fireEvent.changeText(getByTestId('new-tag-data-mem-input'), 'a');
    });
    await act(async () => {
      fireEvent(getByTestId('new-tag-data-mem-input'), 'onBlur');
    });
  });
});
