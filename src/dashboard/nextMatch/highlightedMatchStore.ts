import { NodeCGBrowser } from 'nodecg/browser';
import { HighlightedMatches, TournamentData } from 'schemas';
import { SelectOptions } from '../types/select';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { SetNextRoundRequest } from 'types/messages/rounds';
import { defineStore } from 'pinia';

const highlightedMatches = nodecg.Replicant<HighlightedMatches>('highlightedMatches');
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');

export const highlightedMatchReps = [ highlightedMatches, tournamentData ];

export interface HighlightedMatchStore {
    highlightedMatches: HighlightedMatches;
    tournamentData: TournamentData;
}

export const useHighlightedMatchStore = defineStore('highlightedMatches', {
    state: () => ({
        highlightedMatches: null,
        tournamentData: null
    } as HighlightedMatchStore),
    actions: {
        async getHighlightedMatches({ options }: { options: SelectOptions }): Promise<void> {
            const getAllMatches = options.some(option => option.value === 'all');

            if (getAllMatches) {
                return nodecg.sendMessage('getHighlightedMatches', { getAllMatches });
            } else {
                const values = options.map(option => option.value);

                switch (this.tournamentData.meta.source) {
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
                        throw new Error(`Cannot import data from source '${this.tournamentData.meta.source}'`);
                }
            }
        },
        async setNextMatch(data: SetNextRoundRequest): Promise<void> {
            return nodecg.sendMessage('setNextRound', data);
        }
    }
});
