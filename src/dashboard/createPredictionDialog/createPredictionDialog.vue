<template>
    <ipl-dialog-title
        title="Create Prediction"
        @close="closeDialog('createPredictionDialog')"
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
            />
            <ipl-input
                v-model="duration"
                label="Duration"
                extra="seconds"
                name="duration"
                type="number"
                class="m-l-6 duration-input"
            />
        </div>
        <div class="layout horizontal m-t-4">
            <ipl-input
                v-model="teamAName"
                name="team-a-name"
                class="max-width"
                label="Team A"
            />
            <ipl-input
                v-model="teamBName"
                name="team-b-name"
                class="max-width m-l-6"
                label="Team B"
            />
        </div>
        <div class="layout horizontal m-t-8">
            <iploc-button
                label="Create"
                :disabled="!allValid"
                color="green"
                async
                data-test="create-prediction-button"
                @click="createPrediction"
            />
            <iploc-button
                label="Reset"
                color="red"
                class="m-l-8"
                data-test="reset-inputs-button"
                @click="resetInputs"
            />
        </div>
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import {
    IplSpace,
    IplInput,
    IplDialogTitle,
    IplMessage,
    validator,
    minValue,
    maxValue,
    provideValidators
} from '@iplsplatoon/vue-components';
import { useNextRoundStore } from '../store/nextRoundStore';
import { usePredictionDataStore } from '../store/predictionDataStore';
import { PredictionStatus } from 'types/enums/predictionStatus';
import { NodecgDialog } from '../types/dialog';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';
import { closeDialog } from '../helpers/dialogHelper';
import { addDots } from '../../helpers/stringHelper';
import { maxLength } from '../helpers/validators/stringValidators';
import IplocButton from '../components/IplocButton.vue';

export default defineComponent({
    name: 'CreatePredictionDialog',

    components: { IplErrorDisplay, IplMessage, IplInput, IplSpace, IplDialogTitle, IplocButton },

    setup() {
        const nextRoundStore = useNextRoundStore();
        const predictionDataStore = usePredictionDataStore();

        const title = ref('Who do you think will win this match?');
        const duration = ref(120);
        const teamAName = ref('');
        const teamBName = ref('');
        const { allValid } = provideValidators({
            title: validator(true, maxLength(45)),
            duration: validator(true, minValue(1), maxValue(1800)),
            'team-a-name': validator(true, maxLength(25)),
            'team-b-name': validator(true, maxLength(25))
        });

        watch(() => nextRoundStore.nextRound, (newValue, oldValue) => {
            if (newValue.teamA.name !== oldValue?.teamA.name) teamAName.value = addDots(newValue.teamA.name, 25);
            if (newValue.teamB.name !== oldValue?.teamB.name) teamBName.value = addDots(newValue.teamB.name, 25);
        }, { immediate: true });

        return {
            title,
            duration,
            teamAName,
            teamBName,
            allValid,
            isActivePredictionUnresolved: computed(() => [PredictionStatus.ACTIVE, PredictionStatus.LOCKED]
                .includes(predictionDataStore.predictionStore.currentPrediction?.status as PredictionStatus)),
            async createPrediction() {
                await predictionDataStore.createPrediction({
                    title: title.value,
                    duration: duration.value,
                    teamAName: teamAName.value,
                    teamBName: teamBName.value
                });
                (nodecg.getDialog('createPredictionDialog') as NodecgDialog).close();
            },
            resetInputs() {
                title.value = 'Who do you think will win this match?';
                duration.value = 120;
                teamAName.value = nextRoundStore.nextRound.teamA.name;
                teamBName.value = nextRoundStore.nextRound.teamB.name;
            },
            closeDialog
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
