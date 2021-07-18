import * as nodecgContext from '../helpers/nodecg';
import { ActiveRound, RoundStore } from 'schemas';
import { UpdateRoundStoreRequest } from 'types/messages/roundStore';
import clone from 'clone';
import { GameWinner } from 'types/gameWinner';

const nodecg = nodecgContext.get();

const roundStore = nodecg.Replicant<RoundStore>('roundStore');
const activeRound = nodecg.Replicant<ActiveRound>('activeRound');

nodecg.listenFor('updateRoundStore', (data: UpdateRoundStoreRequest) => {
    const roundStoreValue = roundStore.value[data.id];
    const originalValue = clone(roundStoreValue);

    const mappedGames = clone(data.games).map((game, index) =>
        ({ ...game, winner: originalValue?.games[index]?.winner || GameWinner.NO_WINNER }));

    if (!roundStoreValue) {
        roundStore.value[data.id] = {
            games: mappedGames,
            meta: {
                name: data.roundName,
                isCompleted: false
            }
        };
    } else {
        roundStoreValue.games = mappedGames;
        roundStoreValue.meta.name = data.roundName;
    }

    if (activeRound.value.round.id === data.id) {
        activeRound.value.round.name = data.roundName;
        activeRound.value.games = data.games.map((game, index) =>
            ({ ...activeRound.value.games[index], ...game }));
    }
});

export function commitActiveRoundToRoundStore(): void {
    const currentActiveRound = clone(activeRound.value);

    const winThreshold = currentActiveRound.games.length / 2;
    const isCompleted
        = (currentActiveRound.teamA.score > winThreshold || currentActiveRound.teamB.score > winThreshold);
    const isStarted = currentActiveRound.teamA.score + currentActiveRound.teamB.score > 0;

    roundStore.value[currentActiveRound.round.id] = {
        ...(roundStore.value[currentActiveRound.round.id]),
        meta: {
            name: currentActiveRound.round.name,
            isCompleted
        },
        teamA: isStarted ? currentActiveRound.teamA : undefined,
        teamB: isStarted ? currentActiveRound.teamB : undefined,
        games: currentActiveRound.games.map((game) =>
            ({ stage: game.stage, mode: game.mode, winner: game.winner, color: game.color }))
    };
}
