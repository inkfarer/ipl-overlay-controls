import type NodeCG from '@nodecg/types';
import * as nodecgContext from '../helpers/nodecg';
import { SetNextRoundRequest } from 'types/messages/rounds';
import { setNextRoundGames, setNextRoundTeams } from '../helpers/nextRoundHelper';
import { NextRound } from 'schemas';

const nodecg = nodecgContext.get();
const nextRound = nodecg.Replicant<NextRound>('nextRound');

nodecg.listenFor('setNextRound', (data: SetNextRoundRequest, ack: NodeCG.UnhandledAcknowledgement) => {
    try {
        setNextRoundTeams(data.teamAId, data.teamBId);
        if (data.roundId) {
            setNextRoundGames(data.roundId);
        }
        nextRound.value.name = data.name;
    } catch (e) {
        return ack(e);
    }

    return ack(null);
});
