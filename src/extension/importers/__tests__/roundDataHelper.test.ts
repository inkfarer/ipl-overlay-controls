import { GameWinner } from 'types/enums/gameWinner';
import { Module } from '../../../helpers/__mocks__/module';
import { MockNodecg } from '../../__mocks__/mockNodecg';
import { PlayType } from '../../../types/enums/playType';

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
                .mockReturnValueOnce('222222')
                .mockReturnValueOnce('333333');

            const result = helper.handleRoundData([
                {
                    name: 'Round 1',
                    type: PlayType.PLAY_ALL,
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'makomart', mode: 'clam blitz' },
                        { map: 'MORAY TOWERS', mode: 'TOWER CONTROL' }
                    ]
                },
                { name: 'Round ???' },
                {
                    name: 'Round 2',
                    type: 'some play type that does not exist',
                    maps: [
                        { map: 'HuMpBaCk PuMp TrAcK', mode: 'SpLaT zOnEs' }
                    ]
                },
                {
                    name: 'Round 3',
                    maps: [
                        { map: 'HuMpBaCk PuMp TrAcK', mode: 'SpLaT zOnEs' }
                    ]
                }
            ]);

            expect(result).toEqual({
                '111111': {
                    meta: {
                        name: 'Round 1',
                        isCompleted: false,
                        type: PlayType.PLAY_ALL
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
                        isCompleted: false,
                        type: PlayType.BEST_OF
                    },
                    games: [
                        { stage: 'Humpback Pump Track', mode: 'Splat Zones', winner: GameWinner.NO_WINNER }
                    ]
                },
                '333333': {
                    meta: {
                        name: 'Round 3',
                        isCompleted: false,
                        type: PlayType.BEST_OF
                    },
                    games: [
                        { stage: 'Humpback Pump Track', mode: 'Splat Zones', winner: GameWinner.NO_WINNER }
                    ]
                }
            });
        });
    });
});
