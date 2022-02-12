import { mock } from 'jest-mock-extended';
import type * as NextRoundHelper from '../../replicants/nextRoundHelper';
const mockNextRoundHelper = mock<typeof NextRoundHelper>();
jest.mock('../../replicants/nextRoundHelper', () => mockNextRoundHelper);

import { resetRoundStore } from '../roundStoreHelper';
import { replicants } from '../../__mocks__/mockNodecg';
import { PlayType } from '../../../types/enums/playType';

describe('roundStoreHelper', () => {
    describe('resetRoundStore', () => {
        it('sets round store value and updates next round data', () => {
            resetRoundStore();

            expect(replicants.roundStore).toEqual({
                '00000': {
                    meta: {
                        name: 'Default Round 1',
                        type: PlayType.BEST_OF
                    },
                    games: [
                        {
                            stage: 'MakoMart',
                            mode: 'Clam Blitz'
                        },
                        {
                            stage: 'Ancho-V Games',
                            mode: 'Tower Control'
                        },
                        {
                            stage: 'Wahoo World',
                            mode: 'Rainmaker'
                        }
                    ]
                },
                '11111': {
                    meta: {
                        name: 'Default Round 2',
                        type: PlayType.BEST_OF
                    },
                    games: [
                        {
                            stage: 'Inkblot Art Academy',
                            mode: 'Turf War'
                        },
                        {
                            stage: 'Ancho-V Games',
                            mode: 'Tower Control'
                        },
                        {
                            stage: 'Wahoo World',
                            mode: 'Rainmaker'
                        }
                    ]
                }
            });
            expect(mockNextRoundHelper.setNextRoundGames).toHaveBeenCalledWith('11111');
        });
    });
});
