const { defaults } = require('jest-config');

module.exports = {
    verbose: true,
    "transform": {
        "^.+\\.tsx?$": "ts-jest",
    },
    "globals": {
        "ts-jest": {
        },
    },
    testEnvironment: 'node',
    "testRegex": "((\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    "rootDir": "./__test__",
    moduleFileExtensions: [...defaults.moduleFileExtensions, 'js', 'jsx', 'ts', 'tsx']
}