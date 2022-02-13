import { mock } from 'jest-mock-extended';
import { messageListeners, replicants } from '../../__mocks__/mockNodecg';
import { RuntimeConfig } from '../../../types/schemas';
import { GameVersion } from '../../../types/enums/gameVersion';
import type * as RoundStoreHelper from '../../helpers/roundStoreHelper';
import type * as MatchStoreHelper from '../../helpers/matchStoreHelper';
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

describe('runtimeConfig', () => {
    require('../runtimeConfig');

    describe('setGameVersion', () => {
        it('does nothing if new version is same as current version', () => {
            const ack = jest.fn();
            replicants.runtimeConfig = { gameVersion: 'SPLATOON_2' };

            messageListeners.setGameVersion({ version: 'SPLATOON_2' }, ack);

            expect(mockRoundStoreHelper.resetRoundStore).not.toHaveBeenCalled();
            expect(mockMatchStoreHelper.resetMatchStore).not.toHaveBeenCalled();
            expect(ack).toHaveBeenCalledWith(null);
        });

        it('updates config and resets matches and rounds', () => {
            const ack = jest.fn();
            replicants.runtimeConfig = { gameVersion: GameVersion.SPLATOON_3 };

            messageListeners.setGameVersion({ version: GameVersion.SPLATOON_2 }, ack);

            expect((replicants.runtimeConfig as RuntimeConfig).gameVersion).toEqual('SPLATOON_2');
            expect(mockRoundStoreHelper.resetRoundStore).toHaveBeenCalledTimes(1);
            expect(mockMatchStoreHelper.resetMatchStore).toHaveBeenCalledWith(true);
            expect(ack).toHaveBeenCalledWith(null, {
                incompatibleBundles: [ 'bundle-two' ]
            });
        });
    });
});
