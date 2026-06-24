module.exports = {
  root: true,
  extends: ['@cleandev/eslint-config/next'],
  parserOptions: {
    project: require('node:path').resolve(__dirname, 'tsconfig.json'),
  },
  ignorePatterns: ['node_modules/', 'dist/'],
};
