import * as nodecgContext from '../helpers/nodecg';
import { NextRound, RoundStore, TournamentData } from 'schemas';
import { SetNextRoundRequest } from 'types/messages/nextRound';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import isEmpty from 'lodash/isEmpty';
import { getTeam } from '../helpers/tournamentDataHelper';

const nodecg = nodecgContext.get();

const nextRound = nodecg.Replicant<NextRound>('nextRound');
// const activeRound = nodecg.Replicant<ActiveRound>('activeRound');
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
const roundStore = nodecg.Replicant<RoundStore>('roundStore');

nodecg.listenFor('setNextRound', (data: SetNextRoundRequest, ack: UnhandledListenForCb) => {
    const teamA = getTeam(data.teamAId, tournamentData.value);
    const teamB = getTeam(data.teamBId, tournamentData.value);
    const round = roundStore.value[data.roundId];

    if ([teamA, teamB, round].filter(isEmpty).length > 0) {
        return ack(new Error('Could not find team or round.'));
    }

    nextRound.value = {
        round: {
            id: data.roundId,
            name: round.meta.name
        },
        games: round.games.map(game => ({ stage: game.stage, mode: game.mode })),
        teamA: teamA,
        teamB: teamB
    };
});
