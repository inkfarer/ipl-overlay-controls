import { ScoreboardData, ScoreboardShown, SwapColorsInternally, TeamScores, TournamentData } from 'schemas';

export const teamScores = nodecg.Replicant<TeamScores>('teamScores');
export const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
export const scoreboardData = nodecg.Replicant<ScoreboardData>('scoreboardData');
export const scoreboardShown = nodecg.Replicant<ScoreboardShown>('scoreboardShown');
export const swapColorsInternally = nodecg.Replicant<SwapColorsInternally>('swapColorsInternally');
