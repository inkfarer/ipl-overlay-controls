<template>
    <ipl-error-display class="m-b-8" />
    <ipl-space>
        <ipl-small-toggle
            v-model="chooseTeamsManually"
            label="Choose teams manually"
            data-test="choose-manually-toggle"
        />
        <ipl-small-toggle
            v-model="showOnStream"
            label="Show on stream"
            class="m-t-4"
            data-test="show-on-stream-toggle"
        />
    </ipl-space>
    <highlighted-match-picker
        v-if="!chooseTeamsManually"
        class="m-t-8"
    />
    <manual-team-picker
        v-else
        class="m-t-8"
    />
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';
import HighlightedMatchPicker from './components/highlightedMatchPicker.vue';
import { IplSpace, IplSmallToggle } from '@iplsplatoon/vue-components';
import ManualTeamPicker from './components/manualTeamPicker.vue';
import { useNextRoundStore } from '../store/nextRoundStore';

export default defineComponent({
    name: 'HighlightedMatches',

    components: { ManualTeamPicker, HighlightedMatchPicker, IplErrorDisplay, IplSpace, IplSmallToggle },

    setup() {
        const nextRoundStore = useNextRoundStore();

        return {
            chooseTeamsManually: ref(false),
            showOnStream: computed({
                get() {
                    return nextRoundStore.state.nextRound.showOnStream;
                },
                set(value: boolean) {
                    nextRoundStore.commit('setShowOnStream', value);
                }
            })
        };
    }
});
</script>
