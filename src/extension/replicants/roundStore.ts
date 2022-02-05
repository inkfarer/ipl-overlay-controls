import * as nodecgContext from '../helpers/nodecg';
import { ActiveRound, NextRound, RoundStore } from 'schemas';
import { RemoveRoundRequest, UpdateRoundStoreRequest } from 'types/messages/roundStore';
import clone from 'clone';
import { GameWinner } from 'types/enums/gameWinner';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import { setActiveRoundGames } from './activeRoundHelper';
import { setNextRoundGames } from './nextRoundHelper';
import { DateTime } from 'luxon';
import { generateId } from '../../helpers/generateId';
import { MatchStore } from '../../types/schemas';

const nodecg = nodecgContext.get();

const roundStore = nodecg.Replicant<RoundStore>('roundStore');
const matchStore = nodecg.Replicant<MatchStore>('matchStore');
const activeRound = nodecg.Replicant<ActiveRound>('activeRound');
const nextRound = nodecg.Replicant<NextRound>('nextRound');

nodecg.listenFor('updateRoundStore', (data: UpdateRoundStoreRequest, ack: UnhandledListenForCb) => {
    const id = data.id ?? generateId();
    const roundStoreValue = roundStore.value[id];
    const originalValue = clone(roundStoreValue);

    const mappedGames = clone(data.games).map((game, index) =>
        ({ ...game, winner: originalValue?.games[index]?.winner || GameWinner.NO_WINNER }));

    if (!roundStoreValue) {
        roundStore.value[id] = {
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

    if (activeRound.value.round.id === id) {
        setActiveRoundGames(activeRound.value, id);
    }
    if (nextRound.value.round.id === id) {
        setNextRoundGames(id);
    }

    return ack(null, {
        id,
        round: {
            games: mappedGames,
            meta: {
                name: data.roundName
            }
        }
    });
});

nodecg.listenFor('removeRound', (data: RemoveRoundRequest, ack: UnhandledListenForCb) => {
    if (Object.keys(roundStore.value).length <= 1) {
        return ack(new Error('Cannot delete the last round.'));
    }
    if (!roundStore.value[data.roundId]) {
        return ack(new Error(`Couldn't find round with id '${data.roundId}'.`));
    }

    delete roundStore.value[data.roundId];

    const firstRoundId = Object.keys(roundStore.value)[0];
    if (activeRound.value.round.id === data.roundId) {
        setActiveRoundGames(activeRound.value, firstRoundId);
    }
    if (nextRound.value.round.id === data.roundId) {
        setNextRoundGames(firstRoundId);
    }

    const newMatches = clone(matchStore.value);
    Object.entries(newMatches).forEach(([key, match]) => {
        if (match.meta.relatedRoundId === data.roundId) {
            delete newMatches[key];
        }
    });

    matchStore.value = newMatches;
});

nodecg.listenFor('resetRoundStore', () => {
    const defaultRoundId = '00000';
    const secondDefaultRoundId = '11111';

    roundStore.value = {
        [defaultRoundId]: {
            meta: {
                name: 'Default Round 1'
            },
            games: [
                {
                    stage: 'MakoMart',
                    mode: 'Clam Blitz'
                },
                {
                    stage: 'Ancho-V Games',
                    mode: 'Tower Control'
                },
                {
                    stage: 'Wahoo World',
                    mode: 'Rainmaker'
                }
            ]
        },
        [secondDefaultRoundId]: {
            meta: {
                name: 'Default Round 2'
            },
            games: [
                {
                    stage: 'Inkblot Art Academy',
                    mode: 'Turf War'
                },
                {
                    stage: 'Ancho-V Games',
                    mode: 'Tower Control'
                },
                {
                    stage: 'Wahoo World',
                    mode: 'Rainmaker'
                }
            ]
        }
    };

    setActiveRoundGames(activeRound.value, defaultRoundId);
    setNextRoundGames(secondDefaultRoundId);
});

export function commitActiveRoundToMatchStore(): void {
    const currentActiveRound = clone(activeRound.value);

    const completionTime = currentActiveRound.match.isCompleted ? DateTime.utc().toISO() : undefined;

    matchStore.value[currentActiveRound.match.id] = {
        ...(matchStore.value[currentActiveRound.round.id]),
        meta: {
            name: currentActiveRound.match.name,
            isCompleted: currentActiveRound.match.isCompleted,
            relatedRoundId: currentActiveRound.round.id,
            completionTime
        },
        teamA: currentActiveRound.teamA,
        teamB: currentActiveRound.teamB,
        games: currentActiveRound.games.map((game) =>
            ({ stage: game.stage, mode: game.mode, winner: game.winner, color: game.color }))
    };
}
