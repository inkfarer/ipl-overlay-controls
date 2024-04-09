<template>
    <div>
        <ipl-space>
            <div class="title">{{ $t('sectionName.obs') }}</div>
            <ipl-toggle
                v-model="socketEnabled"
                :true-label="$t('obs.toggleEnable')"
                :false-label="$t('obs.toggleDisable')"
            />
        </ipl-space>
        <ipl-space
            v-if="socketEnabled"
            class="m-t-8"
        >
            <ipl-input
                v-model="socketUrl"
                name="socketUrl"
                :label="$t('obs.socketUrlInput')"
            />
            <ipl-input
                v-model="socketPassword"
                name="password"
                :label="$t('obs.passwordInput')"
                type="password"
                class="m-t-4"
            />
            <iploc-button
                :label="$t('obs.connectButton')"
                class="m-t-8"
                :color="isChanged ? 'red' : 'blue'"
                :disabled="!allValid"
                data-test="socket-connect-button"
                async
                :progress-message="$t('obs.loadingConnectButton')"
                :success-message="$t('obs.connectButtonSuccess')"
                :title="$t('common:button.rightClickUndoMessage')"
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
            {{ $t('obs.socketDisabledMessage') }}
        </ipl-message>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IplSpace,
    IplInput,
    validator,
    notBlank,
    provideValidators,
    IplToggle,
    IplMessage
} from '@iplsplatoon/vue-components';
import { computed, ref, watch } from 'vue';
import { useObsStore } from '../../store/obsStore';
import { useErrorHandlerStore } from '../../store/errorHandlerStore';
import { useTranslation } from 'i18next-vue';
import IplocButton from '../../components/IplocButton.vue';

export default defineComponent({
    name: 'ObsSocketSettings',

    components: { IplMessage, IplToggle, IplocButton, IplSpace, IplInput },

    setup() {
        const { t } = useTranslation();
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

        const { allValid } = provideValidators({
            socketUrl: validator(true, notBlank)
        });

        return {
            socketEnabled,
            socketUrl,
            socketPassword,
            isChanged: computed(() =>
                socketUrl.value !== obsStore.obsCredentials.address
                || socketPassword.value !== obsStore.obsCredentials.password),
            allValid,
            statusText: computed(() => t(`common:obsStatus.${obsStore.obsData.status}`)),
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
