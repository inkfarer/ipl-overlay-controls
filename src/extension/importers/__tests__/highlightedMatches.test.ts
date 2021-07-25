import { MockNodecg } from '../../__mocks__/mockNodecg';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { ImportStatus } from 'types/enums/importStatus';

describe('highlightedMatches', () => {
    const mockGetBattlefyMatches = jest.fn();
    let nodecg: MockNodecg;

    jest.mock('../clients/battlefyClient', () => ({
        __esModule: true,
        getBattlefyMatches: mockGetBattlefyMatches
    }));

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
        nodecg = new MockNodecg();
        nodecg.init();

        require('../highlightedMatches');
    });

    describe('getHighlightedMatches', () => {
        it('acknowledges with an error if arguments are missing', () => {
            const ack = jest.fn();

            nodecg.messageListeners.getHighlightedMatches({ }, ack);

            expect(ack).toHaveBeenCalledWith(new Error('Missing arguments.'));
        });

        it('acknowledges with an error if importing predictions is not supported', () => {
            nodecg.replicants.tournamentData.value = { meta: { source: TournamentDataSource.UPLOAD } };
            const ack = jest.fn();

            nodecg.messageListeners.getHighlightedMatches({ stages: [ ], getAllStages: false }, ack);

            expect(ack).toHaveBeenCalledWith(new Error('Invalid source \'UPLOAD\' given.'));
        });

        it('imports data from battlefy and sorts the result', async () => {
            nodecg.replicants.tournamentData.value = { meta: { source: TournamentDataSource.BATTLEFY, id: '12345' } };
            const ack = jest.fn();
            const battlefyResult = [
                { meta: { stageName: 'Stage 1', name: 'Round 1' } },
                { meta: { stageName: 'Stage 2', name: 'Round 5' } },
                { meta: { stageName: 'Stage 0', name: 'Round 2' } }
            ];
            mockGetBattlefyMatches.mockResolvedValue(battlefyResult);

            await nodecg.messageListeners.getHighlightedMatches({ stages: [ ], getAllStages: true }, ack);

            expect(ack).toHaveBeenCalledWith(null, { status: ImportStatus.SUCCESS, data: battlefyResult });
            expect(nodecg.replicants.highlightedMatches.value).toEqual([
                { meta: { stageName: 'Stage 0', name: 'Round 2' } },
                { meta: { stageName: 'Stage 1', name: 'Round 1' } },
                { meta: { stageName: 'Stage 2', name: 'Round 5' } },
            ]);
        });

        it('acknowledges with "no data" response when no highlighted matches were found', async () => {
            nodecg.replicants.tournamentData.value = { meta: { source: TournamentDataSource.BATTLEFY, id: '12345' } };
            const ack = jest.fn();
            mockGetBattlefyMatches.mockResolvedValue([ ]);

            await nodecg.messageListeners.getHighlightedMatches({ stages: [ ], getAllStages: true }, ack);

            expect(ack).toHaveBeenCalledWith(null, { status: ImportStatus.NO_DATA, data: [ ]});
        });
    });
});
