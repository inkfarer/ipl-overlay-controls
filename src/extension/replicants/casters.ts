import type NodeCG from '@nodecg/types';
import * as nodecgContext from '../helpers/nodecg';
import { RemoveCasterRequest } from 'types/messages/casters';
import { Caster, Casters } from 'schemas';
import { generateId } from '../../helpers/generateId';

const nodecg = nodecgContext.get();

const casters = nodecg.Replicant<Casters>('casters');

nodecg.listenFor('removeCaster', (data: RemoveCasterRequest, ack: NodeCG.UnhandledAcknowledgement) => {
    if (!casters.value[data.id]) {
        return ack(new Error(`Caster '${data.id}' not found.`));
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
        return ack(new Error('"casterIds" must be provided as a list of strings.'));
    }
    if (!data.casterIds.every(id => !!casters.value[id])
        || data.casterIds.length !== Object.keys(casters.value).length) {
        return ack(new Error('Could not re-order casters as caster ID list has unknown or missing IDs'));
    }

    casters.value = data.casterIds.reduce((result, id) => {
        result[id] = casters.value[id];
        return result;
    }, {} as Casters);
    ack(null);
});
