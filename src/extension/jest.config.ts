export default {
    preset: 'ts-jest',
    clearMocks: true,
    restoreMocks: true,
    moduleDirectories: ['node_modules', 'src'],
    transform: {
        '^.+\\.(ts|tsx)?$': 'ts-jest'
    },
    setupFilesAfterEnv: ['./__mocks__/mockNodecg.ts', './__mocks__/MockBaseController.ts']
};
