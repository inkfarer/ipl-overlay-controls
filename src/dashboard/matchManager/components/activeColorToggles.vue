<template>
    <ipl-space>
        <ipl-message
            v-if="obsStore.obsData.enabled && showMissingGameplayInputWarning"
            type="warning"
            closeable
            class="m-b-8"
            data-test="missing-gameplay-input-warning"
            @close="showMissingGameplayInputWarning = false"
        >
            {{ $t('missingObsGameplayInputWarning') }}
        </ipl-message>
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
                class="color-display text-right"
                :style="{
                    backgroundColor: activeRound.teamA.color,
                    color: getBorderColor(activeRound.teamA.color)
                }"
                data-test="team-a-color-display"
            >
                {{ colorsSwapped ? 'β' : 'α' }}
            </div>
            <div
                class="color-display m-l-6"
                :style="{
                    backgroundColor: activeRound.teamB.color,
                    color: getBorderColor(activeRound.teamB.color)
                }"
                data-test="team-b-color-display"
            >
                {{ colorsSwapped ? 'α' : 'β' }}
            </div>
        </div>
        <div class="layout horizontal m-t-6 color-toggle-container">
            <div
                class="color-toggle layout horizontal center-vertical center-horizontal"
                :class="{ disabled: colorTogglesDisabled }"
                data-test="color-toggle-previous"
                @click="switchToPreviousColor"
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
                :label="$t('swapColorsButton')"
                class="m-l-6"
                data-test="swap-colors-button"
                @click="swapColors"
            />
            <div
                class="color-toggle layout horizontal center-vertical center-horizontal m-l-6"
                :class="{ disabled: colorTogglesDisabled }"
                data-test="color-toggle-next"
                @click="switchToNextColor"
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
        <ipl-button
            v-if="obsStore.obsData.enabled"
            :disabled="obsStore.obsData.status !== 'CONNECTED' || obsStore.obsData.gameplayInput == null"
            class="m-t-6"
            :label="$t('readColorsFromSourceScreenshotButton')"
            small
            async
            data-test="read-colors-from-source-button"
            @click="readColorsFromSourceScreenshot"
        />
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { IplButton, IplSpace, IplMessage } from '@iplsplatoon/vue-components';
import { useActiveRoundStore } from '../../store/activeRoundStore';
import { getContrastingTextColor } from '@iplsplatoon/vue-components';
import { themeColors } from '../../styles/colors';
import { addDots } from '../../../helpers/stringHelper';
import { ColorWithCategory, GetNextAndPreviousColorsResponse } from 'types/messages/activeRound';
import { sendMessage } from '../../helpers/nodecgHelper';
import { useObsStore } from '../../store/obsStore';

library.add(faChevronRight, faChevronLeft);

export default defineComponent({
    name: 'ActiveColorToggles',

    components: { IplSpace, IplButton, IplMessage, FontAwesomeIcon },

    setup() {
        const obsStore = useObsStore();
        const activeRoundStore = useActiveRoundStore();

        const activeRound = computed(() => activeRoundStore.activeRound);
        const nextColor = ref<ColorWithCategory>(null);
        const previousColor = ref<ColorWithCategory>(null);

        watch(
            () => [
                activeRoundStore.activeRound.activeColor.index,
                activeRoundStore.activeRound.activeColor.categoryName
            ],
            async () => {
                const colors: GetNextAndPreviousColorsResponse = await activeRoundStore.getNextAndPreviousColors();

                nextColor.value = colors.nextColor;
                previousColor.value = colors.previousColor;
            },
            { immediate: true });
        
        const colorTogglesDisabled = computed(() => {
            const activeColorIndex = activeRound.value.activeColor.index;
            return (nextColor.value != null && nextColor.value.index === activeColorIndex
                    && previousColor.value != null && previousColor.value.index === activeColorIndex)
                || activeRoundStore.activeRound.activeColor.isCustom;
        });

        const showMissingGameplayInputWarning = ref(false);
        watch(
            () => obsStore.obsData.gameplayInput,
            (newValue) => {
                showMissingGameplayInputWarning.value = newValue == null;
            },
            { immediate: true }
        );

        return {
            obsStore,
            showMissingGameplayInputWarning,
            activeRound,
            colorTogglesDisabled,
            getBorderColor(color?: string): string {
                if (!color) {
                    return themeColors.backgroundColorTertiary;
                }
                return getContrastingTextColor(color, 'white', themeColors.backgroundColorTertiary);
            },
            colorsSwapped: computed(() => activeRoundStore.swapColorsInternally),
            nextColor,
            previousColor,
            addDots,
            swapColors() {
                activeRoundStore.swapColors();
            },
            switchToNextColor() {
                activeRoundStore.switchToNextColor();
            },
            switchToPreviousColor() {
                activeRoundStore.switchToPreviousColor();
            },
            async readColorsFromSourceScreenshot() {
                await sendMessage('setActiveColorsFromGameplaySource');
            }
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
    height: 18px;
    padding: 2px 4px;
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
