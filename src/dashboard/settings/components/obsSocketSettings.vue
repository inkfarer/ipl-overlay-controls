<template>
    <ipl-space>
        <div class="title">OBS Socket</div>
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
            @click="connect"
        />
        <ipl-space
            class="text-center m-t-8 text-semibold rounded-inner"
            :class="`obs-status_${status}`"
        >
            {{ statusText }}
        </ipl-space>
    </ipl-space>
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
    allValid
} from '@iplsplatoon/vue-components';
import { computed, ref } from 'vue';
import { useObsStore } from '../../store/obsStore';
import { ObsStatus, ObsStatusHelper } from 'types/enums/ObsStatus';

export default defineComponent({
    name: 'ObsSocketSettings',

    components: { IplButton, IplSpace, IplInput },

    setup() {
        const obsStore = useObsStore();

        const socketUrl = ref('');
        const socketPassword = ref('');

        obsStore.watch(
            state => state.obsCredentials.address, newValue => socketUrl.value = newValue,
            { immediate: true });
        obsStore.watch(
            state => state.obsCredentials.password, newValue => socketPassword.value = newValue,
            { immediate: true });

        const validators = {
            socketUrl: validator(socketUrl, true, notBlank)
        };
        provideValidators(validators);

        return {
            socketUrl,
            socketPassword,
            isChanged: computed(() =>
                socketUrl.value !== obsStore.state.obsCredentials.address
                || socketPassword.value !== obsStore.state.obsCredentials.password),
            allValid: computed(() => allValid(validators)),
            statusText: computed(() => ObsStatusHelper.toPrettyString(obsStore.state.obsData.status as ObsStatus)),
            status: computed(() => obsStore.state.obsData.status),
            connect() {
                obsStore.dispatch('connect', { address: socketUrl.value, password: socketPassword.value });
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
