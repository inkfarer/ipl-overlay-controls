import { MockNodecg } from '../__mocks__/mockNodecg';
import * as fs from 'fs';
import { version } from '../../../package.json';

describe('versionChecker', () => {
    const mockReaddirSync = jest.fn();
    const mockExistsSync = jest.fn();
    const mockReadFileSync = jest.fn();
    let nodecg: MockNodecg;

    jest.mock('fs', () => ({
        readdirSync: mockReaddirSync,
        existsSync: mockExistsSync,
        readFileSync: mockReadFileSync
    }));

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
        process.env.NODECG_ROOT = 'dir/nodecg';
        nodecg = new MockNodecg();
        nodecg.init();
    });

    it('reads bundle packages to find version conflicts', () => {
        mockReaddirSync.mockReturnValue([
            {
                isDirectory: () => true,
                name: 'ipl-overlay-controls'
            },
            {
                isDirectory: () => true,
                name: 'old-bundle'
            },
            {
                isDirectory: () => true,
                name: 'new-bundle'
            },
            {
                isDirectory: () => false,
                name: 'a-file'
            }
        ] as fs.Dirent[]);
        mockExistsSync.mockReturnValue(true);
        mockReadFileSync
            .mockReturnValueOnce('{ "compatibleDashboardVersion": "^1.0.0" }')
            .mockReturnValueOnce(`{ "compatibleDashboardVersion": "${version}" }`);

        require('../versionChecker');

        expect(nodecg.log.warn).toHaveBeenCalledTimes(1);
        expect(nodecg.log.warn).toHaveBeenCalledWith(`Bundle old-bundle expects version ^1.0.0 of ipl-overlay-controls! The installed version is ${version}.`);
    });
});
