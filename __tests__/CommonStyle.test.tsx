import {StyleSheet} from 'react-native';
import {styles} from '../src/styles/CommonStyle.tsx';

describe('CommonStyle スタイルシート', () => {
  it('styles オブジェクトが正しくエクスポートされていること', () => {
    expect(styles).toBeDefined();
    expect(StyleSheet.flatten(styles)).toBeInstanceOf(Object);
  });

  // 個々のスタイル・プロパティのテスト
  describe('各スタイルのプロパティテスト', () => {
    it('fontAndColor スタイルが期待通りであること', () => {
      const expectedFontAndColor = {
        color: '#000',
        fontFamily: 'ipaexg',
      };
      expect(styles.fontAndColor).toEqual(expectedFontAndColor);
    });

    it('container スタイルが期待通りであること', () => {
      const expectedContainer = {
        backgroundColor: '#fff',
        flex: 1,
        justifyContent: 'space-between',
      };
      expect(styles.container).toEqual(expectedContainer);
    });

    // 必要に応じて他のスタイルのテストを追加する
  });

  // 関数テスト
  // describe('ユーティリティ関数のテスト', () => {
  //   it('rem 関数が正しくピクセルをremに変換すること', () => {
  //     // rem関数のテスト例
  //     const baseSize = 16; // これが効用関数で使われる基本サイズだと仮定すると
  //     const pixels = 32;
  //     const expectedRem = pixels / baseSize;
  //     expect(rem(pixels)).toEqual(expectedRem);
  //   });
  // });
});
