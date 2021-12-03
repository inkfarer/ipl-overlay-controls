<template>
    <ipl-error-display class="m-b-8" />
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
        <highlighted-match-importer />
        <highlighted-match-viewer class="m-t-8" />
    </template>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useHighlightedMatchStore } from './highlightedMatchStore';
import { TournamentDataSource, TournamentDataSourceHelper } from 'types/enums/tournamentDataSource';
import IplMessage from '../components/iplMessage.vue';
import HighlightedMatchImporter from './components/highlightedMatchImporter.vue';
import HighlightedMatchViewer from './components/highlightedMatchViewer.vue';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';
import isEmpty from 'lodash/isEmpty';

export default defineComponent({
    name: 'HighlightedMatches',

    components: { IplErrorDisplay, HighlightedMatchViewer, HighlightedMatchImporter, IplMessage },

    setup() {
        const store = useHighlightedMatchStore();
        const tournamentDataSource = computed(() => store.state.tournamentData.meta.source as TournamentDataSource);

        return {
            canImportData: computed(() => [TournamentDataSource.BATTLEFY, TournamentDataSource.SMASHGG]
                .includes(tournamentDataSource.value)),
            formattedDataSource: computed(() => TournamentDataSourceHelper.toPrettyString(tournamentDataSource.value )),
            stageDataPresent: computed(() => !isEmpty(store.state.tournamentData.stages))
        };
    }
});
</script>
