<template>
    <bordered-space :label="$t('matchExporter.sectionTitle')">
        <ipl-space>
            <div class="text-small text-center">{{ $t('matchExporter.matchCount', { count: matchCount }) }}</div>
            <ipl-button
                :label="$t('matchExporter.exportButton')"
                class="m-t-4"
                :href="`/${bundleName}/match-data`"
            />
        </ipl-space>
    </bordered-space>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IplButton, IplSpace } from '@iplsplatoon/vue-components';
import { useTournamentDataStore } from '../../store/tournamentDataStore';
import { computed } from 'vue';
import BorderedSpace from '../../components/BorderedSpace.vue';

export default defineComponent({
    name: 'MatchExporter',

    components: { BorderedSpace, IplButton, IplSpace },

    setup() {
        const tournamentDataStore = useTournamentDataStore();

        return {
            matchCount: computed(() => Object.keys(tournamentDataStore.matchStore).length),
            bundleName: nodecg.bundleName
        };
    }
});
</script>
