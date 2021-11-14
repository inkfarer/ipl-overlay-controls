<template>
    <ipl-expanding-space
        key="scoreboard"
        title="Scoreboard"
    >
        <ipl-input
            v-model="scoreboardData.flavorText"
            label="Flavor text"
            name="flavor-text"
            @focuschange="handleFocusEvent"
        />
        <ipl-button
            label="Update"
            class="m-t-8"
            :color="buttonColor"
            data-test="update-button"
            @click="setFlavorText"
        />
        <ipl-toggle
            v-model="scoreboardData.isVisible"
            class="m-t-8"
            data-test="scoreboard-visible-toggle"
            @update:modelValue="setScoreboardVisible"
        />
    </ipl-expanding-space>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref } from 'vue';
import IplExpandingSpace from '../../components/iplExpandingSpace.vue';
import IplInput from '../../components/iplInput.vue';
import IplToggle from '../../components/iplToggle.vue';
import IplButton from '../../components/iplButton.vue';
import { useScoreboardStore } from '../../store/scoreboardStore';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import { ScoreboardData } from 'schemas';
import cloneDeep from 'lodash/cloneDeep';

export default defineComponent({
    name: 'ScoreboardEditor',

    components: { IplButton, IplToggle, IplInput, IplExpandingSpace },

    setup() {
        const store = useScoreboardStore();
        const isFocused = ref(false);
        const isChanged = computed(() => !isEqual(
            pick(scoreboardData.value, [ 'flavorText' ]),
            pick(store.state.scoreboardData, [ 'flavorText' ])
        ));
        const scoreboardData: Ref<ScoreboardData> = ref(cloneDeep(store.state.scoreboardData));

        store.watch(store => store.scoreboardData.flavorText, (newValue) => {
            if (!isFocused.value) {
                scoreboardData.value.flavorText = newValue;
            }
        });

        store.watch(store => store.scoreboardData.isVisible, newValue => {
            scoreboardData.value.isVisible = newValue;
        });

        return {
            scoreboardData,
            handleFocusEvent(event: boolean) {
                isFocused.value = event;
            },
            buttonColor: computed(() => isChanged.value ? 'red' : 'blue'),
            setFlavorText() {
                if (isChanged.value) {
                    store.commit('setFlavorText', scoreboardData.value.flavorText);
                }
            },
            setScoreboardVisible(value: boolean) {
                store.commit('setScoreboardVisible', value);
            }
        };
    }
});
</script>

<style lang="scss" scoped>

</style>
