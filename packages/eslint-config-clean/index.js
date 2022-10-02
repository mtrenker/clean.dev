module.exports = {
  globals: {
      MyGlobal: true
  },
  extends: [
    'plugin:import/recommended',
    'plugin:import/typescript'
  ],
  rules: {
    semi: [2, "always"],
    indent: ["error", 2],
    "space-infix-ops": "error"
    // "object-curly-newline": ["error", {
    //   "ObjectExpression": { "multiline": true },
    //   "ObjectPattern": { "multiline": true },
    //   "ImportDeclaration": { "multiline": true, "minProperties": 3 },
    //   "ExportDeclaration": { "multiline": true, "minProperties": 3 }
    // }],
  }
};
