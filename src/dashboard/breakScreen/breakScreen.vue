<template>
    <ipl-error-display class="m-b-8" />
    <ipl-expanding-space title="Main Scene">
        <template #header-extra>
            <ipl-button
                class="show-scene-button m-l-8"
                label="Show"
                color="green"
                data-test="show-main-button"
                :disabled="activeBreakScene === 'main'"
                @click="setActiveBreakScene('main')"
            />
        </template>
        <ipl-input
            v-model="mainFlavorText"
            label="Flavor Text"
            name="break-main-flavor-text"
            @focuschange="handleMainFlavorTextFocus"
        />
        <div class="layout vertical center-horizontal">
            <div class="m-t-8">Next stage timer</div>
            <next-stage-time-input
                v-model="nextRoundTime"
                data-test="next-stage-time-input"
                @focuschange="handleNextRoundTimeFocus"
            />
            <ipl-checkbox
                v-model="showNextRoundTime"
                class="m-t-8"
                label="Show timer"
            />
            <ipl-button
                class="m-t-8"
                label="Update"
                :color="mainUpdateButtonColor"
                @click="updateMainScene"
            />
        </div>
    </ipl-expanding-space>
    <ipl-space class="layout horizontal center-vertical layout-break-scene m-t-8">
        <span>Teams</span>
        <ipl-button
            class="show-scene-button"
            label="Show"
            color="green"
            data-test="show-teams-button"
            :disabled="activeBreakScene === 'teams'"
            @click="setActiveBreakScene('teams')"
        />
    </ipl-space>
    <ipl-space class="layout horizontal center-vertical layout-break-scene m-t-8">
        <span>Stages</span>
        <ipl-button
            class="show-scene-button"
            label="Show"
            color="green"
            data-test="show-stages-button"
            :disabled="activeBreakScene === 'stages'"
            @click="setActiveBreakScene('stages')"
        />
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import IplSpace from '../components/iplSpace.vue';
import IplButton from '../components/iplButton.vue';
import { useBreakScreenStore } from './breakScreenStore';
import { ActiveBreakScene } from 'schemas';
import IplExpandingSpace from '../components/iplExpandingSpace.vue';
import IplInput from '../components/iplInput.vue';
import isEqual from 'lodash/isEqual';
import NextStageTimeInput from './components/nextStageTimeInput.vue';
import IplCheckbox from '../components/iplCheckbox.vue';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';

export default defineComponent({
    name: 'BreakScreen',

    components: { IplErrorDisplay, IplCheckbox, NextStageTimeInput, IplInput, IplExpandingSpace, IplButton, IplSpace },

    setup() {
        const store = useBreakScreenStore();
        const mainFlavorText = ref('');
        const nextRoundTime = ref('');
        const nextRoundTimeFocused = ref(false);
        const mainFlavorTextFocused = ref(false);
        const isChanged = computed(() => !isEqual(mainFlavorText.value, store.state.mainFlavorText)
            || !isEqual(nextRoundTime.value, store.state.nextRoundStartTime.startTime));

        store.watch(store => store.mainFlavorText, newValue => {
            if (!mainFlavorTextFocused.value) {
                mainFlavorText.value = newValue;
            }
        }, { immediate: true });

        store.watch(store => store.nextRoundStartTime.startTime, newValue => {
            if (!nextRoundTimeFocused.value) {
                nextRoundTime.value = newValue;
            }
        }, { immediate: true });

        return {
            activeBreakScene: computed(() => store.state.activeBreakScene),
            mainFlavorText,
            nextRoundTime,
            showNextRoundTime: computed({
                get() {
                    return store.state.nextRoundStartTime.isVisible;
                },
                set(value: boolean) {
                    store.commit('setNextRoundStartTimeVisible', value);
                }
            }),
            setActiveBreakScene(newValue: ActiveBreakScene) {
                store.commit('setActiveBreakScene', newValue);
            },
            updateMainScene() {
                store.commit('setMainFlavorText', mainFlavorText.value);
                store.commit('setNextRoundStartTime', nextRoundTime.value);
            },
            mainUpdateButtonColor: computed(() => isChanged.value ? 'red' : 'blue'),
            handleMainFlavorTextFocus(event: boolean) {
                mainFlavorTextFocused.value = event;
            },
            handleNextRoundTimeFocus(event: boolean) {
                nextRoundTimeFocused.value = event;
            },
            mainFlavorTextFocused,
            nextRoundTimeFocused
        };
    }
});
</script>

<style lang="scss" scoped>
.ipl-button.show-scene-button {
    width: 75px;
}

.layout-break-scene {
    font-weight: 500;

    span {
        flex-grow: 1;
    }
}
</style>
