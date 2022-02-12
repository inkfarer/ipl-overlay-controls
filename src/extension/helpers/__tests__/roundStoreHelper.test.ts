import { mock } from 'jest-mock-extended';
import type * as NextRoundHelper from '../../replicants/nextRoundHelper';
const mockNextRoundHelper = mock<typeof NextRoundHelper>();
jest.mock('../../replicants/nextRoundHelper', () => mockNextRoundHelper);

import { replicants } from '../../__mocks__/mockNodecg';
import { PlayType } from '../../../types/enums/playType';
import { randomFromArray } from '../../../helpers/array';

jest.mock('../../../helpers/array');

import { resetRoundStore } from '../roundStoreHelper';
import { GameVersion } from '../../../types/enums/gameVersion';
import { perGameData } from '../../../helpers/gameData/gameData';

describe('roundStoreHelper', () => {
    describe('resetRoundStore', () => {
        it('sets round store value and updates next round data', () => {
            replicants.runtimeConfig = { gameVersion: GameVersion.SPLATOON_2 };
            (randomFromArray as jest.Mock).mockReturnValue('random item');

            resetRoundStore();

            expect(replicants.roundStore).toEqual({
                '00000': {
                    meta: {
                        name: 'Default Round 1',
                        type: PlayType.BEST_OF
                    },
                    games: [
                        { stage: 'random item', mode: 'random item' },
                        { stage: 'random item', mode: 'random item' },
                        { stage: 'random item', mode: 'random item' }
                    ]
                },
                '11111': {
                    meta: {
                        name: 'Default Round 2',
                        type: PlayType.BEST_OF
                    },
                    games: [
                        { stage: 'random item', mode: 'random item' },
                        { stage: 'random item', mode: 'random item' },
                        { stage: 'random item', mode: 'random item' }
                    ]
                }
            });

            expect(mockNextRoundHelper.setNextRoundGames).toHaveBeenCalledWith('11111');
            expect(randomFromArray).toHaveBeenCalledTimes(12);
            expect(randomFromArray).toHaveBeenCalledWith(perGameData[GameVersion.SPLATOON_2].stages.filter(stage => stage !== 'Unknown Stage'));
            expect(randomFromArray).toHaveBeenCalledWith(perGameData[GameVersion.SPLATOON_2].modes.filter(stage => stage !== 'Unknown Mode'));
        });
    });
});
