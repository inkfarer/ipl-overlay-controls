import axios from 'axios';
import * as nodecgContext from './util/nodecg';
import { Caster, Casters, RadiaSettings } from 'types/schemas';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';

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
            casters.value = castersToAdd.reduce((map, obj) => {
                const id = obj.discordId;
                delete obj.discordId;
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
async function getLiveCasters(url: string, authorisation: string, guildID: string): Promise<Caster[]> {
    return new Promise((resolve, reject) => {
        axios
            .get(`${url}/live/guild/${guildID}`, {
                headers: {
                    Authorization: authorisation
                }
            })
            .then(response => {
                const { data } = response;
                if (data.error) {
                    reject(data.error);
                    return;
                }

                const casters: Caster[] = [];
                data.forEach((item: Caster) => {
                    casters.push({
                        discordId: item.discord_user_id,
                        name: item.name,
                        twitter: `@${item.twitter}`,
                        pronouns: item.pronouns
                    });
                });
                resolve(casters);
            })
            .catch(err => {
                reject(err);
            });
    });
}
