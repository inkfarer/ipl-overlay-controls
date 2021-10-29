import { RoundStore, TournamentData } from 'schemas';
import { createStore, Store, useStore } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import { InjectionKey } from 'vue';
import { ToggleTeamImageRequest } from 'types/messages/tournamentData';

const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
const roundStore = nodecg.Replicant<RoundStore>('roundStore');

export const tournamentDataReps = [ tournamentData, roundStore ];

export interface TournamentDataStore {
    tournamentData: TournamentData;
    roundStore: RoundStore;
}

export const tournamentDataStore = createStore<TournamentDataStore>({
    state: {
        tournamentData: null,
        roundStore: null
    },
    mutations: {
        setState(store, { name, val }: { name: string, val: unknown }): void {
            this.state[name] = cloneDeep(val);
        },
        setTeamImageHidden(store, { teamId, isVisible }: { teamId: string, isVisible: boolean }): void {
            nodecg.sendMessage('toggleTeamImage', { teamId, isVisible } as ToggleTeamImageRequest);
        }
    },
    actions: {
        async getTournamentData(store, { method, id }: { method: TournamentDataStore, id: string }): Promise<void> {
            return await nodecg.sendMessage('getTournamentData', { method, id });
        },
        async getSmashggEvent(store, { eventId }: { eventId: number }): Promise<void> {
            return await nodecg.sendMessage('getSmashggEvent', { eventId });
        },
        async uploadTeamData(store, { file }: { file: File }) {
            return sendLocalFile('teams', file);
        },
        async uploadRoundData(store, { file }: { file: File }) {
            return sendLocalFile('rounds', file);
        }
    }
});

async function sendLocalFile(dataType: 'teams' | 'rounds', file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jsonType', dataType);

    const response = await fetch('/ipl-overlay-controls/upload-tournament-json', { method: 'POST', body: formData });

    if (response.status !== 200) {
        throw new Error(`Import failed with status ${response.status}`);
    }
}

export const tournamentDataStoreKey: InjectionKey<Store<TournamentDataStore>> = Symbol();

export function useTournamentDataStore(): Store<TournamentDataStore> {
    return useStore(tournamentDataStoreKey);
}
