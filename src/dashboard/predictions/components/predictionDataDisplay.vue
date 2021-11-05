<template>
    <ipl-space>
        <div class="title">
            {{ title }}
        </div>
        <div
            v-if="isActive && secondsRemaining > 0"
            class="text-center"
        >
            {{ formattedTimeRemaining }} remaining
        </div>

        <ipl-space
            color="light"
            class="prediction-outcomes-space"
        >
            <div
                class="outcome"
                :class="{ 'is-winner': firstOutcome.isWinner }"
            >
                <span class="team-name">{{ firstOutcome.title }}</span>
                <div>
                    <span>{{ pluralize('point', firstOutcome.pointsUsed) }}</span>
                    <span style="float: right">
                        {{ firstOutcome.users }} <font-awesome-icon icon="users" />
                        {{ firstOutcome.percentage }}%
                    </span>
                </div>
                <ipl-progress-bar
                    :color="firstOutcome.isWinner ? 'yellow' : firstOutcome.color.toLowerCase()"
                    :value="firstOutcome.percentage"
                    background-color="dark"
                    class="m-t-4"
                />
            </div>
            <div
                class="outcome"
                :class="{ 'is-winner': secondOutcome.isWinner }"
            >
                <ipl-progress-bar
                    :color="secondOutcome.isWinner ? 'yellow' : secondOutcome.color.toLowerCase()"
                    :value="secondOutcome.percentage"
                    background-color="dark"
                />
                <div class="m-t-4">
                    <span>{{ pluralize('point', secondOutcome.pointsUsed) }}</span>
                    <span style="float: right">
                        {{ secondOutcome.users }} <font-awesome-icon icon="users" />
                        {{ secondOutcome.percentage }}%
                    </span>
                </div>
                <span class="team-name">{{ secondOutcome.title }}</span>
            </div>
        </ipl-space>
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUsers } from '@fortawesome/free-solid-svg-icons/faUsers';
import { usePredictionDataStore } from '../predictionDataStore';
import { Outcome } from 'schemas';
import IplProgressBar from '../../components/iplProgressBar.vue';
import IplSpace from '../../components/iplSpace.vue';
import { pluralize } from '../../helpers/stringHelper';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { DateTime, Duration } from 'luxon';

library.add(faUsers);

export default defineComponent({
    name: 'PredictionDataDisplay',
    components: { IplSpace, IplProgressBar, FontAwesomeIcon },
    setup() {
        const store = usePredictionDataStore();

        const isActive = computed(() => store.state.predictionStore.currentPrediction?.status === 'ACTIVE');
        const lockTime = computed(() => DateTime.fromISO(store.state.predictionStore.currentPrediction?.lockTime));
        const secondsRemaining = ref(0);
        let timeRemainingInterval: number = null;
        const formattedTimeRemaining = computed(() =>
            Duration.fromObject({ seconds: secondsRemaining.value }).toFormat('m:ss'));
        watch(isActive, newValue => {
            if (newValue) {
                timeRemainingInterval = window.setInterval(() => {
                    const diff = lockTime.value.diffNow([ 'seconds' ]).seconds;
                    secondsRemaining.value = diff > 0 ? diff : 0;
                }, 100);
            } else {
                clearInterval(timeRemainingInterval);
                timeRemainingInterval = null;
            }
        }, { immediate: true });

        const currentPrediction = computed(() => store.state.predictionStore.currentPrediction);
        const totalPointsSpent = computed(() =>
            currentPrediction.value?.outcomes[0]?.pointsUsed + currentPrediction.value?.outcomes[1].pointsUsed);
        function getOutcome(index: number): Outcome & { percentage: number, isWinner: boolean } {
            const outcome = currentPrediction.value?.outcomes[index];
            const percentage = Math.round(outcome.pointsUsed / totalPointsSpent.value * 100);

            return {
                ...outcome,
                percentage: isNaN(percentage) ? 0 : percentage,
                isWinner: currentPrediction.value?.winningOutcome === outcome.id
            };
        }
        const firstOutcome = computed(() => getOutcome(0));
        const secondOutcome = computed(() => getOutcome(1));

        return {
            title: computed(() => currentPrediction.value?.title),
            formattedTimeRemaining,
            secondsRemaining,
            isActive,
            firstOutcome,
            secondOutcome,
            pluralize
        };
    }
});
</script>

<style lang="scss" scoped>
span.team-name {
    font-size: 1.25em;
    font-weight: 600;
}

.prediction-outcomes-space {
    padding: 4px;
}

.outcome {
    border-radius: 5px;
    padding: 4px;
    transition-duration: 100ms;

    &.is-winner {
        background-color: rgba(255, 199, 0, 0.15);
    }
}
</style>