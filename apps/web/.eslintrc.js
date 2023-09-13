
/**
 * @type {import("@types/eslint").Linter.Config}
 */
module.exports = {
  extends: [
    '@cleandev/eslint-config/next',
    '@cleandev/eslint-config',
    'plugin:tailwindcss/recommended'
  ],
  ignorePatterns: [
    'node_modules/',
    '.next/',
    '.open-next/',
    'out/'
  ]
}
