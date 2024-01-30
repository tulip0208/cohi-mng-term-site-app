import React from 'react';
import {render} from '@testing-library/react-native';
import WA1020 from '../src/screens/WA1020';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootList} from '../src/navigation/AppNavigator';
import {RecoilRoot} from 'recoil';

// navigationオブジェクトのモック
const mockNavigation = {
  navigate: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  goBack: jest.fn(),
  isFocused: jest.fn(),
  canGoBack: jest.fn(),
  getId: jest.fn(),
  getState: jest.fn(),
  getParent: jest.fn(),
  setParams: jest.fn(),
  setOptions: jest.fn(), // エラーメッセージに基づいて追加
  // その他の必要なメソッドを追加
} as unknown as StackNavigationProp<RootList, 'WA1020'>; // 型アサーション

describe('WA1020 Screen', () => {
  it('renders correctly', () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1020 navigation={mockNavigation} />
      </RecoilRoot>,
    );
    expect(getByText('端末登録')).toBeTruthy();
  });

  // その他のテストケース...
});
