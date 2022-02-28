import * as nodecgContext from '../helpers/nodecg';
import { generateId } from '../../helpers/generateId';
import cloneDeep from 'lodash/cloneDeep';
import { GameWinner } from '../../types/enums/gameWinner';
import {
    ActiveRound,
    MatchStore,
    RoundStore,
    RuntimeConfig,
    SwapColorsInternally,
    TournamentData
} from '../../types/schemas';
import { setActiveRoundGames, setActiveRoundTeams } from './activeRoundHelper';
import { perGameData } from '../../helpers/gameData/gameData';

const nodecg = nodecgContext.get();
const matchStore = nodecg.Replicant<MatchStore>('matchStore');
const roundStore = nodecg.Replicant<RoundStore>('roundStore');
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
const activeRound = nodecg.Replicant<ActiveRound>('activeRound');
const runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');
const swapColorsInternally = nodecg.Replicant<SwapColorsInternally>('swapColorsInternally');

export function resetMatchStore(resetColors = false): void {
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

    setActiveRoundToFirstMatch(resetColors);
}

export function setActiveRoundToFirstMatch(resetColors = false): void {
    const firstMatchId = Object.keys(matchStore.value)[0];
    const firstMatch = matchStore.value[firstMatchId];

    const newActiveRound = cloneDeep(activeRound.value);
    setActiveRoundGames(newActiveRound, firstMatchId);
    setActiveRoundTeams(newActiveRound, firstMatch.teamA.id, firstMatch.teamB.id);
    if (resetColors) {
        const gameData = perGameData[runtimeConfig.value.gameVersion];
        const firstCategory = gameData.colors[0];
        const firstColor = firstCategory.colors[0];
        newActiveRound.teamA.color = swapColorsInternally.value ? firstColor.clrB : firstColor.clrA;
        newActiveRound.teamB.color = swapColorsInternally.value ? firstColor.clrA : firstColor.clrB;
        newActiveRound.activeColor = {
            index: firstColor.index,
            title: firstColor.title,
            categoryName: firstCategory.meta.name,
            isCustom: firstColor.isCustom,
            clrNeutral: firstColor.clrNeutral
        };
    }

    activeRound.value = newActiveRound;
}
