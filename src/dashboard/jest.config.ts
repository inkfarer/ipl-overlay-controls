export default {
    clearMocks: true,
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '\\.(css|scss)$': '<rootDir>/src/dashboard/__mocks__/mockStyle.ts'
    },
    preset: 'ts-jest'
};
