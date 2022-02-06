import * as nodecgContext from '../helpers/nodecg';
import { Casters, RadiaSettings } from 'schemas';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import { getLiveCasters } from './clients/radiaClient';
import { RadiaApiCaster } from '../types/radiaApi';

const nodecg = nodecgContext.get();

const casters = nodecg.Replicant<Casters>('casters');
const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');

nodecg.listenFor('getLiveCommentators', async (data, ack: UnhandledListenForCb) => {
    try {
        const result = await getLiveCasters(radiaSettings.value.guildID);
        if (result.length <= 0) return ack(new Error('Got no commentators from API.'));
        const normalizedResult = result.map(normalizeCaster);

        const castersToAdd = normalizedResult.slice(0, 3);
        const extraCasters = normalizedResult.slice(3);

        // Format casters to the map format our replicant expects
        casters.value = castersToAdd.reduce((map: Casters, obj) => {
            const id = obj.discord_user_id;
            delete obj.discord_user_id;
            map[id] = obj;
            return map;
        }, {});

        // add: The casters that where added to the replicant
        // extra: Casters that where not added to replicant as we already meet the max of 3 casters
        ack(null, { add: castersToAdd, extra: extraCasters });
    } catch (e) {
        // If the API gives us a 404, just ignore it :)
        if (e?.response?.status === 404) {
            return ack(null, null);
        }

        ack(e);
    }
});

function normalizeCaster(caster: RadiaApiCaster): RadiaApiCaster {
    caster.twitter = `@${caster.twitter}`;
    caster.pronouns = caster.pronouns.toLowerCase();
    return caster;
}
