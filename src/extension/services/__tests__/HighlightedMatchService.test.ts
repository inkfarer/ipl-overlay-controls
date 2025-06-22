import { mockBundleConfig, mockNodecg, replicants } from '../../__mocks__/mockNodecg';
import * as BattlefyClient from '../../importers/clients/battlefyClient';
import * as SmashggClient from '../../importers/clients/smashggClient';
import { mock } from 'jest-mock-extended';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import type { SendouInkClient } from '../../clients/SendouInkClient';

const mockSendouInkClient = mock<SendouInkClient>();
const mockBattlefyClient = mock<typeof BattlefyClient>();
const mockSmashggClient = mock<typeof SmashggClient>();
jest.mock('../../importers/clients/battlefyClient', () => mockBattlefyClient);
jest.mock('../../importers/clients/smashggClient', () => mockSmashggClient);
jest.mock('../../clients/SendouInkClient', () => ({ __esModule: true, SendouInkClientInstance: mockSendouInkClient }));

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

        describe('source: SENDOU_INK', () => {
            it('imports matches from sendou.ink', async () => {
                replicants.tournamentData = {
                    meta: { source: TournamentDataSource.SENDOU_INK, id: '99999' },
                    teams: [
                        { id: '11', name: 'Test Team 1' },
                        { id: '22', name: 'Test Team 2' },
                        { id: '33', name: 'Test Team 3' },
                        { id: '44', name: 'Test Team 4' }
                    ]
                };
                mockSendouInkClient.getCastedMatches.mockResolvedValue({
                    current: [
                        {
                            matchId: 111,
                            channel: {
                                type: 'TWITCH',
                                channelId: 'iplsplatoon'
                            }
                        },
                        {
                            matchId: 222,
                            channel: {
                                type: 'TWITCH',
                                channelId: 'iplsplatoon'
                            }
                        }
                    ],
                    future: [
                        {
                            matchId: 333,
                            channel: {
                                type: 'TWITCH',
                                channelId: 'iplsplatoon'
                            }
                        },
                        {
                            matchId: 444,
                            channel: null
                        }
                    ]
                });
                mockSendouInkClient.getMatch
                    .mockResolvedValueOnce({
                        teamOne: {
                            id: 11,
                            score: 0
                        },
                        teamTwo: {
                            id: 22,
                            score: 1
                        },
                        url: 'mock-sendou-ink://test-match-one',
                        mapList: [
                            {
                                map: {
                                    mode: 'SZ',
                                    stage: {
                                        id: 19,
                                        name: 'Shipshape Cargo Co.'
                                    }
                                },
                                participatedUserIds: [1, 2, 3],
                                winnerTeamId: 22,
                                source: 'TO'
                            },
                            {
                                map: {
                                    mode: 'SZ',
                                    stage: {
                                        id: 10,
                                        name: 'MakoMart'
                                    }
                                },
                                participatedUserIds: [1, 2, 3],
                                winnerTeamId: null,
                                source: 'COUNTERPICK'
                            }
                        ],
                        bracketName: 'Test Bracket',
                        roundName: 'Round One'
                    })
                    .mockResolvedValueOnce({
                        teamOne: {
                            id: 22,
                            score: 0
                        },
                        teamTwo: {
                            id: 33,
                            score: 0
                        },
                        url: 'mock-sendou-ink://test-match-two',
                        mapList: null,
                        bracketName: 'Test Bracket',
                        roundName: 'Round Two'
                    })
                    .mockResolvedValueOnce({
                        teamOne: {
                            id: 44,
                            score: 0
                        },
                        teamTwo: null,
                        url: 'mock-sendou-ink://test-match-three',
                        mapList: null,
                        bracketName: null,
                        roundName: 'Round Three'
                    })
                    .mockResolvedValueOnce({
                        teamOne: {
                            id: 55,
                            score: 0
                        },
                        teamTwo: {
                            id: 33,
                            score: 0
                        },
                        url: 'mock-sendou-ink://test-match-four',
                        mapList: null,
                        bracketName: 'Test Bracket',
                        roundName: null
                    });

                await service.get({ getAllMatches: false });

                expect(replicants.highlightedMatches).toEqual([
                    {
                        meta: {
                            id: '111',
                            name: 'Round One on Test Bracket',
                            shortName: 'Round One'
                        },
                        teamA: { id: '11', name: 'Test Team 1' },
                        teamB: { id: '22', name: 'Test Team 2' }
                    },
                    {
                        meta: {
                            id: '222',
                            name: 'Round Two on Test Bracket',
                            shortName: 'Round Two'
                        },
                        teamA: { id: '22', name: 'Test Team 2' },
                        teamB: { id: '33', name: 'Test Team 3' }
                    }
                ]);
                expect(mockSendouInkClient.getCastedMatches).toHaveBeenCalledTimes(1);
                expect(mockSendouInkClient.getMatch).toHaveBeenCalledTimes(4);
                expect(mockSendouInkClient.getMatch).toHaveBeenCalledWith(111);
                expect(mockSendouInkClient.getMatch).toHaveBeenCalledWith(222);
                expect(mockSendouInkClient.getMatch).toHaveBeenCalledWith(333);
                expect(mockSendouInkClient.getMatch).toHaveBeenCalledWith(444);
            });
        });

        it.each([
            TournamentDataSource.UNKNOWN,
            TournamentDataSource.UPLOAD
        ])('throws error when using unsupported source %s', async (source) => {
            replicants.tournamentData = { meta: { source } };

            await expect(service.get({ stages: [ ], getAllMatches: false })).rejects.toThrow(new Error('translation:highlightedMatches.unsupportedSource'));
        });
    });
});
