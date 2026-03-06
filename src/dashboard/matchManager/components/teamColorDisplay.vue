<template>
    <div>
        <div class="layout horizontal">
            <span class="max-width text-small team-name wrap-anywhere">
                {{ addDots(activeRoundStore.activeRound.teamA.name, 36) }}
            </span>
            <span class="max-width text-small team-name wrap-anywhere text-right m-l-6">
                {{ addDots(activeRoundStore.activeRound.teamB.name, 36) }}
            </span>
        </div>
        <div class="layout horizontal m-t-4">
            <div
                class="color-display text-right"
                :style="{
                    backgroundColor: props.teamAColor ?? 'var(--ipl-bg-secondary)',
                    color: getTextColor(props.teamAColor)
                }"
                data-test="team-a-color-display"
            >
                {{ colorsSwapped ? 'β' : 'α' }}
            </div>
            <div
                class="color-display m-l-6"
                :style="{
                    backgroundColor: props.teamBColor ?? 'var(--ipl-bg-secondary)',
                    color: getTextColor(props.teamBColor)
                }"
                data-test="team-b-color-display"
            >
                {{ colorsSwapped ? 'α' : 'β' }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getContrastingTextColor } from '@iplsplatoon/vue-components';
import { useActiveRoundStore } from '../../store/activeRoundStore';
import { computed } from 'vue';
import { addDots } from '../../../helpers/stringHelper';

const activeRoundStore = useActiveRoundStore();

const props = defineProps<{
    teamAColor?: string
    teamBColor?: string
}>();

function getTextColor(color?: string): string {
    if (color == null) {
        return 'var(--ipl-body-text-color)';
    }

    return getContrastingTextColor(color, 'white', 'var(--ipl-bg-tertiary)');
}

const colorsSwapped = computed(() => activeRoundStore.swapColorsInternally);
</script>

<style scoped lang="scss">
@use '../../styles/constants';

span.team-name {
    align-self: flex-end;
}

.color-display {
    width: 100%;
    height: 18px;
    padding: 2px 4px;
    border-radius: 3px;
    transition-duration: constants.$transition-duration-med;
}
</style>
