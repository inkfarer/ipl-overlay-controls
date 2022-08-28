<template>
    <ipl-error-display class="m-b-8" />
    <div class="layout horizontal even-spacing">
        <div>
            <team-data-importer />
        </div>
        <div class="m-l-8">
            <round-importer />
            <match-exporter class="m-t-8" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TeamDataImporter from './components/teamDataImporter.vue';
import RoundImporter from './components/roundImporter.vue';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';
import MatchExporter from './components/matchExporter.vue';

export default defineComponent({
    name: 'DataImport',

    components: { MatchExporter, IplErrorDisplay, RoundImporter, TeamDataImporter }
});
</script>
