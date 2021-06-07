import { ScoreboardData, ScoreboardShown, TeamScores, TournamentData } from 'schemas';

export const teamScores = nodecg.Replicant<TeamScores>('teamScores');
export const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
export const scoreboardData = nodecg.Replicant<ScoreboardData>('scoreboardData');
export const scoreboardShown = nodecg.Replicant<ScoreboardShown>('scoreboardShown');
