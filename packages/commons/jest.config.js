module.exports = {
  passWithNoTests: true,
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.spec.json',
    },
  },
  preset: 'ts-jest/presets/js-with-ts',
  setupFiles: []
}
