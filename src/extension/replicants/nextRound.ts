import * as nodecgContext from '../helpers/nodecg';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import { SetNextRoundRequest } from 'types/messages/rounds';
import { setNextRoundGames, setNextRoundTeams } from '../helpers/nextRoundHelper';

const nodecg = nodecgContext.get();

nodecg.listenFor('setNextRound', (data: SetNextRoundRequest, ack: UnhandledListenForCb) => {
    try {
        setNextRoundTeams(data.teamAId, data.teamBId);
        if (data.roundId) {
            setNextRoundGames(data.roundId);
        }
    } catch (e) {
        return ack(e);
    }
});
