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
        <ipl-data-row
            v-if="!!selectedMatchData?.meta.playType"
            label="Type of play"
            :value="formatPlayType(selectedMatchData?.meta.playType, selectedRoundData?.roundData?.games.length)"
            data-test="play-type-display"
        />
        <round-select
            v-model="selectedRound"
            class="m-t-4"
            data-test="round-selector"
            @update:roundData="selectedRoundData = $event"
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
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';
import { IplButton, IplSelect, IplDataRow, IplMessage, IplSpace } from '@iplsplatoon/vue-components';
import { useHighlightedMatchStore } from '../highlightedMatchStore';
import RoundSelect, { RoundSelectRound } from '../../components/roundSelect.vue';
import { useNextRoundStore } from '../../store/nextRoundStore';
import { addDots } from '../../../helpers/stringHelper';
import { PlayTypeHelper } from '../../../helpers/enums/playTypeHelper';
import { useTournamentDataStore } from '../../store/tournamentDataStore';

export default defineComponent({
    name: 'HighlightedMatchViewer',

    components: { RoundSelect, IplMessage, IplDataRow, IplSelect, IplButton, IplSpace },

    setup() {
        const highlightedMatchStore = useHighlightedMatchStore();
        const nextRoundStore = useNextRoundStore();
        const tournamentDataStore = useTournamentDataStore();
        const selectedMatch = ref<string>(null);
        const selectedRound = ref<string>(null);
        const selectedRoundData = ref<RoundSelectRound>(null);

        watchEffect(() => {
            const nextRound = nextRoundStore.nextRound;
            const equalMatch = highlightedMatchStore.highlightedMatches.find(match =>
                match.teamA.id === nextRound.teamA.id && match.teamB.id === nextRound.teamB.id);

            if (equalMatch) {
                selectedMatch.value = equalMatch.meta.id;
            } else {
                selectedMatch.value = highlightedMatchStore.highlightedMatches[0]?.meta?.id ?? null;
            }
        });

        const selectedMatchData = computed(() =>
            highlightedMatchStore.highlightedMatches.find(match => match.meta.id === selectedMatch.value));

        watch(() => nextRoundStore.nextRound.round.id, newId => {
            selectedRound.value = newId;
        }, { immediate: true });

        return {
            addDots,
            selectedRoundData,
            formatPlayType: PlayTypeHelper.toPrettyString,
            matchOptions: computed(() => {
                const isAllSameStage = highlightedMatchStore.highlightedMatches.every(match =>
                    match.meta.stageName === highlightedMatchStore.highlightedMatches[0].meta.stageName);

                return highlightedMatchStore.highlightedMatches.map(stage => ({
                    value: stage.meta.id,
                    name: isAllSameStage ? stage.meta.name : `${stage.meta.name} | ${stage.meta.stageName}`
                }));
            }),
            selectedMatch,
            selectedRound,
            selectedMatchData,
            disableSetNextMatch: computed(() => !selectedMatchData.value),
            isChanged: computed(() =>
                nextRoundStore.nextRound.teamA.id !== selectedMatchData.value?.teamA.id
                || nextRoundStore.nextRound.teamB.id !== selectedMatchData.value?.teamB.id
                || nextRoundStore.nextRound.round.id !== selectedRound.value ),
            async handleSetNextMatch() {
                await highlightedMatchStore.setNextMatch({
                    teamAId: selectedMatchData.value.teamA.id,
                    teamBId: selectedMatchData.value.teamB.id,
                    roundId: selectedRound.value
                });

                const playType = selectedMatchData.value?.meta.playType;
                if (!!playType && selectedRoundData.value.roundData?.meta.type !== playType) {
                    await tournamentDataStore.updateRound({
                        id: selectedRound.value,
                        type: playType
                    });
                }
            }
        };
    }
});
</script>
