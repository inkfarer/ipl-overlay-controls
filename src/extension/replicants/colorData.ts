import * as nodecgContext from '../util/nodecg';
import { ActiveRound, SwapColorsInternally } from 'schemas';

const nodecg = nodecgContext.get();

const swapColorsInternally = nodecg.Replicant<SwapColorsInternally>('swapColorsInternally');
const activeRound = nodecg.Replicant<ActiveRound>('activeRound');

swapColorsInternally.on('change', (newValue, oldValue) => {
    if (oldValue !== undefined) {
        const clrA = activeRound.value.teamA.color;
        activeRound.value.teamA.color = activeRound.value.teamB.color;
        activeRound.value.teamB.color = clrA;
    }
});
