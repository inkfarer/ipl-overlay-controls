<template>
    <ipl-select
        v-model="model"
        :options="options"
    />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useSettingsStore } from '../store/settingsStore';
import { perGameData } from '../../helpers/gameData/gameData';
import { IplSelect } from '@iplsplatoon/vue-components';
import sortBy from 'lodash/sortBy';

export default defineComponent({
    name: 'StageSelect',

    components: { IplSelect },

    props: {
        modelValue: {
            type: String,
            default: null
        }
    },

    emits: ['update:modelValue'],

    setup(props, { emit }) {
        const model = computed({
            get() {
                return props.modelValue;
            },
            set(newValue: string) {
                emit('update:modelValue', newValue);
            }
        });

        const settingsStore = useSettingsStore();

        return {
            model,
            options: computed(() =>
                sortBy(Object.entries(
                    perGameData[settingsStore.runtimeConfig.gameVersion].stages[settingsStore.runtimeConfig.locale])
                    .map(([key, value]) => ({ value: key, name: value })), 'name')),
        };
    }
});
</script>
