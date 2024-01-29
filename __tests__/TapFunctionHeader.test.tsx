import React from 'react';
import { TouchableOpacity } from 'react-native';
import TestRenderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { NavigationContext } from '@react-navigation/native';
import TapFunctionHeader from '../src/components/TapFunctionHeader.tsx';

// ログ関数とナビゲーションのモック
jest.mock('../src/utils/Log.tsx', () => ({
  logScreen: jest.fn(),
  logUserAction: jest.fn()
}));

const mockNavigate = jest.fn();

// テスト用のナビゲーションコンテキスト
const navigationContext: any = {
  navigate: mockNavigate,
};

describe('TapFunctionHeader コンポーネント', () => {
  // 初期化処理
  jest.useFakeTimers();
  let consoleSpy: jest.SpyInstance, clearTimeoutSpy: jest.SpyInstance, testRenderer: ReactTestRenderer;

  // テスト前に実行される関数
  beforeEach(() => {
    // console.log のモック化
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    // testRendererの初期化
    testRenderer = TestRenderer.create(
      <NavigationContext.Provider value={navigationContext}>
        <TapFunctionHeader appType="App" viewTitle="View" functionTitle="Function" sourceScreenId="Source" />
      </NavigationContext.Provider>
    );
  });

  // テスト後に実行される関数
  afterEach(() => {
    // モックのクリーンアップ
    consoleSpy.mockRestore();
    clearTimeoutSpy.mockRestore();
  });

  ///////----------------------------------------///////
  ///////----ここ以下に必要なテストを記述する-------///////
  ///////----------------------------------------///////

  it('正しくレンダリングされること', () => {
    const tree = testRenderer.toJSON();
    // 正しいかをスナップショットで比較をする
    expect(tree).toMatchSnapshot();
  });

  it('タップがカウントされること', () => {
    // タップしてカウントアップ
    act(() => {
      const touchableOpacity = testRenderer.root.findByType(TouchableOpacity);
      touchableOpacity.props.onPress();
    });
    // 1のカウントが行われていること
    expect(consoleSpy).toHaveBeenCalledWith("count tap ", 1);
    act(() => {
      const touchableOpacity = testRenderer.root.findByType(TouchableOpacity);
      touchableOpacity.props.onPress();
    });
    // 2のカウントが行われていること
    expect(consoleSpy).toHaveBeenCalledWith("count tap ", 2);
  });

  it('タップをカウントし、5秒後にリセットされること', () => {
    // タップしてカウントアップ
    act(() => {
      const touchableOpacity = testRenderer.root.findByType(TouchableOpacity);
      touchableOpacity.props.onPress();
    });
    // 1のカウントが行われていること
    expect(consoleSpy).toHaveBeenCalledWith("count tap ", 1);


    // 5秒後の動作確認
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    // カウントリセットのログが流れること
    expect(consoleSpy).toHaveBeenCalledWith("count tap reset 0");
    // タップしてカウントアップ
    act(() => {
      const touchableOpacity = testRenderer.root.findByType(TouchableOpacity);
      touchableOpacity.props.onPress();
    });
    // リセットされ、1のカウントが行われていること
    expect(consoleSpy).toHaveBeenCalledWith("count tap ", 1);
  });

  it('タップをカウントし、4秒後にリセットされていないこと', () => {
    // タップしてカウントアップ
    act(() => {
      const touchableOpacity = testRenderer.root.findByType(TouchableOpacity);
      touchableOpacity.props.onPress();
    });
    // 1のカウントが行われていること
    expect(consoleSpy).toHaveBeenCalledWith("count tap ", 1);


    // 4秒後の動作確認
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    // カウントリセットのログが流れていないこと
    expect(consoleSpy).not.toHaveBeenCalledWith("count tap reset 0");
    // タップしてカウントアップ
    act(() => {
      const touchableOpacity = testRenderer.root.findByType(TouchableOpacity);
      touchableOpacity.props.onPress();
    });
    // 2のカウントが行われていること
    expect(consoleSpy).toHaveBeenCalledWith("count tap ", 2);
  });

  it('タイマーがない場合はリセットが行われないこと', () => {
    const touchableOpacity = testRenderer.root.findByType(TouchableOpacity);
    // 1回目タップ
    act(() => {
      touchableOpacity.props.onPress();
    });
    // タイマーが存在しないためリセットが行われないこと
    expect(clearTimeoutSpy).not.toHaveBeenCalled();
  });

  it('すでにタイマーがある時はリセットを行うこと', () => {
    const touchableOpacity = testRenderer.root.findByType(TouchableOpacity);
    // 1回目タップ
    act(() => {
      touchableOpacity.props.onPress();
    });
    // 1回目はタイマーが存在しないためリセットが行われないこと
    expect(clearTimeoutSpy).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    // 2回目タップ
    act(() => {
      touchableOpacity.props.onPress();
    });
    // 2回目はタイマーが存在するためリセットが行われること
    expect(clearTimeoutSpy).toHaveBeenCalled();

  });

  it('4回タップしてもナビゲートが起こらないこと', () => {
    // 4回タップ
    const touchableOpacity = testRenderer.root.findByType(TouchableOpacity);
    act(() => {
      for (let i = 0; i < 4; i++) {
        touchableOpacity.props.onPress();
      }
    });
    // タイマーのリセットが行われていないか
    expect(clearTimeoutSpy).not.toHaveBeenCalled();
    // ナビゲーションが呼ばれていないか
    expect(mockNavigate).not.toHaveBeenCalledWith('WA1050', { sourceScreenId: 'Source' });
  });

  it('5回タップするとナビゲートが起こるか', () => {
    // 5回タップ
    act(() => {
      const touchableOpacity = testRenderer.root.findByType(TouchableOpacity);
      for (let i = 0; i < 5; i++) {
        touchableOpacity.props.onPress();
      }
    });
    // タイマーのリセットが行われているか
    expect(clearTimeoutSpy).toHaveBeenCalled();
    // ナビゲーションが呼ばれているか
    expect(mockNavigate).toHaveBeenCalledWith('WA1050', { sourceScreenId: 'Source' });
  });
});
