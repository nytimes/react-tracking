module.exports = {
  setupFiles: ['raf/polyfill', './setup/enzymeAdapter.js'],
  testPathIgnorePatterns: [
    '<rootDir>/src/__tests__/hoist-non-react-statics@3.0.1/',
  ],
};
