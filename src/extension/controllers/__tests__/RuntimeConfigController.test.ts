import { mock } from 'jest-mock-extended';
import { GameVersion } from 'types/enums/gameVersion';
import type * as RoundStoreHelper from '../../helpers/roundStoreHelper';
import type * as MatchStoreHelper from '../../helpers/matchStoreHelper';
import { LocaleInfoService } from '../../services/LocaleInfoService';
import { mockNodecg, replicants } from '../../__mocks__/mockNodecg';
import { controllerListeners } from '../../__mocks__/MockBaseController';
import { Locale } from 'types/enums/Locale';
import { RuntimeConfig } from 'schemas';

const mockRoundStoreHelper = mock<typeof RoundStoreHelper>();
const mockMatchStoreHelper = mock<typeof MatchStoreHelper>();
jest.mock('../../helpers/roundStoreHelper', () => mockRoundStoreHelper);
jest.mock('../../helpers/matchStoreHelper', () => mockMatchStoreHelper);
jest.mock('../../helpers/bundleHelper', () => ({
    __esModule: true,
    dependentBundles: [
        {
            name: 'bundle-one',
            compatibleGameVersions: [GameVersion.SPLATOON_2]
        },
        {
            name: 'bundle-two',
            compatibleGameVersions: [GameVersion.SPLATOON_3]
        },
        {
            name: 'bundle-three',
            compatibleGameVersions: [GameVersion.SPLATOON_3, GameVersion.SPLATOON_2]
        }
    ]
}));

import { RuntimeConfigController } from '../RuntimeConfigController';
import { AssetPathService } from '../../services/AssetPathService';

describe('RuntimeConfigController', () => {
    let localeInfoService: LocaleInfoService;
    let assetPathService: AssetPathService;

    beforeEach(() => {
        localeInfoService = mock<LocaleInfoService>();
        assetPathService = mock<AssetPathService>();
        new RuntimeConfigController(mockNodecg, localeInfoService, assetPathService);
    });

    describe('setGameVersion', () => {
        it('does nothing if new version is same as current version', () => {
            replicants.runtimeConfig = { gameVersion: 'SPLATOON_2' };

            const result = controllerListeners.setGameVersion({ version: 'SPLATOON_2' });

            expect(mockRoundStoreHelper.resetRoundStore).not.toHaveBeenCalled();
            expect(mockMatchStoreHelper.resetMatchStore).not.toHaveBeenCalled();
            expect(localeInfoService.updateLocaleInfo).not.toHaveBeenCalled();
            expect(assetPathService.updateAssetPaths).not.toHaveBeenCalled();
            expect(result).toEqual(null);
        });

        it('updates config and resets matches and rounds', () => {
            replicants.runtimeConfig = { gameVersion: GameVersion.SPLATOON_3, locale: Locale.DE };

            const result = controllerListeners.setGameVersion({ version: GameVersion.SPLATOON_2 });

            expect((replicants.runtimeConfig as RuntimeConfig).gameVersion).toEqual('SPLATOON_2');
            expect(mockRoundStoreHelper.resetRoundStore).toHaveBeenCalledTimes(1);
            expect(mockMatchStoreHelper.resetMatchStore).toHaveBeenCalledWith(true);
            expect(localeInfoService.updateLocaleInfo).toHaveBeenCalledWith(Locale.DE, GameVersion.SPLATOON_2);
            expect(assetPathService.updateAssetPaths).toHaveBeenCalledWith(GameVersion.SPLATOON_2);
            expect(result).toEqual({
                incompatibleBundles: [ 'bundle-two' ]
            });
        });
    });

    describe('setLocale', () => {
        it('updates replicant data and locale info', () => {
            replicants.runtimeConfig = { locale: Locale.EN, gameVersion: GameVersion.SPLATOON_2 };

            controllerListeners.setLocale(Locale.DE);

            expect(replicants.runtimeConfig).toEqual({ locale: Locale.DE, gameVersion: GameVersion.SPLATOON_2 });
            expect(localeInfoService.updateLocaleInfo).toHaveBeenCalledWith(Locale.DE, GameVersion.SPLATOON_2);
        });
    });
});
