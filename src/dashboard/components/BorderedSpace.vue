<template>
    <fieldset class="section-separator-wrapper">
        <legend>{{ label }}</legend>
        <slot />
    </fieldset>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BorderedSpace',

    props: {
        label: {
            type: String,
            required: true
        }
    }
});
</script>

<style lang="scss">
@import '../styles/colors';
@import '../styles/constants';

.section-separator-wrapper {
    border-color: #869FFF;
    border-radius: $border-radius-outer;
    padding: 8px;

    > legend {
        color: #869FFF;
    }
}
</style>
