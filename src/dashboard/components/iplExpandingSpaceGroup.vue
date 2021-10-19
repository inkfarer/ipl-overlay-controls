<template>
    <slot />
</template>

<script lang="ts">
import { computed, defineComponent, provide } from 'vue';

export default defineComponent({
    name: 'IplExpandingSpaceGroup',

    props: {
        modelValue: {
            type: [String, null],
            required: true
        },
    },

    emits: [ 'update:modelValue' ],

    setup(props, { emit }) {
        const model = computed<string>({
            get() {
                return props.modelValue;
            },
            set(value) {
                emit('update:modelValue', value);
            }
        });

        provide('activeSpace', model);
    }
});
</script>
