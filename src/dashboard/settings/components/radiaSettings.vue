<template>
    <ipl-space>
        <div class="title">Radia</div>
        <ipl-input
            v-model="settings.guildID"
            name="guild-id"
            label="Guild ID"
            :validator="v.guildId"
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
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref } from 'vue';
import IplInput from '../../components/iplInput.vue';
import IplSpace from '../../components/iplSpace.vue';
import IplButton from '../../components/iplButton.vue';
import { useSettingsStore } from '../settingsStore';
import isEqual from 'lodash/isEqual';
import { RadiaSettings } from 'schemas';
import cloneDeep from 'lodash/cloneDeep';
import { allValid, validator } from '../../helpers/validation/validator';
import { minLength, numeric } from '../../helpers/validation/stringValidators';

export default defineComponent({
    name: 'RadiaSettings',

    components: {
        IplButton,
        IplInput,
        IplSpace
    },

    setup() {
        const store = useSettingsStore();
        const isFocused = ref(false);
        const isChanged = computed(() => !isEqual(settings.value, store.state.radiaSettings));
        const settings: Ref<RadiaSettings> = ref(cloneDeep(store.state.radiaSettings));
        const validators = {
            guildId: validator(() => settings.value.guildID, minLength(17), numeric)
        };

        store.watch(store => store.radiaSettings, (newValue) => {
            if (!isFocused.value) {
                settings.value = cloneDeep(newValue);
            }
        }, { deep: true });

        return {
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
            v: validators
        };
    }
});
</script>

<style scoped>

</style>
