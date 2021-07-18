import * as nodecgContext from '../helpers/nodecg';
import { NextRound, RoundStore, TournamentData } from 'schemas';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import isEmpty from 'lodash/isEmpty';
import { getTeam } from '../helpers/tournamentDataHelper';
import { SetRoundRequest } from 'types/messages/rounds';

const nodecg = nodecgContext.get();

const nextRound = nodecg.Replicant<NextRound>('nextRound');
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
const roundStore = nodecg.Replicant<RoundStore>('roundStore');

nodecg.listenFor('setNextRound', (data: SetRoundRequest, ack: UnhandledListenForCb) => {
    try {
        setNextRoundTeams(data.teamAId, data.teamBId);
        if (data.roundId) {
            setNextRoundGames(data.roundId);
        }
    } catch (e) {
        return ack(e);
    }
});

export function setNextRoundGames(roundId: string): void {
    const round = roundStore.value[roundId];
    if (isEmpty(round)) {
        throw new Error(`Could not find round ${roundId}.`);
    }

    nextRound.value.round = {
        id: roundId,
        name: round.meta.name
    };
    nextRound.value.games = round.games.map(game => ({ stage: game.stage, mode: game.mode }));
}

export function setNextRoundTeams(teamAId: string, teamBId: string): void {
    const teamA = getTeam(teamAId, tournamentData.value);
    const teamB = getTeam(teamBId, tournamentData.value);
    if ([teamA, teamB].filter(isEmpty).length > 0) {
        throw new Error('Could not find a team.');
    }

    nextRound.value.teamA = teamA;
    nextRound.value.teamB = teamB;
}
