import { handleRoundData } from '../roundDataHelper';
import * as generateId from '../../../helpers/generateId';
import { GameWinner } from 'types/enums/gameWinner';

describe('roundDataHelper', () => {
    describe('handleRoundData', () => {
        it('generates normalized RoundStore object from rounds', () => {
            jest.spyOn(generateId, 'generateId')
                .mockReturnValueOnce('111111')
                .mockReturnValueOnce('222222');

            const result = handleRoundData([
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
});
