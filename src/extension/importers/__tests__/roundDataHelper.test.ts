import { GameWinner } from 'types/enums/gameWinner';
import { Module } from '../../../helpers/__mocks__/module';
import { MockNodecg } from '../../__mocks__/mockNodecg';

describe('roundDataHelper', () => {
    let helper: Module;
    let nodecg: MockNodecg;

    const mockGenerateId = {
        __esModule: true,
        generateId: jest.fn()
    };
    jest.mock('../../../helpers/generateId', () => mockGenerateId);

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();

        nodecg = new MockNodecg({});
        nodecg.init();

        helper = require('../roundDataHelper');
    });

    describe('handleRoundData', () => {
        it('generates normalized RoundStore object from rounds', () => {
            mockGenerateId.generateId
                .mockReturnValueOnce('111111')
                .mockReturnValueOnce('222222');

            const result = helper.handleRoundData([
                {
                    name: 'Round 1',
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'makomart', mode: 'clam blitz' },
                        { map: 'MORAY TOWERS', mode: 'TOWER CONTROL' }
                    ]
                },
                { name: 'Round ???' },
                {
                    name: 'Round 2',
                    maps: [
                        { map: 'HuMpBaCk PuMp TrAcK', mode: 'SpLaT zOnEs' }
                    ]
                }
            ]);

            expect(result).toEqual({
                '111111': {
                    meta: {
                        name: 'Round 1',
                        isCompleted: false
                    },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker', winner: GameWinner.NO_WINNER },
                        { stage: 'MakoMart', mode: 'Clam Blitz', winner: GameWinner.NO_WINNER },
                        { stage: 'Moray Towers', mode: 'Tower Control', winner: GameWinner.NO_WINNER }
                    ]
                },
                '222222': {
                    meta: {
                        name: 'Round 2',
                        isCompleted: false
                    },
                    games: [
                        { stage: 'Humpback Pump Track', mode: 'Splat Zones', winner: GameWinner.NO_WINNER }
                    ]
                }
            });
        });
    });

    describe('clearMatchesWithUnknownTeams', () => {
        it('deletes progress for stored matches where no matching team can be found in tournament data', () => {
            nodecg.replicants.matchStore.value = {
                aaaa: {
                    teamA: { id: 'aaa' },
                    teamB: { id: 'bbb' },
                    meta: { name: 'Round 1', isCompleted: true, completionTime: '2020-01-01' }
                },
                bbbb: {
                    teamA: { id: 'aaa' },
                    teamB: { id: 'ccc' },
                    meta: { name: 'Round 2', isCompleted: true, completionTime: '2020-01-02' }
                },
                cccc: {
                    teamA: { id: 'ddd' },
                    teamB: { id: 'bbb' },
                    meta: { name: 'Round 3', isCompleted: false }
                }
            };

            helper.clearMatchesWithUnknownTeams({
                teams: [
                    { id: 'aaa' },
                    { id: 'bbb' }
                ]
            });

            expect(nodecg.replicants.matchStore.value).toEqual({
                aaaa: {
                    teamA: { id: 'aaa' },
                    teamB: { id: 'bbb' },
                    meta: { name: 'Round 1', isCompleted: true, completionTime: '2020-01-01' }
                }
            });
        });
    });
});
