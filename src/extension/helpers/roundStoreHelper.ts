import * as nodecgContext from '../helpers/nodecg';
import { RoundStore } from '../../types/schemas';
import { PlayType } from '../../types/enums/playType';
import { setNextRoundGames } from '../replicants/nextRoundHelper';

const nodecg = nodecgContext.get();

const roundStore = nodecg.Replicant<RoundStore>('roundStore');

export function resetRoundStore(): void {
    const defaultRoundId = '00000';
    const secondDefaultRoundId = '11111';

    roundStore.value = {
        [defaultRoundId]: {
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
        [secondDefaultRoundId]: {
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
    };

    setNextRoundGames(secondDefaultRoundId);
}
