import * as nodecgContext from '../helpers/nodecg';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import { SetRoundRequest } from 'types/messages/rounds';
import { setNextRoundGames, setNextRoundTeams } from './nextRoundHelper';

const nodecg = nodecgContext.get();

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
