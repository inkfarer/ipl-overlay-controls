<template>
    <ipl-expanding-space
        key="next-round"
        title="Begin Next Match"
    >
        <ipl-data-row
            label="Team A"
            :value="roundData.teamAName"
        />
        <ipl-data-row
            label="Team B"
            :value="roundData.teamBName"
        />
        <ipl-data-row
            label="Round"
            :value="roundData.name"
        />
        <begin-next-match
            class="m-t-4"
        />
    </ipl-expanding-space>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { IplDataRow, IplExpandingSpace } from '@iplsplatoon/vue-components';
import { useNextRoundStore } from '../../store/nextRoundStore';
import { addDots } from '../../../helpers/stringHelper';
import BeginNextMatch from '../../components/beginNextMatch.vue';

export default defineComponent({
    name: 'NextMatchStarter',

    components: { IplDataRow, BeginNextMatch, IplExpandingSpace },

    setup() {
        const nextRoundStore = useNextRoundStore();

        return {
            roundData: computed(() => ({
                name: nextRoundStore.nextRound.round.name,
                teamAName: addDots(nextRoundStore.nextRound.teamA.name),
                teamBName: addDots(nextRoundStore.nextRound.teamB.name)
            })),
        };
    }
});
</script>
