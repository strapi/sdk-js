/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
  transform: {
    '^.+.tsx?$': ['ts-jest', {}],
  },
  coverageDirectory: '<rootDir>/.coverage/',
};
