<template>
    <div>
        <ipl-space>
            <div class="title">OBS Socket</div>
            <ipl-toggle
                v-model="socketEnabled"
                true-label="Enable"
                false-label="Disable"
            />
        </ipl-space>
        <ipl-space
            v-if="socketEnabled"
            class="m-t-8"
        >
            <ipl-input
                v-model="socketUrl"
                name="socketUrl"
                label="Socket address"
            />
            <ipl-input
                v-model="socketPassword"
                name="password"
                label="Password (Optional)"
                type="password"
                class="m-t-4"
            />
            <ipl-button
                label="Connect"
                class="m-t-8"
                :color="isChanged ? 'red' : 'blue'"
                :disabled="!allValid"
                data-test="socket-connect-button"
                async
                progress-message="Connecting..."
                success-message="Connected!"
                :title="RIGHT_CLICK_UNDO_MESSAGE"
                @click="connect"
                @right-click="undoChanges"
            />
            <ipl-space
                class="text-center m-t-8 text-semibold rounded-inner"
                :class="`obs-status_${status}`"
            >
                {{ statusText }}
            </ipl-space>
        </ipl-space>
        <ipl-message
            v-else
            type="info"
            class="m-t-8"
        >
            OBS websocket is disabled.
        </ipl-message>
    </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import {
    IplSpace,
    IplInput,
    IplButton,
    validator,
    notBlank,
    provideValidators,
    allValid, IplToggle, IplMessage
} from '@iplsplatoon/vue-components';
import { computed, ref, watch } from 'vue';
import { useObsStore } from '../../store/obsStore';
import { ObsStatus, ObsStatusHelper } from 'types/enums/ObsStatus';
import { RIGHT_CLICK_UNDO_MESSAGE } from '../../../extension/helpers/strings';
import { useErrorHandlerStore } from '../../store/errorHandlerStore';

export default defineComponent({
    name: 'ObsSocketSettings',

    components: { IplMessage, IplToggle, IplButton, IplSpace, IplInput },

    setup() {
        const obsStore = useObsStore();
        const errorHandlerStore = useErrorHandlerStore();

        const socketEnabled = computed({
            get() {
                return obsStore.obsData.enabled;
            },
            async set(value: boolean): Promise<void> {
                try {
                    await obsStore.setEnabled(value);
                } catch (err) {
                    errorHandlerStore.handleError({ err });
                }
            }
        });

        const socketUrl = ref('');
        const socketPassword = ref('');

        watch(
            () => obsStore.obsCredentials.address, newValue => socketUrl.value = newValue,
            { immediate: true });
        watch(
            () => obsStore.obsCredentials.password, newValue => socketPassword.value = newValue,
            { immediate: true });

        const validators = {
            socketUrl: validator(socketUrl, true, notBlank)
        };
        provideValidators(validators);

        return {
            RIGHT_CLICK_UNDO_MESSAGE,
            socketEnabled,
            socketUrl,
            socketPassword,
            isChanged: computed(() =>
                socketUrl.value !== obsStore.obsCredentials.address
                || socketPassword.value !== obsStore.obsCredentials.password),
            allValid: computed(() => allValid(validators)),
            statusText: computed(() => ObsStatusHelper.toPrettyString(obsStore.obsData.status as ObsStatus)),
            status: computed(() => obsStore.obsData.status),
            connect() {
                return obsStore.connect({ address: socketUrl.value, password: socketPassword.value });
            },
            undoChanges(event: Event) {
                event.preventDefault();

                socketUrl.value = obsStore.obsCredentials.address;
                socketPassword.value = obsStore.obsCredentials.password;
            }
        };
    }
});
</script>

<style lang="scss">
@import './src/dashboard/styles/colors';

.obs-status_CONNECTING {
    background-color: $yellow !important;
    color: #222;
}

.obs-status_NOT_CONNECTED {
    background-color: $red !important;
}

.obs-status_CONNECTED {
    background-color: $green !important;
}
</style>
