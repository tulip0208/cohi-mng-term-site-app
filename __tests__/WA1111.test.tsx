/**-------------------------------------------
 * WA1111 登録内容確認機能テスト
 * screens/WA1111.tsx
 * ---------------------------------------------*/
import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../src/navigation/AppNavigator.tsx';
import {RecoilRoot} from 'recoil';
import {act} from '@testing-library/react-native';
import WA1111 from '../src/screens/WA1111.tsx';
import {WA1110DataState, WA1111BackState} from '../src/atom/atom.tsx';
import bundledSettingsPath from '../assets/data/settings.json';
import {CT0054} from '../src/enum/enums.tsx';

const mockNavigate = jest.fn();
// navigationオブジェクトのモック
const mockNavigation = {
  navigate: mockNavigate,
} as unknown as StackNavigationProp<RootList, 'WA1111'>; // 型アサーション

let mockWA1110Data = {
  head: {
    wkplcTyp: '仮置場',
    wkplc: '大阪',
    oldTagId: 'a929091111111111a',
  },
  data: {
    ashTyp: 1, // 焼却灰種別、半角英数字
    meaRa: 1, // 測定濃度（焼却時）、半角数値
    conRa: 1, // 換算濃度（焼却時）、半角数値
    surDsRt: 1, // 表面線量率（焼却時）、半角数値（オプショナル）
    surDsDt: 1, // 表面線量率測定日（焼却時）、日付（オプショナル）
    surDsWt: 1, // 表面線量率測定時重量（焼却時）、半角数値（オプショナル）
  },
};

let mockWA1111Back = false;

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
describe('WA1111 Screen', () => {
  // 表示
  it('成功 旧タグID表示', async () => {
    const {findByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1110DataState, mockWA1110Data);
          snap.set(WA1111BackState, mockWA1111Back);
        }}>
        <WA1111 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    await waitFor(() => {});
    // 作業場所
    expect(
      findByText(`作業場所：${mockWA1110Data?.head.wkplcTyp}`),
    ).toBeTruthy();
    expect(findByText('大阪')).toBeTruthy();

    // 旧タグID
    expect(
      findByText(`旧タグID：${mockWA1110Data?.head.oldTagId}`),
    ).toBeTruthy();
    expect(
      findByText(
        `焼却灰種別：${CT0054[mockWA1110Data?.data.ashTyp as number]}`,
      ),
    ).toBeTruthy();
    expect(
      findByText(`測定放射能濃度：${mockWA1110Data?.data.meaRa}`),
    ).toBeTruthy();
    expect(findByText(`(Bq/Kg)　`)).toBeTruthy();

    // 戻る、メニュー
    expect(findByText('戻る')).toBeTruthy();
    expect(findByText('メニュー')).toBeTruthy();
  });

  // 戻るボタンタップ時
  it('戻るボタンタップ時には以下の制御を行う。', async () => {
    const {getAllByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1110DataState, mockWA1110Data);
          snap.set(WA1111BackState, mockWA1111Back);
        }}>
        <WA1111 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getAllByText(/戻る/)[0];
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1110');
    });
  });

  // メニューボタンタップ時
  it('メニューボタンタップ時には以下の制御を行う。', async () => {
    const {getAllByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1110DataState, mockWA1110Data);
          snap.set(WA1111BackState, mockWA1111Back);
        }}>
        <WA1111 navigation={mockNavigation} />
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
});
