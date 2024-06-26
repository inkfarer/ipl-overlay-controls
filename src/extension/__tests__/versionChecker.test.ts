import { version } from '../../../package.json';
import { mockNodecgLog, replicants } from '../__mocks__/mockNodecg';
import { GameVersion } from '../../types/enums/gameVersion';

jest.mock('../helpers/bundleHelper', () => ({
    __esModule: true,
    dependentBundles: [
        {
            name: 'bundle-one',
            compatibleDashboardVersion: '^1.0.0',
            compatibleGameVersions: [GameVersion.SPLATOON_2]
        },
        {
            name: 'bundle-two',
            compatibleDashboardVersion: version,
            compatibleGameVersions: [GameVersion.SPLATOON_3]
        },
        {
            name: 'bundle-three',
            compatibleDashboardVersion: '^99.0.0',
            compatibleGameVersions: [GameVersion.SPLATOON_2, GameVersion.SPLATOON_3]
        }
    ]
}));

describe('versionChecker', () => {
    it('reads bundle packages to find version conflicts', () => {
        replicants.runtimeConfig = { gameVersion: GameVersion.SPLATOON_3 };

        require('../versionChecker');

        expect(mockNodecgLog.warn).toHaveBeenCalledTimes(3);
        expect(mockNodecgLog.warn).toHaveBeenCalledWith('translation:versionChecker.incompatibleGameVersionWarning');
        expect(mockNodecgLog.warn).toHaveBeenCalledWith('translation:versionChecker.incompatibleBundleWarning');
    });
});
