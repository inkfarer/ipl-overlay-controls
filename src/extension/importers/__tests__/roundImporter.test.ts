import { MockNodecg } from '../../__mocks__/mockNodecg';
import { Module } from '../../../helpers/__mocks__/module';

describe('roundImporter', () => {
    const mockGet = jest.fn();
    const mockHandleRoundData = jest.fn();
    let nodecg: MockNodecg;
    let importer: Module;

    jest.mock('../roundDataHelper', () => ({
        __esModule: true,
        handleRoundData: mockHandleRoundData
    }));

    jest.mock('axios', () => ({
        get: mockGet,
    }));

    const mockNextRoundHelper = {
        setNextRoundGames: jest.fn()
    };
    jest.mock('../../replicants/nextRoundHelper', () => mockNextRoundHelper);

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
        nodecg = new MockNodecg();
        nodecg.init();

        importer = require('../roundImporter');
    });

    describe('getRounds', () => {
        it('fetches data from the given URL and normalizes it', async () => {
            nodecg.replicants.roundStore.value = { oldroundoldround: { name: 'Old Round' } };
            mockHandleRoundData.mockReturnValue({ newroundnewround: { name: 'New Round' } });
            mockGet.mockResolvedValue([]);
            const ack = jest.fn();

            await nodecg.messageListeners.getRounds({ url: 'tournament://data/' }, ack);

            expect(nodecg.replicants.roundStore.value).toEqual({
                newroundnewround: { name: 'New Round' }
            });
            expect(mockNextRoundHelper.setNextRoundGames).toHaveBeenCalledWith('newroundnewround');
        });

        it('acknowledges with error when missing arguments', async () => {
            const ack = jest.fn();

            await nodecg.messageListeners.getRounds({ }, ack);

            expect(ack).toHaveBeenCalledWith(new Error('Missing arguments.'));
        });

        it('acknowledges with received errors', async () => {
            mockGet.mockRejectedValue('Error');
            const ack = jest.fn();

            await nodecg.messageListeners.getRounds({ url: 'tournament://data/' }, ack);

            expect(ack).toHaveBeenCalledWith('Error');
        });
    });

    describe('updateRounds', () => {
        it('updates round data and updates next round games', () => {
            const roundData = { roundone: 'Round One', roundtwo: 'Round Two' };

            importer.updateRounds(roundData);

            expect(nodecg.replicants.roundStore.value).toEqual(roundData);
            expect(mockNextRoundHelper.setNextRoundGames).toHaveBeenCalledWith('roundone');
        });
    });
});
