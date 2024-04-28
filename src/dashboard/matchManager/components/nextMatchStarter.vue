<template>
    <ipl-expanding-space
        key="next-round"
        :title="$t('nextMatchStarter.sectionTitle')"
    >
        <ipl-data-row
            :label="$t('nextMatchStarter.teamADisplayLabel')"
            :value="roundData.teamAName"
        />
        <ipl-data-row
            :label="$t('nextMatchStarter.teamBDisplayLabel')"
            :value="roundData.teamBName"
        />
        <ipl-data-row
            :label="$t('nextMatchStarter.roundNameDisplayLabel')"
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
import BeginNextMatch from './beginNextMatch.vue';

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
