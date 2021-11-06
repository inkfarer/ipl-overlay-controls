<template>
    <ipl-button
        :label="label"
        :color="modelValue ? 'green' : '#2F3A4F'"
        class="ipl-toggle-button"
        @click="toggle"
    />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import IplButton from './iplButton.vue';

export default defineComponent({
    name: 'IplToggleButton',

    components: { IplButton },

    props: {
        label: {
            type: String,
            required: true
        },
        modelValue: {
            type: [Boolean, null],
            required: true
        }
    },

    emits: [ 'update:modelValue' ],

    setup(props, { emit }) {
        return {
            toggle() {
                emit('update:modelValue', !props.modelValue);
            }
        };
    }
});
</script>

<style lang="scss" scoped>

</style>
