module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:jest/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  plugins: [
    'jest',
  ],
  rules: {
    // Node.js specific rules
    'node/exports-style': ['error', 'module.exports'],
    'node/file-extension-in-import': ['error', 'always'],
    'node/prefer-global/buffer': ['error', 'always'],
    'node/prefer-global/console': ['error', 'always'],
    'node/prefer-global/process': ['error', 'always'],
    'node/prefer-global/url-search-params': ['error', 'always'],
    'node/prefer-global/url': ['error', 'always'],
    'node/prefer-promises/dns': 'error',
    'node/prefer-promises/fs': 'error',
    
    // General rules
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }], // Allow important console methods
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }], // Allow unused vars if prefixed with underscore
    
    // Jest rules
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/valid-expect': 'error',
  },
  overrides: [
    // Test files
    {
      files: ['**/*.test.js', '**/__tests__/**/*'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off', // Allow console in tests
      },
    },
  ],
}; 