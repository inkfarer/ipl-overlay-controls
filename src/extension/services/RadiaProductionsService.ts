import type { NodeCG, ReplicantServer } from 'nodecg/server';
import { RadiaProductionsClient } from '../clients/RadiaProductionsClient';
import { Casters, RadiaSettings } from 'schemas';
import { RadiaApiCaster } from '../types/radiaApi';

export class RadiaProductionsService {
    private readonly radiaProductionsClient: RadiaProductionsClient;
    private radiaSettings: ReplicantServer<RadiaSettings>;
    private casters: ReplicantServer<Casters>;

    constructor(nodecg: NodeCG, radiaProductionsClient: RadiaProductionsClient) {
        this.radiaProductionsClient = radiaProductionsClient;
        this.radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');
        this.casters = nodecg.Replicant<Casters>('casters');
    }

    async getLiveCommentators(): Promise<{ add: Casters, extra: Casters }> {
        const apiCasters = await this.radiaProductionsClient.getLiveCasters(this.radiaSettings.value.guildID);
        if (apiCasters.length <= 0) {
            throw new Error('Got no commentators from API.');
        }
        const normalizedCasters = apiCasters.map(this.normalizeCaster);

        const castersToAdd = this.mapRadiaCastersToReplicantSchema(normalizedCasters.slice(0, 3));
        const extraCasters = this.mapRadiaCastersToReplicantSchema(normalizedCasters.slice(3));

        this.casters.value = castersToAdd;

        return {
            add: castersToAdd,
            extra: extraCasters
        };
    }

    private normalizeCaster(caster: RadiaApiCaster): RadiaApiCaster {
        caster.twitter = `@${caster.twitter}`;
        caster.pronouns = caster.pronouns.toLowerCase();
        return caster;
    }

    private mapRadiaCastersToReplicantSchema(casters: RadiaApiCaster[]): Casters {
        return casters.reduce((map: Casters, obj) => {
            const id = obj.discord_user_id;
            delete obj.discord_user_id;
            map[id] = obj;
            return map;
        }, {});
    }
}