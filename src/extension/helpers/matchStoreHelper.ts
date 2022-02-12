import * as nodecgContext from '../helpers/nodecg';
import { generateId } from '../../helpers/generateId';
import cloneDeep from 'lodash/cloneDeep';
import { GameWinner } from '../../types/enums/gameWinner';
import { ActiveRound, MatchStore, RoundStore, TournamentData } from '../../types/schemas';
import { setActiveRoundGames, setActiveRoundTeams } from '../replicants/activeRoundHelper';

const nodecg = nodecgContext.get();
const matchStore = nodecg.Replicant<MatchStore>('matchStore');
const roundStore = nodecg.Replicant<RoundStore>('roundStore');
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
const activeRound = nodecg.Replicant<ActiveRound>('activeRound');

export function resetMatchStore(): void {
    const firstRoundId = Object.keys(roundStore.value)[0];
    const firstRound = roundStore.value[firstRoundId];
    const matchId = generateId();

    const firstTeam = cloneDeep(tournamentData.value.teams[0]);
    const secondTeam = cloneDeep(tournamentData.value.teams[1]);

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
}

export function setActiveRoundToFirstMatch(): void {
    const firstMatchId = Object.keys(matchStore.value)[0];
    const firstMatch = matchStore.value[firstMatchId];

    const newActiveRound = cloneDeep(activeRound.value);
    setActiveRoundGames(newActiveRound, firstMatchId);
    setActiveRoundTeams(newActiveRound, firstMatch.teamA.id, firstMatch.teamB.id);
    activeRound.value = newActiveRound;
}
