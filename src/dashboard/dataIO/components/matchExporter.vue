<template>
    <bordered-space label="Export saved matches">
        <ipl-space>
            <div class="text-small text-center">Storing data for {{ pluralize('match', matchCount, 'matches') }}</div>
            <ipl-button
                label="Export"
                class="m-t-4"
                :href="`/${bundleName}/match-data`"
            />
        </ipl-space>
    </bordered-space>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IplButton, IplSpace, pluralize } from '@iplsplatoon/vue-components';
import { useTournamentDataStore } from '../../store/tournamentDataStore';
import { computed } from 'vue';
import BorderedSpace from '../../components/BorderedSpace.vue';

export default defineComponent({
    name: 'MatchExporter',

    components: { BorderedSpace, IplButton, IplSpace },

    setup() {
        const tournamentDataStore = useTournamentDataStore();

        return {
            pluralize,
            matchCount: computed(() => Object.keys(tournamentDataStore.matchStore).length),
            bundleName: nodecg.bundleName
        };
    }
});
</script>
