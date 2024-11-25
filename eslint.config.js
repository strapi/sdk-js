module.exports = {
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
  },
  files: ['src/*.{js,ts,jsx,tsx,yml,yaml}'],
  plugins: {
    import: require('eslint-plugin-import'),
  },
  rules: {
    // eslint-plugin-import
    'import/no-default-export': 'error',
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    'import/first': ['error'],
    'import/exports-last': ['error'],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
  },
};
