import { ActiveRound, ScoreboardData, SwapColorsInternally } from 'schemas';

export const scoreboardData = nodecg.Replicant<ScoreboardData>('scoreboardData');
export const swapColorsInternally = nodecg.Replicant<SwapColorsInternally>('swapColorsInternally');
export const activeRound = nodecg.Replicant<ActiveRound>('activeRound');
