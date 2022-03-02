<template>
    <div class="active-roster-display">
        <team-roster-display
            :team="teamA"
            class="text-right"
        />
        <div class="separator" />
        <team-roster-display :team="teamB" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import { useActiveRoundStore } from '../store/activeRoundStore';
import { computed } from 'vue';
import TeamRosterDisplay from './teamRosterDisplay.vue';

export default defineComponent({
    name: 'ActiveRosterDisplay',

    components: { TeamRosterDisplay },

    setup() {
        const activeRoundStore = useActiveRoundStore();

        return {
            teamA: computed(() => activeRoundStore.state.activeRound.teamA),
            teamB: computed(() => activeRoundStore.state.activeRound.teamB)
        };
    }
});
</script>

<style lang="scss">
@import '../styles/colors';

.active-roster-display {
    display: grid;
    grid-template-columns: 1fr 1px 1fr;
    gap: 8px;

    > .separator {
        height: 100%;
        width: 100%;
        background-color: $input-color;
    }
}
</style>
