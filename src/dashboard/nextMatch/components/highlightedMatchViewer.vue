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
        <ipl-input
            v-model="nextMatchName"
            class="m-t-4"
            name="match-name"
            label="Match Name"
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
            @update:round-data="selectedRoundData = $event"
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
import { IplButton, IplSelect, IplDataRow, IplMessage, IplSpace, IplInput } from '@iplsplatoon/vue-components';
import { useHighlightedMatchStore } from '../highlightedMatchStore';
import RoundSelect, { RoundSelectRound } from '../../components/roundSelect.vue';
import { useNextRoundStore } from '../../store/nextRoundStore';
import { addDots } from '../../../helpers/stringHelper';
import { PlayTypeHelper } from '../../../helpers/enums/playTypeHelper';
import { useTournamentDataStore } from '../../store/tournamentDataStore';

export default defineComponent({
    name: 'HighlightedMatchViewer',

    components: { IplInput, RoundSelect, IplMessage, IplDataRow, IplSelect, IplButton, IplSpace },

    setup() {
        const highlightedMatchStore = useHighlightedMatchStore();
        const nextRoundStore = useNextRoundStore();
        const tournamentDataStore = useTournamentDataStore();
        const selectedMatch = ref(null);
        const selectedRound = ref(null);
        const selectedRoundData = ref<RoundSelectRound>(null);
        const nextMatchName = ref('');

        watchEffect(() => {
            const nextRound = nextRoundStore.nextRound;
            const equalMatch = highlightedMatchStore.highlightedMatches.find(match =>
                match.teamA.id === nextRound.teamA.id && match.teamB.id === nextRound.teamB.id)
                ?? highlightedMatchStore.highlightedMatches[0];

            selectedMatch.value = equalMatch?.meta.id ?? null;
            if (equalMatch) {
                nextMatchName.value = equalMatch.meta.shortName;
            }
        });

        const selectedMatchData = computed(() =>
            highlightedMatchStore.highlightedMatches.find(match => match.meta.id === selectedMatch.value));
        watch(selectedMatchData, newValue => {
            if (newValue) {
                nextMatchName.value = newValue?.meta.shortName;
            }
        });

        watch(() => nextRoundStore.nextRound.round.id, newId => {
            selectedRound.value = newId;
        }, { immediate: true });
        watch(() => nextRoundStore.nextRound.name, newValue => {
            nextMatchName.value = newValue;
        });

        return {
            addDots,
            selectedRoundData,
            highlightedMatchStore,
            formatPlayType: PlayTypeHelper.toPrettyString,
            matchOptions: computed(() => {
                const isAllSameStage = highlightedMatchStore.highlightedMatches.every(match =>
                    match.meta.stageName === highlightedMatchStore.highlightedMatches[0].meta.stageName);

                return highlightedMatchStore.highlightedMatches.map(stage => ({
                    value: stage.meta.id,
                    name: isAllSameStage ? stage.meta.name : `${stage.meta.stageName} | ${stage.meta.name}`
                }));
            }),
            selectedMatch,
            selectedRound,
            selectedMatchData,
            nextMatchName,
            disableSetNextMatch: computed(() => !selectedMatchData.value),
            isChanged: computed(() =>
                nextRoundStore.nextRound.teamA.id !== selectedMatchData.value?.teamA.id
                || nextRoundStore.nextRound.teamB.id !== selectedMatchData.value?.teamB.id
                || nextRoundStore.nextRound.round.id !== selectedRound.value
                || nextRoundStore.nextRound.name !== nextMatchName.value),
            async handleSetNextMatch() {
                await highlightedMatchStore.setNextMatch({
                    teamAId: selectedMatchData.value.teamA.id,
                    teamBId: selectedMatchData.value.teamB.id,
                    roundId: selectedRound.value,
                    name: nextMatchName.value
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
