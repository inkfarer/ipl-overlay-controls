import { ActiveRound, RoundStore, SwapColorsInternally, TournamentData } from 'schemas';

export const swapColorsInternally = nodecg.Replicant<SwapColorsInternally>('swapColorsInternally');
export const activeRound = nodecg.Replicant<ActiveRound>('activeRound');
export const roundStore = nodecg.Replicant<RoundStore>('roundStore');
export const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
