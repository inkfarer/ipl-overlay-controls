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

    async searchCommentators(query: string): Promise<Casters> {
        const apiResult = await this.radiaProductionsClient.searchCasters(query);
        const normalizedCasters = apiResult.map(this.normalizeCaster);

        return this.mapRadiaCastersToReplicantSchema(normalizedCasters);
    }

    async pushCastersToRadia() {
        await this.radiaProductionsClient.setCasters(
            this.radiaSettings.value.guildID,
            this.mapCastersToRadiaApi(this.casters.value));
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

    private mapCastersToRadiaApi(casters: Casters): RadiaApiCaster[] {
        return Object.entries(casters).map(([id, caster]) => ({
            discord_user_id: id,
            name: caster.name,
            pronouns: caster.pronouns,
            twitter: caster.twitter
        }));
    }
}