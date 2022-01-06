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
            :value="selectedMatchData?.teamA?.name"
            data-test="team-a-name-display"
        />
        <ipl-data-row
            label="Team B"
            :value="selectedMatchData?.teamB?.name"
            data-test="team-b-name-display"
        />
        <ipl-button
            class="m-t-8"
            label="Set next match"
            :disabled="disableSetNextMatch"
            data-test="set-next-match-button"
            @click="handleSetNextMatch"
        />
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { IplButton, IplSpace, IplSelect, IplDataRow, IplMessage } from '@iplsplatoon/vue-components';
import { useHighlightedMatchStore } from '../highlightedMatchStore';

export default defineComponent({
    name: 'HighlightedMatchViewer',

    components: { IplMessage, IplDataRow, IplSelect, IplSpace, IplButton },

    setup() {
        const store = useHighlightedMatchStore();
        const selectedMatch = ref<string>(null);
        const selectedMatchData = computed(() =>
            store.state.highlightedMatches.find(match => match.meta.id === selectedMatch.value));

        store.watch(store => store.highlightedMatches, newValue => {
            selectedMatch.value = newValue[0]?.meta?.id ?? null;
        }, { immediate: true });

        return {
            matchOptions: computed(() => {
                const isAllSameStage = store.state.highlightedMatches
                    .every(match => match.meta.stageName === store.state.highlightedMatches[0].meta.stageName);

                return store.state.highlightedMatches.map(stage => ({
                    value: stage.meta.id,
                    name: isAllSameStage ? stage.meta.name : `${stage.meta.name} | ${stage.meta.stageName}`
                }));
            }),
            selectedMatch,
            selectedMatchData,
            disableSetNextMatch: computed(() => !selectedMatchData.value),
            async handleSetNextMatch() {
                await store.dispatch('setNextMatch', {
                    teamAId: selectedMatchData.value.teamA.id,
                    teamBId: selectedMatchData.value.teamB.id
                });
            }
        };
    }
});
</script>
