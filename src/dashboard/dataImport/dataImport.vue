<template>
    <team-data-importer />
    <round-importer class="m-t-8" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TeamDataImporter from './components/teamDataImporter.vue';
import RoundImporter from './components/roundImporter.vue';

export default defineComponent({
    name: 'DataImport',
    components: { RoundImporter, TeamDataImporter }
});
</script>
