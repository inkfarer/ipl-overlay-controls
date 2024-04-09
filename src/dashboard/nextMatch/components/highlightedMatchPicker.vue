<template>
    <ipl-message
        v-if="!stageDataPresent"
        type="info"
        data-test="missing-stages-message"
    >
        {{ $t('highlightedMatches.missingStageDataMessage') }}
    </ipl-message>
    <template v-else>
        <div>
            <highlighted-match-importer />
            <highlighted-match-viewer class="m-t-8" />
        </div>
    </template>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import HighlightedMatchViewer from './highlightedMatchViewer.vue';
import HighlightedMatchImporter from './highlightedMatchImporter.vue';
import { IplMessage } from '@iplsplatoon/vue-components';
import { useHighlightedMatchStore } from '../highlightedMatchStore';
import { computed } from 'vue';
import isEmpty from 'lodash/isEmpty';

export default defineComponent({
    name: 'HighlightedMatchPicker',

    components: { HighlightedMatchViewer, HighlightedMatchImporter, IplMessage },

    setup() {
        const store = useHighlightedMatchStore();

        return {
            stageDataPresent: computed(() => !isEmpty(store.tournamentData.stages)
                || !isEmpty(store.tournamentData.meta.sourceSpecificData?.smashgg?.streams))
        };
    }
});
</script>
