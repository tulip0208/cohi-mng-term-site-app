module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'no-trailing-spaces': 'off',
    'react-hooks/exhaustive-deps': 'off',
  },
  env: {
    // ... 他の環境設定
    jest: true, // Jestのグローバル変数を有効にする
  },
};
