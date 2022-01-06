import { NodeCGBrowser } from 'nodecg/browser';
import { createStore, Store, useStore } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import { InjectionKey } from 'vue';
import {
    HighlightedMatches,
    TournamentData
} from 'schemas';
import { SelectOptions } from '../types/select';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';

const highlightedMatches = nodecg.Replicant<HighlightedMatches>('highlightedMatches');
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');

export const highlightedMatchReps = [ highlightedMatches, tournamentData ];

export interface HighlightedMatchStore {
    highlightedMatches: HighlightedMatches;
    tournamentData: TournamentData;
}

export const highlightedMatchStore = createStore<HighlightedMatchStore>({
    state: {
        highlightedMatches: null,
        tournamentData: null
    },
    mutations: {
        setState(store, { name, val }: { name: string, val: unknown }): void {
            this.state[name] = cloneDeep(val);
        }
    },
    actions: {
        async getHighlightedMatches(store, { options }: { options: SelectOptions }): Promise<void> {
            const getAllMatches = options.some(option => option.value === 'all');

            if (getAllMatches) {
                return nodecg.sendMessage('getHighlightedMatches', { getAllMatches });
            } else {
                const values = options.map(option => option.value);

                switch (store.state.tournamentData.meta.source) {
                    case TournamentDataSource.BATTLEFY:
                        return nodecg.sendMessage('getHighlightedMatches', {
                            getAllMatches: false,
                            stages: values
                        });
                    case TournamentDataSource.SMASHGG:
                        return nodecg.sendMessage('getHighlightedMatches', {
                            getAllMatches: false,
                            streamIDs: values.map(value => parseInt(value))
                        });
                    default:
                        throw new Error(`Cannot import data from source '${store.state.tournamentData.meta.source}'`);
                }
            }
        },
        async setNextMatch(store, { teamAId, teamBId }: { teamAId: string, teamBId: string }): Promise<void> {
            return nodecg.sendMessage('setNextRound', { teamAId, teamBId });
        }
    }
});

export const highlightedMatchStoreKey: InjectionKey<Store<HighlightedMatchStore>> = Symbol();

export function useHighlightedMatchStore(): Store<HighlightedMatchStore> {
    return useStore(highlightedMatchStoreKey);
}
