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
        <ipl-space class="m-l-8 max-width h-max-content">
            team editor placeholder
        </ipl-space>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import IplSpace from '../components/iplSpace.vue';
import IplExpandingSpace from '../components/iplExpandingSpace.vue';
import ScoreDisplay from './components/scoreDisplay.vue';

export default defineComponent({
    name: 'ActiveRound',

    components: { ScoreDisplay, IplExpandingSpace, IplSpace }
});
</script>
