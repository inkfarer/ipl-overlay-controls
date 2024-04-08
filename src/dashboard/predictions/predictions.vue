<template>
    <ipl-error-display class="m-b-8" />
    <ipl-message
        v-if="!predictionStatus.predictionsEnabled"
        type="warning"
        data-test="predictions-disabled-message"
    >
        {{ predictionStatus.predictionStatusReason }}
    </ipl-message>
    <template v-else>
        <ipl-message
            v-if="!hasPredictionData"
            type="info"
            data-test="no-prediction-data-message"
            class="m-b-8"
        >
            {{ $t('noPredictionDataMessage') }}
        </ipl-message>

        <ipl-message
            v-if="!predictionStatus.socketOpen"
            type="warning"
            data-test="socket-closed-message"
            class="m-b-8"
        >
            {{ $t('socketClosedWarning.message') }}
            <iploc-button
                small
                :label="$t('socketClosedWarning.reconnectButton.label')"
                :progress-message="$t('socketClosedWarning.reconnectButton.loadingLabel')"
                class="m-t-6"
                color="yellow"
                data-test="socket-reconnect-button"
                async
                @click="handleReconnect"
            />
        </ipl-message>

        <prediction-data-display
            v-if="hasPredictionData"
            data-test="prediction-data-display"
            class="m-b-8"
        />

        <ipl-space data-test="prediction-management-space">
            <ipl-data-row
                :label="$t('predictionStatusLabel')"
                :value="$t(`common:predictionStatus.${rawStatus}`)"
            />
            <div class="m-t-6 prediction-button-container">
                <ipl-button
                    v-if="rawStatus === PredictionStatus.LOCKED"
                    :label="$t('resolvePredictionButton')"
                    color="green"
                    data-test="resolve-prediction-button"
                    @click="handleResolve"
                />
                <ipl-button
                    v-if="!rawStatus ||
                        rawStatus === PredictionStatus.CANCELED ||
                        rawStatus === PredictionStatus.RESOLVED"
                    :label="$t('createPredictionButton')"
                    color="green"
                    data-test="create-prediction-button"
                    @click="handleCreate"
                />
                <iploc-button
                    v-if="rawStatus === PredictionStatus.ACTIVE"
                    :label="$t('lockPredictionButton.label')"
                    color="red"
                    requires-confirmation
                    short-confirmation-message
                    async
                    :progress-message="$t('lockPredictionButton.loadingLabel')"
                    data-test="lock-prediction-button"
                    @click="handleLock"
                />
                <iploc-button
                    v-if="rawStatus === PredictionStatus.LOCKED || rawStatus === PredictionStatus.ACTIVE"
                    :label="$t('cancelPredictionButton.label')"
                    color="red"
                    requires-confirmation
                    short-confirmation-message
                    async
                    :progress-message="$t('cancelPredictionButton.loadingLabel')"
                    data-test="cancel-prediction-button"
                    @click="handleCancel"
                />
                <ipl-button
                    :label="$t('showPredictionButton.label')"
                    data-test="show-prediction-button"
                    disable-on-success
                    :success-message="$t('showPredictionButton.labelOnClick')"
                    @click="handleShow"
                />
            </div>
        </ipl-space>
    </template>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { usePredictionDataStore } from '../store/predictionDataStore';
import { IplButton, IplSpace, IplMessage, IplDataRow } from '@iplsplatoon/vue-components';
import { NodecgDialog } from '../types/dialog';
import { PredictionStatus } from 'types/enums/predictionStatus';
import PredictionDataDisplay from './components/predictionDataDisplay.vue';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';
import IplocButton from '../components/IplocButton.vue';

export default defineComponent({
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'Predictions',

    components: { IplErrorDisplay, PredictionDataDisplay, IplButton, IplDataRow, IplMessage, IplSpace, IplocButton },

    setup() {
        const store = usePredictionDataStore();
        const hasPredictionData = computed(() => !!store.predictionStore.currentPrediction);
        const currentPrediction = computed(() => store.predictionStore.currentPrediction);

        return {
            rawStatus: computed(() => currentPrediction.value?.status as PredictionStatus),
            PredictionStatus,
            hasPredictionData,
            predictionStatus: computed(() => store.predictionStore.status),
            handleResolve() {
                (nodecg.getDialog('resolvePredictionDialog') as NodecgDialog).open();
            },
            handleCreate() {
                (nodecg.getDialog('createPredictionDialog') as NodecgDialog).open();
            },
            async handleLock() {
                return store.lockPrediction();
            },
            async handleCancel() {
                return store.cancelPrediction();
            },
            handleShow() {
                nodecg.sendMessage('showPredictionData');
            },
            async handleReconnect() {
                return store.reconnect();
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
