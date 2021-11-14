<template>
    <div class="ipl-expanding-space-group">
        <slot />
    </div>
</template>

<script lang="ts">
import { defineComponent, provide, ref, watch } from 'vue';

export default defineComponent({
    name: 'IplExpandingSpaceGroup',

    props: {
        modelValue: {
            type: [String, null],
            default: null
        },
    },

    emits: [ 'update:modelValue' ],

    setup(props) {
        const selectedSpace = ref(null);

        watch(() => props.modelValue, newValue => {
            selectedSpace.value = newValue;
        }, { immediate: true });

        provide('activeSpace', selectedSpace);
    }
});
</script>
