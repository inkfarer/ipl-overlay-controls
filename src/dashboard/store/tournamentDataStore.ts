import { MatchStore, RoundStore, TournamentData } from 'schemas';
import {
    GetTournamentDataRequest,
    GetTournamentDataResponse,
    ToggleTeamImageRequest
} from 'types/messages/tournamentData';
import { UpdateRoundStoreRequest, UpdateRoundStoreResponse } from 'types/messages/roundStore';
import { defineStore } from 'pinia';
import i18next from 'i18next';

const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
const roundStore = nodecg.Replicant<RoundStore>('roundStore');
const matchStore = nodecg.Replicant<MatchStore>('matchStore');

export const tournamentDataReps = [ tournamentData, roundStore, matchStore ];

export interface TournamentDataStore {
    tournamentData: TournamentData;
    roundStore: RoundStore;
    matchStore: MatchStore;
}

export const useTournamentDataStore = defineStore('tournamentData', {
    state: () => ({
        tournamentData: null,
        roundStore: null,
        matchStore: null
    } as TournamentDataStore),
    actions: {
        async getTournamentData({ method, id }: GetTournamentDataRequest): Promise<GetTournamentDataResponse> {
            return nodecg.sendMessage('getTournamentData', { method, id });
        },
        async getSmashggEvent({ eventId }: { eventId: number }): Promise<void> {
            return await nodecg.sendMessage('getSmashggEvent', { eventId });
        },
        async uploadTeamData({ file }: { file: File }): Promise<void> {
            return sendLocalFile('teams', file);
        },
        async uploadRoundData({ file }: { file: File }): Promise<void> {
            return sendLocalFile('rounds', file);
        },
        async fetchRoundData({ url }: { url: string }): Promise<void> {
            return nodecg.sendMessage('getRounds', { url });
        },
        async updateRound(data: UpdateRoundStoreRequest): Promise<void> {
            return nodecg.sendMessage('updateRound', data);
        },
        async insertRound(data: UpdateRoundStoreRequest): Promise<UpdateRoundStoreResponse> {
            return nodecg.sendMessage('insertRound', data);
        },
        resetRoundStore() {
            nodecg.sendMessage('resetRoundStore');
        },
        setTeamImageHidden({ teamId, isVisible }: { teamId: string, isVisible: boolean }): Promise<void> {
            return nodecg.sendMessage('toggleTeamImage', { teamId, isVisible } as ToggleTeamImageRequest);
        },
        removeRound({ roundId }: { roundId: string }): Promise<void> {
            return nodecg.sendMessage('removeRound', { roundId });
        },
        setShortName(newValue: string): void {
            tournamentData.value.meta.shortName = newValue;
        },
        async refreshTournamentData(): Promise<void> {
            return nodecg.sendMessage('refreshTournamentData');
        }
    }
});

async function sendLocalFile(dataType: 'teams' | 'rounds', file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jsonType', dataType);

    const response = await fetch('/ipl-overlay-controls/upload-tournament-json', { method: 'POST', body: formData });

    if (response.status !== 200) {
        const responseText = await response.text();
        throw new Error(i18next.t(
            'common:tournamentDataStore.fileUploadError',
            { statusCode: response.status, message: responseText }));
    }
}
