<template>
    <ipl-space>
        <ipl-multi-select
            v-if="showMatchSelector"
            v-model="selectedMatchOptions"
            :label="$t('highlightedMatches.matchSourceSelect', { context: tournamentDataSource })"
            :options="matchSelectOptions"
            data-test="match-selector"
            class="m-b-8"
        />
        <iploc-button
            :label="$t('highlightedMatches.importButton')"
            async
            :disabled="importDisabled"
            data-test="import-button"
            @click="handleImport"
        />
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent, ref, Ref } from 'vue';
import { IplMultiSelect, IplSpace } from '@iplsplatoon/vue-components';
import { useHighlightedMatchStore } from '../highlightedMatchStore';
import { SelectOptions } from '../../types/select';
import { BracketType } from 'types/enums/bracketType';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { useTranslation } from 'i18next-vue';
import IplocButton from '../../components/IplocButton.vue';

export default defineComponent({
    name: 'HighlightedMatchImporter',

    components: { IplSpace, IplocButton, IplMultiSelect },

    setup() {
        const { t } = useTranslation();
        const store = useHighlightedMatchStore();
        const tournamentDataSource = computed(() => store.tournamentData.meta.source as TournamentDataSource);
        const selectedMatchOptions: Ref<SelectOptions> = ref([]);
        const showMatchSelector = computed(() => tournamentDataSource.value !== TournamentDataSource.SENDOU_INK);

        return {
            tournamentDataSource,
            showMatchSelector,
            matchSelectOptions: computed(() => {
                switch (tournamentDataSource.value) {
                    case TournamentDataSource.BATTLEFY:
                        return [
                            ...(store.tournamentData.stages
                                .filter(stage => [BracketType.SWISS,
                                    BracketType.DOUBLE_ELIMINATION,
                                    BracketType.SINGLE_ELIMINATION,
                                    BracketType.ROUND_ROBIN].includes(stage.type as BracketType))
                                .map(stage => ({
                                    value: stage.id,
                                    name: stage.name
                                }))),
                            {
                                name: t('highlightedMatches.allBattlefyBracketsOption'),
                                value: 'all'
                            }
                        ];
                    case TournamentDataSource.SMASHGG:
                        return [
                            ...(store.tournamentData.meta.sourceSpecificData.smashgg.streams.map(stream => ({
                                value: stream.id.toString(),
                                name: stream.streamName
                            }))),
                            {
                                name: t('highlightedMatches.allStartggStreamsOption'),
                                value: 'all'
                            }
                        ];
                    default:
                        return [];
                }
            }),
            selectedMatchOptions,
            async handleImport() {
                return store.getHighlightedMatches({ options: selectedMatchOptions.value });
            },
            importDisabled: computed(() => showMatchSelector.value && selectedMatchOptions.value?.length <= 0)
        };
    }

});
</script>
