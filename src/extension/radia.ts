import axios from 'axios';
import * as nodecgContext from './util/nodecg';
import { Casters, RadiaSettings } from 'schemas';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import { RadiaApiCaster } from './types/radiaApiCaster';

const nodecg = nodecgContext.get();

const casters = nodecg.Replicant<Casters>('casters');
const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');

const radiaConfig = nodecg.bundleConfig.radia;

nodecg.listenFor('getLiveCommentators', async (data, ack: UnhandledListenForCb) => {
    getLiveCasters(radiaConfig.url, radiaConfig.authentication, radiaSettings.value.guildID)
        .then(data => {
            if (data.length <= 0) return ack('Got no commentators from API.');

            const castersToAdd = data.slice(0, 3);
            const extraCasters = data.slice(3);

            // Format casters to the map format our replicant expects
            casters.value = castersToAdd.reduce((map: Casters, obj) => {
                const id = obj.discord_user_id;
                delete obj.discord_user_id;
                obj.twitter = '@' + obj.twitter;
                map[id] = obj;
                return map;
            }, {});

            // add: The casters that where added to the replicant
            // extra: Casters that where not added to replicant as we already meet the max of 3 casters
            ack(null, { add: castersToAdd, extra: extraCasters });
        })
        .catch(err => {
            // If the API gives us a 404, just ignore it :)
            if (err.response.status === 404) {
                ack(null, null);
            }

            ack(err);
        });
});


/**
 * Get the current live casters in vc from a guild
 * @param {string} url Base API URL
 * @param {string} authorisation API key for authentication
 * @param {string} guildID Guild ID of discord server
 * @returns {Promise<list>} List of live casters
 */
async function getLiveCasters(url: string, authorisation: string, guildID: string): Promise<RadiaApiCaster[]> {
    return new Promise((resolve, reject) => {
        axios
            .get<RadiaApiCaster[]>(`${url}/live/guild/${guildID}`, {
                headers: {
                    Authorization: authorisation
                }
            })
            .then(response => {
                if (response.status !== 200) {
                    reject(`Radia API call failed with response ${response.status.toString()}`);
                    return;
                }
                resolve(response.data);
            })
            .catch(err => {
                reject(err);
            });
    });
}
