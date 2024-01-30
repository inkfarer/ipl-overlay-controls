import { messageListeners, mockBundleConfig, replicants } from '../../__mocks__/mockNodecg';
import { TournamentDataSource } from '../../../types/enums/tournamentDataSource';
import { mock } from 'jest-mock-extended';
import type * as TournamentDataHelper from '../tournamentDataHelper';
import type * as BattlefyClient from '../clients/battlefyClient';
import type * as SmashggClient from '../clients/smashggClient';
import { type SendouInkClient } from '../../clients/SendouInkClient';

const mockSendouInkClient = mock<SendouInkClient>();
const mockTournamentDataHelper = mock<typeof TournamentDataHelper>();
const mockBattlefyClient = mock<typeof BattlefyClient>();
const mockSmashggClient = mock<typeof SmashggClient>();
jest.mock('../tournamentDataHelper', () => mockTournamentDataHelper);
jest.mock('../clients/battlefyClient', () => mockBattlefyClient);
jest.mock('../clients/smashggClient', () => mockSmashggClient);
jest.mock('../../clients/SendouInkClient', () => ({ __esModule: true, SendouInkClientInstance: mockSendouInkClient }));

describe('tournamentRefresh', () => {
    require('../tournamentRefresh');

    describe('refreshTournamentData', () => {
        it.each([TournamentDataSource.UPLOAD, TournamentDataSource.UNKNOWN])('returns error when data source is %s', source => {
            const ack = jest.fn();
            replicants.tournamentData = { meta: { source } };

            messageListeners.refreshTournamentData(null, ack);

            expect(ack).toHaveBeenCalledWith(new Error(`Cannot refresh data from source '${source}'`));
        });

        it('returns error when refreshing smash.gg data with no API key present', () => {
            mockBundleConfig.smashgg.apiKey = null;
            const ack = jest.fn();
            replicants.tournamentData = { meta: { source: TournamentDataSource.SMASHGG } };

            messageListeners.refreshTournamentData(null, ack);

            expect(ack).toHaveBeenCalledWith(new Error('No smash.gg API key is configured.'));
        });

        it('updates battlefy tournament data', async () => {
            const ack = jest.fn();
            replicants.tournamentData = { meta: { source: TournamentDataSource.BATTLEFY, id: '123123' } };
            // @ts-ignore
            mockBattlefyClient.getBattlefyTournamentData.mockResolvedValue({ id: '123123' });

            await messageListeners.refreshTournamentData(null, ack);

            expect(ack).toHaveBeenCalledWith(null);
            expect(mockTournamentDataHelper.updateTournamentDataReplicants).toHaveBeenCalledWith({ id: '123123' });
            expect(mockBattlefyClient.getBattlefyTournamentData).toHaveBeenCalledWith('123123');
        });

        it('updates smash.gg tournament data', async () => {
            const ack = jest.fn();
            mockBundleConfig.smashgg.apiKey = 'apikeyapikey';
            replicants.tournamentData = {
                meta: {
                    source: TournamentDataSource.SMASHGG,
                    sourceSpecificData: {
                        smashgg: {
                            eventData: {
                                id: '234234'
                            }
                        }
                    }
                }
            };
            // @ts-ignore
            mockSmashggClient.getSmashGGData.mockResolvedValue({ id: '999999' });

            await messageListeners.refreshTournamentData(null, ack);

            expect(ack).toHaveBeenCalledWith(null);
            expect(mockTournamentDataHelper.updateTournamentDataReplicants).toHaveBeenCalledWith({ id: '999999' });
            expect(mockSmashggClient.getSmashGGData).toHaveBeenCalledWith('234234', 'apikeyapikey');
        });

        it('updates sendou.ink tournament data', async () => {
            const ack = jest.fn();
            replicants.tournamentData = {
                meta: {
                    source: TournamentDataSource.SENDOU_INK,
                    id: '123123'
                }
            };
            // @ts-ignore
            mockSendouInkClient.getTournamentData.mockResolvedValue({ id: '999999' });

            await messageListeners.refreshTournamentData(null, ack);

            expect(ack).toHaveBeenCalledWith(null);
            expect(mockTournamentDataHelper.updateTournamentDataReplicants).toHaveBeenCalledWith({ id: '999999' });
            expect(mockSendouInkClient.getTournamentData).toHaveBeenCalledWith('123123');
        });
    });
});
