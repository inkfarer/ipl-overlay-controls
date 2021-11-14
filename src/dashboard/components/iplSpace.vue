<template>
    <div
        class="ipl-space"
        :class="`color-${color}`"
    >
        <slot />
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'IplSpace',

    props: {
        color: {
            type: String as PropType<'dark' | 'light'>,
            default: 'dark',
            validator: (value: string): boolean => {
                return ['dark', 'light'].includes(value);
            }
        }
    }
});
</script>

<style lang="scss" scoped>
@import './src/dashboard/styles/colors';

.ipl-space {
    border-radius: 7px;
    padding: 8px;

    &.color-light {
        background-color: $background-secondary;
    }

    &.color-dark {
        background-color: $background-primary;
    }
}
</style>
