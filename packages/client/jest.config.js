const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig.spec')

module.exports = {
  displayName: 'client',
  preset: 'jest-preset-angular',
  passWithNoTests: true,
  // transformIgnorePatterns: [
  //   "<rootDir>/(node_modules)/"
  // ],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
}
