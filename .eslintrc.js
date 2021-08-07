module.exports = {
  extends: [
    // 'erb',
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'no-void': 'off', // allows to ignore floating promises
    'react/require-default-props': 0,
    '@typescript-eslint/unbound-method': 0,
    'no-restricted-syntax': ['error', 'WithStatement'],
    'no-empty': ['error', { allowEmptyCatch: true }],
    'jsx-a11y/label-has-associated-control': [2, {
      controlComponents: ['LabeledInput'],
      depth: 5,
    }],
    'react-hooks/exhaustive-deps': ['error', {
      additionalHooks: "(useDepsUpdateEffect)"
    }],
    'max-lines': ["error", {"max": 500, "skipComments": true}]
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  /*
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.js'),
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  }, */
};
