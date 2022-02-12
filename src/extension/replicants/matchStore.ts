import * as nodecgContext from '../helpers/nodecg';
import { ActiveRound, MatchStore, TournamentData } from '../../types/schemas';
import clone from 'clone';
import { DateTime } from 'luxon';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import { resetMatchStore, setActiveRoundToFirstMatch } from '../helpers/matchStoreHelper';

const nodecg = nodecgContext.get();

const matchStore = nodecg.Replicant<MatchStore>('matchStore');
const activeRound = nodecg.Replicant<ActiveRound>('activeRound');

export function clearMatchesWithUnknownTeams(tournamentData: TournamentData): void {
    const teamIds = tournamentData.teams.map(team => team.id);

    const newMatches = cloneDeep(matchStore.value);

    Object.entries(newMatches).forEach(([key, round]) => {
        if (!isEmpty(round.teamA) || !isEmpty(round.teamB)) {
            if (!teamIds.includes(round.teamA.id) || !teamIds.includes(round.teamB.id)) {
                delete newMatches[key];
            }
        }
    });

    if (Object.keys(newMatches).length <= 0) {
        resetMatchStore();
    } else {
        matchStore.value = newMatches;
        if (!newMatches[activeRound.value.match.id]) {
            setActiveRoundToFirstMatch();
        }
    }
}

export function commitActiveRoundToMatchStore(): void {
    const currentActiveRound = clone(activeRound.value);

    const completionTime = currentActiveRound.match.isCompleted ? DateTime.utc().toISO() : undefined;

    matchStore.value[currentActiveRound.match.id] = {
        meta: {
            name: currentActiveRound.match.name,
            isCompleted: currentActiveRound.match.isCompleted,
            completionTime,
            type: currentActiveRound.match.type
        },
        teamA: currentActiveRound.teamA,
        teamB: currentActiveRound.teamB,
        games: currentActiveRound.games.map((game) =>
            ({ stage: game.stage, mode: game.mode, winner: game.winner, color: game.color }))
    };
}
