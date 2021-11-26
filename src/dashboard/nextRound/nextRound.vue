<template>
    <ipl-error-display class="m-b-8" />
    <ipl-message
        v-if="roundHasProgress"
        type="info"
        data-test="round-progress-message"
        class="m-b-8"
    >
        {{ selectedRound.meta.isCompleted
            ? `'${selectedRound.meta.name}' is already completed.`
            : `'${selectedRound.meta.name}' already has saved progress.` }}
        {{ `(${selectedRound.teamA.name} vs ${selectedRound.teamB.name})` }}
    </ipl-message>
    <ipl-space>
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
            label="Update"
            class="m-t-8"
            :color="updateButtonColor"
            data-test="update-next-round-button"
            @click="handleUpdate"
        />
        <ipl-button
            label="Begin next match"
            color="red"
            class="m-t-8"
            requires-confirmation
            data-test="begin-next-match-button"
            @click="beginNextMatch"
        />
        <div class="layout horizontal center-horizontal">
            <ipl-checkbox
                v-model="showOnStream"
                class="m-t-8"
                label="Show on stream"
                data-test="show-on-stream-toggle"
            />
        </div>
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import IplSpace from '../components/iplSpace.vue';
import IplSelect from '../components/iplSelect.vue';
import IplCheckbox from '../components/iplCheckbox.vue';
import IplButton from '../components/iplButton.vue';
import { useTournamentDataStore } from '../store/tournamentDataStore';
import { useNextRoundStore } from '../store/nextRoundStore';
import { addDots } from '../helpers/stringHelper';
import IplMessage from '../components/iplMessage.vue';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';

export default defineComponent({
    name: 'NextRound',

    components: { IplErrorDisplay, IplMessage, IplButton, IplCheckbox, IplSelect, IplSpace },

    setup() {
        const tournamentDataStore = useTournamentDataStore();
        const nextRoundStore = useNextRoundStore();
        const teamAId = ref('');
        const teamBId = ref('');
        const roundId = ref('');
        const isChanged = computed(() =>
            teamAId.value !== nextRoundStore.state.nextRound.teamA.id
            || teamBId.value !== nextRoundStore.state.nextRound.teamB.id
            || roundId.value !== nextRoundStore.state.nextRound.round.id);
        const selectedRound = computed(() => tournamentDataStore.state.roundStore[roundId.value]);
        const roundHasProgress = computed(() => selectedRound.value.teamA?.score > 0
            || selectedRound.value.teamB?.score > 0);

        nextRoundStore.watch(
            store => store.nextRound.teamA.id,
            newValue => teamAId.value = newValue,
            { immediate: true });
        nextRoundStore.watch(
            store => store.nextRound.teamB.id,
            newValue => teamBId.value = newValue,
            { immediate: true });
        nextRoundStore.watch(
            store => store.nextRound.round.id,
            newValue => roundId.value = newValue,
            { immediate: true });

        watch(selectedRound, newValue => {
            if (roundHasProgress.value) {
                teamAId.value = newValue.teamA.id;
                teamBId.value = newValue.teamB.id;
            } else {
                teamAId.value = nextRoundStore.state.nextRound.teamA.id;
                teamBId.value = nextRoundStore.state.nextRound.teamB.id;
            }
        });

        return {
            teams: computed(() => tournamentDataStore.state.tournamentData.teams.map(team => ({
                value: team.id,
                name: addDots(team.name)
            }))),
            rounds: computed(() => Object.entries(tournamentDataStore.state.roundStore).map(([ key, value ]) => ({
                value: key,
                name: value.meta.name
            }))),
            teamAId,
            teamBId,
            roundId,
            teamAImageShown: computed({
                get() {
                    return nextRoundStore.state.nextRound.teamA.showLogo;
                },
                set(value: boolean) {
                    tournamentDataStore.commit('setTeamImageHidden',
                        { teamId: nextRoundStore.state.nextRound.teamA.id, isVisible: value });
                }
            }),
            teamBImageShown: computed({
                get() {
                    return nextRoundStore.state.nextRound.teamB.showLogo;
                },
                set(value: boolean) {
                    tournamentDataStore.commit('setTeamImageHidden',
                        { teamId: nextRoundStore.state.nextRound.teamB.id, isVisible: value });
                }
            }),
            updateButtonColor: computed(() => isChanged.value ? 'red' : 'blue'),
            handleUpdate() {
                nextRoundStore.commit('setNextRound', {
                    teamAId: teamAId.value,
                    teamBId: teamBId.value,
                    roundId: roundId.value
                });
            },
            beginNextMatch() {
                nextRoundStore.dispatch('beginNextMatch');
            },
            showOnStream: computed({
                get() {
                    return nextRoundStore.state.nextRound.showOnStream;
                },
                set(value: boolean) {
                    nextRoundStore.commit('setShowOnStream', value);
                }
            }),
            selectedRound,
            roundHasProgress
        };
    }
});
</script>
