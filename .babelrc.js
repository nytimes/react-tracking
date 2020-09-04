const test = process.env.BABEL_ENV === 'test';
const useESModules = test ? {} : { useESModules: false };

module.exports = {
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      { ...useESModules, regenerator: true, corejs: false },
    ],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    '@babel/plugin-proposal-object-rest-spread',
  ],
  presets: [
    '@babel/preset-env',
    '@babel/preset-typescript',
    '@babel/preset-react',
  ],
};
