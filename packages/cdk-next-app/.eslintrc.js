/**
 * @type {import("@types/eslint").Linter.Config}
 */
module.exports = {
  extends: [
    '@cleandev/eslint-config/cdk',
    '@cleandev/eslint-config',
  ],
  ignorePatterns: [
    'node_modules/',
    'cdk.out/'
  ]
}
