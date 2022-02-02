<template>
    <ipl-error-display class="m-b-8" />
    <team-data-importer />
    <round-importer class="m-t-8" />
    <match-exporter class="m-t-8" />
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
