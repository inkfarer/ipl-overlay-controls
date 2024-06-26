<template>
    <ipl-error-display class="m-b-8" />
    <div class="layout horizontal">
        <div class="max-width">
            <score-display />
            <active-color-toggles class="m-t-8" />
            <ipl-space class="m-t-8">
                <ipl-button
                    v-if="isObsConnected"
                    :label="startStopLabel"
                    :color="startStopColor"
                    :disabled="startStopDisabled"
                    data-test="start-stop-game-button"
                    class="m-b-8"
                    @click="doAutomationAction"
                />
                <div class="layout horizontal">
                    <ipl-button
                        v-if="actionInProgress"
                        :label="$t('cancelAutomationActionButton')"
                        small
                        data-test="cancel-automation-action-button"
                        color="red"
                        class="max-width m-r-8"
                        @click="cancelAutomationAction"
                    />
                    <ipl-button
                        :label="$t('showCastersButton')"
                        :disabled="disableShowCasters"
                        :small="isObsConnected"
                        data-test="show-casters-button"
                        class="max-width"
                        @click="showCasters"
                    />
                </div>
            </ipl-space>
        </div>
        <ipl-expanding-space-group class="max-width m-l-8">
            <color-list />
            <active-match-editor class="m-t-8" />
            <next-match-starter class="m-t-8" />
            <scoreboard-editor class="m-t-8" />
            <ipl-expanding-space
                key="activeRosters"
                :title="$t('activeRosters.sectionTitle')"
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
import ColorList from './components/colorList.vue';
import SetEditor from './components/setEditor.vue';
import ActiveColorToggles from './components/activeColorToggles.vue';
import {
    IplButton,
    IplSpace,
    IplExpandingSpaceGroup,
    IplExpandingSpace,
    isBlank
} from '@iplsplatoon/vue-components';
import { useCasterStore } from '../store/casterStore';
import ScoreboardEditor from './components/scoreboardEditor.vue';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';
import NextMatchStarter from './components/nextMatchStarter.vue';
import { useObsStore } from '../store/obsStore';
import { ObsStatus } from 'types/enums/ObsStatus';
import ActiveRosterDisplay from '../components/activeRosterDisplay.vue';
import { GameAutomationAction } from 'types/enums/GameAutomationAction';
import { sendMessage } from '../helpers/nodecgHelper';
import { useTranslation } from 'i18next-vue';

export default defineComponent({
    name: 'ActiveRound',

    components: {
        IplExpandingSpace,
        ActiveRosterDisplay,
        NextMatchStarter,
        IplErrorDisplay,
        ScoreboardEditor,
        IplButton,
        IplSpace,
        ActiveColorToggles,
        IplExpandingSpaceGroup,
        ColorList,
        ActiveMatchEditor,
        ScoreDisplay,
        SetEditor
    },

    setup() {
        const { t } = useTranslation();

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
        const gameplaySceneActive = computed(() =>
            obsStore.currentConfig?.gameplayScene === obsStore.obsState.currentScene);

        const now = ref(new Date().getTime());
        const setCurrentTimeInterval = setInterval(() => {
            now.value = new Date().getTime();
        }, 100);

        onUnmounted(() => {
            clearInterval(setCurrentTimeInterval);
        });

        return {
            disableShowCasters,
            isObsConnected: computed(() => obsStore.obsState.status === ObsStatus.CONNECTED),
            showCasters() {
                casterStore.showCasters();
            },

            actionInProgress,
            startStopLabel: computed(() => {
                if (!actionInProgress.value) {
                    return gameplaySceneActive.value ? t('endGameButton') : t('startGameButton');
                } else {
                    return t('automationActionTask', { context: obsStore.gameAutomationData?.nextTaskForAction.name });
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
            cancelAutomationAction() {
                sendMessage('cancelAutomationAction');
            },
            startStopDisabled: computed(() => {
                return actionInProgress.value
                    && obsStore.gameAutomationData?.nextTaskForAction?.executionTimeMillis - 1000 < now.value;
            })
        };
    }
});
</script>
