module.exports = {
  root: false,
  extends: [
    'next/core-web-vitals',
    'plugin:tailwindcss/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  rules: {
    'react/button-has-type': 'error',
    'react/function-component-definition': ['error', { namedComponents: 'arrow-function' }],
    'react/no-array-index-key': 'error',
    'react/no-multi-comp': 'error',
    'react/prop-types': 'off',
    'react/self-closing-comp': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-first-prop-new-line': 'error',
    'react/jsx-tag-spacing': 'error',
    'react/jsx-sort-props': 'error',
    'react/jsx-boolean-value': 'error',
    'react/jsx-indent': ['error', 2, { checkAttributes: true, indentLogicalExpressions: true }],
    'react/jsx-indent-props': ['error', 2],
    'react/jsx-one-expression-per-line': ['error', { allow: 'single-child' }],
    'react/jsx-closing-bracket-location': 'error',
    'react/jsx-wrap-multilines': ['error', {
      'declaration': 'parens-new-line',
       'assignment': 'parens-new-line',
       'return': 'parens-new-line',
       'arrow': 'parens-new-line',
       'condition': 'parens-new-line',
       'logical': 'parens-new-line',
       'prop': 'parens-new-line',
     },
   ],
   'jsx-a11y/anchor-is-valid': 'off',
   'tailwindcss/no-custom-classname': ['warn', {
      'whitelist': [
        'animate-spin-slow',
      ]
   }],
  },
};
