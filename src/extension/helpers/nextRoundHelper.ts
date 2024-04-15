import isEmpty from 'lodash/isEmpty';
import { getTeam } from './tournamentDataHelper';
import * as nodecgContext from './nodecg';
import { NextRound, RoundStore, TournamentData } from 'schemas';
import i18next from 'i18next';

const nodecg = nodecgContext.get();

const nextRound = nodecg.Replicant<NextRound>('nextRound');
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
const roundStore = nodecg.Replicant<RoundStore>('roundStore');

export function setNextRoundGames(roundId: string): void {
    const round = roundStore.value[roundId];
    if (isEmpty(round)) {
        throw new Error(i18next.t('nextRoundHelper.roundNotFound', { roundId }));
    }

    nextRound.value.round = {
        id: roundId,
        name: round.meta.name,
        type: round.meta.type
    };
    nextRound.value.games = round.games.map(game => ({ stage: game.stage, mode: game.mode }));
}

export function setNextRoundTeams(teamAId: string, teamBId: string): void {
    const teamA = getTeam(teamAId, tournamentData.value);
    const teamB = getTeam(teamBId, tournamentData.value);
    if ([teamA, teamB].filter(isEmpty).length > 0) {
        throw new Error(i18next.t('nextRoundHelper.teamNotFound'));
    }

    nextRound.value.teamA = teamA;
    nextRound.value.teamB = teamB;
}

