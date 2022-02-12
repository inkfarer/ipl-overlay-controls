<template>
    <ipl-space>
        <div class="layout horizontal">
            <span class="max-width text-small team-name wrap-anywhere">
                {{ addDots(activeRound.teamA.name, 36) }}
            </span>
            <span class="max-width text-small team-name wrap-anywhere text-right m-l-6">
                {{ addDots(activeRound.teamB.name, 36) }}
            </span>
        </div>
        <div class="layout horizontal m-t-4">
            <div
                class="color-display"
                :style="{ backgroundColor: activeRound.teamA.color }"
                data-test="team-a-color-display"
            />
            <div
                class="color-display m-l-6"
                :style="{ backgroundColor: activeRound.teamB.color }"
                data-test="team-b-color-display"
            />
        </div>
        <div class="layout horizontal m-t-6 color-toggle-container">
            <div
                class="color-toggle layout horizontal center-vertical center-horizontal"
                :class="{ disabled: colorTogglesDisabled }"
                data-test="color-toggle-previous"
                @click="setActiveColor(previousColor)"
            >
                <font-awesome-icon
                    icon="chevron-left"
                    class="icon-left"
                />
                <div
                    class="color"
                    :style="{
                        backgroundColor: previousColor?.clrA,
                        borderColor: getBorderColor(previousColor?.clrA)
                    }"
                />
                <div
                    class="color"
                    :style="{
                        backgroundColor: previousColor?.clrB,
                        borderColor: getBorderColor(previousColor?.clrB)
                    }"
                />
            </div>
            <ipl-button
                label="Swap"
                class="m-l-6"
                data-test="swap-colors-button"
                @click="swapColors"
            />
            <div
                class="color-toggle layout horizontal center-vertical center-horizontal m-l-6"
                :class="{ disabled: colorTogglesDisabled }"
                data-test="color-toggle-next"
                @click="setActiveColor(nextColor)"
            >
                <div
                    class="color"
                    :style="{ backgroundColor: nextColor?.clrA, borderColor: getBorderColor(nextColor?.clrA) }"
                />
                <div
                    class="color"
                    :style="{ backgroundColor: nextColor?.clrB, borderColor: getBorderColor(nextColor?.clrB) }"
                />
                <font-awesome-icon
                    icon="chevron-right"
                    class="icon-right"
                />
            </div>
        </div>
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { IplButton, IplSpace } from '@iplsplatoon/vue-components';
import { useActiveRoundStore } from '../../store/activeRoundStore';
import { ColorInfo } from 'types/colors';
import { getContrastingTextColor } from '../../helpers/colorHelper';
import { themeColors } from '../../styles/colors';
import { addDots } from '../../../helpers/stringHelper';
import { useSettingsStore } from '../../settings/settingsStore';
import { perGameData } from '../../../helpers/gameData/gameData';

library.add(faChevronRight, faChevronLeft);

export default defineComponent({
    name: 'ActiveColorToggles',

    components: { IplSpace, IplButton, FontAwesomeIcon },

    setup() {
        const activeRoundStore = useActiveRoundStore();
        const settingsStore = useSettingsStore();
        const gameData = computed(() => perGameData[settingsStore.state.runtimeConfig.gameVersion]);

        const activeRound = computed(() => activeRoundStore.state.activeRound);

        const colorTogglesDisabled = computed(() =>
            activeRoundStore.state.activeRound.activeColor.categoryName === 'Custom Color');
        const selectedColorGroup = computed(() => {
            return gameData.value.colors.find(group => group.meta.name === activeRound.value.activeColor.categoryName);
        });
        const selectedIndex = computed(() => activeRound.value.activeColor.index);

        function swapColors(data: ColorInfo): ColorInfo {
            return {
                ...data,
                clrA: data.clrB,
                clrB: data.clrA
            };
        }

        const nextColor = computed(() => {
            const color = selectedColorGroup.value?.colors.find(color => {
                return color.index === (selectedIndex.value + 1 === selectedColorGroup.value.colors.length
                    ? 0
                    : selectedIndex.value + 1);
            });
            if (!color) return null;
            return activeRoundStore.state.swapColorsInternally ? swapColors(color) : color;
        });
        const previousColor = computed(() => {
            const color = selectedColorGroup.value?.colors.find(color => {
                return color.index === (selectedIndex.value === 0
                    ? selectedColorGroup.value.colors.length - 1
                    : selectedIndex.value - 1);
            });
            if (!color) return null;
            return activeRoundStore.state.swapColorsInternally ? swapColors(color) : color;
        });

        return {
            activeRound,
            colorTogglesDisabled,
            setActiveColor(color: ColorInfo) {
                if (colorTogglesDisabled.value) return;

                activeRoundStore.dispatch('setActiveColor', {
                    color,
                    categoryName: selectedColorGroup.value.meta.name
                });
            },
            getBorderColor(color: string): string {
                return getContrastingTextColor(color, 'white', themeColors.backgroundColorTertiary);
            },
            nextColor,
            previousColor,
            swapColors() {
                activeRoundStore.dispatch('swapColors');
            },
            addDots
        };
    }
});
</script>

<style lang="scss" scoped>
@import './src/dashboard/styles/colors';
@import './src/dashboard/styles/constants';

span.team-name {
    align-self: flex-end;
}

.color-display {
    width: 100%;
    height: 20px;
    border-radius: 3px;
    transition-duration: $transition-duration-med;
}

.color-toggle-container {
    .ipl-button {
        width: auto;
        flex-grow: 1;
    }
}

.color-toggle {
    width: 68px;
    background-color: $background-secondary;
    border-radius: $border-radius-inner;
    transition-duration: $transition-duration-low;
    padding: 6px;

    &:not(.disabled):hover {
        background-color: $background-secondary-hover;
    }

    &:not(.disabled):active {
        background-color: $background-secondary-active;
    }

    &.disabled {
        background-color: $background-tertiary;
        pointer-events: none;
        color: $text-color-disabled;

        .color {
            filter: contrast(0.25);
        }
    }

    .color {
        width: 20px;
        border-style: solid;
        border-width: 2px;
        height: 20px;
        border-radius: 50%;
        margin: 1px;
        pointer-events: none;
        transition-duration: $transition-duration-med;
    }

    .icon-right {
        margin-left: 4px;
        pointer-events: none;
    }

    .icon-left {
        margin-right: 4px;
        pointer-events: none;
    }
}
</style>
