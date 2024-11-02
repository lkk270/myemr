module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['src/**/*.js'],
    coverageReporting: {
      reporters: ['text', 'lcov']
    },
    preset: 'ts-jest',
  }; 