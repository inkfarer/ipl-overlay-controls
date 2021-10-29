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
        }
    }
});

export const tournamentDataStoreKey: InjectionKey<Store<TournamentDataStore>> = Symbol();

export function useTournamentDataStore(): Store<TournamentDataStore> {
    return useStore(tournamentDataStoreKey);
}
