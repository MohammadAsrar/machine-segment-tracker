module.exports = {
  // The root of your source code, typically /src
  roots: ["<rootDir>/src"],

  // Test environment
  testEnvironment: "jsdom",

  // Jest transformations -- this adds support for TypeScript
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },

  // Module file extensions for importing
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],

  // Coverage settings
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/index.js",
    "!src/reportWebVitals.js",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/mocks/**/*",
  ],
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Test file match pattern
  testMatch: [
    "**/__tests__/**/*.{js,jsx,ts,tsx}",
    "**/*.{spec,test}.{js,jsx,ts,tsx}",
  ],

  // Test setup files
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],

  // Mock files
  moduleNameMapper: {
    // Handle image imports
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js",

    // Handle CSS imports
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },

  // Ignore specific folders from being tested
  testPathIgnorePatterns: ["/node_modules/", "/build/"],
};
