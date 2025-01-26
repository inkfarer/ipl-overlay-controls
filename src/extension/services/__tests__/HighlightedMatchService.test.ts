import { mockBundleConfig, mockNodecg, replicants } from '../../__mocks__/mockNodecg';
import * as BattlefyClient from '../../importers/clients/battlefyClient';
import * as SmashggClient from '../../importers/clients/smashggClient';
import { mock } from 'jest-mock-extended';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';

const mockBattlefyClient = mock<typeof BattlefyClient>();
const mockSmashggClient = mock<typeof SmashggClient>();
jest.mock('../../importers/clients/battlefyClient', () => mockBattlefyClient);
jest.mock('../../importers/clients/smashggClient', () => mockSmashggClient);

import { HighlightedMatchService } from '../HighlightedMatchService';

describe('HighlightedMatchService', () => {
    let service: HighlightedMatchService;

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
        service = new HighlightedMatchService(mockNodecg);
    });

    describe('get', () => {
        describe('source: BATTLEFY', () => {
            it('throws error if arguments are missing', async () => {
                replicants.tournamentData = { meta: { source: TournamentDataSource.BATTLEFY } };

                await expect(service.get({ getAllMatches: false })).rejects.toThrow(new Error('translation:highlightedMatches.missingArguments'));
                expect(mockBattlefyClient.getBattlefyMatches).not.toHaveBeenCalled();
            });

            it('imports data from battlefy and sorts the result', async () => {
                replicants.tournamentData = { meta: { source: TournamentDataSource.BATTLEFY, id: '12345' } };
                const battlefyResult = [
                    { meta: { stageName: 'Stage 1', name: 'Round 1' } },
                    { meta: { stageName: 'Stage 2', name: 'Round 5' } },
                    { meta: { stageName: 'Stage 0', name: 'Round 2' } }
                ];
                // @ts-ignore
                mockBattlefyClient.getBattlefyMatches.mockResolvedValue(battlefyResult);

                await service.get({ stages: [ ], getAllMatches: true });

                expect(replicants.highlightedMatches).toEqual([
                    { meta: { stageName: 'Stage 0', name: 'Round 2' } },
                    { meta: { stageName: 'Stage 1', name: 'Round 1' } },
                    { meta: { stageName: 'Stage 2', name: 'Round 5' } },
                ]);
                expect(mockBattlefyClient.getBattlefyMatches).toHaveBeenCalledWith('12345', [], true);
            });
        });

        describe('source: SMASHGG', () => {
            describe('with bundle configuration', () => {
                it('throws error if arguments are missing', async () => {
                    replicants.tournamentData = { meta: { source: TournamentDataSource.SMASHGG } };

                    await expect(service.get({ getAllMatches: false })).rejects.toThrow(new Error('translation:highlightedMatches.missingArguments'));
                    expect(mockSmashggClient.getSmashGGStreamQueue).not.toHaveBeenCalled();
                });

                it('imports data from start.gg and sorts the result', async () => {
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
                    const result = [
                        { meta: { stageName: 'Stage 1', name: 'Round 1' } },
                        { meta: { stageName: 'Stage 2', name: 'Round 5' } },
                        { meta: { stageName: 'Stage 0', name: 'Round 2' } }
                    ];
                    // @ts-ignore
                    mockSmashggClient.getSmashGGStreamQueue.mockResolvedValue(result);

                    await service.get({ streamIDs: [ ], getAllMatches: true });

                    expect(replicants.highlightedMatches).toEqual([
                        { meta: { stageName: 'Stage 0', name: 'Round 2' } },
                        { meta: { stageName: 'Stage 1', name: 'Round 1' } },
                        { meta: { stageName: 'Stage 2', name: 'Round 5' } },
                    ]);
                    expect(mockSmashggClient.getSmashGGStreamQueue)
                        .toHaveBeenCalledWith('12345', 'smashggkey789', 123123123, [], true);
                });
            });

            it('throws error if no api key is present', async () => {
                mockBundleConfig.smashgg.apiKey = undefined;
                replicants.tournamentData = { meta: { source: TournamentDataSource.SMASHGG } };

                await expect(service.get({ getAllMatches: true })).rejects.toThrow(new Error('translation:common.missingStartggApiKey'));
            });
        });

        it.each([
            TournamentDataSource.UNKNOWN,
            TournamentDataSource.UPLOAD,
            TournamentDataSource.SENDOU_INK
        ])('throws error when using unsupported source %s', async (source) => {
            replicants.tournamentData = { meta: { source } };

            await expect(service.get({ stages: [ ], getAllMatches: false })).rejects.toThrow(new Error('translation:highlightedMatches.unsupportedSource'));
        });
    });
});
