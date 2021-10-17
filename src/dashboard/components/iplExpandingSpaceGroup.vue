<template>
    <slot />
</template>

<script lang="ts">
import { defineComponent, provide, ref } from 'vue';

export default defineComponent({
    name: 'IplExpandingSpaceGroup',

    setup() {
        provide('activeSpace', ref<string>(null));
    }
});
</script>
