module.exports = {
  root: true,
  plugins: ['prettier'],
  extends: ['airbnb', 'plugin:prettier/recommended'],
  rules: {
    'prettier/prettier': 'error',
    'no-param-reassign': 0,
    'no-underscore-dangle': 0,
    'consistent-return': 0,
  },
  env: {
    browser: true,
    amd: true,
    node: true,
    es6: true,
  },
}
