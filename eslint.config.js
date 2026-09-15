import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'frontend/dist/**', 'frontend/coverage/**', 'frontend/playwright-report/**', 'backend/coverage/**', 'backend/dist/**'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // React Compiler rules added in eslint-plugin-react-hooks v7 — disabled until
      // the project adopts the React Compiler.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/use-memo': 'off',
      'react-hooks/void-use-memo': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/globals': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/error-boundaries': 'off',
      'react-hooks/set-state-in-render': 'off',
      'react-hooks/gating': 'off',
      'react-hooks/config': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ['frontend/src/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}'],
    ignores: [
      'frontend/src/**/*.{test,spec}.{ts,tsx}',
      'frontend/src/test/**',
      'src/**/*.{test,spec}.{ts,tsx}',
      'src/test/**',
    ],
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  }
);
