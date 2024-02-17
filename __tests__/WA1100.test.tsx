/**-------------------------------------------
 * WA1100 登録内容確認機能テスト
 * screens/WA1100.tsx
 * ---------------------------------------------*/
import React from 'react';
import messages from '../src/utils/messages.tsx';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../src/navigation/AppNavigator.tsx';
import {RecoilRoot, useRecoilValue} from 'recoil';
import {act} from '@testing-library/react-native';
import WA1100 from '../src/screens/WA1100.tsx';
import {WA1100DataState, WA1101BackState} from '../src/atom/atom.tsx';
import bundledSettingsPath from '../assets/data/settings.json';

const mockNavigate = jest.fn();
// navigationオブジェクトのモック
const mockNavigation = {
  navigate: mockNavigate,
} as unknown as StackNavigationProp<RootList, 'WA1100'>; // 型アサーション

let mockWA1100Data = {
  head: {
    wkplcTyp: '仮置場',
    wkplc: '大阪',
    newTagId: 'a929091111111111a',
  },
  data: {
    newTagId: 'a929091111111111a',
    oldTagId: '000-23-451',
    tmpLocId: 'string',
    tmpLocNm: '飯館仮置場',
    tyRegDt: 'string',
    lnkNewTagDatMem: '',
    ashTyp: 1,
    meaRa: 123456789,
    surDsRt: 123456.78,
    surDsDt: '',
    surDsWt: 123456,
    sndId: '',
  },
};

let mockWA1101Back = false;

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

jest.mock('../src/utils/Realm', () => {
  return {
    getInstance: jest.fn().mockReturnValue({
      objects: jest.fn().mockImplementation(function (schema: string) {
        if (schema === 'settings') {
          return [bundledSettingsPath];
        }
        return [];
      }),
    }),
  };
});

/************************************************
 * テストコード
 ************************************************/
describe('WA1100 Screen', () => {
  // 表示
  it('成功 旧タグID表示', async () => {
    const {findByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1100DataState, mockWA1100Data);
          snap.set(WA1101BackState, mockWA1101Back);
        }}>
        <WA1100 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    await waitFor(() => {});
    // 仮置場
    expect(findByText(`作業場所：${mockWA1100Data?.head.wkplc}`)).toBeTruthy();
    expect(findByText('大阪')).toBeTruthy();

    // 新タグ
    expect(
      findByText(
        `下記ボタンを押してフレコンに取り付けられたタグを読み込んで下さい。`,
      ),
    ).toBeTruthy();

    //タグID
    expect(findByText(`タグ読込`)).toBeTruthy();

    // 戻る、次へ
    expect(findByText('戻る')).toBeTruthy();
    expect(findByText('次へ')).toBeTruthy();
  });

  // 戻るボタンタップ時
  it('戻るボタンタップ時には以下の制御を行う。', async () => {
    const {getAllByText, findByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1100DataState, mockWA1100Data);
          snap.set(WA1101BackState, mockWA1101Back);
        }}>
        <WA1100 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getAllByText(/戻る/)[0];
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 新タグ参照画面コール
    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1100');
    });
  });

  // メニューボタンタップ時
  it('メニューボタンタップ時には以下の制御を行う。', async () => {
    const {getAllByText, findByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1100DataState, mockWA1100Data);
          snap.set(WA1101BackState, mockWA1101Back);
        }}>
        <WA1100 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getAllByText(/メニュー/)[0];
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // メニュー画面コール
    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1040');
    });
  });

  //タグ用QRコードスキャナー
  it('タグ用QRコードスキャナー', async () => {
    const {getAllByText, findByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1100DataState, mockWA1100Data);
          snap.set(WA1101BackState, mockWA1101Back);
        }}>
        <WA1100 navigation={mockNavigation} />
      </RecoilRoot>,
    );
  });
});
