<template>
    <ipl-error-display class="m-b-8" />
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
        <ipl-input
            v-model="matchName"
            name="matchName"
            label="Match Name"
            class="m-t-6"
            :validator="validators.matchName"
        />
        <ipl-button
            label="Begin next match"
            color="red"
            class="m-t-8"
            requires-confirmation
            data-test="begin-next-match-button"
            :disabled="!allValid"
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
import { IplButton, IplSpace, IplSelect, IplCheckbox, IplInput } from '@iplsplatoon/vue-components';
import { useTournamentDataStore } from '../store/tournamentDataStore';
import { useNextRoundStore } from '../store/nextRoundStore';
import { addDots } from '../../helpers/stringHelper';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';
import { allValid, validator } from '../helpers/validation/validator';
import { notBlank } from '../helpers/validation/stringValidators';
import { generateMatchNameForRound } from '../../helpers/nextRound';

export default defineComponent({
    name: 'NextRound',

    components: { IplInput, IplErrorDisplay, IplButton, IplCheckbox, IplSelect, IplSpace },

    setup() {
        const tournamentDataStore = useTournamentDataStore();
        const nextRoundStore = useNextRoundStore();
        const teamAId = ref('');
        const teamBId = ref('');
        const roundId = ref('');
        const matchName = ref('');
        const isChanged = computed(() =>
            teamAId.value !== nextRoundStore.state.nextRound.teamA.id
            || teamBId.value !== nextRoundStore.state.nextRound.teamB.id
            || roundId.value !== nextRoundStore.state.nextRound.round.id);
        const selectedRound = computed(() => tournamentDataStore.state.roundStore[roundId.value]);

        watch(selectedRound, (newValue, oldValue) => {
            if (!!newValue && newValue.meta.name !== oldValue?.meta.name) {
                matchName.value = generateMatchNameForRound(
                    tournamentDataStore.state.matchStore, roundId.value, newValue.meta.name);
            }
        });

        const validators = {
            matchName: validator(matchName, false, notBlank)
        };

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
            matchName,
            validators,
            allValid: computed(() => allValid(validators)),
            teamAImageShown: computed({
                get() {
                    return nextRoundStore.state.nextRound.teamA.showLogo;
                },
                set(value: boolean) {
                    tournamentDataStore.dispatch('setTeamImageHidden',
                        { teamId: nextRoundStore.state.nextRound.teamA.id, isVisible: value });
                }
            }),
            teamBImageShown: computed({
                get() {
                    return nextRoundStore.state.nextRound.teamB.showLogo;
                },
                set(value: boolean) {
                    tournamentDataStore.dispatch('setTeamImageHidden',
                        { teamId: nextRoundStore.state.nextRound.teamB.id, isVisible: value });
                }
            }),
            updateButtonColor: computed(() => isChanged.value ? 'red' : 'blue'),
            handleUpdate() {
                nextRoundStore.dispatch('setNextRound', {
                    teamAId: teamAId.value,
                    teamBId: teamBId.value,
                    roundId: roundId.value
                });
            },
            beginNextMatch() {
                nextRoundStore.dispatch('beginNextMatch', { matchName: matchName.value });
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
            addDots
        };
    }
});
</script>
