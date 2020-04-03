module.exports = {
  root: true,
  plugins: ['prettier'],
  extends: ['airbnb', 'plugin:prettier/recommended'],
  rules: {
    'prettier/prettier': 'error',
  },
  env: {
    browser: true,
    amd: true,
    node: true,
    es6: true,
  },
}
