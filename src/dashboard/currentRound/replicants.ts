import { ActiveRound, SwapColorsInternally } from 'schemas';

export const swapColorsInternally = nodecg.Replicant<SwapColorsInternally>('swapColorsInternally');
export const activeRound = nodecg.Replicant<ActiveRound>('activeRound');
