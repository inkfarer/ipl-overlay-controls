export default {
    preset: 'ts-jest',
    clearMocks: true,
    moduleDirectories: ['node_modules', 'src'],
    transform: {
        '^.+\\.(ts|tsx)?$': 'ts-jest'
    },
};
