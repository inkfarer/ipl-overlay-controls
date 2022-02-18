<template>
    <ipl-space>
        <ipl-message
            v-if="!radiaEnabled"
            type="warning"
            class="m-b-8"
            data-test="radia-disabled-warning"
        >
            Radia integration is disabled.
            <ipl-button
                small
                label="Attempt to connect"
                class="m-t-6"
                color="yellow"
                data-test="radia-connect-button"
                async
                @click="attemptRadiaReconnect"
            />
        </ipl-message>
        <div class="title">Radia</div>
        <ipl-input
            v-model="settings.guildID"
            name="guild-id"
            label="Guild ID"
            @focuschange="handleFocusEvent"
        />
        <ipl-button
            label="Update"
            data-test="update-button"
            class="m-t-8"
            :color="buttonColor"
            :disabled="!isValid"
            @click="handleUpdate"
        />
        <ipl-checkbox
            v-model="settings.updateOnImport"
            class="m-t-8"
            label="Update tournament data on import"
            data-test="update-on-import-checkbox"
            @update:modelValue="setUpdateOnImport"
        />
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref } from 'vue';
import { IplButton, IplInput, IplSpace, IplCheckbox, IplMessage, provideValidators } from '@iplsplatoon/vue-components';
import { useSettingsStore } from '../settingsStore';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import cloneDeep from 'lodash/cloneDeep';
import { RadiaSettings } from 'schemas';
import { allValid, validator } from '../../helpers/validation/validator';
import { minLength, numeric } from '../../helpers/validation/stringValidators';

export default defineComponent({
    name: 'RadiaSettings',

    components: {
        IplCheckbox,
        IplButton,
        IplInput,
        IplSpace,
        IplMessage
    },

    setup() {
        const store = useSettingsStore();
        const isFocused = ref(false);
        const isChanged = computed(() => !isEqual(
            pick(settings.value, ['guildID']),
            pick(store.state.radiaSettings, ['guildID'])
        ));
        const settings: Ref<RadiaSettings> = ref(cloneDeep(store.state.radiaSettings));
        const validators = {
            'guild-id': validator(() => settings.value.guildID, true, minLength(17), numeric)
        };
        provideValidators(validators);

        store.watch(store => store.radiaSettings.guildID, newValue => {
            if (!isFocused.value) {
                settings.value.guildID = newValue;
            }
        });

        store.watch(store => store.radiaSettings.updateOnImport, newValue => {
            settings.value.updateOnImport = newValue;
        });

        return {
            radiaEnabled: computed(() => store.state.radiaSettings.enabled),
            focused: isFocused,
            handleFocusEvent(event: boolean) {
                isFocused.value = event;
            },
            isChanged,
            isValid: computed(() => allValid(validators)),
            buttonColor: computed(() => isChanged.value ? 'red' : 'blue'),
            settings,
            handleUpdate() {
                if (isChanged.value) {
                    store.commit('setRadiaSettings', { newValue: settings.value });
                }
            },
            setUpdateOnImport(value: boolean) {
                store.commit('setUpdateOnImport', value);
            },
            async attemptRadiaReconnect(): Promise<void> {
                return store.dispatch('attemptRadiaConnection');
            }
        };
    }
});
</script>
