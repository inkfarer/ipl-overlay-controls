<template>
    <ipl-space>
        <div class="layout horizontal">
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
                        backgroundColor: previousColor.clrA,
                        borderColor: getBorderColor(previousColor.clrA)
                    }"
                />
                <div
                    class="color"
                    :style="{
                        backgroundColor: previousColor.clrB,
                        borderColor: getBorderColor(previousColor.clrB)
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
                    :style="{ backgroundColor: nextColor.clrA, borderColor: getBorderColor(nextColor.clrA) }"
                />
                <div
                    class="color"
                    :style="{ backgroundColor: nextColor.clrB, borderColor: getBorderColor(nextColor.clrB) }"
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
import IplSpace from '../../components/iplSpace.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import IplButton from '../../components/iplButton.vue';
import { useActiveRoundStore } from '../../store/activeRoundStore';
import { ColorInfo } from 'types/colors';
import { colors } from '../../../helpers/splatoonData';
import { getContrastingTextColor } from '../../helpers/colorHelper';

library.add(faChevronRight, faChevronLeft);

export default defineComponent({
    name: 'ActiveColorToggles',

    components: { IplSpace, IplButton, FontAwesomeIcon },

    setup() {
        const activeRoundStore = useActiveRoundStore();

        const activeRound = computed(() => activeRoundStore.state.activeRound);

        const colorTogglesDisabled = computed(() =>
            activeRoundStore.state.activeRound.activeColor.categoryName === 'Custom Color');
        const selectedColorGroup = computed(() => {
            return colors.find(group => group.meta.name === activeRound.value.activeColor.categoryName);
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
            const color = selectedColorGroup.value.colors.find(color => {
                return color.index === (selectedIndex.value + 1 === selectedColorGroup.value.colors.length
                    ? 0
                    : selectedIndex.value + 1);
            });
            return activeRoundStore.state.swapColorsInternally ? swapColors(color) : color;
        });
        const previousColor = computed(() => {
            const color = selectedColorGroup.value.colors.find(color => {
                return color.index === (selectedIndex.value === 0
                    ? selectedColorGroup.value.colors.length - 1
                    : selectedIndex.value - 1);
            });
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
                return getContrastingTextColor(color, 'white', '#181E29');
            },
            nextColor,
            previousColor,
            swapColors() {
                activeRoundStore.dispatch('swapColors');
            }
        };
    }
});
</script>

<style lang="scss" scoped>
.color-display {
    width: 100%;
    height: 20px;
    border-radius: 3px;
    transition-duration: 250ms;
}

.color-toggle-container {
    .ipl-button {
        width: auto;
        flex-grow: 1;
    }
}

.color-toggle {
    width: 68px;
    background-color: #2F3A4F;
    border-radius: 5px;
    transition-duration: 100ms;
    padding: 6px;

    &:not(.disabled):hover {
        background-color: #3C4B66;
    }

    &:not(.disabled):active {
        background-color: #334057;
    }

    &.disabled {
        background-color: #181e29;
        pointer-events: none;
        color: #a9aaa9;

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
        transition-duration: 250ms;
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
