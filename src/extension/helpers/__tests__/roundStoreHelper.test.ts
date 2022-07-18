import { mock } from 'jest-mock-extended';
import type * as NextRoundHelper from '../nextRoundHelper';
const mockNextRoundHelper = mock<typeof NextRoundHelper>();
jest.mock('../nextRoundHelper', () => mockNextRoundHelper);

import { replicants } from '../../__mocks__/mockNodecg';
import { PlayType } from '../../../types/enums/playType';
import { randomFromArray } from '../../../helpers/array';

jest.mock('../../../helpers/array');

import { resetRoundStore } from '../roundStoreHelper';
import { GameVersion } from '../../../types/enums/gameVersion';

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
            expect(randomFromArray).toHaveBeenCalledWith([
                'Ancho-V Games',
                'Arowana Mall',
                'Blackbelly Skatepark',
                'Camp Triggerfish',
                'Goby Arena',
                'Humpback Pump Track',
                'Inkblot Art Academy',
                'Kelp Dome',
                'MakoMart',
                'Manta Maria',
                'Moray Towers',
                'Musselforge Fitness',
                'New Albacore Hotel',
                'Piranha Pit',
                'Port Mackerel',
                'Shellendorf Institute',
                'Shifty Station',
                'Snapper Canal',
                'Starfish Mainstage',
                'Sturgeon Shipyard',
                'The Reef',
                'Wahoo World',
                'Walleye Warehouse',
                'Skipper Pavilion'
            ]);
            expect(randomFromArray).toHaveBeenCalledWith([
                'Clam Blitz',
                'Tower Control',
                'Rainmaker',
                'Splat Zones',
                'Turf War'
            ]);
        });
    });
});
