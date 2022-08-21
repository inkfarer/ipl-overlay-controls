import * as nodecgContext from '../helpers/nodecg';
import { RoundStore, RuntimeConfig } from '../../types/schemas';
import { PlayType } from '../../types/enums/playType';
import { setNextRoundGames } from './nextRoundHelper';
import { perGameData } from '../../helpers/gameData/gameData';
import { randomFromArray } from '../../helpers/ArrayHelper';
import omit from 'lodash/omit';
import { Locale } from '../../types/enums/Locale';

const nodecg = nodecgContext.get();

const roundStore = nodecg.Replicant<RoundStore>('roundStore');
const runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');

export function resetRoundStore(): void {
    const defaultRoundId = '00000';
    const secondDefaultRoundId = '11111';

    const gameData = perGameData[runtimeConfig.value.gameVersion];
    const stagesWithoutUnknown = Object.keys(omit(gameData.stages[Locale.EN], ['Unknown Stage', 'Counterpick']));
    const modesWithoutUnknown = Object.keys(omit(gameData.modes[Locale.EN], ['Unknown Mode']));
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
