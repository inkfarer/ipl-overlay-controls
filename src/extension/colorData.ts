import * as nodecgContext from './util/nodecg';
import { ScoreboardData, SwapColorsInternally } from 'schemas';

const nodecg = nodecgContext.get();

const swapColorsInternally = nodecg.Replicant<SwapColorsInternally>('swapColorsInternally');
const scoreboardData = nodecg.Replicant<ScoreboardData>('scoreboardData');

swapColorsInternally.on('change', (newValue, oldValue) => {
    if (oldValue !== undefined) {
        const { colorInfo } = scoreboardData.value;

        scoreboardData.value.colorInfo = {
            ...scoreboardData.value.colorInfo,
            clrA: colorInfo.clrB,
            clrB: colorInfo.clrA
        };
    }
});
