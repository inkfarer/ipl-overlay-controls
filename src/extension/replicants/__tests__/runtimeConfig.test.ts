import { mock } from 'jest-mock-extended';
import { messageListeners, replicants } from '../../__mocks__/mockNodecg';
import type * as RoundStoreHelper from '../../helpers/roundStoreHelper';
import type * as MatchStoreHelper from '../../helpers/matchStoreHelper';
import { RuntimeConfig } from '../../../types/schemas';
const mockRoundStoreHelper = mock<typeof RoundStoreHelper>();
const mockMatchStoreHelper = mock<typeof MatchStoreHelper>();
jest.mock('../../helpers/roundStoreHelper', () => mockRoundStoreHelper);
jest.mock('../../helpers/matchStoreHelper', () => mockMatchStoreHelper);

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
            replicants.runtimeConfig = { gameVersion: 'SPLATOON_3' };

            messageListeners.setGameVersion({ version: 'SPLATOON_2' }, ack);

            expect((replicants.runtimeConfig as RuntimeConfig).gameVersion).toEqual('SPLATOON_2');
            expect(mockRoundStoreHelper.resetRoundStore).toHaveBeenCalledTimes(1);
            expect(mockMatchStoreHelper.resetMatchStore).toHaveBeenCalledTimes(1);
            expect(ack).toHaveBeenCalledWith(null);
        });
    });
});
