import { MockNodecg } from '../../__mocks__/mockNodecg';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';

describe('tournamentImporter', () => {
    describe('missing bundle configuration', () => {
        let nodecg: MockNodecg;

        beforeEach(() => {
            jest.resetAllMocks();
            jest.resetModules();
            nodecg = new MockNodecg({ });
            nodecg.init();

            require('../tournamentImporter');
        });

        describe('getTournamentData', () => {
            it('acknowledges with error when trying to import smash.gg data', async () => {
                const ack = jest.fn();

                await nodecg.messageListeners.getTournamentData(
                    { id: 'tourney', method: TournamentDataSource.SMASHGG }, ack);

                expect(ack).toHaveBeenCalledWith(new Error('No smash.gg token provided.'));
            });
        });
    });

    describe('with bundle configuration', () => {
        const mockUpdateTournamentDataReplicants = jest.fn();
        const mockGetBattlefyTournamentData = jest.fn();
        const mockGetSmashggData = jest.fn();
        const mockGetSmashggEvents = jest.fn();
        const mockGet = jest.fn();
        const mockParseUploadedTeamData = jest.fn();
        let nodecg: MockNodecg;

        jest.mock('../tournamentDataHelper', () => ({
            __esModule: true,
            updateTournamentDataReplicants: mockUpdateTournamentDataReplicants,
            parseUploadedTeamData: mockParseUploadedTeamData
        }));

        jest.mock('../clients/battlefyClient', () => ({
            __esModule: true,
            getBattlefyTournamentData: mockGetBattlefyTournamentData
        }));

        jest.mock('../clients/smashggClient', () => ({
            __esModule: true,
            getSmashGGData: mockGetSmashggData,
            getSmashGGEvents: mockGetSmashggEvents
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

        describe('getTournamentData', () => {
            it('imports tournament data from Battlefy', async () => {
                const ack = jest.fn();
                const serviceResult = { meta: { id: 'bfytourney' } };
                mockGetBattlefyTournamentData.mockResolvedValue(serviceResult);

                await nodecg.messageListeners.getTournamentData(
                    { id: 'bfytourney', method: TournamentDataSource.BATTLEFY }, ack);

                expect(mockUpdateTournamentDataReplicants).toHaveBeenCalledWith(serviceResult);
                expect(ack).toHaveBeenCalledWith(null, { id: 'bfytourney' });
                expect(mockGetBattlefyTournamentData).toHaveBeenCalledWith('bfytourney');
            });

            it('imports tournament data from Smash.gg if one event is returned', async () => {
                const ack = jest.fn();
                const serviceResult = { meta: { id: 'smashggtourney' } };
                mockGetSmashggEvents.mockResolvedValue([{ id: 123123 }]);
                mockGetSmashggData.mockResolvedValue(serviceResult);

                await nodecg.messageListeners.getTournamentData(
                    { id: '123123123', method: TournamentDataSource.SMASHGG }, ack);

                expect(mockGetSmashggEvents).toHaveBeenCalledWith('123123123', '190487208572340');
                expect(mockGetSmashggData).toHaveBeenCalledWith(123123, '190487208572340');
                expect(mockUpdateTournamentDataReplicants).toHaveBeenCalledWith(serviceResult);
                expect(ack).toHaveBeenCalledWith(null, { id: '123123123' });
            });

            it('returns list of events if multiple events are found', async () => {
                const ack = jest.fn();
                const serviceResult = { meta: { id: 'smashggtourney' } };
                mockGetSmashggEvents.mockResolvedValue([{ id: 123123 }, { id: 456456 }]);
                mockGetSmashggData.mockResolvedValue(serviceResult);

                await nodecg.messageListeners.getTournamentData(
                    { id: '123123123', method: TournamentDataSource.SMASHGG }, ack);

                expect(mockGetSmashggEvents).toHaveBeenCalledWith('123123123', '190487208572340');
                expect(mockGetSmashggData).not.toHaveBeenCalled();
                expect(mockUpdateTournamentDataReplicants).not.toHaveBeenCalled();
                expect(ack).toHaveBeenCalledWith(null, { id: '123123123', events: [{ id: 123123 }, { id: 456456 }]});
            });

            it('imports tournament data from URL', async () => {
                const ack = jest.fn();
                const serviceResult = { meta: { id: 'tourney://cool-tournament' } };
                mockGet.mockResolvedValue({ status: 200, data: { tournament: 'cool tournament' } });
                mockParseUploadedTeamData.mockResolvedValue(serviceResult);

                await nodecg.messageListeners.getTournamentData(
                    { id: 'tourney://cool-tournament', method: TournamentDataSource.UPLOAD }, ack);

                expect(mockUpdateTournamentDataReplicants).toHaveBeenCalledWith(serviceResult);
                expect(ack).toHaveBeenCalledWith(null, { id: 'tourney://cool-tournament' });
                expect(mockGet).toHaveBeenCalledWith('tourney://cool-tournament');
            });

            it('acknowledges with error if URL returns a bad response', async () => {
                const ack = jest.fn();
                const serviceResult = { meta: { id: 'tourney://uncool-tournament' } };
                mockGet.mockResolvedValue({ status: 401 });
                mockParseUploadedTeamData.mockResolvedValue(serviceResult);

                await nodecg.messageListeners.getTournamentData(
                    { id: 'tourney://uncool-tournament', method: TournamentDataSource.UPLOAD }, ack);

                expect(ack).toHaveBeenCalledWith(
                    new Error('Got response code 401 from URL tourney://uncool-tournament'));
                expect(mockGet).toHaveBeenCalledWith('tourney://uncool-tournament');
            });
        });

        describe('getSmashggEvent', () => {
            it('fetches event data and updates radia api data', async () => {
                const tournamentData = {
                    meta: {
                        id: 'cool-tournament',
                        url: 'smashgg://cto',
                        name: 'Cool Tourney'
                    }
                };
                mockGetSmashggData.mockResolvedValue(tournamentData);
                const ack = jest.fn();

                await nodecg.messageListeners.getSmashggEvent({ eventId: 123123 }, ack);

                expect(mockGetSmashggData).toHaveBeenCalledWith(123123, '190487208572340');
                expect(mockUpdateTournamentDataReplicants).toHaveBeenCalledWith(tournamentData);
                expect(ack).toHaveBeenCalledWith(null, 123123);
            });
        });
    });
});
