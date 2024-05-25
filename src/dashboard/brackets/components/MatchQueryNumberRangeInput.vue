<template>
    <ipl-radio
        :model-value="props.modelValue ? String(props.modelValue) : null"
        :options="options"
        :label="props.label"
        @update:model-value="newValue => emit('update:modelValue', newValue)"
    />
</template>

<script setup lang="ts">
import { IplRadio } from '@iplsplatoon/vue-components';

const props = defineProps<{
    modelValue?: string | number
    min: number
    max: number
    label: string
}>();
const emit = defineEmits<{
    (event: 'update:modelValue', newValue: string): void
}>();

const options = Array.from(
    { length: props.max - props.min + 1 },
    (_, i) => ({ name: String(i + props.min), value: String(i + props.min) }));
</script>
