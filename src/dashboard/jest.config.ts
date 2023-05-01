export default {
    clearMocks: true,
    testEnvironment: 'jsdom',
    testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons']
    },
    moduleFileExtensions: [ 'ts', 'js', 'json', 'vue' ],
    moduleNameMapper: {
        '\\.(css|scss)$': '<rootDir>/__mocks__/emptyModule.ts'
    },
    preset: 'ts-jest',
    transform: {
        '^.+\\.(ts|tsx)?$': 'ts-jest',
        '.*\\.(vue)$': '@vue/vue3-jest'
    },
    moduleDirectories: ['node_modules', 'src'],
    setupFilesAfterEnv: ['./__mocks__/mockNodecg.ts']
};
