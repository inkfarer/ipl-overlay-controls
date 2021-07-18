import * as nodecgContext from '../helpers/nodecg';
import { NextRound, RoundStore, TournamentData } from 'schemas';
import { SetNextRoundRequest } from 'types/messages/nextRound';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import isEmpty from 'lodash/isEmpty';
import { getTeam } from '../helpers/tournamentDataHelper';

const nodecg = nodecgContext.get();

const nextRound = nodecg.Replicant<NextRound>('nextRound');
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
const roundStore = nodecg.Replicant<RoundStore>('roundStore');

nodecg.listenFor('setNextRound', (data: SetNextRoundRequest, ack: UnhandledListenForCb) => {
    const teamA = getTeam(data.teamAId, tournamentData.value);
    const teamB = getTeam(data.teamBId, tournamentData.value);
    if ([teamA, teamB].filter(isEmpty).length > 0) {
        return ack(new Error('Could not find team.'));
    }

    nextRound.value.teamA = teamA;
    nextRound.value.teamB = teamB;

    if (data.roundId) {
        const round = roundStore.value[data.roundId];
        if (isEmpty(round)) {
            return ack(new Error(`Could not found round ${data.roundId}.`));
        }

        nextRound.value.round = {
            id: data.roundId,
            name: round.meta.name
        };
        nextRound.value.games = round.games.map(game => ({ stage: game.stage, mode: game.mode }));
    }
});
