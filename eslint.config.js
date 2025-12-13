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
  // Allow console in logger.ts
  {
    files: ['src/utils/logger.ts'],
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

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',

      // General rules
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Unused imports (handled by @typescript-eslint/no-unused-vars)
      'no-unused-vars': 'off', // Disable base rule as it conflicts with TypeScript rule
    },
  },
  prettier,
];
