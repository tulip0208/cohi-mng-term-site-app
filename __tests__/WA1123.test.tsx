/**-------------------------------------------
 * A01-0120_輸送カード申請
 * WA1123登録内容確認機能テスト
 * screens/WA1123.tsx
 * ---------------------------------------------*/
import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {logUserAction, logScreen} from '../src/utils/Log.tsx';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../src/navigation/AppNavigator.tsx';
import {RecoilRoot, useRecoilValue} from 'recoil';
import {act} from '@testing-library/react-native';
import WA1123 from '../src/screens/WA1123.tsx';
import bundledSettingsPath from '../assets/data/settings.json';
import messages from '../src/utils/messages.tsx';
import {useAlert} from '../src/components/AlertContext.tsx';
import {IFT0210} from '../src/utils/Api.tsx';
import {ApiResponse} from '../src/types/type';
import {
  WA1120DataState,
  WA1120PrevScreenId,
  WA1120CarState,
  WA1120DrvState,
  WA1120DestState,
  WA1120TrpCardNoState,
  WA1121DataState,
} from '../src/atom/atom.tsx';
import {useButton} from '../src/hook/useButton.tsx';

const mockNavigate = jest.fn();
// navigationオブジェクトのモック
const mockNavigation = {
  navigate: mockNavigate,
} as unknown as StackNavigationProp<RootList, 'WA1123'>; // 型アサーション

let mockWA1120Data = {
  wkplcTyp: '仮置場',
  wkplc: '大熊2期1工区東大和久一時保管場 (TD)',
};
let mockWA1120DataState = '';
let mockWA1120PrevScreenId = '';
let mockWA1120Car = {
  idTyp: '', //ID種別
  carId: '', //車両ID
  carNm: '', //車両名称
  carNo: '', //車両番号
  maxWt: '', //最大積載量
  carWt: '', //車両重量
  empCarWt: '', //空車重量
};
let mockWA1120Drv = {
  idTyp: '', //ID種別
  drvId: '', //運転手ID
  drvNm: '', //運転手名
};
let mockWA1120Dest = {
  idTyp: '', //ID種別
  storPlacId: '', //保管場ID
  fixPlacId: '', //定置場ID
  fixPlacNm: '', //定置場名
  facTyp: '', //施設区分
  raKbn: '', //濃度区分
};
let mockWA1120TrpCardNo = '';
let mockWA1121Data = '';

let mockWA1123Back = false;

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
// Api.jsのIFA0010関数をモック化
jest.mock('../src/utils/Api', () => ({
  IFA0010: jest.fn<Promise<ApiResponse<null>>, [string, Uint8Array]>(),
}));

/************************************************
 * テストコード
 ************************************************/
describe('WA1123 Screen', () => {
  // 表示
  it('成功 ログイン時の作業場所（作業場所種類-仮置場、作業場所名、）輸送(輸送車両、運転手、行先名、輸送カード番号)、輸送カード申請', async () => {
    const {findByText} = render(
      <RecoilRoot
        initializeState={(snap: any) => {
          snap.set(WA1120DataState, mockWA1120Data);
          snap.set(WA1120PrevScreenId, mockWA1120PrevScreenId);
          snap.set(WA1120DrvState, mockWA1120Drv);
          snap.set(WA1120DestState, mockWA1120Dest);
          snap.set(WA1120CarState, mockWA1120Car);
          snap.set(WA1120TrpCardNoState, mockWA1120TrpCardNo);
          snap.set(WA1121DataState, mockWA1121Data);
        }}>
        <WA1123 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    await waitFor(() => {});
    // 仮置場
    expect(findByText(`作業場所：${mockWA1120Data?.wkplcTyp}`)).toBeTruthy();
    expect(findByText(`${mockWA1120Data?.wkplc}`)).toBeTruthy();

    // 輸送
    expect(findByText(`輸送車両：${mockWA1120Car?.carNo}`)).toBeTruthy();

    expect(findByText(`運転手：${mockWA1120Drv?.drvNm}`)).toBeTruthy();

    expect(findByText(`行先名：${mockWA1120Dest?.fixPlacNm}`)).toBeTruthy();
    expect(findByText(`輸送カード番号：${mockWA1120TrpCardNo}`)).toBeTruthy();

    expect(findByText(`申請状況：${mockWA1120TrpCardNo}`)).toBeTruthy();
  });

  //  輸送カード申請
  it('輸送カード申請', async () => {
    const {showAlert} = useAlert();
    const {getByText, getByTestId, findByText} = render(
      <RecoilRoot>
        <WA1123 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const triggerButton = getByText(/輸送カード申請/);
    await act(async () => {
      fireEvent(triggerButton, 'accessibilityAction', {disabled: false});
    });

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    await waitFor(async () => {
      const expectedMessage = messages.IA5022();
      expect(findByText(expectedMessage)).toBeTruthy();
    });

    await waitFor(async () => {
      const btnAppBack = getByText('輸送カード申請');
      fireEvent.press(btnAppBack);

      await waitFor(async () => {
        fireEvent.press(getByText(/更新/));
        await waitFor(() => {
          const expectedMessage = messages.IA5022();
          expect(findByText(expectedMessage)).toBeTruthy();
        });
      });
    });
  });
});
