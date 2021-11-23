<template>
    <ipl-message
        v-if="!predictionsEnabled"
        type="warning"
        data-test="predictions-disabled-message"
    >
        Unsupported Guild, unable to run predictions.
    </ipl-message>
    <ipl-message
        v-if="!hasPredictionData && predictionsEnabled"
        type="info"
        data-test="no-prediction-data-message"
    >
        No prediction data loaded.
    </ipl-message>

    <prediction-data-display
        v-if="hasPredictionData && predictionsEnabled"
        class="m-t-8"
        data-test="prediction-data-display"
    />

    <ipl-space
        v-if="predictionsEnabled"
        class="m-t-8"
        data-test="prediction-management-space"
    >
        <ipl-data-row
            label="Status"
            :value="status"
        />
        <div class="m-t-6 prediction-button-container">
            <ipl-button
                v-if="rawStatus === PredictionStatus.LOCKED"
                label="Resolve"
                color="green"
                data-test="resolve-prediction-button"
                @click="handleResolve"
            />
            <ipl-button
                v-if="!rawStatus || rawStatus === PredictionStatus.CANCELED || rawStatus === PredictionStatus.RESOLVED"
                label="New"
                color="green"
                data-test="create-prediction-button"
                @click="handleCreate"
            />
            <ipl-button
                v-if="rawStatus === PredictionStatus.ACTIVE"
                label="Lock"
                color="red"
                requires-confirmation
                short-confirmation-message
                async
                progress-message="Locking..."
                data-test="lock-prediction-button"
                @click="handleLock"
            />
            <ipl-button
                v-if="rawStatus === PredictionStatus.LOCKED || rawStatus === PredictionStatus.ACTIVE"
                label="Cancel"
                color="red"
                requires-confirmation
                short-confirmation-message
                async
                progress-message="Cancelling..."
                data-test="cancel-prediction-button"
                @click="handleCancel"
            />
            <ipl-button
                label="Show"
                data-test="show-prediction-button"
                @click="handleShow"
            />
        </div>
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { usePredictionDataStore } from '../store/predictionDataStore';
import IplSpace from '../components/iplSpace.vue';
import IplMessage from '../components/iplMessage.vue';
import IplDataRow from '../components/iplDataRow.vue';
import IplButton from '../components/iplButton.vue';
import { NodecgDialog } from '../types/dialog';
import { PredictionStatus } from 'types/enums/predictionStatus';
import PredictionDataDisplay from './components/predictionDataDisplay.vue';

export default defineComponent({
    name: 'Predictions',

    components: { PredictionDataDisplay, IplButton, IplDataRow, IplMessage, IplSpace },

    setup() {
        const store = usePredictionDataStore();
        const hasPredictionData = computed(() => !!store.state.predictionStore.currentPrediction);
        const predictionsEnabled = computed(() => store.state.predictionStore.status.predictionsEnabled);

        const currentPrediction = computed(() => store.state.predictionStore.currentPrediction);

        return {
            status: computed(() => {
                const status = currentPrediction.value?.status;
                return status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : null;
            }),
            rawStatus: computed(() => currentPrediction.value?.status),
            PredictionStatus,
            hasPredictionData,
            predictionsEnabled,
            handleResolve() {
                (nodecg.getDialog('resolvePredictionDialog') as NodecgDialog).open();
            },
            handleCreate() {
                (nodecg.getDialog('createPredictionDialog') as NodecgDialog).open();
            },
            async handleLock() {
                return store.dispatch('lockPrediction');
            },
            async handleCancel() {
                return store.dispatch('cancelPrediction');
            },
            handleShow() {
                nodecg.sendMessage('showPredictionData');
            }
        };
    }
});
</script>

<style lang="scss" scoped>
.prediction-button-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;

    *:nth-child(3) {
        grid-column: span 2;
    }
}
</style>
