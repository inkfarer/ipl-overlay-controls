import { PlayType } from '../../../types/enums/playType';
import * as GenerateId from '../../../helpers/generateId';
import { mock } from 'jest-mock-extended';
import { GameVersion } from '../../../types/enums/gameVersion';

const mockGenerateId = mock<typeof GenerateId>();
jest.mock('../../../helpers/generateId', () => mockGenerateId);

import { handleRoundData } from '../roundDataHelper';

describe('roundDataHelper', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('handleRoundData', () => {
        it('generates normalized RoundStore object from rounds', () => {
            mockGenerateId.generateId
                .mockReturnValueOnce('111111')
                .mockReturnValueOnce('222222')
                .mockReturnValueOnce('333333');

            const result = handleRoundData([
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
                    // @ts-ignore
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
            ], GameVersion.SPLATOON_2);

            expect(result).toEqual({
                '111111': {
                    meta: {
                        name: 'Round 1',
                        isCompleted: false,
                        type: PlayType.PLAY_ALL
                    },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'MakoMart', mode: 'Clam Blitz' },
                        { stage: 'Moray Towers', mode: 'Tower Control' }
                    ]
                },
                '222222': {
                    meta: {
                        name: 'Round 2',
                        isCompleted: false,
                        type: PlayType.BEST_OF
                    },
                    games: [
                        { stage: 'Humpback Pump Track', mode: 'Splat Zones' }
                    ]
                },
                '333333': {
                    meta: {
                        name: 'Round 3',
                        isCompleted: false,
                        type: PlayType.BEST_OF
                    },
                    games: [
                        { stage: 'Humpback Pump Track', mode: 'Splat Zones' }
                    ]
                }
            });
        });

        it('only recognizes stage names from the given game version', () => {
            mockGenerateId.generateId.mockReturnValueOnce('111111');

            const result = handleRoundData([
                {
                    name: 'Round 1',
                    type: PlayType.PLAY_ALL,
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'moray towers', mode: 'clam blitz' },
                        { map: 'Counterpick', mode: '?????' }
                    ]
                }
            ], GameVersion.SPLATOON_3);

            expect(result).toEqual({
                '111111': {
                    meta: {
                        name: 'Round 1',
                        isCompleted: false,
                        type: PlayType.PLAY_ALL
                    },
                    games: [
                        { stage: 'Unknown Stage', mode: 'Rainmaker' },
                        { stage: 'Unknown Stage', mode: 'Clam Blitz' },
                        { stage: 'Counterpick', mode: 'Unknown Mode' }
                    ]
                }
            });
        });
    });
});
