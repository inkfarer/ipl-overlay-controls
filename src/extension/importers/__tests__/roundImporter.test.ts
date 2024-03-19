import { messageListeners, replicants } from '../../__mocks__/mockNodecg';
import { RoundStore } from 'schemas';
import * as RoundDataHelper from '../roundDataHelper';
import * as NextRoundHelper from '../../helpers/nextRoundHelper';
import type * as RoundsFromMapsIplabs from '../roundFromMapsIplabs';
import { mock } from 'jest-mock-extended';
import axios from 'axios';

const mockRoundDataHelper = mock<typeof RoundDataHelper>();
const mockNextRoundHelper = mock<typeof NextRoundHelper>();
const mockAxios = mock<typeof axios>();
const mockRoundsFromMapsIplabs = mock<typeof RoundsFromMapsIplabs>();
jest.mock('../roundDataHelper', () => mockRoundDataHelper);
jest.mock('../../helpers/nextRoundHelper', () => mockNextRoundHelper);
jest.mock('../roundFromMapsIplabs', () => mockRoundsFromMapsIplabs);
jest.mock('axios', () => ({ __esModule: true, default: mockAxios }));

import { updateRounds } from '../roundImporter';
import { GameVersion } from '../../../types/enums/gameVersion';

describe('roundImporter', () => {
    beforeEach(() => {
        replicants.runtimeConfig = {
            gameVersion: GameVersion.SPLATOON_2
        };
    });

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
    });

    describe('getRounds', () => {
        it('fetches data from the given URL and normalizes it', async () => {
            replicants.roundStore = { oldroundoldround: { name: 'Old Round' } };
            // @ts-ignore
            mockRoundDataHelper.handleRoundData.mockReturnValue({ newroundnewround: { name: 'New Round' } });
            mockAxios.get.mockResolvedValue([]);
            const ack = jest.fn();

            await messageListeners.getRounds({ url: 'tournament://data/' }, ack);

            expect(ack).toHaveBeenCalledWith(null, 'tournament://data/');
            expect(replicants.roundStore).toEqual({
                newroundnewround: { name: 'New Round' }
            });
            expect(mockNextRoundHelper.setNextRoundGames).toHaveBeenCalledWith('newroundnewround');
        });

        it('imports from the IPL map generator', async () => {
            replicants.roundStore = { oldroundoldround: { name: 'Old Round' } };
            replicants.runtimeConfig = { gameVersion: GameVersion.SPLATOON_3 };
            // @ts-ignore
            mockRoundsFromMapsIplabs.importFromMapsIplabs.mockReturnValue({ newroundnewround: { name: 'New Round' } });
            const ack = jest.fn();

            await messageListeners.getRounds({ url: 'https://maps.iplabs.ink/?c=test&v=1' }, ack);

            expect(ack).toHaveBeenCalledWith(null, 'https://maps.iplabs.ink/?c=test&v=1');
            expect(replicants.roundStore).toEqual({
                newroundnewround: { name: 'New Round' }
            });
            expect(mockNextRoundHelper.setNextRoundGames).toHaveBeenCalledWith('newroundnewround');
        });

        it('does not import from the IPL map generator if using Splatoon 2 data', async () => {
            replicants.roundStore = { oldroundoldround: { name: 'Old Round' } };
            replicants.runtimeConfig = { gameVersion: GameVersion.SPLATOON_2 };
            const ack = jest.fn();

            await messageListeners.getRounds({ url: 'https://maps.iplabs.ink/?c=test&v=1' }, ack);

            expect(ack).toHaveBeenCalledWith(new Error('maps.iplabs.ink links only support Splatoon 3'));
            expect(replicants.roundStore).toEqual({ oldroundoldround: { name: 'Old Round' } });
        });

        it('acknowledges with error when missing arguments', async () => {
            const ack = jest.fn();

            await messageListeners.getRounds({ }, ack);

            expect(ack).toHaveBeenCalledWith(new Error('Missing arguments.'));
        });

        it('acknowledges with received errors', async () => {
            mockAxios.get.mockRejectedValue('Error');
            const ack = jest.fn();

            await messageListeners.getRounds({ url: 'tournament://data/' }, ack);

            expect(ack).toHaveBeenCalledWith('Error');
        });
    });

    describe('updateRounds', () => {
        it('updates round data and updates next round games', () => {
            const roundData = { roundone: 'Round One', roundtwo: 'Round Two' };

            updateRounds(roundData as unknown as RoundStore);

            expect(replicants.roundStore).toEqual(roundData);
            expect(mockNextRoundHelper.setNextRoundGames).toHaveBeenCalledWith('roundone');
        });
    });
});
