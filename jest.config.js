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
    'node_modules/(?!(react-native|@react-native|react-native-rem-stylesheet|jest-runtime)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
