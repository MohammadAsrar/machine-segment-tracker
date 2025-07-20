module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jest/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
    'jest',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // React specific rules
    'react/prop-types': 'warn', // Warn for missing prop types
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+
    'react/display-name': 'off',
    'react/jsx-uses-react': 'off', // Not needed with React 17+
    
    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error', // Enforce Rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Warn about missing dependencies
    
    // General rules
    'no-console': ['warn', { allow: ['warn', 'error'] }], // Only allow console.warn and console.error
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }], // Allow unused vars if prefixed with underscore
    
    // Jest rules
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/valid-expect': 'error',
  },
  overrides: [
    // TypeScript files
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        'plugin:@typescript-eslint/recommended',
      ],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
    },
    // Test files
    {
      files: ['**/*.test.js', '**/*.test.jsx', '**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off', // Allow console in tests
      },
    },
  ],
}; 