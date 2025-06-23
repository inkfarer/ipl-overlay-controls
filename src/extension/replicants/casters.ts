import type NodeCG from '@nodecg/types';
import * as nodecgContext from '../helpers/nodecg';
import { RemoveCasterRequest } from 'types/messages/casters';
import { BundleCasterSets, Caster, Casters } from 'schemas';
import { generateId } from '../../helpers/generateId';
import i18next from 'i18next';

const nodecg = nodecgContext.get();

const casters = nodecg.Replicant<Casters>('casters');
const bundleCasterSets = nodecg.Replicant<BundleCasterSets>('bundleCasterSets');

nodecg.listenFor('removeCaster', (data: RemoveCasterRequest, ack: NodeCG.UnhandledAcknowledgement) => {
    if (data.bundleName === nodecg.bundleName) {
        if (!casters.value[data.id]) {
            return ack(new Error(i18next.t('casters.casterNotFound', { id: data.id })));
        }

        delete casters.value[data.id];
    } else {
        if (!bundleCasterSets.value[data.bundleName]?.[data.casterSetKey]?.[data.id]) {
            return ack(new Error(i18next.t('casters.casterNotFound', { id: data.id })));
        }

        delete bundleCasterSets.value[data.bundleName][data.casterSetKey][data.id];
    }
});

nodecg.listenFor('saveCaster', (data: { bundleName: string, casterSetKey: string, caster: Caster }, ack: NodeCG.UnhandledAcknowledgement) => {
    const id = generateId();
    if (data.bundleName === nodecg.bundleName) {
        casters.value[id] = data.caster;
    } else {
        bundleCasterSets.value[data.bundleName][data.casterSetKey][id] = data.caster;
    }
    ack(null, id);
});

nodecg.listenFor('setCasterOrder', (data: { bundleName: string, casterSetKey: string, casterIds: string[] }, ack: NodeCG.UnhandledAcknowledgement) => {
    if (!Array.isArray(data.casterIds)) {
        return ack(new Error(i18next.t('invalidArgumentsError')));
    }
    const existingCasters = data.bundleName === nodecg.bundleName
        ? casters.value
        : bundleCasterSets.value[data.bundleName][data.casterSetKey];
    if (!data.casterIds.every(id => !!existingCasters[id])
        || data.casterIds.length !== Object.keys(existingCasters).length) {
        return ack(new Error(i18next.t('casters.badCasterIdListForReordering')));
    }

    if (data.bundleName === nodecg.bundleName) {
        casters.value = data.casterIds.reduce((result, id) => {
            result[id] = existingCasters[id];
            return result;
        }, {} as Casters);
    } else {
        bundleCasterSets.value[data.bundleName][data.casterSetKey] = data.casterIds.reduce((result, id) => {
            result[id] = existingCasters[id];
            return result;
        }, {} as Casters);
    }
    ack(null);
});
