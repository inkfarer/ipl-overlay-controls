import { MockNodecg } from '../../__mocks__/mockNodecg';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { ImportStatus } from 'types/enums/importStatus';

describe('highlightedMatches', () => {
    const mockGetBattlefyMatches = jest.fn();
    const mockGetSmashGGStreamQueue = jest.fn();
    let nodecg: MockNodecg;

    jest.mock('../clients/battlefyClient', () => ({
        __esModule: true,
        getBattlefyMatches: mockGetBattlefyMatches
    }));

    jest.mock('../clients/smashggClient', () => ({
        __esModule: true,
        getSmashGGStreamQueue: mockGetSmashGGStreamQueue
    }));

    const defaultBundleConfig = { smashgg: { apiKey: '123123123123' } };

    const setup = (bundleConfig = defaultBundleConfig) => {
        nodecg = new MockNodecg(bundleConfig);
        nodecg.init();

        require('../highlightedMatches');
    };

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
    });

    describe('getHighlightedMatches', () => {
        describe('source: BATTLEFY', () => {
            beforeEach(() => {
                setup();
            });

            it('acknowledges with an error if arguments are missing', async () => {
                nodecg.replicants.tournamentData.value = { meta: { source: TournamentDataSource.BATTLEFY } };
                const ack = jest.fn();

                await nodecg.messageListeners.getHighlightedMatches({ }, ack);

                expect(ack).toHaveBeenCalledWith(new Error('Missing arguments.'));
                expect(mockGetBattlefyMatches).not.toHaveBeenCalled();
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

                await nodecg.messageListeners.getHighlightedMatches({ stages: [ ], getAllMatches: true }, ack);

                expect(ack).toHaveBeenCalledWith(null, { status: ImportStatus.SUCCESS, data: battlefyResult });
                expect(nodecg.replicants.highlightedMatches.value).toEqual([
                    { meta: { stageName: 'Stage 0', name: 'Round 2' } },
                    { meta: { stageName: 'Stage 1', name: 'Round 1' } },
                    { meta: { stageName: 'Stage 2', name: 'Round 5' } },
                ]);
                expect(mockGetBattlefyMatches).toHaveBeenCalledWith('12345', [], true);
            });

            it('acknowledges with "no data" response when no highlighted matches were found', async () => {
                nodecg.replicants.tournamentData.value = { meta: { source: TournamentDataSource.BATTLEFY, id: '12345' } };
                const ack = jest.fn();
                mockGetBattlefyMatches.mockResolvedValue([ ]);

                await nodecg.messageListeners.getHighlightedMatches({ stages: [ ], getAllMatches: true }, ack);

                expect(ack).toHaveBeenCalledWith(null, { status: ImportStatus.NO_DATA, data: [ ]});
                expect(mockGetBattlefyMatches).toHaveBeenCalledWith('12345', [], true);
            });
        });

        describe('source: SMASHGG', () => {
            describe('with bundle configuration', () => {
                beforeEach(() => {
                    setup();
                });

                it('acknowledges with an error if arguments are missing', async () => {
                    nodecg.replicants.tournamentData.value = { meta: { source: TournamentDataSource.SMASHGG } };
                    const ack = jest.fn();

                    await nodecg.messageListeners.getHighlightedMatches({ }, ack);

                    expect(ack).toHaveBeenCalledWith(new Error('Missing arguments.'));
                    expect(mockGetSmashGGStreamQueue).not.toHaveBeenCalled();
                });

                it('imports data from smash.gg and sorts the result', async () => {
                    nodecg.replicants.tournamentData.value = {
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
                    mockGetSmashGGStreamQueue.mockResolvedValue(result);

                    await nodecg.messageListeners.getHighlightedMatches({ streamIDs: [ ], getAllMatches: true }, ack);

                    expect(ack).toHaveBeenCalledWith(null, { status: ImportStatus.SUCCESS, data: result });
                    expect(nodecg.replicants.highlightedMatches.value).toEqual([
                        { meta: { stageName: 'Stage 0', name: 'Round 2' } },
                        { meta: { stageName: 'Stage 1', name: 'Round 1' } },
                        { meta: { stageName: 'Stage 2', name: 'Round 5' } },
                    ]);
                    expect(mockGetSmashGGStreamQueue).toHaveBeenCalledWith('12345', '123123123123', 123123123, [], true);
                });

                it('acknowledges with "no data" response when no highlighted matches were found', async () => {
                    nodecg.replicants.tournamentData.value = {
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
                    mockGetSmashGGStreamQueue.mockResolvedValue([ ]);

                    await nodecg.messageListeners.getHighlightedMatches({ streamIDs: [], getAllMatches: true }, ack);

                    expect(ack).toHaveBeenCalledWith(null, { status: ImportStatus.NO_DATA, data: [ ]});
                    expect(mockGetSmashGGStreamQueue).toHaveBeenCalledWith('12345', '123123123123', 123123123, [], true);
                });
            });

            it('acknowledges with error if no api key is present', async () => {
                setup({ smashgg: { apiKey: undefined } });
                nodecg.replicants.tournamentData.value = { meta: { source: TournamentDataSource.SMASHGG } };
                const ack = jest.fn();

                await nodecg.messageListeners.getHighlightedMatches({ }, ack);

                expect(ack).toHaveBeenCalledWith(new Error('No Smash.gg API key found.'));
            });
        });

        it('acknowledges with an error if importing predictions is not supported', () => {
            setup();
            nodecg.replicants.tournamentData.value = { meta: { source: TournamentDataSource.UPLOAD } };
            const ack = jest.fn();

            nodecg.messageListeners.getHighlightedMatches({ stages: [ ], getAllStages: false }, ack);

            expect(ack).toHaveBeenCalledWith(new Error('Invalid source \'UPLOAD\' given.'));
        });
    });
});
