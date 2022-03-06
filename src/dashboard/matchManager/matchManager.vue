<template>
    <ipl-error-display class="m-b-8" />
    <div class="layout horizontal">
        <div class="max-width">
            <score-display />
            <active-color-toggles class="m-t-8" />
            <ipl-space class="m-t-8">
                <div
                    v-if="isObsConnected"
                    class="layout horizontal m-b-8"
                >
                    <ipl-button
                        label="Start"
                        color="green"
                        async
                        progress-message="Starting..."
                        :disabled="disableGameStart"
                        data-test="start-game-button"
                        @click="startGame"
                    />
                    <ipl-button
                        label="End"
                        color="red"
                        async
                        progress-message="Ending..."
                        class="m-l-8"
                        :disabled="disableGameEnd"
                        data-test="end-game-button"
                        @click="endGame"
                    />
                </div>
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
import { computed, defineComponent, ref } from 'vue';
import ScoreDisplay from './components/scoreDisplay.vue';
import ActiveMatchEditor from './components/activeMatchEditor.vue';
import ColorEditor from './components/colorEditor.vue';
import SetEditor from './components/setEditor.vue';
import ActiveColorToggles from './components/activeColorToggles.vue';
import { IplButton, IplSpace, IplExpandingSpaceGroup, IplExpandingSpace } from '@iplsplatoon/vue-components';
import { useCasterStore } from '../store/casterStore';
import ScoreboardEditor from './components/scoreboardEditor.vue';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';
import NextMatchStarter from './components/nextMatchStarter.vue';
import { useObsStore } from '../store/obsStore';
import { ObsStatus } from 'types/enums/ObsStatus';
import ActiveRosterDisplay from '../components/activeRosterDisplay.vue';

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

        return {
            disableShowCasters,
            isObsConnected: computed(() => obsStore.state.obsData.status === ObsStatus.CONNECTED),
            showCasters() {
                casterStore.showCasters();
            },
            async startGame() {
                return obsStore.dispatch('startGame');
            },
            async endGame() {
                return obsStore.dispatch('endGame');
            },
            disableGameStart: computed(() =>
                obsStore.state.obsData.gameplayScene === obsStore.state.obsData.currentScene),
            disableGameEnd: computed(() =>
                obsStore.state.obsData.gameplayScene !== obsStore.state.obsData.currentScene)
        };
    }
});
</script>
