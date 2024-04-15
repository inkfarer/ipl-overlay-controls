import type NodeCG from '@nodecg/types';
import * as nodecgContext from '../helpers/nodecg';
import { NextRound, RoundStore } from 'schemas';
import { RemoveRoundRequest, UpdateRoundStoreRequest } from 'types/messages/roundStore';
import { setNextRoundGames } from '../helpers/nextRoundHelper';
import { generateId } from '../../helpers/generateId';
import { resetRoundStore } from '../helpers/roundStoreHelper';
import i18next from 'i18next';

const nodecg = nodecgContext.get();

const roundStore = nodecg.Replicant<RoundStore>('roundStore');
const nextRound = nodecg.Replicant<NextRound>('nextRound');

nodecg.listenFor('updateRound', (data: UpdateRoundStoreRequest, ack: NodeCG.UnhandledAcknowledgement) => {
    if (!data.id) {
        return ack(new Error(i18next.t('invalidArgumentsError')));
    }
    if (!roundStore.value[data.id]) {
        return ack(new Error(i18next.t('roundStore.roundNotFound', { id: data.id })));
    }

    const roundStoreValue = roundStore.value[data.id];

    if (data.games) {
        roundStoreValue.games = data.games;
    }
    if (data.roundName) {
        roundStoreValue.meta.name = data.roundName;
    }
    if (data.type) {
        roundStoreValue.meta.type = data.type;
    }

    if (nextRound.value.round.id === data.id) {
        setNextRoundGames(data.id);
    }

    ack(null);
});

nodecg.listenFor('insertRound', (data: UpdateRoundStoreRequest, ack: NodeCG.UnhandledAcknowledgement) => {
    if (data.id && roundStore.value[data.id]) {
        return ack(new Error(i18next.t('roundStore.roundAlreadyExists', { id: data.id })));
    }

    const id = data.id ?? generateId();

    roundStore.value[id] = {
        games: data.games,
        meta: {
            name: data.roundName,
            isCompleted: false,
            type: data.type
        }
    };

    return ack(null, {
        id,
        round: {
            games: data.games,
            meta: {
                name: data.roundName,
                type: data.type
            }
        }
    });
});

nodecg.listenFor('removeRound', (data: RemoveRoundRequest, ack: NodeCG.UnhandledAcknowledgement) => {
    if (Object.keys(roundStore.value).length <= 1) {
        return ack(new Error(i18next.t('roundStore.cannotDeleteLastRound')));
    }
    if (!roundStore.value[data.roundId]) {
        return ack(new Error(i18next.t('roundStore.roundNotFound', { id: data.roundId })));
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
    resetRoundStore();
});
