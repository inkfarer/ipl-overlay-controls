import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { messageListeners, mockBundleConfig } from '../../__mocks__/mockNodecg';
import { mock } from 'jest-mock-extended';
import type * as TournamentDataHelper from '../tournamentDataHelper';
import type * as BattlefyClient from '../clients/battlefyClient';
import type * as SmashggClient from '../clients/smashggClient';
import type axios from 'axios';

const mockAxios = mock<typeof axios>();
const mockTournamentDataHelper = mock<typeof TournamentDataHelper>();
const mockBattlefyClient = mock<typeof BattlefyClient>();
const mockSmashggClient = mock<typeof SmashggClient>();
jest.mock('axios', () => ({ __esModule: true, default: mockAxios }));
jest.mock('../tournamentDataHelper', () => mockTournamentDataHelper);
jest.mock('../clients/battlefyClient', () => mockBattlefyClient);
jest.mock('../clients/smashggClient', () => mockSmashggClient);

describe('tournamentImporter', () => {
    require('../tournamentImporter');

    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('missing bundle configuration', () => {
        describe('getTournamentData', () => {
            it('acknowledges with error when trying to import smash.gg data', async () => {
                mockBundleConfig.smashgg = {};
                const ack = jest.fn();

                await messageListeners.getTournamentData(
                    { id: 'tourney', method: TournamentDataSource.SMASHGG }, ack);

                expect(ack).toHaveBeenCalledWith(new Error('No smash.gg token provided.'));
            });
        });
    });

    describe('with bundle configuration', () => {
        describe('getTournamentData', () => {
            it('imports tournament data from Battlefy', async () => {
                const ack = jest.fn();
                const serviceResult = { meta: { id: 'bfytourney' } };
                // @ts-ignore
                mockBattlefyClient.getBattlefyTournamentData.mockResolvedValue(serviceResult);

                await messageListeners.getTournamentData(
                    { id: 'bfytourney', method: TournamentDataSource.BATTLEFY }, ack);

                expect(mockTournamentDataHelper.updateTournamentDataReplicants).toHaveBeenCalledWith(serviceResult);
                expect(ack).toHaveBeenCalledWith(null, { id: 'bfytourney' });
                expect(mockBattlefyClient.getBattlefyTournamentData).toHaveBeenCalledWith('bfytourney');
            });

            it('imports tournament data from Smash.gg if one event is returned', async () => {
                const ack = jest.fn();
                const serviceResult = { meta: { id: 'smashggtourney' } };
                // @ts-ignore
                mockSmashggClient.getSmashGGEvents.mockResolvedValue([{ id: 123123 }]);
                // @ts-ignore
                mockSmashggClient.getSmashGGData.mockResolvedValue(serviceResult);

                await messageListeners.getTournamentData(
                    { id: '123123123', method: TournamentDataSource.SMASHGG }, ack);

                expect(mockSmashggClient.getSmashGGEvents).toHaveBeenCalledWith('123123123', 'smashggkey789');
                expect(mockSmashggClient.getSmashGGData).toHaveBeenCalledWith(123123, 'smashggkey789');
                expect(mockTournamentDataHelper.updateTournamentDataReplicants).toHaveBeenCalledWith(serviceResult);
                expect(ack).toHaveBeenCalledWith(null, { id: '123123123' });
            });

            it('returns list of events if multiple events are found', async () => {
                const ack = jest.fn();
                const serviceResult = { meta: { id: 'smashggtourney' } };
                // @ts-ignore
                mockSmashggClient.getSmashGGEvents.mockResolvedValue([{ id: 123123 }, { id: 456456 }]);
                // @ts-ignore
                mockSmashggClient.getSmashGGData.mockResolvedValue(serviceResult);

                await messageListeners.getTournamentData(
                    { id: '123123123', method: TournamentDataSource.SMASHGG }, ack);

                expect(mockSmashggClient.getSmashGGEvents).toHaveBeenCalledWith('123123123', 'smashggkey789');
                expect(mockSmashggClient.getSmashGGData).not.toHaveBeenCalled();
                expect(mockTournamentDataHelper.updateTournamentDataReplicants).not.toHaveBeenCalled();
                expect(ack).toHaveBeenCalledWith(null, { id: '123123123', events: [{ id: 123123 }, { id: 456456 }]});
            });

            it('imports tournament data from URL', async () => {
                const ack = jest.fn();
                const serviceResult = { meta: { id: 'tourney://cool-tournament' } };
                mockAxios.get.mockResolvedValue({ status: 200, data: { tournament: 'cool tournament' } });
                // @ts-ignore
                mockTournamentDataHelper.parseUploadedTeamData.mockResolvedValue(serviceResult);

                await messageListeners.getTournamentData(
                    { id: 'tourney://cool-tournament', method: TournamentDataSource.UPLOAD }, ack);

                expect(mockTournamentDataHelper.updateTournamentDataReplicants).toHaveBeenCalledWith(serviceResult);
                expect(ack).toHaveBeenCalledWith(null, { id: 'tourney://cool-tournament' });
                expect(mockAxios.get).toHaveBeenCalledWith('tourney://cool-tournament');
            });

            it('acknowledges with error if URL returns a bad response', async () => {
                const ack = jest.fn();
                const serviceResult = { meta: { id: 'tourney://uncool-tournament' } };
                mockAxios.get.mockResolvedValue({ status: 401 });
                // @ts-ignore
                mockTournamentDataHelper.parseUploadedTeamData.mockResolvedValue(serviceResult);

                await messageListeners.getTournamentData(
                    { id: 'tourney://uncool-tournament', method: TournamentDataSource.UPLOAD }, ack);

                expect(ack).toHaveBeenCalledWith(
                    new Error('Got response code 401 from URL tourney://uncool-tournament'));
                expect(mockAxios.get).toHaveBeenCalledWith('tourney://uncool-tournament');
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
                // @ts-ignore
                mockSmashggClient.getSmashGGData.mockResolvedValue(tournamentData);
                const ack = jest.fn();

                await messageListeners.getSmashggEvent({ eventId: 123123 }, ack);

                expect(mockSmashggClient.getSmashGGData).toHaveBeenCalledWith(123123, 'smashggkey789');
                expect(mockTournamentDataHelper.updateTournamentDataReplicants).toHaveBeenCalledWith(tournamentData);
                expect(ack).toHaveBeenCalledWith(null, 123123);
            });
        });
    });
});
