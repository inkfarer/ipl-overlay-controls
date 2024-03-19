import axios, { type AxiosInstance } from 'axios';
import { TournamentData } from 'schemas';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import * as nodecgContext from '../helpers/nodecg';

interface SendouInkGetTournamentResponse {
    name: string
    url: string
    logoUrl: string | null
    startTime: string
    teams: {
        registeredCount: number
        checkedInCount: number
    }
}

type SendouInkGetTournamentTeamsResponse = Array<{
    id: number
    name: string
    registeredAt: string
    checkedIn: boolean
    url: string
    seed: number | null
    mapPool: Array<SendouInkStageWithMode> | null
    members: Array<{
        userId: number
        name: string
        discordId: string
        avatarUrl: string | null
        captain: boolean
        joinedAt: string
    }>;
}>;

type SendouInkStageWithMode = {
    mode: string
    stage: {
        id: number
        name: string
    }
}

export class SendouInkClient {
    private readonly axios: AxiosInstance;

    constructor(apiKey: string) {
        this.axios = axios.create({
            baseURL: 'https://sendou.ink/api',
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        });
    }

    async getTournamentData(tournamentId: string): Promise<TournamentData> {
        const tournamentData = await this.axios.get<SendouInkGetTournamentResponse>(`/tournament/${tournamentId}`);
        const teams = await this.axios.get<SendouInkGetTournamentTeamsResponse>(`/tournament/${tournamentId}/teams`);

        return {
            meta: {
                id: tournamentId,
                source: TournamentDataSource.SENDOU_INK,
                name: tournamentData.data.name,
                shortName: tournamentData.data.name,
                url: tournamentData.data.url
            },
            teams: teams.data.map(team => ({
                id: String(team.id),
                name: team.name,
                showLogo: true,
                players: team.members.map(member => ({
                    name: member.name
                }))
            }))
        };
    }
}

const nodecg = nodecgContext.get();
export let SendouInkClientInstance: SendouInkClient | undefined;
if (nodecg.bundleConfig.sendouInk?.apiKey != null) {
    SendouInkClientInstance = new SendouInkClient(nodecg.bundleConfig.sendouInk?.apiKey);
}
