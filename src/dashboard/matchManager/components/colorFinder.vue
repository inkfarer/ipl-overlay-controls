<template>
    <div>
        <div class="options-title">{{ $t('colorFinder.firstColorLabel') }}</div>
        <div class="color-finder-options">
            <ipl-space
                v-for="(option, index) in colorGroup?.colorFinderOptions ?? []"
                :key="`first-color-option_${index}`"
                :color="selectedFirstColorIndex === index ? 'blue' : 'secondary'"
                class="color-option"
                clickable
                :data-test="`first-color-option_${index}`"
                @click="selectedFirstColorIndex = index"
            >
                <div
                    class="color-display"
                    :style="{
                        backgroundColor: option.optionColor,
                        borderColor: getBorderColor(option.optionColor)
                    }"
                />
            </ipl-space>
        </div>
        <div class="options-title">{{ $t('colorFinder.secondColorLabel') }}</div>
        <div class="color-finder-options">
            <ipl-space
                v-if="secondColorOptions.length === 0"
                class="color-option disabled"
            >
                <div
                    class="color-display"
                    style="background-color: var(--ipl-bg-tertiary-hover); border-color: white;"
                />
            </ipl-space>
            <ipl-space
                v-for="(option, index) in secondColorOptions"
                v-else
                :key="`second-color-option_${index}`"
                :color="selectedSecondColorIndex === index ? 'blue' : 'secondary'"
                class="color-option"
                clickable
                :data-test="`second-color-option_${index}`"
                @click="selectedSecondColorIndex = index"
            >
                <div
                    class="color-display"
                    :style="{
                        backgroundColor: option.clrB,
                        borderColor: getBorderColor(option.clrB)
                    }"
                />
            </ipl-space>
        </div>
        <team-color-display
            :team-a-color="teamColors.teamA"
            :team-b-color="teamColors.teamB"
            class="m-t-8"
        />
        <div class="layout horizontal m-t-8">
            <ipl-button
                :label="$t('colorFinder.applyButton')"
                :disabled="selectedSecondColorIndex == null"
                data-test="apply-button"
                @click="applyColor"
            />
            <ipl-button
                icon="times"
                color="red"
                class="m-l-8"
                :title="$t('colorFinder.cancelButtonTitle')"
                data-test="cancel-button"
                @click="emit('close')"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '../../store/settingsStore';
import { computed, ref, watch } from 'vue';
import { perGameData } from '../../../helpers/gameData/gameData';
import { IplSpace, IplButton } from '@iplsplatoon/vue-components';
import { getContrastingTextColor } from '@iplsplatoon/vue-components';
import TeamColorDisplay from './teamColorDisplay.vue';
import { useActiveRoundStore } from '../../store/activeRoundStore';
import { swapColors } from '../../../helpers/ColorHelper';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';

library.add(faTimes);

const emit = defineEmits<{
    (e: 'close'): void
}>();
const props = defineProps<{
    colorGroupKey: string | null
}>();

const settingsStore = useSettingsStore();
const activeRoundStore = useActiveRoundStore();

const colorGroup = computed(() => perGameData[settingsStore.runtimeConfig.gameVersion].colors
    .find(group => group.meta.key === props.colorGroupKey));

const selectedFirstColorIndex = ref<number | null>(null);
watch(() => props.colorGroupKey, () => {
    selectedFirstColorIndex.value = null;
    selectedSecondColorIndex.value = null;
});

const selectedSecondColorIndex = ref<number | null>(null);
const secondColorOptions = computed(() => {
    if (selectedFirstColorIndex.value == null) {
        return [];
    } else {
        return colorGroup.value?.colorFinderOptions?.[selectedFirstColorIndex.value]?.matchingColorKeys
            .map(key => colorGroup.value.colors.find(color => color.key === key));
    }
});

const teamColors = computed(() => {
    if (selectedFirstColorIndex.value == null && selectedSecondColorIndex.value == null) {
        return {
            teamA: null,
            teamB: null
        };
    } else if (selectedSecondColorIndex.value == null) {
        const alphaColor = colorGroup.value?.colorFinderOptions?.[selectedFirstColorIndex.value].optionColor;
        if (activeRoundStore.swapColorsInternally) {
            return {
                teamA: null,
                teamB: alphaColor
            };
        } else {
            return {
                teamA: alphaColor,
                teamB: null
            };
        }
    } else {
        const selectedColor = secondColorOptions.value[selectedSecondColorIndex.value];
        if (activeRoundStore.swapColorsInternally) {
            return {
                teamA: selectedColor.clrB,
                teamB: selectedColor.clrA
            };
        } else {
            return {
                teamA: selectedColor.clrA,
                teamB: selectedColor.clrB
            };
        }
    }
});

watch(selectedFirstColorIndex, () => {
    if (secondColorOptions.value.length === 1) {
        selectedSecondColorIndex.value = 0;
    } else {
        selectedSecondColorIndex.value = null;
    }
});

function applyColor() {
    if (selectedSecondColorIndex.value == null) return;

    const selectedColor = secondColorOptions.value[selectedSecondColorIndex.value];
    activeRoundStore.setActiveColor({
        categoryKey: colorGroup.value.meta.key,
        categoryName: colorGroup.value.meta.name,
        color: activeRoundStore.swapColorsInternally ? swapColors(selectedColor) : selectedColor
    });
    emit('close');
}

function getBorderColor(color: string): string {
    return getContrastingTextColor(color, 'white', 'var(--ipl-bg-tertiary)');
}
</script>

<style scoped lang="scss">
.options-title {
    font-weight: 700;
    margin-bottom: 2px;

    &:not(:first-child) {
        margin-top: 8px;
    }
}

.color-finder-options {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
}

.color-option {
    padding: 6px;

    &.disabled {
        background-color: var(--ipl-bg-tertiary);
        cursor: not-allowed;
    }
}

.color-display {
    box-sizing: border-box;
    border-style: solid;
    border-width: 2px;
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 999px;
}
</style>
