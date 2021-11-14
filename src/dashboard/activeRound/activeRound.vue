<template>
    <div class="layout horizontal">
        <div class="max-width">
            <score-display />
            <active-color-toggles class="m-t-8" />
            <ipl-space class="m-t-8">
                <ipl-button
                    label="Show casters"
                    @click="showCasters"
                />
            </ipl-space>
        </div>
        <ipl-expanding-space-group class="max-width m-l-8">
            <color-editor />
            <active-round-editor class="m-t-8" />
            <scoreboard-editor class="m-t-8" />
        </ipl-expanding-space-group>
    </div>
    <set-editor class="m-t-8" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ScoreDisplay from './components/scoreDisplay.vue';
import ActiveRoundEditor from './components/activeRoundEditor.vue';
import ColorEditor from './components/colorEditor.vue';
import SetEditor from './components/setEditor.vue';
import IplExpandingSpaceGroup from '../components/iplExpandingSpaceGroup.vue';
import ActiveColorToggles from './components/activeColorToggles.vue';
import IplSpace from '../components/iplSpace.vue';
import IplButton from '../components/iplButton.vue';
import { useCasterStore } from '../store/casterStore';
import ScoreboardEditor from './components/scoreboardEditor.vue';

export default defineComponent({
    name: 'ActiveRound',

    components: {
        ScoreboardEditor,
        IplButton,
        IplSpace,
        ActiveColorToggles,
        IplExpandingSpaceGroup,
        ColorEditor,
        ActiveRoundEditor,
        ScoreDisplay,
        SetEditor
    },

    setup() {
        const casterStore = useCasterStore();

        return {
            showCasters() {
                casterStore.dispatch('showCasters');
            }
        };
    }
});
</script>
