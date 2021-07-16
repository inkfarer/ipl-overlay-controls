import * as nodecgContext from '../util/nodecg';
import { ActiveRound, Rounds } from 'schemas';
import { SetActiveRoundRequest } from 'types/messages/activeRound';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import { GameWinner } from 'types/gameWinner';

const nodecg = nodecgContext.get();

const activeRound = nodecg.Replicant<ActiveRound>('activeRound');
const rounds = nodecg.Replicant<Rounds>('rounds');

nodecg.listenFor('setActiveRound', (data: SetActiveRoundRequest, ack: UnhandledListenForCb) => {
    const selectedRound = rounds.value[data.roundId];

    if (selectedRound) {
        const newValue = activeRound.value;
        newValue.round = {
            id: data.roundId,
            name: selectedRound.meta.name
        };
        newValue.teamA.score = 0;
        newValue.teamB.score = 0;

        newValue.games = selectedRound.games.map(game => {
            return {
                mode: game.mode,
                stage: game.stage,
                winner: GameWinner.NO_WINNER
            };
        });

        activeRound.value = newValue;
    } else {
        ack(new Error('No round found.'));
    }
});
