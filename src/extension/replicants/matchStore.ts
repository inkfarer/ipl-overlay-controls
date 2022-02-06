import * as nodecgContext from '../helpers/nodecg';
import { ActiveRound, MatchStore } from '../../types/schemas';
import clone from 'clone';
import { DateTime } from 'luxon';

const nodecg = nodecgContext.get();

const matchStore = nodecg.Replicant<MatchStore>('matchStore');
const activeRound = nodecg.Replicant<ActiveRound>('activeRound');

export function commitActiveRoundToMatchStore(): void {
    const currentActiveRound = clone(activeRound.value);

    const completionTime = currentActiveRound.match.isCompleted ? DateTime.utc().toISO() : undefined;

    matchStore.value[currentActiveRound.match.id] = {
        meta: {
            name: currentActiveRound.match.name,
            isCompleted: currentActiveRound.match.isCompleted,
            completionTime
        },
        teamA: currentActiveRound.teamA,
        teamB: currentActiveRound.teamB,
        games: currentActiveRound.games.map((game) =>
            ({ stage: game.stage, mode: game.mode, winner: game.winner, color: game.color }))
    };
}
