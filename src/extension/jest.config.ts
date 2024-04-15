export default {
    preset: 'ts-jest/presets/js-with-ts',
    // Transform dependencies that only support ESM
    transformIgnorePatterns: ['node_modules/(?!(jsoncrush))'],
    clearMocks: true,
    restoreMocks: true,
    moduleDirectories: ['node_modules', 'src'],
    transform: {
        '^.+\\.m?[tj]sx?$': 'ts-jest'
    },
    setupFilesAfterEnv: [
        './__mocks__/mockNodecg.ts',
        './__mocks__/MockBaseController.ts',
        './__mocks__/i18n.ts'
    ]
};
