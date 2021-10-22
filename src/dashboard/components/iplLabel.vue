<template>
    <label class="ipl-label">
        <slot />
    </label>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'IplLabel'
});
</script>

<style lang="scss" scoped>
label {
    color: #737373;
    font-size: 0.75em;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    transition-duration: 100ms;
}
</style>
