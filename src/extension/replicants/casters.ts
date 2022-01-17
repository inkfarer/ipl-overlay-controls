import * as nodecgContext from '../helpers/nodecg';
import { RemoveCasterRequest } from '../../types/messages/casters';
import { Caster, Casters } from '../../types/schemas';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import { generateId } from '../../helpers/generateId';

const nodecg = nodecgContext.get();

const casters = nodecg.Replicant<Casters>('casters');

nodecg.listenFor('removeCaster', (data: RemoveCasterRequest, ack: UnhandledListenForCb) => {
    if (!casters.value[data.id]) {
        return ack(new Error(`Caster '${data.id}' not found.`));
    }

    delete casters.value[data.id];
});

nodecg.listenFor('saveCaster', (data: Caster, ack: UnhandledListenForCb) => {
    const id = generateId();
    casters.value[id] = data;
    ack(null, id);
});
