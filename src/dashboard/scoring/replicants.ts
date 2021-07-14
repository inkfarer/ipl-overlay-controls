import { ActiveRound, NextTeams, ScoreboardData, SwapColorsInternally, TeamScores, TournamentData } from 'schemas';

export const teamScores = nodecg.Replicant<TeamScores>('teamScores');
export const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
export const scoreboardData = nodecg.Replicant<ScoreboardData>('scoreboardData');
export const swapColorsInternally = nodecg.Replicant<SwapColorsInternally>('swapColorsInternally');
export const activeRound = nodecg.Replicant<ActiveRound>('activeRound');
export const nextTeams = nodecg.Replicant<NextTeams>('nextTeams');
