import { RadiaApiCaster, RadiaCasterSearchResultItem } from '../types/radiaApi';
import axios, { AxiosInstance } from 'axios';
import { handleAxiosError } from '../importers/clients/radiaClient';
import { isBlank } from '../../helpers/stringHelper';

export class RadiaProductionsClient {
    private readonly axios: AxiosInstance;

    constructor(baseUrl: string, apiKey: string) {
        this.axios = axios.create({
            baseURL: baseUrl,
            headers: {
                Authorization: apiKey
            }
        });
        this.axios.interceptors.response.use(null, handleAxiosError);
    }

    async getLiveCasters(guildId: string): Promise<RadiaApiCaster[]> {
        try {
            const response = await this.axios.get<RadiaApiCaster[]>(
                `live/guild/${guildId}`,
                { validateStatus: status => status === 200 });

            return response.data;
        } catch (e) {
            if (e.response?.status === 404) {
                return null;
            }

            throw e;
        }
    }

    async searchCasters(query: string): Promise<RadiaCasterSearchResultItem[]> {
        if (isBlank(query)) {
            return [];
        }

        const response = await this.axios.get<RadiaCasterSearchResultItem[]>(`commentators/profile/search/${encodeURI(query)}`);

        return response.data;
    }
}
