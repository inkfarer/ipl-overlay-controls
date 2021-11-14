<template>
    <div
        class="ipl-progress-bar__wrapper"
        :style="{ backgroundColor: hexBackgroundColor }"
    >
        <div
            class="progress-bar"
            :style="{ width: `${normalizedValue}%`, backgroundColor: hexColor }"
        />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { progressBarBackgroundColors, progressBarColors } from '../styles/colors';

export default defineComponent({
    name: 'IplProgressBar',

    props: {
        value: {
            type: Number,
            required: true
        },
        color: {
            type: String as PropType<'blue' | 'pink' | 'yellow'>,
            required: true,
            validator: (value: string) => {
                return ['blue', 'pink', 'yellow'].includes(value);
            }
        },
        backgroundColor: {
            type: String as PropType<'light' | 'dark'>,
            default: 'light',
            validator: (value: string) => {
                return ['light', 'dark'].includes(value);
            }
        }
    },

    setup(props) {
        return {
            normalizedValue: computed(() => Math.max(Math.min(props.value, 100), 4)),
            hexColor: computed(() => progressBarColors[props.color]),
            hexBackgroundColor: computed(() => progressBarBackgroundColors[props.backgroundColor])
        };
    }
});
</script>

<style lang="scss" scoped>
@import './src/dashboard/styles/constants';

.ipl-progress-bar__wrapper {
    height: 10px;
    border-radius: 8px;
    padding: 3px;
    display: block;
    transition-duration: $transition-duration-low;

    .progress-bar {
        height: 100%;
        border-radius: 6px;
        transition-duration: $transition-duration-low;
    }
}
</style>
