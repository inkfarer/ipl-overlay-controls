import { HighlightedMatches, TournamentData } from 'schemas';
import { SelectOptions } from '../types/select';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { SetNextRoundRequest } from 'types/messages/rounds';
import { defineStore } from 'pinia';
import i18next from 'i18next';
import { sendMessage } from '../helpers/nodecgHelper';

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
                return sendMessage('highlightedMatches:import', { getAllMatches });
            } else {
                const values = options.map(option => option.value);

                switch (this.tournamentData.meta.source) {
                    case TournamentDataSource.BATTLEFY:
                        return sendMessage('highlightedMatches:import', {
                            getAllMatches: false,
                            stages: values
                        });
                    case TournamentDataSource.SMASHGG:
                        return sendMessage('highlightedMatches:import', {
                            getAllMatches: false,
                            streamIDs: values.map(value => parseInt(value))
                        });
                    default:
                        throw new Error(i18next.t('cannotImportDataError', { source: this.tournamentData.meta.source }));
                }
            }
        },
        async setNextMatch(data: SetNextRoundRequest): Promise<void> {
            return nodecg.sendMessage('setNextRound', data);
        }
    }
});
