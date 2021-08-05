export default {
    clearMocks: true,
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '\\.(css|scss)$': '<rootDir>/__mocks__/emptyModule.ts'
    },
    preset: 'ts-jest',
    transform: {
        '^.+\\.(ts|tsx)?$': 'ts-jest'
    },
    moduleDirectories: ['node_modules', 'src']
};
