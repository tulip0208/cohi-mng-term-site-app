import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RecoilRoot} from 'recoil';
import {RootList} from '../src/navigation/AppNavigator';
import WA1081 from '../src/screens/WA1081';

const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
} as unknown as StackNavigationProp<RootList, 'WA1081'>;

describe('WA1081 テスト', () => {
  //
  it('初期レンダリング', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1081 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    await waitFor(() => {
      expect(getByText(/作業場所：/i)).toBeTruthy();
      expect(getByText(/旧タグID：/i)).toBeTruthy();
    });
  });
  //
  it('戻るボタンをクリックしたとき-> navigation: WA1080', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1081 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    await waitFor(async () => {
      const btnAppBack = getByText('戻る');
      fireEvent.press(btnAppBack);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('WA1080');
      });
    });
  });
  //
  it('戻るボタンをクリックしたとき(isBtnEnabledBck が null の場合)-> 次の状態に移行しません', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1081 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    await waitFor(async () => {
      const btnAppBack = getByText('戻る');
      fireEvent.press(btnAppBack);

      await waitFor(async () => {
        fireEvent.press(btnAppBack);

        await waitFor(() => {
          expect(getByText('作業場所：')).toBeTruthy();
        });
      });
    });
  });
  //
  it('メニューボタンをクリックしたとき-> navigation: WA1040', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1081 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    await waitFor(async () => {
      const btnAppBack = getByText('メニュー');
      fireEvent.press(btnAppBack);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('WA1040');
      });
    });
  });
  //
  it('メニューボタンをクリックしたとき(isBtnEnabledMnu が null の場合)-> 次の状態に移行しません', async () => {
    const {getByText} = render(
      <RecoilRoot>
        <WA1081 navigation={mockNavigation} />
      </RecoilRoot>,
    );

    await waitFor(async () => {
      const btnAppBack = getByText('メニュー');
      fireEvent.press(btnAppBack);

      await waitFor(async () => {
        fireEvent.press(btnAppBack);
        await waitFor(() => {
          expect(getByText('作業場所：')).toBeTruthy();
        });
      });
    });
  });
});
