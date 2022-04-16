<template>
    <ipl-error-display class="m-b-8" />
    <div class="layout horizontal">
        <div class="max-width">
            <score-display />
            <active-color-toggles class="m-t-8" />
            <ipl-space class="m-t-8">
                <ipl-message
                    v-if="showObsConfigurationChangedWarning"
                    type="warning"
                    class="m-b-8"
                    data-test="obs-scenes-changed-warning"
                    closeable
                    @close="showObsConfigurationChangedWarning = false"
                >
                    The OBS scene configuration has changed.
                    Please confirm that the configured gameplay and intermission scenes
                    ('{{ gameplayScene }}' & '{{ intermissionScene }}') are still correct.
                </ipl-message>
                <ipl-button
                    v-if="isObsConnected"
                    :label="startStopLabel"
                    :color="startStopColor"
                    :disabled="startStopDisabled"
                    data-test="start-stop-game-button"
                    class="m-b-8"
                    @click="doAutomationAction"
                />
                <ipl-button
                    label="Show casters"
                    :disabled="disableShowCasters"
                    :small="isObsConnected"
                    data-test="show-casters-button"
                    @click="showCasters"
                />
            </ipl-space>
        </div>
        <ipl-expanding-space-group class="max-width m-l-8">
            <color-editor />
            <active-match-editor class="m-t-8" />
            <next-match-starter class="m-t-8" />
            <scoreboard-editor class="m-t-8" />
            <ipl-expanding-space
                key="activeRosters"
                title="Active Rosters"
                class="m-t-8"
            >
                <active-roster-display class="m-t-8" />
            </ipl-expanding-space>
        </ipl-expanding-space-group>
    </div>
    <set-editor class="m-t-8" />
</template>

<script lang="ts">
import { computed, defineComponent, onUnmounted, ref } from 'vue';
import ScoreDisplay from './components/scoreDisplay.vue';
import ActiveMatchEditor from './components/activeMatchEditor.vue';
import ColorEditor from './components/colorEditor.vue';
import SetEditor from './components/setEditor.vue';
import ActiveColorToggles from './components/activeColorToggles.vue';
import {
    IplButton,
    IplSpace,
    IplExpandingSpaceGroup,
    IplExpandingSpace,
    isBlank,
    IplMessage
} from '@iplsplatoon/vue-components';
import { useCasterStore } from '../store/casterStore';
import ScoreboardEditor from './components/scoreboardEditor.vue';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';
import NextMatchStarter from './components/nextMatchStarter.vue';
import { useObsStore } from '../store/obsStore';
import { ObsStatus } from 'types/enums/ObsStatus';
import ActiveRosterDisplay from '../components/activeRosterDisplay.vue';
import { GameAutomationAction } from 'types/enums/GameAutomationAction';

export default defineComponent({
    name: 'ActiveRound',

    components: {
        IplMessage,
        IplExpandingSpace,
        ActiveRosterDisplay,
        NextMatchStarter,
        IplErrorDisplay,
        ScoreboardEditor,
        IplButton,
        IplSpace,
        ActiveColorToggles,
        IplExpandingSpaceGroup,
        ColorEditor,
        ActiveMatchEditor,
        ScoreDisplay,
        SetEditor
    },

    setup() {
        const casterStore = useCasterStore();
        const obsStore = useObsStore();
        const disableShowCasters = ref(false);
        let enableShowCastersTimeout: number;

        nodecg.listenFor('mainShowCasters', () => {
            disableShowCasters.value = true;
            clearTimeout(enableShowCastersTimeout);
            enableShowCastersTimeout = window.setTimeout(() => {
                disableShowCasters.value = false;
            }, 5000);
        });

        const actionInProgress = computed(() =>
            obsStore.gameAutomationData?.actionInProgress !== GameAutomationAction.NONE
            && !isBlank(obsStore.gameAutomationData?.nextTaskForAction?.name));
        const gameplaySceneActive = computed(() => obsStore.obsData.gameplayScene === obsStore.obsData.currentScene);

        const now = ref(new Date().getTime());
        const setCurrentTimeInterval = setInterval(() => {
            now.value = new Date().getTime();
        }, 100);

        onUnmounted(() => {
            clearInterval(setCurrentTimeInterval);
        });

        const showObsConfigurationChangedWarning = ref(false);
        nodecg.listenFor('obsSceneConfigurationChangedAfterUpdate', () => {
            showObsConfigurationChangedWarning.value = true;
        });

        return {
            disableShowCasters,
            isObsConnected: computed(() => obsStore.obsData.status === ObsStatus.CONNECTED),
            showCasters() {
                casterStore.showCasters();
            },

            actionInProgress,
            startStopLabel: computed(() => {
                if (!actionInProgress.value) {
                    return gameplaySceneActive.value ? 'End Game' : 'Start Game';
                } else {
                    return {
                        changeScene: 'Change Scene',
                        showScoreboard: 'Show Scoreboard',
                        showCasters: 'Show Casters',
                        hideScoreboard: 'Hide Scoreboard'
                    }[obsStore.gameAutomationData?.nextTaskForAction.name] ?? '???';
                }
            }),
            startStopColor: computed(() => {
                if (actionInProgress.value) {
                    return 'blue';
                } else if (gameplaySceneActive.value) {
                    return 'red';
                } else {
                    return 'green';
                }
            }),
            doAutomationAction() {
                if (actionInProgress.value) {
                    obsStore.fastForwardToNextGameAutomationTask();
                } else if (gameplaySceneActive.value) {
                    obsStore.endGame();
                } else {
                    obsStore.startGame();
                }
            },
            startStopDisabled: computed(() => {
                return actionInProgress.value
                    && obsStore.gameAutomationData?.nextTaskForAction?.executionTimeMillis - 1000 < now.value;
            }),

            gameplayScene: computed(() => obsStore.obsData.gameplayScene),
            intermissionScene: computed(() => obsStore.obsData.intermissionScene),
            showObsConfigurationChangedWarning
        };
    }
});
</script>
