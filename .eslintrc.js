module.exports = {
  parser: 'babel-eslint',
  extends: [
    'airbnb',
    'prettier',
    'plugin:prettier/recommended',
    'prettier/react',
  ],
  plugins: ['prettier'],
  env: {
    jest: true,
    browser: true,
  },
  rules: {
    'prettier/prettier': ['error', { parser: '' }],
    'react/jsx-filename-extension': [
      1,
      {
        extensions: ['.js', '.jsx'],
      },
    ],
  },
};
