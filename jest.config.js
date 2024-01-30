const {defaults: tsjPreset} = require('ts-jest/presets');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  ...tsjPreset,
  preset: 'react-native',
  transform: {
    '^.+\\.jsx?$': 'babel-jest', // JSXファイル用
    '^.+\\.tsx?$': 'ts-jest', // TSXファイル用
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-rem-stylesheet|jest-runtime|react-native-sha256|react-native-device-info|react-native-device-info|react-native-base64|react-native-keychain|jest-runtime)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['<rootDir>/jest/setup.js'], // setupファイルへのパス
  moduleNameMapper: {
    'react-native-fs': '<rootDir>/__mocks__/react-native-fs.js',
    'react-native-camera': '<rootDir>/__mocks__/react-native-camera.js',
    'react-native-zip-archive':
      '<rootDir>/__mocks__/react-native-zip-archive.js',
  },
};
