import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist/', 'node_modules/', '*.config.js', '*.config.ts'],
  },
  js.configs.recommended,
  // Allow console in logger.ts and errorTrackingService.ts
  {
    files: ['src/utils/logger.ts', 'src/services/errorTrackingService.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json', // Required for type-aware rules
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        crypto: 'readonly',
        FileReader: 'readonly',
        File: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        navigator: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLAnchorElement: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        Event: 'readonly',
        Node: 'readonly',
        MediaQueryListEvent: 'readonly',
        Image: 'readonly',
        // IndexedDB globals
        indexedDB: 'readonly',
        IDBDatabase: 'readonly',
        IDBOpenDBRequest: 'readonly',
        IDBRequest: 'readonly',
        IDBCursorWithValue: 'readonly',
        IDBTransaction: 'readonly',
        IDBObjectStore: 'readonly',
        // Node.js globals (for build tools)
        process: 'readonly',
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React rules
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',

      // TypeScript rules (stricter in v1.8.0)
      '@typescript-eslint/no-unused-vars': [
        'error', // Upgraded from 'warn' to 'error'
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'error', // New in v1.8.0
      '@typescript-eslint/await-thenable': 'error', // New in v1.8.0
      '@typescript-eslint/no-misused-promises': 'error', // New in v1.8.0

      // General rules
      'no-console': [
        'error', // Upgraded from 'warn' to 'error'
        {
          allow: ['warn', 'error'],
        },
      ],
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'complexity': ['warn', 20], // New in v1.8.0 - warn on functions with cyclomatic complexity > 20

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error', // Upgraded from 'warn' to 'error'

      // Unused imports (handled by @typescript-eslint/no-unused-vars)
      'no-unused-vars': 'off', // Disable base rule as it conflicts with TypeScript rule
    },
  },
  prettier,
];
