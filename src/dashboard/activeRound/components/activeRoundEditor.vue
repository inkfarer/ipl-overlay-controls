<template>
    <ipl-expanding-space
        key="teams-rounds"
        title="Teams & Rounds"
        data-test="active-round-editor"
    >
        <ipl-message
            v-if="isChanged && roundHasProgress"
            type="info"
            data-test="round-progress-message"
        >
            {{ selectedRound.meta.isCompleted
                ? `'${selectedRound.meta.name}' is already completed.`
                : `'${selectedRound.meta.name}' already has saved progress.` }}
            {{ `(${addDots(selectedRound.teamA.name)} vs ${addDots(selectedRound.teamB.name)})` }}
        </ipl-message>

        <div class="layout horizontal">
            <div class="layout vertical center-horizontal max-width">
                <ipl-select
                    v-model="teamAId"
                    label="Team A"
                    data-test="team-a-selector"
                    :options="teams"
                />
                <ipl-checkbox
                    v-model="teamAImageShown"
                    class="m-t-6"
                    label="Show image"
                    data-test="team-a-image-toggle"
                    small
                />
            </div>
            <div class="layout vertical center-horizontal max-width m-l-8">
                <ipl-select
                    v-model="teamBId"
                    label="Team B"
                    data-test="team-b-selector"
                    :options="teams"
                />
                <ipl-checkbox
                    v-model="teamBImageShown"
                    class="m-t-6"
                    label="Show image"
                    data-test="team-b-image-toggle"
                    small
                />
            </div>
        </div>
        <ipl-select
            v-model="roundId"
            class="m-t-6"
            :options="rounds"
            data-test="round-selector"
            label="Round"
        />
        <ipl-button
            class="m-t-8"
            label="Update"
            :color="isChanged ? 'red' : 'blue'"
            data-test="update-round-button"
            @click="updateRound"
        />
    </ipl-expanding-space>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { useTournamentDataStore } from '../../store/tournamentDataStore';
import { addDots } from '../../../helpers/stringHelper';
import { useActiveRoundStore } from '../../store/activeRoundStore';
import { IplButton, IplSelect, IplCheckbox, IplMessage, IplExpandingSpace } from '@iplsplatoon/vue-components';

export default defineComponent({
    name: 'ActiveRoundEditor',

    components: { IplExpandingSpace, IplMessage, IplButton, IplCheckbox, IplSelect },

    setup() {
        const tournamentDataStore = useTournamentDataStore();
        const activeRoundStore = useActiveRoundStore();

        const activeRound = computed(() => activeRoundStore.state.activeRound);

        const teamAId = ref('');
        const teamBId = ref('');
        const roundId = ref('');

        const selectedRound = computed(() => tournamentDataStore.state.roundStore[roundId.value]);
        const roundHasProgress = computed(() => selectedRound.value.teamA?.score > 0
            || selectedRound.value.teamB?.score > 0);

        watch(selectedRound, newValue => {
            if (roundHasProgress.value) {
                teamAId.value = newValue.teamA.id;
                teamBId.value = newValue.teamB.id;
            } else {
                teamAId.value = activeRoundStore.state.activeRound.teamA.id;
                teamBId.value = activeRoundStore.state.activeRound.teamB.id;
            }
        });

        const isChanged = computed(() =>
            teamAId.value !== activeRoundStore.state.activeRound.teamA.id
            || teamBId.value !== activeRoundStore.state.activeRound.teamB.id
            || roundId.value !== activeRoundStore.state.activeRound.round.id);

        activeRoundStore.watch(
            store => store.activeRound.teamA.id,
            newValue => teamAId.value = newValue,
            { immediate: true });
        activeRoundStore.watch(
            store => store.activeRound.teamB.id,
            newValue => teamBId.value = newValue,
            { immediate: true });
        activeRoundStore.watch(
            store => store.activeRound.round.id,
            newValue => roundId.value = newValue,
            { immediate: true });

        return {
            teams: computed(() => tournamentDataStore.state.tournamentData.teams.map(team => ({
                value: team.id,
                name: addDots(team.name)
            }))),
            teamAId,
            teamBId,
            roundId,
            activeRound,
            teamAImageShown: computed({
                get() {
                    return activeRoundStore.state.activeRound.teamA.showLogo;
                },
                set(value: boolean) {
                    tournamentDataStore.dispatch('setTeamImageHidden',
                        { teamId: activeRoundStore.state.activeRound.teamA.id, isVisible: value });
                }
            }),
            teamBImageShown: computed({
                get() {
                    return activeRoundStore.state.activeRound.teamB.showLogo;
                },
                set(value: boolean) {
                    tournamentDataStore.dispatch('setTeamImageHidden',
                        { teamId: activeRoundStore.state.activeRound.teamB.id, isVisible: value });
                }
            }),
            rounds: computed(() => Object.entries(tournamentDataStore.state.roundStore).map(([ key, value ]) => ({
                value: key,
                name: value.meta.name
            }))),
            isChanged,
            updateRound() {
                activeRoundStore.dispatch('setActiveRound', {
                    roundId: roundId.value,
                    teamAId: teamAId.value,
                    teamBId: teamBId.value
                });
            },
            selectedRound,
            roundHasProgress,
            addDots
        };
    }
});
</script>
