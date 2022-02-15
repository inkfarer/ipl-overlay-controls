<template>
    <ipl-expanding-space
        key="more-colors"
        title="More colors"
    >
        <div class="colors-container">
            <div class="layout horizontal center-horizontal">
                <ipl-checkbox
                    v-model="useCustomColor"
                    label="Use custom color"
                    small
                />
            </div>
            <div
                v-if="!useCustomColor"
                class="m-t-8"
            >
                <div
                    v-for="(group, groupIndex) in colorsWithoutCustom"
                    :key="`color-group_${groupIndex}`"
                    class="color-group"
                >
                    <div class="title">{{ group.meta.name }}</div>
                    <div
                        v-for="(color, colorIndex) in group.colors"
                        :key="`color_${groupIndex}_${colorIndex}`"
                        :data-test="`color-option-${groupIndex}-${colorIndex}`"
                        class="color-option layout horizontal center-vertical"
                        :class="{ 'is-selected': activeColor === color.title }"
                        @click="setColor(color, group.meta.name)"
                    >
                        <span style="flex-grow: 1">{{ color.title }}</span>
                        <div class="color-previews layout horizontal">
                            <div
                                class="color-preview"
                                :style="{
                                    backgroundColor: swapColorsInternally ? color.clrB : color.clrA,
                                    borderColor: getBorderColor(swapColorsInternally ? color.clrB : color.clrA)
                                }"
                            />
                            <div
                                class="color-preview"
                                :style="{
                                    backgroundColor: swapColorsInternally ? color.clrA : color.clrB,
                                    borderColor: getBorderColor(swapColorsInternally ? color.clrA : color.clrB)
                                }"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="useCustomColor">
            <div class="layout horizontal m-t-8">
                <ipl-input
                    v-model="customColorA"
                    type="color"
                    style="flex-grow: 1"
                    name="team-a-color"
                />
                <ipl-input
                    v-model="customColorB"
                    type="color"
                    class="m-l-8"
                    style="flex-grow: 1"
                    name="team-b-color"
                />
            </div>
            <ipl-button
                label="Update"
                class="m-t-8"
                :color="customColorChanged ? 'red' : 'blue'"
                data-test="custom-color-submit-btn"
                @click="submitCustomColor"
            />
        </div>
    </ipl-expanding-space>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useActiveRoundStore } from '../../store/activeRoundStore';
import { getContrastingTextColor } from '../../helpers/colorHelper';
import { ColorInfo } from 'types/colors';
import { IplButton, IplExpandingSpace, IplCheckbox, IplInput } from '@iplsplatoon/vue-components';
import { themeColors } from '../../../browser/styles/colors';
import { useSettingsStore } from '../../settings/settingsStore';
import { perGameData } from '../../../helpers/gameData/gameData';

export default defineComponent({
    name: 'ColorEditor',

    components: { IplButton, IplInput, IplCheckbox, IplExpandingSpace },

    setup() {
        const activeRoundStore = useActiveRoundStore();
        const settingsStore = useSettingsStore();
        const gameData = computed(() => perGameData[settingsStore.state.runtimeConfig.gameVersion]);

        const useCustomColor = ref(false);
        const customColorA = ref(null);
        const customColorB = ref(null);

        activeRoundStore.watch(store => store.activeRound.teamA.color, newValue => {
            customColorA.value = newValue;
        }, { immediate: true });
        activeRoundStore.watch(store => store.activeRound.teamB.color, newValue => {
            customColorB.value = newValue;
        }, { immediate: true });

        activeRoundStore.watch(store => store.swapColorsInternally, () => {
            const colorA = customColorA.value;
            customColorA.value = customColorB.value;
            customColorB.value = colorA;
        });

        const swapColorsInternally = computed(() => activeRoundStore.state.swapColorsInternally);

        activeRoundStore.watch(store => store.activeRound.activeColor.isCustom, newValue => {
            useCustomColor.value = newValue;
        }, { immediate: true });

        function swapColors(data: ColorInfo): ColorInfo {
            return {
                ...data,
                clrA: data.clrB,
                clrB: data.clrA
            };
        }

        return {
            useCustomColor,
            customColorA,
            customColorB,
            customColorChanged: computed(() => {
                const activeRound = activeRoundStore.state.activeRound;
                return customColorA.value !== activeRound.teamA.color || customColorB.value !== activeRound.teamB.color;
            }),
            submitCustomColor() {
                activeRoundStore.dispatch('setActiveColor', {
                    categoryName: 'Custom Color',
                    color: {
                        index: 0,
                        title: 'Custom Color',
                        clrA: customColorA.value,
                        clrB: customColorB.value,
                        clrNeutral: '#FFFFFF',
                        isCustom: true
                    }
                });
            },
            colorsWithoutCustom: computed(() =>
                gameData.value.colors.filter(color => color.meta.name !== 'Custom Color')),
            activeColor: computed(() => activeRoundStore.state.activeRound.activeColor.title),
            getBorderColor(color: string): string {
                return getContrastingTextColor(color, 'white', themeColors.backgroundColorTertiary);
            },
            setColor(color: ColorInfo, categoryName: string): void {
                activeRoundStore.dispatch('setActiveColor', {
                    color: swapColorsInternally.value ? swapColors(color) : color,
                    categoryName
                });
            },
            swapColorsInternally
        };
    }
});
</script>

<style lang="scss" scoped>
@import '../../../browser/styles/colors';
@import '../../../browser/styles/constants';

.colors-container {
    max-height: 180px;
    overflow: auto;
}

.color-option {
    width: auto;
    margin: 8px 0;
    background-color: $background-secondary;
    border-radius: $border-radius-inner;
    padding: 6px 10px;
    cursor: pointer;
    transition-duration: $transition-duration-low;

    &.is-selected {
        background-color: $blue;

        &:hover {
            background-color: $blue-hover;
        }

        &:active {
            background-color: $blue-active;
        }
    }

    &:not(.is-selected) {
        &:hover {
            background-color: $background-secondary-hover;
        }

        &:active {
            background-color: $background-secondary-active;
        }
    }

    .color-previews {
        pointer-events: none;
    }

    .color-preview {
        width: 20px;
        border-style: solid;
        border-width: 2px;
        height: 20px;
        border-radius: 50%;
        margin: 1px;
        pointer-events: none;
        transition-duration: $transition-duration-med;
    }
}
</style>
