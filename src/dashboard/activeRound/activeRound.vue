<template>
    <div class="layout horizontal">
        <div class="max-width">
            <score-display />
            <color-editor class="m-t-8" />
        </div>
        <active-round-editor class="m-l-8 max-width h-max-content" />
    </div>
    <set-editor class="m-t-8" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ScoreDisplay from './components/scoreDisplay.vue';
import ActiveRoundEditor from './components/activeRoundEditor.vue';
import ColorEditor from './components/colorEditor.vue';
import SetEditor from './components/setEditor.vue';

export default defineComponent({
    name: 'ActiveRound',

    components: { ColorEditor, ActiveRoundEditor, ScoreDisplay, SetEditor }
});
</script>
