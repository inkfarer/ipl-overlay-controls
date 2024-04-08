<template>
    <ipl-dialog-title
        :title="$t('dialogTitle')"
        @close="closeDialog('resolvePredictionDialog')"
    />
    <ipl-error-display class="m-t-8" />
    <ipl-message
        v-if="!outcomes"
        type="warning"
        class="m-t-8"
    >
        {{ $t('noPredictionDataMessage') }}
    </ipl-message>
    <ipl-message
        v-else-if="status !== PredictionStatus.LOCKED"
        type="info"
        class="m-t-8"
    >
        {{ $t('resolvingNotPossibleMessage') }}
    </ipl-message>
    <template v-else>
        <ipl-message
            v-if="!matchIsCompleted"
            class="m-t-8"
            type="warning"
        >
            {{ $t('roundNotCompletedWarning') }}
        </ipl-message>
        <ipl-message
            v-if="winningTeam === GameWinner.NO_WINNER"
            type="info"
            class="m-t-8"
        >
            {{ !winningTeamName
                ? $t('predictionWinnerUnknownMessage.withoutWinner')
                : $t('predictionWinnerUnknownMessage.withWinner', { name: winningTeamName }) }}
        </ipl-message>
        <ipl-space class="m-t-8">
            <ipl-label
                :class="{'winner-label': winningTeam === GameWinner.ALPHA}"
            >
                {{ winningTeam === GameWinner.ALPHA
                    ? $t('teamAButtonLabel.winner')
                    : $t('teamAButtonLabel.default') }}
            </ipl-label>
            <iploc-button
                async
                :progress-message="$t('buttonResolvingInProgressLabel')"
                :label="outcomes[0].title"
                :color="winningTeam === GameWinner.ALPHA ? 'yellow' : 'blue'"
                data-test="resolve-outcome-1-button"
                @click="resolvePrediction(0)"
            />
            <ipl-label
                :class="{'winner-label': winningTeam === GameWinner.BRAVO}"
            >
                {{ winningTeam === GameWinner.BRAVO
                    ? $t('teamBButtonLabel.winner')
                    : $t('teamBButtonLabel.default') }}
            </ipl-label>
            <iploc-button
                async
                :progress-message="$t('buttonResolvingInProgressLabel')"
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
import { IplDialogTitle, IplLabel, IplMessage, IplSpace } from '@iplsplatoon/vue-components';
import { usePredictionDataStore } from '../store/predictionDataStore';
import { GameWinner } from 'types/enums/gameWinner';
import { useActiveRoundStore } from '../store/activeRoundStore';
import { PredictionStatus } from 'types/enums/predictionStatus';
import { NodecgDialog } from '../types/dialog';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';
import { closeDialog } from '../helpers/dialogHelper';
import IplocButton from '../components/IplocButton.vue';

export default defineComponent({
    name: 'ResolvePredictionDialog',

    components: { IplErrorDisplay, IplDialogTitle, IplMessage, IplocButton, IplLabel, IplSpace },

    setup() {
        const predictionDataStore = usePredictionDataStore();
        const activeRoundStore = useActiveRoundStore();

        const outcomes = computed(() => predictionDataStore.predictionStore.currentPrediction?.outcomes);

        const winningTeamName = computed(() => {
            const activeRound = activeRoundStore.activeRound;
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
            matchIsCompleted: computed(() => activeRoundStore.activeRound.match.isCompleted),
            outcomes,
            status: computed(() => predictionDataStore.predictionStore.currentPrediction?.status),
            PredictionStatus,
            winningTeamName,
            winningTeam,
            GameWinner,
            async resolvePrediction(winningOutcomeIndex: number): Promise<void> {
                await predictionDataStore.resolvePrediction({ winningOutcomeIndex });
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
