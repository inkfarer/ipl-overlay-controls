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
            data-test="round-selector"
        />
        <ipl-input
            v-model="nextMatchName"
            class="m-t-4"
            name="match-name"
            label="Match Name"
        />
        <ipl-button
            label="Update"
            class="m-t-8"
            :color="isChanged ? 'red' : 'blue'"
            :title="RIGHT_CLICK_UNDO_MESSAGE"
            data-test="update-button"
            @click="handleUpdate"
            @right-click="undoChanges"
        />
    </ipl-space>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IplButton, IplInput, IplSpace } from '@iplsplatoon/vue-components';
import TeamSelect from '../../components/teamSelect.vue';
import { computed, ref, watch } from 'vue';
import { useNextRoundStore } from '../../store/nextRoundStore';
import RoundSelect from '../../components/roundSelect.vue';
import { RIGHT_CLICK_UNDO_MESSAGE } from '../../../extension/helpers/strings';

export default defineComponent({
    name: 'ManualTeamPicker',

    components: { IplInput, IplButton, RoundSelect, TeamSelect, IplSpace },

    setup() {
        const nextRoundStore = useNextRoundStore();

        const teamAId = ref(nextRoundStore.nextRound.teamA.id);
        const teamBId = ref(nextRoundStore.nextRound.teamB.id);
        const selectedRound = ref<string>(nextRoundStore.nextRound.round.id);
        const nextMatchName = ref<string>('');

        watch(
            () => nextRoundStore.nextRound.teamA.id,
            newValue => teamAId.value = newValue,
            { immediate: true });
        watch(
            () => nextRoundStore.nextRound.teamB.id,
            newValue => teamBId.value = newValue,
            { immediate: true });
        watch(
            () => nextRoundStore.nextRound.round.id,
            newId => selectedRound.value = newId,
            { immediate: true });
        watch(
            () => nextRoundStore.nextRound.name,
            newValue => nextMatchName.value = newValue,
            { immediate: true });

        return {
            RIGHT_CLICK_UNDO_MESSAGE,
            teamAId,
            teamBId,
            selectedRound,
            nextMatchName,
            isChanged: computed(() =>
                teamAId.value !== nextRoundStore.nextRound.teamA.id
                || teamBId.value !== nextRoundStore.nextRound.teamB.id
                || selectedRound.value !== nextRoundStore.nextRound.round.id
                || nextMatchName.value !== nextRoundStore.nextRound.name),
            handleUpdate() {
                nextRoundStore.setNextRound({
                    teamAId: teamAId.value,
                    teamBId: teamBId.value,
                    roundId: selectedRound.value,
                    name: nextMatchName.value
                });
            },
            undoChanges(event: Event) {
                event.preventDefault();

                teamAId.value = nextRoundStore.nextRound.teamA.id;
                teamBId.value = nextRoundStore.nextRound.teamB.id;
                selectedRound.value = nextRoundStore.nextRound.round.id;
                nextMatchName.value = nextRoundStore.nextRound.name;
            }
        };
    }
});
</script>
