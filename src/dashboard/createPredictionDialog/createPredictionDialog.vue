<template>
    <ipl-dialog-title
        title="Create Prediction"
        dialog-name="createPredictionDialog"
    />
    <ipl-error-display class="m-t-8" />
    <ipl-message
        v-if="isActivePredictionUnresolved"
        type="warning"
        class="m-t-8"
    >
        The active prediction has not been resolved!
    </ipl-message>
    <ipl-space
        v-else
        class="m-t-8"
    >
        <div class="layout horizontal">
            <ipl-input
                v-model="title"
                label="Title"
                name="title"
                class="title-input"
                :validator="validators.title"
            />
            <ipl-input
                v-model="duration"
                label="Duration"
                extra="seconds"
                name="duration"
                type="number"
                class="m-l-6 duration-input"
                :validator="validators.duration"
            />
        </div>
        <div class="layout horizontal m-t-4">
            <ipl-input
                v-model="teamAName"
                name="team-a-name"
                class="max-width"
                label="Team A"
                :validator="validators.teamAName"
            />
            <ipl-input
                v-model="teamBName"
                name="team-b-name"
                class="max-width m-l-6"
                label="Team B"
                :validator="validators.teamBName"
            />
        </div>
        <ipl-button
            label="Create"
            class="m-t-8"
            :disabled="!allValid"
            color="green"
            async
            data-test="create-prediction-button"
            @click="createPrediction"
        />
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import IplDialogTitle from '../components/iplDialogTitle.vue';
import IplSpace from '../components/iplSpace.vue';
import IplInput from '../components/iplInput.vue';
import IplButton from '../components/iplButton.vue';
import { useNextRoundStore } from '../store/nextRoundStore';
import { addDots } from '../../helpers/stringHelper';
import { allValid, validator } from '../helpers/validation/validator';
import { maxLength } from '../helpers/validation/stringValidators';
import { maxValue, minValue } from '../helpers/validation/numberValidators';
import { usePredictionDataStore } from '../store/predictionDataStore';
import { PredictionStatus } from 'types/enums/predictionStatus';
import IplMessage from '../components/iplMessage.vue';
import { NodecgDialog } from '../types/dialog';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';

export default defineComponent({
    name: 'CreatePredictionDialog',

    components: { IplErrorDisplay, IplMessage, IplButton, IplInput, IplSpace, IplDialogTitle },

    setup() {
        const nextRoundStore = useNextRoundStore();
        const predictionDataStore = usePredictionDataStore();

        const title = ref('Who do you think will win this match?');
        const duration = ref(120);
        const teamAName = ref('');
        const teamBName = ref('');
        const validators = {
            title: validator(title, true, maxLength(45)),
            duration: validator(duration, true, minValue(1), maxValue(1800)),
            teamAName: validator(teamAName, false, maxLength(25)),
            teamBName: validator(teamBName, false, maxLength(25))
        };

        nextRoundStore.watch(state => state.nextRound, (newValue, oldValue) => {
            if (newValue.teamA.name !== oldValue?.teamA.name) teamAName.value = addDots(newValue.teamA.name, 25);
            if (newValue.teamB.name !== oldValue?.teamB.name) teamBName.value = addDots(newValue.teamB.name, 25);
        }, { immediate: true });

        return {
            title,
            duration,
            teamAName,
            teamBName,
            validators,
            allValid: computed(() => allValid(validators)),
            isActivePredictionUnresolved: computed(() => [PredictionStatus.ACTIVE, PredictionStatus.LOCKED]
                .includes(predictionDataStore.state.predictionStore.currentPrediction?.status as PredictionStatus)),
            async createPrediction() {
                await predictionDataStore.dispatch('createPrediction', {
                    title: title.value,
                    duration: duration.value,
                    teamAName: teamAName.value,
                    teamBName: teamBName.value
                });
                (nodecg.getDialog('createPredictionDialog') as NodecgDialog).close();
            }
        };
    }
});
</script>

<style lang="scss" scoped>
.title-input {
    width: 65%;
}

.duration-input {
    width: 35%;
}
</style>
