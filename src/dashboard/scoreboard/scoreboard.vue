<template>
    <ipl-space>
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
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref } from 'vue';
import IplSpace from '../components/iplSpace.vue';
import IplInput from '../components/iplInput.vue';
import { useScoreboardStore } from './scoreboardStore';
import { ScoreboardData } from 'schemas';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import IplButton from '../components/iplButton.vue';
import IplToggle from '../components/iplToggle.vue';

export default defineComponent({
    name: 'Scoreboard',

    components: { IplToggle, IplButton, IplInput, IplSpace },

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
