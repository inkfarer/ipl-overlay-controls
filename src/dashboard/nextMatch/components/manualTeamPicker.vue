<template>
    <ipl-space>
        <div class="layout horizontal">
            <team-select
                v-model="teamAId"
                label="Team A"
                data-test="team-a-selector"
            />
            <team-select
                v-model="teamBId"
                label="Team B"
                class="m-l-8"
                data-test="team-b-selector"
            />
        </div>
        <round-select
            v-model="selectedRound"
            class="m-t-8"
        />
        <ipl-button
            label="Update"
            class="m-t-8"
            :color="isChanged ? 'red' : 'blue'"
            data-test="update-button"
            @click="handleUpdate"
        />
    </ipl-space>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import { IplButton, IplSpace } from '@iplsplatoon/vue-components';
import TeamSelect from '../../components/teamSelect.vue';
import { computed, ref } from 'vue';
import { useNextRoundStore } from '../../store/nextRoundStore';
import RoundSelect from '../../components/roundSelect.vue';

export default defineComponent({
    name: 'ManualTeamPicker',

    components: { IplButton, RoundSelect, TeamSelect, IplSpace },

    setup() {
        const nextRoundStore = useNextRoundStore();

        const teamAId = ref(nextRoundStore.state.nextRound.teamA.id);
        const teamBId = ref(nextRoundStore.state.nextRound.teamB.id);
        const selectedRound = ref<string>(nextRoundStore.state.nextRound.round.id);

        nextRoundStore.watch(
            store => store.nextRound.teamA.id,
            newValue => teamAId.value = newValue,
            { immediate: true });
        nextRoundStore.watch(
            store => store.nextRound.teamB.id,
            newValue => teamBId.value = newValue,
            { immediate: true });
        nextRoundStore.watch(
            state => state.nextRound.round.id,
            newId => selectedRound.value = newId,
            { immediate: true });

        return {
            teamAId,
            teamBId,
            selectedRound,
            isChanged: computed(() =>
                teamAId.value !== nextRoundStore.state.nextRound.teamA.id
                || teamBId.value !== nextRoundStore.state.nextRound.teamB.id
                || selectedRound.value !== nextRoundStore.state.nextRound.round.id),
            handleUpdate() {
                nextRoundStore.dispatch('setNextRound', {
                    teamAId: teamAId.value,
                    teamBId: teamBId.value,
                    roundId: selectedRound.value
                });
            }
        };
    }
});
</script>