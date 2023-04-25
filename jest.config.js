/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  // verbose: true,
  testEnvironment: 'node',
  // moduleNameMapper: {
  //   '/src/(.*)': '<rootDir>/src/$1',
  // },
  roots: ['<rootDir>'],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/'], // To ignore tests from the dist/ directory
};
