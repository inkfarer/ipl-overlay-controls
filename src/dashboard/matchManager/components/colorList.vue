<template>
    <ipl-expanding-space
        key="more-colors"
        title="More colors"
    >
        <div class="colors-container">
            <div class="layout horizontal center-horizontal m-x-16">
                <ipl-checkbox
                    v-model="useCustomColor"
                    label="Use custom color"
                    data-test="use-custom-color-toggle"
                    small
                />
                <ipl-checkbox
                    v-model="showColorNames"
                    label="Show color names"
                    data-test="color-names-toggle"
                    class="m-l-8"
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
                    :class="{ 'color-names-visible': showColorNames }"
                >
                    <div class="title">{{ group.meta.name }}</div>
                    <div
                        v-for="(color, colorIndex) in group.colors"
                        :key="`color_${groupIndex}_${colorIndex}`"
                        :data-test="`color-option-${groupIndex}-${colorIndex}`"
                        class="color-option layout horizontal center-vertical"
                        :class="{ 'is-selected': activeColor.title === color.title &&
                            activeColor.categoryName === group.meta.name }"
                        @click="setColor(color, group.meta.name, group.meta.key)"
                    >
                        <span
                            v-show="showColorNames"
                            style="flex-grow: 1"
                        >
                            {{ color.title }}
                        </span>
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
                :title="RIGHT_CLICK_UNDO_MESSAGE"
                data-test="custom-color-submit-btn"
                @click="submitCustomColor"
                @right-click="undoCustomColorChanges"
            />
        </div>
    </ipl-expanding-space>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { useActiveRoundStore } from '../../store/activeRoundStore';
import { ColorInfo } from 'types/colors';
import { IplButton, IplExpandingSpace, IplCheckbox, IplInput, getContrastingTextColor } from '@iplsplatoon/vue-components';
import { themeColors } from '../../styles/colors';
import { useSettingsStore } from '../../store/settingsStore';
import { perGameData } from '../../../helpers/gameData/gameData';
import { RIGHT_CLICK_UNDO_MESSAGE } from '../../../extension/helpers/strings';

export default defineComponent({
    name: 'ColorList',

    components: { IplButton, IplInput, IplCheckbox, IplExpandingSpace },

    setup() {
        const activeRoundStore = useActiveRoundStore();
        const settingsStore = useSettingsStore();
        const gameData = computed(() => perGameData[settingsStore.runtimeConfig.gameVersion]);

        const useCustomColor = ref(false);
        const customColorA = ref(null);
        const customColorB = ref(null);

        watch(() => activeRoundStore.activeRound.teamA.color, newValue => {
            if (customColorA.value == null || activeRoundStore.activeRound.activeColor.isCustom) {
                customColorA.value = newValue;
            }
        }, { immediate: true });
        watch(() => activeRoundStore.activeRound.teamB.color, newValue => {
            if (customColorB.value == null || activeRoundStore.activeRound.activeColor.isCustom) {
                customColorB.value = newValue;
            }
        }, { immediate: true });

        watch(() => activeRoundStore.swapColorsInternally, () => {
            const colorA = customColorA.value;
            customColorA.value = customColorB.value;
            customColorB.value = colorA;
        });

        const swapColorsInternally = computed(() => activeRoundStore.swapColorsInternally);

        watch(() => activeRoundStore.activeRound.activeColor.isCustom, newValue => {
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
            RIGHT_CLICK_UNDO_MESSAGE,
            useCustomColor,
            customColorA,
            customColorB,
            customColorChanged: computed(() => {
                const activeRound = activeRoundStore.activeRound;
                return customColorA.value !== activeRound.teamA.color || customColorB.value !== activeRound.teamB.color;
            }),
            submitCustomColor() {
                activeRoundStore.setActiveColor({
                    categoryName: 'Custom Color',
                    categoryKey: 'customColor',
                    color: {
                        index: 0,
                        title: 'Custom Color',
                        key: 'customColor',
                        clrA: customColorA.value,
                        clrB: customColorB.value,
                        clrNeutral: '#FFFFFF',
                        isCustom: true
                    }
                });
            },
            colorsWithoutCustom: computed(() =>
                gameData.value.colors.filter(color => color.meta.name !== 'Custom Color')),
            activeColor: computed(() => activeRoundStore.activeRound.activeColor),
            getBorderColor(color: string): string {
                return getContrastingTextColor(color, 'white', themeColors.backgroundColorTertiary);
            },
            setColor(color: ColorInfo, categoryName: string, categoryKey: string): void {
                activeRoundStore.setActiveColor({
                    color: swapColorsInternally.value ? swapColors(color) : color,
                    categoryName,
                    categoryKey
                });
            },
            swapColorsInternally,
            undoCustomColorChanges(event: Event) {
                event.preventDefault();

                customColorA.value = activeRoundStore.activeRound.teamA.color;
                customColorB.value = activeRoundStore.activeRound.teamB.color;
            },

            showColorNames: ref(false)
        };
    }
});
</script>

<style lang="scss" scoped>
@import './src/dashboard/styles/colors';
@import './src/dashboard/styles/constants';

.colors-container {
    max-height: 180px;
    overflow-y: auto;
}

.color-group {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin-bottom: 6px;

    > .color-option {
        justify-content: center;
    }

    > .title {
        grid-column: 1 / -1;
        margin: 0;
    }

    &.color-names-visible {
        grid-template-columns: 1fr;
    }
}

.color-option {
    background-color: $background-secondary;
    border-radius: $border-radius-inner;
    padding: 6px 10px;
    cursor: pointer;
    transition-property: background-color;
    transition-duration: $transition-duration-low;
    box-sizing: border-box;

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
