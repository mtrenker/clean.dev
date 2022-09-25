module.exports = {
  globals: {
      MyGlobal: true
  },
  rules: {
    semi: [2, "always"],
    indent: ["error", 2]
    // "object-curly-newline": ["error", {
    //   "ObjectExpression": { "multiline": true },
    //   "ObjectPattern": { "multiline": true },
    //   "ImportDeclaration": { "multiline": true, "minProperties": 3 },
    //   "ExportDeclaration": { "multiline": true, "minProperties": 3 }
    // }],
  }
};
