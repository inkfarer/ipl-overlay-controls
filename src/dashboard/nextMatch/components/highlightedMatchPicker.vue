<template>
    <ipl-message
        v-if="!canImportData"
        type="warning"
        data-test="unsupported-source-warning"
    >
        Cannot import data from source '{{ formattedDataSource }}'.
    </ipl-message>
    <ipl-message
        v-else-if="!stageDataPresent"
        type="info"
        data-test="missing-stages-message"
    >
        No stages present to import from.
    </ipl-message>
    <template v-else>
        <div>
            <highlighted-match-importer />
            <highlighted-match-viewer class="m-t-8" />
        </div>
    </template>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import HighlightedMatchViewer from './highlightedMatchViewer.vue';
import HighlightedMatchImporter from './highlightedMatchImporter.vue';
import { IplMessage } from '@iplsplatoon/vue-components';
import { useHighlightedMatchStore } from '../highlightedMatchStore';
import { computed } from 'vue';
import { TournamentDataSource, TournamentDataSourceHelper } from 'types/enums/tournamentDataSource';
import isEmpty from 'lodash/isEmpty';

export default defineComponent({
    name: 'HighlightedMatchPicker',

    components: { HighlightedMatchViewer, HighlightedMatchImporter, IplMessage },

    setup() {
        const store = useHighlightedMatchStore();
        const tournamentDataSource = computed(() => store.tournamentData.meta.source as TournamentDataSource);

        return {
            canImportData: computed(() => [TournamentDataSource.BATTLEFY, TournamentDataSource.SMASHGG]
                .includes(tournamentDataSource.value)),
            formattedDataSource: computed(() => TournamentDataSourceHelper.toPrettyString(tournamentDataSource.value)),
            stageDataPresent: computed(() => !isEmpty(store.tournamentData.stages)
                || !isEmpty(store.tournamentData.meta.sourceSpecificData?.smashgg?.streams))
        };
    }
});
</script>
