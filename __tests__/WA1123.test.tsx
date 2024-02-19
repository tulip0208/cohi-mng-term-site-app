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
let mockWA1120DataState='';
let mockWA1120PrevScreenId='';
let mockWA1120Car={
  idTyp: '', //ID種別
  carId: '', //車両ID
  carNm: '', //車両名称
  carNo: '', //車両番号
  maxWt: '', //最大積載量
  carWt: '', //車両重量
  empCarWt: '', //空車重量
};
let mockWA1120Drv={
  idTyp: '', //ID種別
  drvId: '', //運転手ID
  drvNm: '', //運転手名
};
let mockWA1120Dest={
  idTyp: '', //ID種別
  storPlacId: '', //保管場ID
  fixPlacId: '', //定置場ID
  fixPlacNm: '', //定置場名
  facTyp: '', //施設区分
  raKbn: '', //濃度区分
};
let mockWA1120TrpCardNo='';
let mockWA1121Data='';


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

/************************************************
 * テストコード
 ************************************************/
describe('WA1123 Screen', () => {
  // 表示
  it('成功 成功 ログイン時の作業場所（作業場所種類-仮置場、作業場所名、）輸送(輸送車両、運転手、行先名、輸送カード番号)、タグ読込ボタン、戻るボタン', async () => {
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
    expect(
      findByText(`作業場所：${mockWA1120Data?.wkplcTyp}`),
    ).toBeTruthy();
    expect(
      findByText(`${mockWA1120Data?.wkplc}`),
    ).toBeTruthy();
  
    // 輸送
    expect(
      findByText(`輸送車両：${mockWA1120Car?.carNo}`),
    ).toBeTruthy();

    expect(
      findByText(`運転手：${mockWA1120Drv?.drvNm}`),
    ).toBeTruthy();

    expect(
      findByText(
        `行先名：${mockWA1120Dest?.fixPlacNm}`,
      ),
    ).toBeTruthy();
    expect(
      findByText(`輸送カード番号：${mockWA1120TrpCardNo}`),
    ).toBeTruthy();

    expect(
      findByText(`荷台各面の中心位置放射線量率を入力後、
      送信ボタンを押して下さい。`)).toBeTruthy();
    
 //荷台各面の中心位置放射線量率
    expect(
      findByText(`前：${mockWA1120Drv?.drvNm}`),
    ).toBeTruthy();

    expect(
      findByText(
        `行先名：${mockWA1120Dest?.fixPlacNm}`,
      ),
    ).toBeTruthy();
    expect(
      findByText(`輸送カード番号：${mockWA1120TrpCardNo}`),
    ).toBeTruthy();

    expect(findByText('戻る')).toBeTruthy();
    expect(findByText('メニュー')).toBeTruthy();
  });

  it('renders correctly', () => {
    const {getByText, getByTestId, getAllByText} = render(
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
    // コンポーネントが正しくレンダリングされることをテストする
    const allElementsWithμSvH = getAllByText('μSv/h');
    expect(allElementsWithμSvH[0]).toBeTruthy();
    expect(allElementsWithμSvH[1]).toBeTruthy();
    expect(allElementsWithμSvH[2]).toBeTruthy();
    expect(allElementsWithμSvH[3]).toBeTruthy();

    expect(getByText('前：')).toBeTruthy();
   
    expect(getByText('左：')).toBeTruthy();

    expect(getByText('後：')).toBeTruthy();

    expect(getByText('右：')).toBeTruthy();

  });

//前：
  it('前：1番目のテキスト入力の値をフィルタリングして更新する必要があります。', () => {
    const {getByText, getByTestId} = render(
      <RecoilRoot>
        <WA1123 navigation={mockNavigation} />
      </RecoilRoot>,
    );

   // 特定のテストIDを持つTextInputコンポーネントを探す
    const firstInput = getByTestId('radiation_forward'); // TextInputコンポーネントにtestIDを設定する

    fireEvent.changeText(firstInput, 'abc123def');

    expect(firstInput.props.value).toBe('123');
  });

  it('前：2番目のテキスト入力の値をフィルタリングして更新する必要があります。', () => {
    const {getByText, getByTestId} = render(
      <RecoilRoot>
        <WA1123 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    
    // 特定のテストIDを持つTextInputコンポーネントを探す
    const secondInput = getByTestId('radiation_forward2'); // TextInputコンポーネントにtestIDを設定する

    fireEvent.changeText(secondInput, 'xyz456.78');

    expect(secondInput.props.value).toBe('45678');
  });

//左：
  it('左：1番目のテキスト入力の値をフィルタリングして更新する必要があります。', () => {
    const {getByText, getByTestId} = render(
      <RecoilRoot>
        <WA1123 navigation={mockNavigation} />
      </RecoilRoot>,
    );

   // 特定のテストIDを持つTextInputコンポーネントを探す
    const firstInput = getByTestId('radiation_left'); // TextInputコンポーネントにtestIDを設定する

    fireEvent.changeText(firstInput, 'abc123def');

    expect(firstInput.props.value).toBe('123');
  });

  it('左：2番目のテキスト入力の値をフィルタリングして更新する必要があります。', () => {
    const {getByText, getByTestId} = render(
      <RecoilRoot>
        <WA1123 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    
    // 特定のテストIDを持つTextInputコンポーネントを探す
    const secondInput = getByTestId('radiation_left2'); // TextInputコンポーネントにtestIDを設定する

    fireEvent.changeText(secondInput, 'xyz456.78');

    expect(secondInput.props.value).toBe('45678');
  });

  //後：
  it('後：1番目のテキスト入力の値をフィルタリングして更新する必要があります。', () => {
    const {getByText, getByTestId} = render(
      <RecoilRoot>
        <WA1123 navigation={mockNavigation} />
      </RecoilRoot>,
    );

   // 特定のテストIDを持つTextInputコンポーネントを探す
    const firstInput = getByTestId('radiation_back'); // TextInputコンポーネントにtestIDを設定する

    fireEvent.changeText(firstInput, 'abc123def');

    expect(firstInput.props.value).toBe('123');
  });

  it('後：2番目のテキスト入力の値をフィルタリングして更新する必要があります。', () => {
    const {getByText, getByTestId} = render(
      <RecoilRoot>
        <WA1123 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    
    // 特定のテストIDを持つTextInputコンポーネントを探す
    const secondInput = getByTestId('radiation_back2'); // TextInputコンポーネントにtestIDを設定する

    fireEvent.changeText(secondInput, 'xyz456.78');

    expect(secondInput.props.value).toBe('45678');
  });

  //右：
  it('右：1番目のテキスト入力の値をフィルタリングして更新する必要があります。', () => {
    const {getByText, getByTestId} = render(
      <RecoilRoot>
        <WA1123 navigation={mockNavigation} />
      </RecoilRoot>,
    );

   // 特定のテストIDを持つTextInputコンポーネントを探す
    const firstInput = getByTestId('radiation_right'); // TextInputコンポーネントにtestIDを設定する

    fireEvent.changeText(firstInput, 'abc123def');

    expect(firstInput.props.value).toBe('123');
  });

  it('右：2番目のテキスト入力の値をフィルタリングして更新する必要があります。', () => {
    const {getByText, getByTestId} = render(
      <RecoilRoot>
        <WA1123 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // 特定のテストIDを持つTextInputコンポーネントを探す
    const secondInput = getByTestId('radiation_right2'); // TextInputコンポーネントにtestIDを設定する
    fireEvent.changeText(secondInput, 'xyz456.78');
    expect(secondInput.props.value).toBe('45678');
   
  });

//    //ボタン連続押下制御
  it('破棄ボタン処理', async () => {
    const {showAlert} = useAlert();
    const {getByText, getByTestId, findByText} = render(
      <RecoilRoot>
        <WA1123 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const triggerButton = getByText(/破棄/);
    await act(async () => {
      fireEvent(triggerButton, 'accessibilityAction', {disabled: false});
    });

    await act(async () => {
      fireEvent.press(triggerButton);
    });

    await waitFor(async () => {
      const expectedMessage = messages.IA5012();
      expect(findByText(expectedMessage)).toBeTruthy();
    });
    
  });

//   戻るボタン処理
  it('ボタンクリック 戻るボタン', async () => {
    const {getByText, getByTestId, findByText} = render(
      <RecoilRoot>
        <WA1123 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    const triggerButton = getByText(/戻る/);
    await act(async () => {
      fireEvent.press(triggerButton);
    });
    await waitFor(async () => {
      const expectedMessage = messages.IA5014();
      expect(findByText(expectedMessage)).toBeTruthy();
    });
  });

  it('ボタンクリック 送信', async () => {
    // WA1123 コンポーネントをレンダリング
    const {getByText, findByText, getAllByText} = render(
      <RecoilRoot>
        <WA1123 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    const allElementsWithμSvH = getAllByText(/送信/);
    const triggerButton = allElementsWithμSvH[1];

    await act(async () => {
      fireEvent(triggerButton, 'accessibilityAction', {disabled: false});
    });

    await act(async () => {
      fireEvent.press(triggerButton);
    });
    await waitFor(async () => {
      const expectedMessage = messages.IA5006();
      expect(findByText(expectedMessage)).toBeTruthy();
    });
  });

  // 小数点以下二桁目補填
  it('小数点以下二桁目補填 前', async () => {
    const mockSetFrCaLgSdBgDsDec = jest.fn();
      const initialState = {
        frCaLgSdBgDsDec: '1', 
        setFrCaLgSdBgDsDec: mockSetFrCaLgSdBgDsDec,
      };
    // WA1123 コンポーネントをレンダリング
    const {getByText, getByTestId, findByText, getAllByText} = render(
      <RecoilRoot>
        <WA1123 {...initialState} navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // onBlur イベントをトリガーします（実際の実装に基づいてイベント名を調整する必要があります）
      fireEvent(getByTestId('radiation_forward2'), 'blur');
  });
  it('小数点以下二桁目補填 前左', async () => {
    const mockSetFrCaLgSdBgDsDec = jest.fn();
      const initialState = {
        frCaLgSdBgDsDec: '1', 
        setFrCaLgSdBgDsDec: mockSetFrCaLgSdBgDsDec,
      };
    // WA1123 コンポーネントをレンダリング
    const {getByText, getByTestId, findByText, getAllByText} = render(
      <RecoilRoot>
        <WA1123 {...initialState} navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // onBlur イベントをトリガーします（実際の実装に基づいてイベント名を調整する必要があります）
      fireEvent(getByTestId('radiation_left2'), 'blur');
  });
  it('小数点以下二桁目補填 後', async () => {
    const mockSetFrCaLgSdBgDsDec = jest.fn();
      const initialState = {
        frCaLgSdBgDsDec: '1', 
        setFrCaLgSdBgDsDec: mockSetFrCaLgSdBgDsDec,
      };
    // WA1123 コンポーネントをレンダリング
    const {getByText, getByTestId, findByText, getAllByText} = render(
      <RecoilRoot>
        <WA1123 {...initialState} navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // onBlur イベントをトリガーします（実際の実装に基づいてイベント名を調整する必要があります）
      fireEvent(getByTestId('radiation_back2'), 'blur');
  });
  it('小数点以下二桁目補填 右：', async () => {
    const mockSetFrCaLgSdBgDsDec = jest.fn();
      const initialState = {
        frCaLgSdBgDsDec: '1', 
        setFrCaLgSdBgDsDec: mockSetFrCaLgSdBgDsDec,
      };
    // WA1123 コンポーネントをレンダリング
    const {getByText, getByTestId, findByText, getAllByText} = render(
      <RecoilRoot>
        <WA1123 {...initialState} navigation={mockNavigation} />
      </RecoilRoot>,
    );
    // onBlur イベントをトリガーします（実際の実装に基づいてイベント名を調整する必要があります）
      fireEvent(getByTestId('radiation_right2'), 'blur');
  });
});

