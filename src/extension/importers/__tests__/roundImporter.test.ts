import { MockNodecg } from '../../__mocks__/mockNodecg';

describe('roundImporter', () => {
    const mockGet = jest.fn();
    const mockHandleRoundData = jest.fn();
    let nodecg: MockNodecg;

    jest.mock('../roundDataHelper', () => ({
        __esModule: true,
        handleRoundData: mockHandleRoundData
    }));

    jest.mock('axios', () => ({
        get: mockGet,
    }));

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
        nodecg = new MockNodecg();
        nodecg.init();

        require('../roundImporter');
    });

    describe('getRound', () => {
        it('fetches data from the given URL and normalizes it', async () => {
            nodecg.replicants.roundStore.value = { oldroundoldround: { name: 'Old Round' } };
            mockHandleRoundData.mockReturnValue({ newroundnewround: { name: 'New Round' } });
            mockGet.mockResolvedValue([]);
            const ack = jest.fn();

            await nodecg.messageListeners.getRounds({ url: 'tournament://data/' }, ack);

            expect(nodecg.replicants.roundStore.value).toEqual({
                newroundnewround: { name: 'New Round' }
            });
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
});
