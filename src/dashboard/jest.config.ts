export default {
    clearMocks: true,
    testEnvironment: 'jsdom',
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
    setupFilesAfterEnv: ['../browser/__mocks__/mockNodecg.ts']
};
