module.exports = {
  // The root of your source code, typically /src
  roots: ["<rootDir>/src"],

  // Test environment
  testEnvironment: "node",

  // Jest transformations
  transform: {
    "^.+\\.(js|ts)$": "babel-jest",
  },

  // Module file extensions for importing
  moduleFileExtensions: ["js", "ts", "json", "node"],

  // Coverage settings
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,ts}",
    "!src/**/*.d.ts",
    "!src/index.js",
    "!src/server.js",
    "!src/config/**/*",
    "!src/scripts/**/*",
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
  testMatch: ["**/__tests__/**/*.{js,ts}", "**/*.{spec,test}.{js,ts}"],

  // Test setup files
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],

  // Ignore specific folders from being tested
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/build/"],

  // Global variables
  globals: {
    "process.env.NODE_ENV": "test",
  },
};
