import * as nodecgContext from '../helpers/nodecg';
import { NextRound, RoundStore } from 'schemas';
import { RemoveRoundRequest, UpdateRoundStoreRequest } from 'types/messages/roundStore';
import clone from 'clone';
import { GameWinner } from 'types/enums/gameWinner';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import { setNextRoundGames } from './nextRoundHelper';
import { generateId } from '../../helpers/generateId';
import { PlayType } from '../../types/enums/playType';

const nodecg = nodecgContext.get();

const roundStore = nodecg.Replicant<RoundStore>('roundStore');
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
                isCompleted: false,
                type: data.type
            }
        };
    } else {
        roundStoreValue.games = mappedGames;
        roundStoreValue.meta.name = data.roundName;
        roundStoreValue.meta.type = data.type;
    }

    if (nextRound.value.round.id === id) {
        setNextRoundGames(id);
    }

    return ack(null, {
        id,
        round: {
            games: mappedGames,
            meta: {
                name: data.roundName,
                type: data.type
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

    try {
        const firstRoundId = Object.keys(roundStore.value)[0];
        if (nextRound.value.round.id === data.roundId) {
            setNextRoundGames(firstRoundId);
        }
    } catch (e) {
        return ack(e);
    }
});

nodecg.listenFor('resetRoundStore', () => {
    const defaultRoundId = '00000';
    const secondDefaultRoundId = '11111';

    roundStore.value = {
        [defaultRoundId]: {
            meta: {
                name: 'Default Round 1',
                type: PlayType.BEST_OF
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
                name: 'Default Round 2',
                type: PlayType.BEST_OF
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

    setNextRoundGames(secondDefaultRoundId);
});
