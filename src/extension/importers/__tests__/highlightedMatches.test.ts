import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { ImportStatus } from 'types/enums/importStatus';
import * as BattlefyClient from '../clients/battlefyClient';
import * as SmashggClient from '../clients/smashggClient';
import { mock } from 'jest-mock-extended';
import { messageListeners, mockBundleConfig, replicants } from '../../__mocks__/mockNodecg';

const mockBattlefyClient = mock<typeof BattlefyClient>();
const mockSmashggClient = mock<typeof SmashggClient>();
jest.mock('../clients/battlefyClient', () => mockBattlefyClient);
jest.mock('../clients/smashggClient', () => mockSmashggClient);

describe('highlightedMatches', () => {
    require('../highlightedMatches');

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
    });

    describe('getHighlightedMatches', () => {
        describe('source: BATTLEFY', () => {
            it('acknowledges with an error if arguments are missing', async () => {
                replicants.tournamentData = { meta: { source: TournamentDataSource.BATTLEFY } };
                const ack = jest.fn();

                await messageListeners.getHighlightedMatches({ }, ack);

                expect(ack).toHaveBeenCalledWith(new Error('Missing arguments.'));
                expect(mockBattlefyClient.getBattlefyMatches).not.toHaveBeenCalled();
            });

            it('imports data from battlefy and sorts the result', async () => {
                replicants.tournamentData = { meta: { source: TournamentDataSource.BATTLEFY, id: '12345' } };
                const ack = jest.fn();
                const battlefyResult = [
                    { meta: { stageName: 'Stage 1', name: 'Round 1' } },
                    { meta: { stageName: 'Stage 2', name: 'Round 5' } },
                    { meta: { stageName: 'Stage 0', name: 'Round 2' } }
                ];
                // @ts-ignore
                mockBattlefyClient.getBattlefyMatches.mockResolvedValue(battlefyResult);

                await messageListeners.getHighlightedMatches({ stages: [ ], getAllMatches: true }, ack);

                expect(ack).toHaveBeenCalledWith(null, { status: ImportStatus.SUCCESS, data: battlefyResult });
                expect(replicants.highlightedMatches).toEqual([
                    { meta: { stageName: 'Stage 0', name: 'Round 2' } },
                    { meta: { stageName: 'Stage 1', name: 'Round 1' } },
                    { meta: { stageName: 'Stage 2', name: 'Round 5' } },
                ]);
                expect(mockBattlefyClient.getBattlefyMatches).toHaveBeenCalledWith('12345', [], true);
            });

            it('acknowledges with "no data" response when no highlighted matches were found', async () => {
                replicants.tournamentData = { meta: { source: TournamentDataSource.BATTLEFY, id: '12345' } };
                const ack = jest.fn();
                mockBattlefyClient.getBattlefyMatches.mockResolvedValue([ ]);

                await messageListeners.getHighlightedMatches({ stages: [ ], getAllMatches: true }, ack);

                expect(ack).toHaveBeenCalledWith(null, { status: ImportStatus.NO_DATA, data: [ ]});
                expect(mockBattlefyClient.getBattlefyMatches).toHaveBeenCalledWith('12345', [], true);
            });
        });

        describe('source: SMASHGG', () => {
            describe('with bundle configuration', () => {
                it('acknowledges with an error if arguments are missing', async () => {
                    replicants.tournamentData = { meta: { source: TournamentDataSource.SMASHGG } };
                    const ack = jest.fn();

                    await messageListeners.getHighlightedMatches({ }, ack);

                    expect(ack).toHaveBeenCalledWith(new Error('Missing arguments.'));
                    expect(mockSmashggClient.getSmashGGStreamQueue).not.toHaveBeenCalled();
                });

                it('imports data from smash.gg and sorts the result', async () => {
                    replicants.tournamentData = {
                        meta: {
                            source: TournamentDataSource.SMASHGG,
                            id: '12345',
                            sourceSpecificData: {
                                smashgg: {
                                    eventData: {
                                        id: 123123123
                                    }
                                }
                            }
                        }
                    };
                    const ack = jest.fn();
                    const result = [
                        { meta: { stageName: 'Stage 1', name: 'Round 1' } },
                        { meta: { stageName: 'Stage 2', name: 'Round 5' } },
                        { meta: { stageName: 'Stage 0', name: 'Round 2' } }
                    ];
                    // @ts-ignore
                    mockSmashggClient.getSmashGGStreamQueue.mockResolvedValue(result);

                    await messageListeners.getHighlightedMatches({ streamIDs: [ ], getAllMatches: true }, ack);

                    expect(ack).toHaveBeenCalledWith(null, { status: ImportStatus.SUCCESS, data: result });
                    expect(replicants.highlightedMatches).toEqual([
                        { meta: { stageName: 'Stage 0', name: 'Round 2' } },
                        { meta: { stageName: 'Stage 1', name: 'Round 1' } },
                        { meta: { stageName: 'Stage 2', name: 'Round 5' } },
                    ]);
                    expect(mockSmashggClient.getSmashGGStreamQueue)
                        .toHaveBeenCalledWith('12345', 'smashggkey789', 123123123, [], true);
                });

                it('acknowledges with "no data" response when no highlighted matches were found', async () => {
                    replicants.tournamentData = {
                        meta: {
                            source: TournamentDataSource.SMASHGG,
                            id: '12345',
                            sourceSpecificData: {
                                smashgg: {
                                    eventData: {
                                        id: 123123123
                                    }
                                }
                            }
                        }
                    };
                    const ack = jest.fn();
                    mockSmashggClient.getSmashGGStreamQueue.mockResolvedValue([ ]);

                    await messageListeners.getHighlightedMatches({ streamIDs: [], getAllMatches: true }, ack);

                    expect(ack).toHaveBeenCalledWith(null, { status: ImportStatus.NO_DATA, data: [ ]});
                    expect(mockSmashggClient.getSmashGGStreamQueue)
                        .toHaveBeenCalledWith('12345', 'smashggkey789', 123123123, [], true);
                });
            });

            it('acknowledges with error if no api key is present', async () => {
                mockBundleConfig.smashgg.apiKey = undefined;
                replicants.tournamentData = { meta: { source: TournamentDataSource.SMASHGG } };
                const ack = jest.fn();

                await messageListeners.getHighlightedMatches({ }, ack);

                expect(ack).toHaveBeenCalledWith(new Error('No Smash.gg API key found.'));
            });
        });

        it('acknowledges with an error if importing predictions is not supported', () => {
            replicants.tournamentData = { meta: { source: TournamentDataSource.UPLOAD } };
            const ack = jest.fn();

            messageListeners.getHighlightedMatches({ stages: [ ], getAllStages: false }, ack);

            expect(ack).toHaveBeenCalledWith(new Error('Invalid source \'UPLOAD\' given.'));
        });
    });
});
