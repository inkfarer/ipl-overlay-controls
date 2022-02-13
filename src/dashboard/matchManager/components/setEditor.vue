<template>
    <ipl-expanding-space>
        <template #title>
            Edit match
            <template v-if="!!nextGame">
                <span class="badge badge-blue m-l-6">Next up</span>
                <span class="text-small">{{ nextGame.mode }} on {{ nextGame.stage }}</span>
            </template>
        </template>
        <div
            v-for="(game, index) in games"
            :key="`set-editor-${index}`"
            :data-test="`set-editor-${index}`"
            class="layout horizontal center-vertical game-editor"
            :class="{ 'is-next-game': index === nextGameIndex }"
        >
            <span class="set-number">{{ index + 1 }}</span>
            <ipl-select
                v-show="!editColorsEnabled"
                v-model="game.stage"
                :options="stages"
                data-test="stage-select"
                class="m-l-6"
            />
            <ipl-select
                v-show="!editColorsEnabled"
                v-model="game.mode"
                :options="modes"
                data-test="mode-select"
                class="m-l-6"
            />
            <ipl-select
                v-show="editColorsEnabled && !(game.color?.isCustom ?? activeColor.isCustom)"
                :model-value="
                    `${game.color?.categoryName ?? activeColor.categoryName}_${game.color?.index ?? activeColor.index}`"
                :option-groups="colors"
                class="m-l-6"
                :disabled="game.winner === GameWinner.NO_WINNER"
                data-test="color-select"
                @update:modelValue="setGameColor(index, $event)"
            />
            <div
                v-show="editColorsEnabled && (game.color?.isCustom ?? activeColor.isCustom)"
                class="layout horizontal max-width m-l-6"
            >
                <ipl-input
                    :model-value="game.color?.clrA ?? activeColor.clrA"
                    type="color"
                    class="max-width custom-color-select"
                    style="flex-grow: 1"
                    name="team-a-color"
                    :disabled="!game.color?.clrA"
                    data-test="custom-color-select-a"
                    @update:modelValue="setCustomColor('a', index, $event)"
                />
                <ipl-input
                    :model-value="game.color?.clrB ?? activeColor.clrB"
                    type="color"
                    class="m-l-8 max-width custom-color-select"
                    style="flex-grow: 1"
                    name="team-b-color"
                    :disabled="!game.color?.clrB"
                    data-test="custom-color-select-b"
                    @update:modelValue="setCustomColor('b', index, $event)"
                />
            </div>
            <div
                v-show="editColorsEnabled"
                class="color-editor-toggles layout horizontal"
            >
                <ipl-checkbox
                    :model-value="game.color?.isCustom ?? activeColor.isCustom"
                    :disabled="!game.color"
                    label="Custom color"
                    small
                    data-test="custom-color-toggle"
                    @update:modelValue="setIsCustomColor(index, $event)"
                />
                <ipl-checkbox
                    :model-value="game.color?.colorsSwapped ?? swapColorsInternally"
                    :disabled="!game.color"
                    label="Swap colors"
                    class="m-l-6"
                    small
                    data-test="swap-colors-toggle"
                    @update:modelValue="setColorsSwapped(index, $event)"
                />
            </div>
            <ipl-button
                icon="times"
                color="red"
                class="m-l-6 no-winner-button"
                :disabled="game.winner === GameWinner.NO_WINNER"
                data-test="set-winner-button-none"
                @click="setWinner(index, GameWinner.NO_WINNER)"
            />
            <div class="winner-selection m-l-6 layout horizontal">
                <ipl-button
                    label="A"
                    :color="getColorA(game)"
                    :style="{
                        borderLeft: `${game.winner === GameWinner.ALPHA ? '8px' : '0px'} solid ${getColorA(game)}`
                    }"
                    :disabled="game.winner === GameWinner.ALPHA"
                    data-test="set-winner-button-a"
                    @click="setWinner(index, GameWinner.ALPHA)"
                />
                <ipl-button
                    label="B"
                    :color="getColorB(game)"
                    :style="{
                        borderRight: `${game.winner === GameWinner.BRAVO ? '8px' : '0px'} solid ${getColorB(game)}`
                    }"
                    :disabled="game.winner === GameWinner.BRAVO"
                    data-test="set-winner-button-b"
                    @click="setWinner(index, GameWinner.BRAVO)"
                />
            </div>
        </div>
        <div class="layout horizontal m-t-8">
            <ipl-button
                label="Update"
                :color="gamesChanged ? 'red' : 'blue'"
                data-test="update-button"
                @click="handleUpdate"
            />
            <ipl-button
                label="Reset"
                color="red"
                class="m-l-6"
                requires-confirmation
                data-test="reset-button"
                @click="handleReset"
            />
            <ipl-toggle-button
                v-model="editColorsEnabled"
                label="Edit colors"
                class="m-l-6"
                data-test="edit-colors-toggle"
            />
        </div>
    </ipl-expanding-space>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useActiveRoundStore } from '../../store/activeRoundStore';
import {
    IplButton,
    IplCheckbox,
    IplExpandingSpace,
    IplInput,
    IplSelect,
    IplToggleButton
} from '@iplsplatoon/vue-components';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { GameWinner } from 'types/enums/gameWinner';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import { useSettingsStore } from '../../settings/settingsStore';
import { perGameData } from '../../../helpers/gameData/gameData';

library.add(faTimes);

