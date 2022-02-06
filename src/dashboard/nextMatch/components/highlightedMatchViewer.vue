<template>
    <ipl-message
        v-if="!matchOptions?.length"
        type="info"
    >
        No matches loaded.
    </ipl-message>
    <ipl-space v-else>
        <ipl-select
            v-model="selectedMatch"
            label="Match"
            :options="matchOptions"
            data-test="match-selector"
        />
        <ipl-data-row
            label="Team A"
            :value="addDots(selectedMatchData?.teamA?.name)"
            data-test="team-a-name-display"
        />
        <ipl-data-row
            label="Team B"
            :value="addDots(selectedMatchData?.teamB?.name)"
            data-test="team-b-name-display"
        />
        <round-select
            v-model="selectedRound"
            class="m-t-4"
        />
        <ipl-button
            class="m-t-8"
            label="Update"
            :color="isChanged ? 'red' : 'blue'"
            :disabled="disableSetNextMatch"
            data-test="set-next-match-button"
            @click="handleSetNextMatch"
        />
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watchEffect } from 'vue';
import { IplButton, IplSelect, IplDataRow, IplMessage, IplSpace } from '@iplsplatoon/vue-components';
import { useHighlightedMatchStore } from '../highlightedMatchStore';
import RoundSelect from '../../components/roundSelect.vue';
import { useNextRoundStore } from '../../store/nextRoundStore';
import { addDots } from '../../../helpers/stringHelper';

export default defineComponent({
    name: 'HighlightedMatchViewer',

    components: { RoundSelect, IplMessage, IplDataRow, IplSelect, IplButton, IplSpace },

    setup() {
        const highlightedMatchStore = useHighlightedMatchStore();
        const nextRoundStore = useNextRoundStore();
        const selectedMatch = ref<string>(null);
        const selectedRound = ref<string>(null);

        watchEffect(() => {
            const nextRound = nextRoundStore.state.nextRound;
            const equalMatch = highlightedMatchStore.state.highlightedMatches.find(match =>
                match.teamA.id === nextRound.teamA.id && match.teamB.id === nextRound.teamB.id);

            if (equalMatch) {
                selectedMatch.value = equalMatch.meta.id;
            } else {
                selectedMatch.value = highlightedMatchStore.state.highlightedMatches[0]?.meta?.id ?? null;
            }
        });

        const selectedMatchData = computed(() =>
            highlightedMatchStore.state.highlightedMatches.find(match => match.meta.id === selectedMatch.value));

        nextRoundStore.watch(state => state.nextRound.round.id, newId => {
            selectedRound.value = newId;
        }, { immediate: true });

        return {
            addDots,
            matchOptions: computed(() => {
                const isAllSameStage = highlightedMatchStore.state.highlightedMatches.every(match =>
                    match.meta.stageName === highlightedMatchStore.state.highlightedMatches[0].meta.stageName);

                return highlightedMatchStore.state.highlightedMatches.map(stage => ({
                    value: stage.meta.id,
                    name: isAllSameStage ? stage.meta.name : `${stage.meta.name} | ${stage.meta.stageName}`
                }));
            }),
            selectedMatch,
            selectedRound,
            selectedMatchData,
            disableSetNextMatch: computed(() => !selectedMatchData.value),
            isChanged: computed(() =>
                nextRoundStore.state.nextRound.teamA.id !== selectedMatchData.value?.teamA.id
                || nextRoundStore.state.nextRound.teamB.id !== selectedMatchData.value?.teamB.id
                || nextRoundStore.state.nextRound.round.id !== selectedRound.value ),
            async handleSetNextMatch() {
                await highlightedMatchStore.dispatch('setNextMatch', {
                    teamAId: selectedMatchData.value.teamA.id,
                    teamBId: selectedMatchData.value.teamB.id,
                    roundId: selectedRound.value
                });
            }
        };
    }
});
</script>
