<template>
    <ipl-error-display class="m-b-8" />
    <ipl-space>
        <ipl-small-toggle
            v-if="canImportData"
            v-model="chooseTeamsManually"
            :label="$t('chooseTeamsManuallyToggle')"
            data-test="choose-manually-toggle"
            class="m-b-4"
        />
        <ipl-small-toggle
            v-model="showOnStream"
            :label="$t('showOnStreamToggle')"
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
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { useHighlightedMatchStore } from './highlightedMatchStore';

export default defineComponent({
    name: 'HighlightedMatches',

    components: { ManualTeamPicker, HighlightedMatchPicker, IplErrorDisplay, IplSpace, IplSmallToggle },

    setup() {
        const nextRoundStore = useNextRoundStore();
        const highlightedMatchStore = useHighlightedMatchStore();
        const chooseTeamsManually = ref(false);
        const canImportData = computed(() =>
            [
                TournamentDataSource.BATTLEFY,
                TournamentDataSource.SMASHGG,
                TournamentDataSource.SENDOU_INK
            ]
                .includes(highlightedMatchStore.tournamentData.meta.source as TournamentDataSource));

        return {
            canImportData,
            chooseTeamsManually: computed({
                get() {
                    if (!canImportData.value) {
                        return true;
                    } else {
                        return chooseTeamsManually.value;
                    }
                },
                set(newValue: boolean) {
                    chooseTeamsManually.value = newValue;
                }
            }),
            showOnStream: computed({
                get() {
                    return nextRoundStore.nextRound.showOnStream;
                },
                set(value: boolean) {
                    nextRoundStore.setShowOnStream(value);
                }
            })
        };
    }
});
</script>
