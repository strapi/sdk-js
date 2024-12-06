/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
  transform: {
    '^.+.tsx?$': ['ts-jest', {}],
  },
  coverageDirectory: '<rootDir>/.coverage/',
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
};
