<template>
    <ipl-error-display class="m-b-8" />
    <team-data-importer />
    <round-importer class="m-t-8" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TeamDataImporter from './components/teamDataImporter.vue';
import RoundImporter from './components/roundImporter.vue';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';

export default defineComponent({
    name: 'DataImport',

    components: { IplErrorDisplay, RoundImporter, TeamDataImporter }
});
</script>