export default defineComponent({
    name: 'SetEditor',

    components: { IplCheckbox, IplToggleButton, IplButton, IplSelect, IplExpandingSpace, IplInput },

    setup() {
        const activeRoundStore = useActiveRoundStore();
        const settingsStore = useSettingsStore();
        const gameData = computed(() => perGameData[settingsStore.state.runtimeConfig.gameVersion]);

        const editColorsEnabled = ref(false);

        const games = ref(cloneDeep(activeRoundStore.state.activeRound.games));
        const gamesChanged = computed(() => !isEqual(games.value, activeRoundStore.state.activeRound.games));

        activeRoundStore.watch(state => state.activeRound.games, (newValue, oldValue) => {
            games.value = cloneDeep(newValue).map((game, index) => {
                const oldGame = oldValue[index];

                const result = {
                    ...games.value[index],
                    winner: game.winner,
                };

                if (!isEqual(game.color, oldGame?.color)) result.color = game.color;
                if (!isEqual(game.stage, oldGame?.stage)) result.stage = game.stage;
                if (!isEqual(game.mode, oldGame?.mode)) result.mode = game.mode;

                if (!result.color) {
                    delete result.color;
                }

                return result;
            });
        });

        const activeColor = computed(() => ({
            ...activeRoundStore.state.activeRound.activeColor,
            clrA: activeRoundStore.state.activeRound.teamA.color,
            clrB: activeRoundStore.state.activeRound.teamB.color
        }));

        const nextGameIndex = computed(() =>
            activeRoundStore.state.activeRound.games.findIndex(game => game.winner === GameWinner.NO_WINNER));
        const nextGame = computed(() =>
            nextGameIndex.value === -1 ? null : activeRoundStore.state.activeRound.games[nextGameIndex.value]);

        return {
            games,
            stages: computed(() => gameData.value.stages.map(stage => ({ value: stage, name: stage }))),
            modes: computed(() => gameData.value.modes.map(stage => ({ value: stage, name: stage }))),
            GameWinner,
            gamesChanged,
            getColorA(game: { color: { clrA: string } }): string {
                return game.color?.clrA ?? activeRoundStore.state.activeRound.teamA.color;
            },
            getColorB(game: { color: { clrB: string } }): string {
                return game.color?.clrB ?? activeRoundStore.state.activeRound.teamB.color;
            },
            setWinner(index: number, winner: GameWinner): void {
                activeRoundStore.dispatch('setWinnerForIndex', { index, winner });
            },
            editColorsEnabled,
            activeColor,
            colors: computed(() => gameData.value.colors.map(group => ({
                name: group.meta.name,
                options: group.colors.map(color => ({
                    name: color.title,
                    value: `${group.meta.name}_${color.index}`,
                    disabled: group.meta.name === 'Custom Color'
                }))
            }))),
            setGameColor(index: number, color: string): void {
                const colorParts = color.split('_');
                const colorIndex = parseInt(colorParts[1]);
                const colorObject = gameData.value.colors
                    .find(group => group.meta.name === colorParts[0])
                    .colors[colorIndex];
                const colorsSwapped = games.value[index].color?.colorsSwapped
                    ?? activeRoundStore.state.swapColorsInternally;

                games.value[index].color = {
                    ...colorObject,
                    ...colorsSwapped && {
                        clrA: colorObject.clrB,
                        clrB: colorObject.clrA
                    },
                    categoryName: colorParts[0],
                    colorsSwapped
                };
            },
            setColorsSwapped(index: number, colorsSwapped: boolean): void {
                activeRoundStore.dispatch('swapRoundColor', { roundIndex: index, colorsSwapped });
            },
            setIsCustomColor(index: number, isCustom: boolean): void {
                if (!games.value[index].color) return;

                games.value[index].color = {
                    ...games.value[index].color,
                    categoryName: 'Custom Color',
                    title: 'Custom Color',
                    index: 0,
                    isCustom
                };
            },
            setCustomColor(team: 'a' | 'b', index: number, color: string): void {
                if (!games.value[index].color) return;

                if (team === 'a') {
                    games.value[index].color.clrA = color;
                } else if (team === 'b') {
                    games.value[index].color.clrB = color;
                }
            },
            swapColorsInternally: computed(() => activeRoundStore.state.swapColorsInternally),
            handleUpdate(): void {
                activeRoundStore.dispatch('updateActiveGames', games.value);
            },
            handleReset(): void {
                activeRoundStore.dispatch('resetActiveRound');
            },
            nextGame,
            nextGameIndex
        };
    }
});
</script>

<style lang="scss" scoped>
@import './src/dashboard/styles/constants';
@import './src/dashboard/styles/colors';

.no-winner-button {
    height: 32px !important;
    padding-top: 3px !important;
    transition-duration: $transition-duration-med;
}

.set-number {
    user-select: none;
}

.color-editor-toggles {
    width: 75%;
    margin-left: 10px;
}

.winner-selection {
    min-width: 88px;

    .ipl-button {
        min-width: 40px;
        height: 32px;
        font-size: 1.5em;
        font-weight: bold;
        padding: 3px 0 0;
        transition-duration: $transition-duration-med;

        &:first-child {
            border-radius: $border-radius-inner 0 0 $border-radius-inner;
        }

        &:last-child {
            border-radius: 0 $border-radius-inner $border-radius-inner 0;
        }
    }
}

.game-editor {
    border-radius: $border-radius-inner;
    transition-duration: $transition-duration-med;
    padding: 2px 6px;

    &.is-next-game {
        background-color: $background-secondary;
        padding: 4px 6px;
    }
}
</style>

<style lang="scss">
.custom-color-select input {
    margin: 0;
    height: 34px !important;
}
</style>
