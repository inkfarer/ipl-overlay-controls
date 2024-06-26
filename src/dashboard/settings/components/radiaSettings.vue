<template>
    <ipl-space>
        <ipl-message
            v-if="!radiaEnabled"
            type="warning"
            class="m-b-8"
            data-test="radia-disabled-warning"
        >
            {{ $t('radia.radiaDisabledMessage') }}
            <iploc-button
                small
                :label="$t('radia.reconnectButton')"
                :progress-message="$t('radia.loadingReconnectButton')"
                class="m-t-6"
                color="yellow"
                data-test="radia-connect-button"
                async
                @click="attemptRadiaReconnect"
            />
        </ipl-message>
        <div class="title">{{ $t('sectionName.radia') }}</div>
        <ipl-input
            v-model="settings.guildID"
            name="guild-id"
            :label="$t('radia.guildIdInput')"
            @focuschange="handleFocusEvent"
        />
        <ipl-button
            :label="$t('common:button.update')"
            data-test="update-button"
            class="m-t-8"
            :color="buttonColor"
            :disabled="!isValid"
            :title="$t('common:button.rightClickUndoMessage')"
            @click="handleUpdate"
            @right-click="undoChanges"
        />
        <ipl-checkbox
            v-model="settings.updateOnImport"
            class="m-t-8"
            :label="$t('radia.updateTournamentDataOnImportCheckbox')"
            data-test="update-on-import-checkbox"
            @update:model-value="setUpdateOnImport"
        />
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, watch } from 'vue';
import {
    IplButton,
    IplCheckbox,
    IplInput,
    IplMessage,
    IplSpace,
    provideValidators,
    validator
} from '@iplsplatoon/vue-components';
import { useSettingsStore } from '../../store/settingsStore';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import cloneDeep from 'lodash/cloneDeep';
import { RadiaSettings } from 'schemas';
import { minLength, numeric } from '../../helpers/validators/stringValidators';
import IplocButton from '../../components/IplocButton.vue';

export default defineComponent({
    name: 'RadiaSettings',

    components: {
        IplCheckbox,
        IplButton,
        IplInput,
        IplSpace,
        IplMessage,
        IplocButton
    },

    setup() {
        const store = useSettingsStore();
        const isFocused = ref(false);
        const isChanged = computed(() => !isEqual(
            pick(settings.value, [ 'guildID' ]),
            pick(store.radiaSettings, [ 'guildID' ])
        ));
        const settings: Ref<RadiaSettings> = ref(cloneDeep(store.radiaSettings));
        const { allValid } = provideValidators({
            'guild-id': validator(true, minLength(17), numeric)
        });

        watch(() => store.radiaSettings.guildID, newValue => {
            if (!isFocused.value) {
                settings.value.guildID = newValue;
            }
        });

        watch(() => store.radiaSettings.updateOnImport, newValue => {
            settings.value.updateOnImport = newValue;
        });

        return {
            radiaEnabled: computed(() => store.radiaSettings.enabled),
            focused: isFocused,
            handleFocusEvent(event: boolean) {
                isFocused.value = event;
            },
            isChanged,
            isValid: allValid,
            buttonColor: computed(() => isChanged.value ? 'red' : 'blue'),
            settings,
            handleUpdate() {
                if (isChanged.value) {
                    store.setRadiaSettings({ newValue: settings.value });
                }
            },
            setUpdateOnImport(value: boolean) {
                store.setUpdateOnImport(value);
            },
            async attemptRadiaReconnect(): Promise<void> {
                return store.attemptRadiaConnection();
            },
            undoChanges(event: Event) {
                event.preventDefault();

                settings.value.guildID = store.radiaSettings.guildID;
            }
        };
    }
});
</script>
