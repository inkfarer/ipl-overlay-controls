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
        const mockUpdateTeamDataReplicants = jest.fn();
        const mockGetBattlefyTournamentData = jest.fn();
        const mockGetSmashggData = jest.fn();
        const mockGetSmashggEvents = jest.fn();
        const mockGet = jest.fn();
        const mockHandleRawData = jest.fn();
        const mockRadiaClient = {
            __esModule: true,
            updateTournamentData: jest.fn()
        };
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
            getSmashGGData: mockGetSmashggData,
            getSmashGGEvents: mockGetSmashggEvents
        }));

        jest.mock('../clients/radiaClient', () => mockRadiaClient);

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
                nodecg.replicants.radiaSettings.value = { updateOnImport: false };
                const ack = jest.fn();
                const serviceResult = { meta: { id: 'bfytourney' } };
                mockGetBattlefyTournamentData.mockResolvedValue(serviceResult);

                await nodecg.messageListeners.getTournamentData(
                    { id: 'bfytourney', method: TournamentDataSource.BATTLEFY }, ack);

                expect(mockUpdateTeamDataReplicants).toHaveBeenCalledWith(serviceResult);
                expect(ack).toHaveBeenCalledWith(null, { id: 'bfytourney' });
                expect(mockGetBattlefyTournamentData).toHaveBeenCalledWith('bfytourney');
                expect(mockRadiaClient.updateTournamentData).not.toHaveBeenCalled();
            });

            it('updates radia api data if enabled and importing from battlefy', async () => {
                nodecg.replicants.radiaSettings.value = { updateOnImport: true, guildID: '123123345' };
                const ack = jest.fn();
                const serviceResult = { meta: { id: 'bfytourney', name: 'Battlefy Tournament', url: 'bfy://tourney' } };
                mockGetBattlefyTournamentData.mockResolvedValue(serviceResult);

                await nodecg.messageListeners.getTournamentData(
                    { id: 'bfytourney', method: TournamentDataSource.BATTLEFY }, ack);

                expect(mockUpdateTeamDataReplicants).toHaveBeenCalledWith(serviceResult);
                expect(ack).toHaveBeenCalledWith(null, { id: 'bfytourney' });
                expect(mockGetBattlefyTournamentData).toHaveBeenCalledWith('bfytourney');
                expect(mockRadiaClient.updateTournamentData)
                    .toHaveBeenCalledWith('123123345', 'bfy://tourney', 'Battlefy Tournament');
            });

            it('does not update radia api data if guild id is unset', async () => {
                nodecg.replicants.radiaSettings.value = { updateOnImport: true, guildID: '' };
                mockGetBattlefyTournamentData.mockResolvedValue({
                    meta: {
                        id: 'bfytourney', name: 'Battlefy Tournament', url: 'bfy://tourney'
                    }
                });

                await nodecg.messageListeners.getTournamentData(
                    { id: 'bfytourney', method: TournamentDataSource.BATTLEFY }, jest.fn());

                expect(mockRadiaClient.updateTournamentData).not.toHaveBeenCalled();
            });

            it('imports tournament data from Smash.gg if one event is returned', async () => {
                nodecg.replicants.radiaSettings.value = { updateOnImport: false };
                const ack = jest.fn();
                const serviceResult = { meta: { id: 'smashggtourney' } };
                mockGetSmashggEvents.mockResolvedValue([{ id: 123123 }]);
                mockGetSmashggData.mockResolvedValue(serviceResult);

                await nodecg.messageListeners.getTournamentData(
                    { id: '123123123', method: TournamentDataSource.SMASHGG }, ack);

                expect(mockGetSmashggEvents).toHaveBeenCalledWith('123123123', '190487208572340');
                expect(mockGetSmashggData).toHaveBeenCalledWith(123123, '190487208572340');
                expect(mockUpdateTeamDataReplicants).toHaveBeenCalledWith(serviceResult);
                expect(ack).toHaveBeenCalledWith(null, { id: '123123123' });
                expect(mockRadiaClient.updateTournamentData).not.toHaveBeenCalled();
            });

            it('returns list of events if multiple events are found', async () => {
                nodecg.replicants.radiaSettings.value = { updateOnImport: false };
                const ack = jest.fn();
                const serviceResult = { meta: { id: 'smashggtourney' } };
                mockGetSmashggEvents.mockResolvedValue([{ id: 123123 }, { id: 456456 }]);
                mockGetSmashggData.mockResolvedValue(serviceResult);

                await nodecg.messageListeners.getTournamentData(
                    { id: '123123123', method: TournamentDataSource.SMASHGG }, ack);

                expect(mockGetSmashggEvents).toHaveBeenCalledWith('123123123', '190487208572340');
                expect(mockGetSmashggData).not.toHaveBeenCalled();
                expect(mockUpdateTeamDataReplicants).not.toHaveBeenCalled();
                expect(ack).toHaveBeenCalledWith(null, { id: '123123123', events: [{ id: 123123 }, { id: 456456 }]});
                expect(mockRadiaClient.updateTournamentData).not.toHaveBeenCalled();
            });

            it('updates radia api data if enabled and importing from smash.gg', async () => {
                nodecg.replicants.radiaSettings.value = { updateOnImport: true, guildID: '123345123' };
                const ack = jest.fn();
                const serviceResult = { meta: { id: 'smashggtourney', url: 'smashgg://tour', name: 'Smash.gg Tour' } };
                mockGetSmashggEvents.mockResolvedValue([{ id: 123123 }]);
                mockGetSmashggData.mockResolvedValue(serviceResult);

                await nodecg.messageListeners.getTournamentData(
                    { id: '123123123', method: TournamentDataSource.SMASHGG }, ack);

                expect(mockGetSmashggEvents).toHaveBeenCalledWith('123123123', '190487208572340');
                expect(mockGetSmashggData).toHaveBeenCalledWith(123123, '190487208572340');
                expect(mockUpdateTeamDataReplicants).toHaveBeenCalledWith(serviceResult);
                expect(ack).toHaveBeenCalledWith(null, { id: '123123123' });
                expect(mockRadiaClient.updateTournamentData)
                    .toHaveBeenCalledWith('123345123', 'smashgg://tour', 'Smash.gg Tour');
            });

            it('imports tournament data from URL', async () => {
                const ack = jest.fn();
                const serviceResult = { meta: { id: 'tourney://cool-tournament' } };
                mockGet.mockResolvedValue({ status: 200, data: { tournament: 'cool tournament' } });
                mockHandleRawData.mockResolvedValue(serviceResult);

                await nodecg.messageListeners.getTournamentData(
                    { id: 'tourney://cool-tournament', method: TournamentDataSource.UPLOAD }, ack);

                expect(mockUpdateTeamDataReplicants).toHaveBeenCalledWith(serviceResult);
                expect(ack).toHaveBeenCalledWith(null, { id: 'tourney://cool-tournament' });
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

        describe('getSmashggEvent', () => {
            it('fetches event data and updates radia api data', async () => {
                nodecg.replicants.radiaSettings.value = { updateOnImport: true, guildID: '028450375' };
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
                expect(mockUpdateTeamDataReplicants).toHaveBeenCalledWith(tournamentData);
                expect(ack).toHaveBeenCalledWith(null, 123123);
                expect(mockRadiaClient.updateTournamentData)
                    .toHaveBeenCalledWith('028450375', 'smashgg://cto', 'Cool Tourney');
            });
        });
    });
});
