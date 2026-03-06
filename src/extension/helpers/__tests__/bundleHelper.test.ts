import * as fs from 'fs';
import { GameVersion } from '../../../types/enums/gameVersion';

describe('bundleHelper', () => {
    const mockReaddirSync = jest.fn();
    const mockExistsSync = jest.fn();
    const mockReadFileSync = jest.fn();

    jest.mock('fs', () => ({
        readdirSync: mockReaddirSync,
        existsSync: mockExistsSync,
        readFileSync: mockReadFileSync
    }));

    beforeEach(() => {
        process.cwd = () => 'dir/nodecg';
    });

    it('reads the bundles directory to compile dependent bundles', () => {
        mockReaddirSync.mockReturnValue([
            {
                isDirectory: () => true,
                name: 'ipl-overlay-controls'
            },
            {
                isDirectory: () => true,
                name: 'bundle-one'
            },
            {
                isDirectory: () => true,
                name: 'random-directory'
            },
            {
                isDirectory: () => true,
                name: 'bundle-two'
            },
            {
                isDirectory: () => true,
                name: 'non-dependent-bundle'
            },
            {
                isDirectory: () => false,
                name: 'a-file'
            }
        ] as fs.Dirent[]);
        mockExistsSync
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true);
        mockReadFileSync
            .mockReturnValueOnce(JSON.stringify({
                compatibleDashboardVersion: '^1.0.0',
                compatibleGameVersions: [ 'SPLATOON_3', 'random string' ]}))
            .mockReturnValueOnce(JSON.stringify({ bundleDependencies: { 'other-bundle': '^10.0.0', 'ipl-overlay-controls': '^12.0.1' } }))
            .mockReturnValueOnce('{ "name": "non-dependent-bundle" }');

        expect(require('../bundleHelper').dependentBundles).toEqual([
            {
                compatibleDashboardVersion: '^1.0.0',
                compatibleGameVersions: [ GameVersion.SPLATOON_3 ],
                name: 'bundle-one'
            },
            {
                compatibleDashboardVersion: '^12.0.1',
                compatibleGameVersions: [ GameVersion.SPLATOON_2 ],
                name: 'bundle-two'
            }
        ]);
        expect(mockReaddirSync).toHaveBeenCalledWith('dir/nodecg/bundles', { withFileTypes: true });
        expect(mockExistsSync).toHaveBeenCalledTimes(4);
        expect(mockExistsSync).toHaveBeenCalledWith('dir/nodecg/bundles/bundle-one/package.json');
        expect(mockExistsSync).toHaveBeenCalledWith('dir/nodecg/bundles/random-directory/package.json');
        expect(mockExistsSync).toHaveBeenCalledWith('dir/nodecg/bundles/bundle-two/package.json');
        expect(mockExistsSync).toHaveBeenCalledWith('dir/nodecg/bundles/non-dependent-bundle/package.json');
        expect(mockReadFileSync).toHaveBeenCalledTimes(3);
        expect(mockReadFileSync).toHaveBeenCalledWith('dir/nodecg/bundles/bundle-one/package.json', 'utf-8');
        expect(mockReadFileSync).toHaveBeenCalledWith('dir/nodecg/bundles/bundle-two/package.json', 'utf-8');
        expect(mockReadFileSync).toHaveBeenCalledWith('dir/nodecg/bundles/non-dependent-bundle/package.json', 'utf-8');
    });
});
