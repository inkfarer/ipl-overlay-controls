import { ActiveRoundId, GameData, Rounds, ScoreboardData, SwapColorsInternally } from 'schemas';

export const gameData = nodecg.Replicant<GameData>('gameData');
export const activeRoundId = nodecg.Replicant<ActiveRoundId>('activeRoundId');
export const rounds = nodecg.Replicant<Rounds>('rounds');
export const scoreboardData = nodecg.Replicant<ScoreboardData>('scoreboardData');
export const swapColorsInternally = nodecg.Replicant<SwapColorsInternally>('swapColorsInternally');
