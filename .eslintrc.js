module.exports = {
  root: true,
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  rules: {
    'prettier/prettier': 'error',
    'no-unused-vars': 2,
    'no-unused-expressions': 2,
  },
  env: {
    browser: true,
    amd: true,
    node: true,
    es6: true,
  },
}
