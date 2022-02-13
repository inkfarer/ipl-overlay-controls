import * as nodecgContext from '../helpers/nodecg';
import { RoundStore, RuntimeConfig } from '../../types/schemas';
import { PlayType } from '../../types/enums/playType';
import { setNextRoundGames } from '../replicants/nextRoundHelper';
import { perGameData } from '../../helpers/gameData/gameData';
import { randomFromArray } from '../../helpers/array';

const nodecg = nodecgContext.get();

const roundStore = nodecg.Replicant<RoundStore>('roundStore');
const runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');

export function resetRoundStore(): void {
    const defaultRoundId = '00000';
    const secondDefaultRoundId = '11111';

    const gameData = perGameData[runtimeConfig.value.gameVersion];
    const stagesWithoutUnknown = gameData.stages.filter(stage => stage !== 'Unknown Stage');
    const modesWithoutUnknown = gameData.modes.filter(stage => stage !== 'Unknown Mode');
    const getRandomGame = () => ({
        stage: randomFromArray(stagesWithoutUnknown),
        mode: randomFromArray(modesWithoutUnknown)
    });

    roundStore.value = {
        [defaultRoundId]: {
            meta: {
                name: 'Default Round 1',
                type: PlayType.BEST_OF
            },
            games: [
                getRandomGame(),
                getRandomGame(),
                getRandomGame()
            ]
        },
        [secondDefaultRoundId]: {
            meta: {
                name: 'Default Round 2',
                type: PlayType.BEST_OF
            },
            games: [
                getRandomGame(),
                getRandomGame(),
                getRandomGame()
            ]
        }
    };

    setNextRoundGames(secondDefaultRoundId);
}
