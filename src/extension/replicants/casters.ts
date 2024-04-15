import type NodeCG from '@nodecg/types';
import * as nodecgContext from '../helpers/nodecg';
import { RemoveCasterRequest } from 'types/messages/casters';
import { Caster, Casters } from 'schemas';
import { generateId } from '../../helpers/generateId';
import i18next from 'i18next';

const nodecg = nodecgContext.get();

const casters = nodecg.Replicant<Casters>('casters');

nodecg.listenFor('removeCaster', (data: RemoveCasterRequest, ack: NodeCG.UnhandledAcknowledgement) => {
    if (!casters.value[data.id]) {
        return ack(new Error(i18next.t('casters.casterNotFound', { id: data.id })));
    }

    delete casters.value[data.id];
});

nodecg.listenFor('saveCaster', (data: Caster, ack: NodeCG.UnhandledAcknowledgement) => {
    const id = generateId();
    casters.value[id] = data;
    ack(null, id);
});

nodecg.listenFor('setCasterOrder', (data: { casterIds: string[] }, ack: NodeCG.UnhandledAcknowledgement) => {
    if (!Array.isArray(data.casterIds)) {
        return ack(new Error(i18next.t('invalidArgumentsError')));
    }
    if (!data.casterIds.every(id => !!casters.value[id])
        || data.casterIds.length !== Object.keys(casters.value).length) {
        return ack(new Error(i18next.t('casters.badCasterIdListForReordering')));
    }

    casters.value = data.casterIds.reduce((result, id) => {
        result[id] = casters.value[id];
        return result;
    }, {} as Casters);
    ack(null);
});
