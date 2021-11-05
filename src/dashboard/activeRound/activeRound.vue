<template>
    <div class="layout horizontal">
        <div class="max-width">
            <score-display />
            <ipl-expanding-space
                class="m-t-8"
                title="More colors"
            >
                color editor placeholder
            </ipl-expanding-space>
        </div>
        <active-round-editor class="m-l-8 max-width h-max-content" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import IplExpandingSpace from '../components/iplExpandingSpace.vue';
import ScoreDisplay from './components/scoreDisplay.vue';
import ActiveRoundEditor from './components/activeRoundEditor.vue';

export default defineComponent({
    name: 'ActiveRound',

    components: { ActiveRoundEditor, ScoreDisplay, IplExpandingSpace }
});
</script>
