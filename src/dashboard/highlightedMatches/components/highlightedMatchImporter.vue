<template>
    <ipl-space>
        <ipl-multi-select
            v-model="selectedMatchOptions"
            :label="matchSelectLabel"
            :options="matchSelectOptions"
            data-test="match-selector"
        />
        <ipl-button
            label="Import"
            class="m-t-8"
            async
            :disabled="importDisabled"
            data-test="import-button"
            @click="handleImport"
        />
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent, ref, Ref } from 'vue';
import { IplButton, IplMultiSelect, IplSpace } from '@iplsplatoon/vue-components';
import { useHighlightedMatchStore } from '../highlightedMatchStore';
import { SelectOptions } from '../../types/select';
import { BracketType } from 'types/enums/bracketType';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';

export default defineComponent({
    name: 'HighlightedMatchImporter',

    components: { IplSpace, IplButton, IplMultiSelect },

    setup() {
        const store = useHighlightedMatchStore();
        const tournamentDataSource = computed(() => store.state.tournamentData.meta.source as TournamentDataSource);
        const selectedMatchOptions: Ref<SelectOptions> = ref([]);

        return {
            matchSelectLabel: computed(() => {
                switch (tournamentDataSource.value) {
                    case TournamentDataSource.BATTLEFY:
                        return 'Bracket';
                    case TournamentDataSource.SMASHGG:
                        return 'Stream';
                    default:
                        return '';
                }
            }),
            matchSelectOptions: computed(() => {
                switch (tournamentDataSource.value) {
                    case TournamentDataSource.BATTLEFY:
                        return [
                            ...(store.state.tournamentData.stages
                                .filter(stage => [BracketType.SWISS,
                                    BracketType.DOUBLE_ELIMINATION,
                                    BracketType.SINGLE_ELIMINATION,
                                    BracketType.ROUND_ROBIN].includes(stage.type as BracketType))
                                .map(stage => ({
                                    value: stage.id,
                                    name: stage.name
                                }))),
                            { name: 'All Brackets', value: 'all' }
                        ];
                    case TournamentDataSource.SMASHGG:
                        return [
                            ...(store.state.tournamentData.meta.sourceSpecificData.smashgg.streams.map(stream => ({
                                value: stream.id.toString(),
                                name: stream.streamName
                            }))),
                            { name: 'All Streams', value: 'all' }
                        ];
                    default:
                        return [];
                }
            }),
            selectedMatchOptions,
            async handleImport() {
                return store.dispatch('getHighlightedMatches', { options: selectedMatchOptions.value });
            },
            importDisabled: computed(() => selectedMatchOptions.value?.length <= 0)
        };
    }

});
</script>
