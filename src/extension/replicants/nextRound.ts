import type NodeCG from '@nodecg/types';
import * as nodecgContext from '../helpers/nodecg';
import { SetNextRoundRequest } from 'types/messages/rounds';
import { setNextRoundGames, setNextRoundTeams } from '../helpers/nextRoundHelper';

const nodecg = nodecgContext.get();

nodecg.listenFor('setNextRound', (data: SetNextRoundRequest, ack: NodeCG.UnhandledAcknowledgement) => {
    try {
        setNextRoundTeams(data.teamAId, data.teamBId);
        if (data.roundId) {
            setNextRoundGames(data.roundId);
        }
    } catch (e) {
        return ack(e);
    }

    return ack(null);
});
