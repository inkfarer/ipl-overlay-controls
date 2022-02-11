import * as nodecgContext from '../helpers/nodecg';
import { ActiveRound, MatchStore, RoundStore, TournamentData } from '../../types/schemas';
import clone from 'clone';
import { DateTime } from 'luxon';
import cloneDeep from 'lodash/cloneDeep';
import { generateId } from '../../helpers/generateId';
import { setActiveRoundGames, setActiveRoundTeams } from './activeRoundHelper';
import isEmpty from 'lodash/isEmpty';
import { GameWinner } from '../../types/enums/gameWinner';

const nodecg = nodecgContext.get();

const roundStore = nodecg.Replicant<RoundStore>('roundStore');
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
        const firstRoundId = Object.keys(roundStore.value)[0];
        const firstRound = roundStore.value[firstRoundId];
        const matchId = generateId();

        const firstTeam = cloneDeep(tournamentData.teams[0]);
        const secondTeam = cloneDeep(tournamentData.teams[1]);

        matchStore.value = {
            [matchId]: {
                meta: {
                    name: firstRound.meta.name,
                    isCompleted: false,
                    type: firstRound.meta.type
                },
                teamA: {
                    ...firstTeam,
                    score: 0
                },
                teamB: {
                    ...secondTeam,
                    score: 0
                },
                games: firstRound.games.map(game => ({ ...game, winner: GameWinner.NO_WINNER }))
            }
        };

        setActiveRoundToFirstMatch();
    } else {
        matchStore.value = newMatches;
        if (!newMatches[activeRound.value.match.id]) {
            setActiveRoundToFirstMatch();
        }
    }
}

function setActiveRoundToFirstMatch(): void {
    const firstMatchId = Object.keys(matchStore.value)[0];
    const firstMatch = matchStore.value[firstMatchId];

    const newActiveRound = cloneDeep(activeRound.value);
    setActiveRoundGames(newActiveRound, firstMatchId);
    setActiveRoundTeams(newActiveRound, firstMatch.teamA.id, firstMatch.teamB.id);
    activeRound.value = newActiveRound;
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
