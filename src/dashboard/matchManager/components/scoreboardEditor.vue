<template>
    <ipl-expanding-space
        key="scoreboard"
        title="Scoreboard"
    >
        <ipl-data-row
            label="Flavor Text"
            :value="flavorText"
        />
        <ipl-toggle
            v-model="scoreboardData.isVisible"
            class="m-t-8"
            data-test="scoreboard-visible-toggle"
            @update:model-value="setScoreboardVisible"
        />
    </ipl-expanding-space>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, watch } from 'vue';
import { IplToggle, IplExpandingSpace, IplDataRow } from '@iplsplatoon/vue-components';
import { useScoreboardStore } from '../../store/scoreboardStore';
import { ScoreboardData } from 'schemas';
import cloneDeep from 'lodash/cloneDeep';

export default defineComponent({
    name: 'ScoreboardEditor',

    components: { IplDataRow, IplToggle, IplExpandingSpace },

    setup() {
        const store = useScoreboardStore();
        const scoreboardData: Ref<ScoreboardData> = ref(cloneDeep(store.scoreboardData));

        watch(() => store.scoreboardData.isVisible, newValue => {
            scoreboardData.value.isVisible = newValue;
        });

        return {
            flavorText: computed(() => store.scoreboardData.flavorText),
            scoreboardData,
            setScoreboardVisible(value: boolean) {
                store.setScoreboardVisible(value);
            }
        };
    }
});
</script>
