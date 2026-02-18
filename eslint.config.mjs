// eslint.config.mjs
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';

export default [
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      'no-restricted-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'off', // TODO: Discuss about this off rule
      'react-hooks/preserve-manual-memoization': 'off', // TODO: Discuss about this off rule
      'react-hooks/set-state-in-effect': 'off', // TODO: Discuss about this off rule
      'react-hooks/rules-of-hooks': 'off', // TODO: Discuss about this off rule
      '@typescript-eslint/no-unsafe-assignment': 'off', // TODO: Discuss about this off rule
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prettier/prettier': [
        'warn',
        {
          semi: true,
          singleQuote: true,
          trailingComma: 'es5',
          tabWidth: 2,
          printWidth: 100,
          arrowParens: 'avoid',
          endOfLine: 'lf',
        },
      ],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '.vercel/**'],
  },
];
