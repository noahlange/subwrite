const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/.ignore/'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths ?? {}, {
    prefix: '<rootDir>/src'
  })
};
