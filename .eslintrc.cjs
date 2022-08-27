module.exports = {
  root: false,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json', './packages/*/tsconfig.json'],
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'clean'
  ],
  rules: {
    'quotes': ['error', 'single'],
    'jsx-quotes': ['error', 'prefer-double'],
    'comma-spacing': ['error', { before: false, after: true }],
    'comma-dangle': ['error', 'always-multiline'],
    'space-before-function-paren': 'error',
    'no-multi-spaces': 'error',
    'array-bracket-spacing': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    '@typescript-eslint/no-unused-vars': ['error', {
      'argsIgnorePattern': '^_',
      'destructuredArrayIgnorePattern': '^_',
    }]
  },
  overrides: [{
    files: ['*.mdx'],
    extends: 'plugin:mdx/recommended',
  }]
};
