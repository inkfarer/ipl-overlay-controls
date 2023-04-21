import { RadiaApiCaster } from '../types/radiaApi';
import axios, { AxiosInstance } from 'axios';
import { handleAxiosError } from '../importers/clients/radiaClient';

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
}
