import { MockNodecg } from '../../__mocks__/mockNodecg';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';

jest.mock('../clients/battlefyClient');
jest.mock('../tournamentDataHelper');

describe('tournamentImporter', () => {
    describe('getTournamentData', () => {
        describe('missing bundle configuration', () => {
            let nodecg: MockNodecg;

            beforeEach(() => {
                jest.resetAllMocks();
                jest.resetModules();
                nodecg = new MockNodecg({ });
                nodecg.init();

                require('../tournamentImporter');
            });

            it('acknowledges with error when trying to import smash.gg data', async () => {
                const ack = jest.fn();

                await nodecg.messageListeners.getTournamentData(
                    { id: 'tourney', method: TournamentDataSource.SMASHGG }, ack);

                expect(ack).toHaveBeenCalledWith(new Error('No smash.gg token provided.'));
            });
        });

        describe('with bundle configuration', () => {
            const mockUpdateTeamDataReplicants = jest.fn();
            const mockGetBattlefyTournamentData = jest.fn();
            const mockGetSmashggData = jest.fn();
            const mockGet = jest.fn();
            const mockHandleRawData = jest.fn();
            let nodecg: MockNodecg;

            jest.mock('../tournamentDataHelper', () => ({
                __esModule: true,
                updateTeamDataReplicants: mockUpdateTeamDataReplicants,
                handleRawData: mockHandleRawData
            }));

            jest.mock('../clients/battlefyClient', () => ({
                __esModule: true,
                getBattlefyTournamentData: mockGetBattlefyTournamentData
            }));

            jest.mock('../clients/smashggClient', () => ({
                __esModule: true,
                getSmashGGData: mockGetSmashggData
            }));

            jest.mock('axios', () => ({
                get: mockGet,
            }));

            beforeEach(() => {
                jest.resetAllMocks();
                jest.resetModules();
                nodecg = new MockNodecg({
                    smashgg: {
                        apiKey: '190487208572340'
                    }
                });
                nodecg.init();

                require('../tournamentImporter');
            });

            it('imports tournament data from Battlefy', async () => {
                const ack = jest.fn();
                const serviceResult = { meta: { id: 'bfytourney' } };
                mockGetBattlefyTournamentData.mockResolvedValue(serviceResult);

                await nodecg.messageListeners.getTournamentData(
                    { id: 'bfytourney', method: TournamentDataSource.BATTLEFY }, ack);

                expect(mockUpdateTeamDataReplicants).toHaveBeenCalledWith(serviceResult);
                expect(ack).toHaveBeenCalledWith(null, 'bfytourney');
                expect(mockGetBattlefyTournamentData).toHaveBeenCalledWith('bfytourney');
            });

            it('imports tournament data from Smash.gg', async () => {
                const ack = jest.fn();
                const serviceResult = { meta: { id: 'smashggtourney' } };
                mockGetSmashggData.mockResolvedValue(serviceResult);

                await nodecg.messageListeners.getTournamentData(
                    { id: 'smashggtourney', method: TournamentDataSource.SMASHGG }, ack);

                expect(mockUpdateTeamDataReplicants).toHaveBeenCalledWith(serviceResult);
                expect(ack).toHaveBeenCalledWith(null, 'smashggtourney');
                expect(mockGetSmashggData).toHaveBeenCalledWith('smashggtourney', '190487208572340');
            });

            it('imports tournament data from URL', async () => {
                const ack = jest.fn();
                const serviceResult = { meta: { id: 'tourney://cool-tournament' } };
                mockGet.mockResolvedValue({ status: 200, data: { tournament: 'cool tournament' } });
                mockHandleRawData.mockResolvedValue(serviceResult);

                await nodecg.messageListeners.getTournamentData(
                    { id: 'tourney://cool-tournament', method: TournamentDataSource.UPLOAD }, ack);

                expect(mockUpdateTeamDataReplicants).toHaveBeenCalledWith(serviceResult);
                expect(ack).toHaveBeenCalledWith(null, 'tourney://cool-tournament');
                expect(mockGet).toHaveBeenCalledWith('tourney://cool-tournament');
            });

            it('acknowledges with error if URL returns a bad response', async () => {
                const ack = jest.fn();
                const serviceResult = { meta: { id: 'tourney://uncool-tournament' } };
                mockGet.mockResolvedValue({ status: 401 });
                mockHandleRawData.mockResolvedValue(serviceResult);

                await nodecg.messageListeners.getTournamentData(
                    { id: 'tourney://uncool-tournament', method: TournamentDataSource.UPLOAD }, ack);

                expect(ack).toHaveBeenCalledWith(
                    new Error('Got response code 401 from URL tourney://uncool-tournament'));
                expect(mockGet).toHaveBeenCalledWith('tourney://uncool-tournament');
            });
        });
    });
});
