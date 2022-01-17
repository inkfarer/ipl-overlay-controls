<template>
    <ipl-dialog-title
        title="Resolve Prediction"
        @close="closeDialog('resolvePredictionDialog')"
    />
    <ipl-error-display class="m-t-8" />
    <ipl-message
        v-if="!outcomes"
        type="warning"
        class="m-t-8"
    >
        No prediction data loaded.
    </ipl-message>
    <ipl-message
        v-else-if="status !== PredictionStatus.LOCKED"
        type="info"
        class="m-t-8"
    >
        This prediction cannot be resolved right now.
    </ipl-message>
    <template v-else>
        <ipl-message
            v-if="!roundIsCompleted"
            class="m-t-8"
            type="warning"
        >
            The current round has not been completed!
        </ipl-message>
        <ipl-message
            v-if="winningTeam === GameWinner.NO_WINNER"
            type="info"
            class="m-t-8"
        >
            Unable to determine the current round's winner.
            <template v-if="!!winningTeamName">The leading team is {{ winningTeamName }}.</template>
        </ipl-message>
        <ipl-space class="m-t-8">
            <ipl-label
                :class="{'winner-label': winningTeam === GameWinner.ALPHA}"
            >
                {{ winningTeam === GameWinner.ALPHA ? 'Winner - ' : '' }} Team A
            </ipl-label>
            <ipl-button
                async
                progress-message="Resolving..."
                :label="outcomes[0].title"
                :color="winningTeam === GameWinner.ALPHA ? 'yellow' : 'blue'"
                data-test="resolve-outcome-1-button"
                @click="resolvePrediction(0)"
            />
            <ipl-label
                :class="{'winner-label': winningTeam === GameWinner.BRAVO}"
            >
                {{ winningTeam === GameWinner.BRAVO ? 'Winner - ' : '' }} Team B
            </ipl-label>
            <ipl-button
                async
                progress-message="Resolving..."
                :label="outcomes[1].title"
                :color="winningTeam === GameWinner.BRAVO ? 'yellow' : 'blue'"
                data-test="resolve-outcome-2-button"
                @click="resolvePrediction(1)"
            />
        </ipl-space>
    </template>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent } from 'vue';
import { IplButton, IplSpace, IplLabel, IplMessage, IplDialogTitle } from '@iplsplatoon/vue-components';
import { usePredictionDataStore } from '../store/predictionDataStore';
import { GameWinner } from 'types/enums/gameWinner';
import { useActiveRoundStore } from '../store/activeRoundStore';
import { PredictionStatus } from 'types/enums/predictionStatus';
import { NodecgDialog } from '../types/dialog';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';
import { closeDialog } from '../helpers/dialogHelper';

export default defineComponent({
    name: 'ResolvePredictionDialog',

    components: { IplErrorDisplay, IplDialogTitle, IplMessage, IplButton, IplLabel, IplSpace },

    setup() {
        const predictionDataStore = usePredictionDataStore();
        const activeRoundStore = useActiveRoundStore();

        const outcomes = computed(() => predictionDataStore.state.predictionStore.currentPrediction?.outcomes);

        const winningTeamName = computed(() => {
            const activeRound = activeRoundStore.state.activeRound;
            if (activeRound.teamA.score === activeRound.teamB.score) {
                return null;
            } else if (activeRound.teamA.score > activeRound.teamB.score) {
                return activeRound.teamA.name;
            } else {
                return activeRound.teamB.name;
            }
        });

        const winningTeam: ComputedRef<GameWinner> = computed(() => {
            if (outcomes.value) {
                for (let i = 0; i < 2; i++) {
                    const outcome = outcomes.value[i];
                    if (outcome.title.toUpperCase() === winningTeamName.value?.toUpperCase()) {
                        if (i === 0) {
                            return GameWinner.ALPHA;
                        } else if (i === 1) {
                            return GameWinner.BRAVO;
                        }
                    }
                }
            }

            return GameWinner.NO_WINNER;
        });

        return {
            roundIsCompleted: computed(() => activeRoundStore.state.activeRound.round.isCompleted),
            outcomes,
            status: computed(() => predictionDataStore.state.predictionStore.currentPrediction?.status),
            PredictionStatus,
            winningTeamName,
            winningTeam,
            GameWinner,
            async resolvePrediction(winningOutcomeIndex: number): Promise<void> {
                await predictionDataStore.dispatch('resolvePrediction', { winningOutcomeIndex });
                (nodecg.getDialog('resolvePredictionDialog') as NodecgDialog).close();
            },
            closeDialog
        };
    }
});
</script>

<style lang="scss" scoped>
.winner-label {
    color: #FDD835;
}
</style>
