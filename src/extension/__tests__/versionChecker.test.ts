import { version } from '../../../package.json';
import { mockNodecgLog } from '../__mocks__/mockNodecg';
jest.mock('../helpers/bundleHelper', () => ({
    __esModule: true,
    dependentBundles: [
        {
            name: 'bundle-one',
            compatibleDashboardVersion: '^1.0.0'
        },
        {
            name: 'bundle-two',
            compatibleDashboardVersion: version
        },
        {
            name: 'bundle-three',
            compatibleDashboardVersion: '^99.0.0'
        }
    ]
}));

describe('versionChecker', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('reads bundle packages to find version conflicts', () => {
        require('../versionChecker');

        expect(mockNodecgLog.warn).toHaveBeenCalledTimes(2);
        expect(mockNodecgLog.warn).toHaveBeenCalledWith(`Bundle bundle-one expects version ^1.0.0 of ipl-overlay-controls! The installed version is ${version}.`);
        expect(mockNodecgLog.warn).toHaveBeenCalledWith(`Bundle bundle-three expects version ^99.0.0 of ipl-overlay-controls! The installed version is ${version}.`);
    });
});
