/**-------------------------------------------
 * WA1071 登録内容確認機能テスト
 * screens/WA1071.tsx
 * ---------------------------------------------*/
import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../src/navigation/AppNavigator';
import {RecoilRoot} from 'recoil';
import {act} from '@testing-library/react-native';
import WA1071 from '../src/screens/WA1071';
import {
  CT0005,
  CT0006,
  CT0007,
  CT0009,
  CT0010,
  CT0011,
  CT0042,
} from '../src/enum/enums';
import {WA1070DataState, WA1071BackState} from '../src/atom/atom';
import bundledSettingsPath from '../assets/data/settings.json';

const mockNavigate = jest.fn();
// navigationオブジェクトのモック
const mockNavigation = {
  navigate: mockNavigate,
} as unknown as StackNavigationProp<RootList, 'WA1071'>; // 型アサーション

let mockWA1070Data = {
  head: {
    wkplcTyp: '仮置場',
    wkplc: '大阪',
    newTagId: 'a929091111111111a',
  },
  data: {
    newTagId: 'a929091111111111a',
    rmSolTyp: 1,
    pkTyp: 1,
    splFac: 1,
    tsuInd: 1,
    usgInnBg: 1,
    usgAluBg: 1,
    yesNoOP: 1,
    caLgSdBgWt: 1,
    caLgSdBgDs: 1,
    estRa: 1,
    lnkNewTagDatMem: '',
  },
  oldTag: {
    //---旧タグ---
    oldTagId: 1,
    oldTagIdList: ['a939091111111111a'],
  },
};

let mockWA1071Back = false;

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
describe('WA1071 Screen', () => {
  // 表示
  it('成功 新タグID登録内容表示', async () => {
    const {findByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1070DataState, mockWA1070Data);
          snap.set(WA1071BackState, mockWA1071Back);
        }}>
        <WA1071 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    // 作業場所
    expect(
      findByText(`作業場所：${mockWA1070Data?.head.wkplcTyp}`),
    ).toBeTruthy();
    expect(findByText('大阪')).toBeTruthy();

    // 新タグ
    expect(
      findByText(`新タグID：${mockWA1070Data?.data.newTagId}`),
    ).toBeTruthy();
    expect(
      findByText(
        `土壌等種別：${CT0007[mockWA1070Data?.data.rmSolTyp as number]}`,
      ),
    ).toBeTruthy();
    expect(
      findByText(`特定施設：${CT0006[mockWA1070Data?.data.splFac as number]}`),
    ).toBeTruthy();
    expect(
      findByText(`津波浸水：${CT0005[mockWA1070Data?.data.tsuInd as number]}`),
    ).toBeTruthy();
    expect(
      findByText(`重量：${mockWA1070Data?.data.caLgSdBgWt as number}`),
    ).toBeTruthy();
    expect(
      findByText(`線量：${mockWA1070Data?.data.caLgSdBgDs as number}`),
    ).toBeTruthy();
    expect(
      findByText(`推定濃度：${mockWA1070Data?.data.estRa as number}`),
    ).toBeTruthy();
    expect(
      findByText(`荷姿種別：${CT0009[mockWA1070Data?.data.pkTyp as number]}`),
    ).toBeTruthy();
    expect(
      findByText(
        `内袋利用方法：${CT0010[mockWA1070Data?.data.usgInnBg as number]}`,
      ),
    ).toBeTruthy();
    expect(
      findByText(
        `アルミ内袋：${CT0011[mockWA1070Data?.data.usgAluBg as number]}`,
      ),
    ).toBeTruthy();
    expect(
      findByText(
        `オーバーパック：${CT0042[mockWA1070Data?.data.yesNoOP as number]}`,
      ),
    ).toBeTruthy();
    expect(
      findByText(`メモ：${mockWA1070Data?.data.lnkNewTagDatMem}`),
    ).toBeTruthy();

    // 旧タグ
    expect(
      findByText(`旧タグ数：${mockWA1070Data?.oldTag.oldTagId}`),
    ).toBeTruthy();
    mockWA1070Data?.oldTag.oldTagIdList.map((tagId: string, index: number) => {
      expect(findByText(`${index + 1}: ${tagId}`)).toBeTruthy();
    });

    // 戻る、メニュー
    expect(findByText('戻る')).toBeTruthy();
    expect(findByText('メニュー')).toBeTruthy();
  });

  // 戻るボタンタップ時
  it('戻るボタンタップ時には以下の制御を行う。', async () => {
    const {getByTestId} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1070DataState, mockWA1070Data);
          snap.set(WA1071BackState, mockWA1071Back);
        }}>
        <WA1071 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByTestId('back-btn');
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // 新タグ参照画面コール
    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1070');
    });
  });

  // メニューボタンタップ時
  it('メニューボタンタップ時には以下の制御を行う。', async () => {
    const {getByTestId} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1070DataState, mockWA1070Data);
          snap.set(WA1071BackState, mockWA1071Back);
        }}>
        <WA1071 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const triggerButton = getByTestId('menu-btn');
    await act(async () => {
      fireEvent.press(triggerButton);
    });

    // メニュー画面コール
    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith('WA1040');
    });
  });
});
