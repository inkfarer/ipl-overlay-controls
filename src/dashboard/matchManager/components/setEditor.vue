<template>
    <ipl-expanding-space>
        <template #title>
            Edit match
            <template v-if="!!nextGame">
                <span class="badge badge-blue m-l-6">Next up</span>
                <span class="text-small">
                    {{ settingsStore.translatedModeName(nextGame.mode) }}
                    on
                    {{ settingsStore.translatedStageName(nextGame.stage) }}
                </span>
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
            <stage-select
                v-show="!editColorsEnabled"
                v-model="game.stage"
                data-test="stage-select"
                class="m-l-6 max-width"
            />
            <mode-select
                v-show="!editColorsEnabled"
                v-model="game.mode"
                data-test="mode-select"
                class="m-l-6 max-width"
            />
            <!-- eslint-disable max-len -->
            <ipl-select
                v-show="editColorsEnabled && !(game.color?.isCustom ?? activeColor.isCustom)"
                :model-value="`${game.color?.categoryName ?? activeColor.categoryKey}_${game.color?.colorKey ?? activeColor.colorKey}`"
                :option-groups="colors"
                class="m-l-6"
                :disabled="game.winner === GameWinner.NO_WINNER"
                data-test="color-select"
                @update:model-value="setGameColor(index, $event)"
            />
            <!-- eslint-enable max-len -->
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
                    @update:model-value="setCustomColor('a', index, $event)"
                />
                <ipl-input
                    :model-value="game.color?.clrB ?? activeColor.clrB"
                    type="color"
                    class="m-l-8 max-width custom-color-select"
                    style="flex-grow: 1"
                    name="team-b-color"
                    :disabled="!game.color?.clrB"
                    data-test="custom-color-select-b"
                    @update:model-value="setCustomColor('b', index, $event)"
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
                    @update:model-value="setIsCustomColor(index, $event)"
                />
                <ipl-checkbox
                    :model-value="game.color?.colorsSwapped ?? swapColorsInternally"
                    :disabled="!game.color"
                    label="Swap colors"
                    class="m-l-6"
                    small
                    data-test="swap-colors-toggle"
                    @update:model-value="setColorsSwapped(index, $event)"
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
                        borderColor: getColorA(game),
                        borderWidth: `0 0 0 ${game.winner === GameWinner.ALPHA ? '8px' : '0px'}`
                    }"
                    :disabled="game.winner === GameWinner.ALPHA"
                    data-test="set-winner-button-a"
                    @click="setWinner(index, GameWinner.ALPHA)"
                />
                <ipl-button
                    label="B"
                    :color="getColorB(game)"
                    :style="{
                        borderColor: getColorB(game),
                        borderWidth: `0 ${game.winner === GameWinner.BRAVO ? '8px' : '0px'} 0 0`
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
                :title="RIGHT_CLICK_UNDO_MESSAGE"
                @click="handleUpdate"
                @right-click="undoChanges"
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
import { computed, defineComponent, ref, watch } from 'vue';
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
import { useSettingsStore } from '../../store/settingsStore';
import { perGameData } from '../../../helpers/gameData/gameData';
import { RIGHT_CLICK_UNDO_MESSAGE } from '../../../extension/helpers/strings';
import { ActiveRoundGame } from 'types/activeRoundGame';
import StageSelect from '../../components/StageSelect.vue';
import ModeSelect from '../../components/ModeSelect.vue';

library.add(faTimes);

export default defineComponent({
    name: 'SetEditor',

    components: {
        ModeSelect,
        StageSelect,
        IplCheckbox,
        IplToggleButton,
        IplButton,
        IplSelect,
        IplExpandingSpace,
        IplInput
    },

    setup() {
        const activeRoundStore = useActiveRoundStore();
        const settingsStore = useSettingsStore();
        const gameData = computed(() => perGameData[settingsStore.runtimeConfig.gameVersion]);

        const editColorsEnabled = ref(false);

        const games = ref<ActiveRoundGame[]>(cloneDeep(activeRoundStore.activeRound.games));
        const gamesChanged = computed(() => !isEqual(games.value, activeRoundStore.activeRound.games));

        watch(() => activeRoundStore.activeRound.games, (newValue, oldValue) => {
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
            ...activeRoundStore.activeRound.activeColor,
            clrA: activeRoundStore.activeRound.teamA.color,
            clrB: activeRoundStore.activeRound.teamB.color
        }));

        const nextGameIndex = computed(() =>
            activeRoundStore.activeRound.games.findIndex(game => game.winner === GameWinner.NO_WINNER));
        const nextGame = computed(() =>
            nextGameIndex.value === -1 ? null : activeRoundStore.activeRound.games[nextGameIndex.value]);

        return {
            RIGHT_CLICK_UNDO_MESSAGE,
            games,
            GameWinner,
            gamesChanged,
            getColorA(game: { color: { clrA: string } }): string {
                return game.color?.clrA ?? activeRoundStore.activeRound.teamA.color;
            },
            getColorB(game: { color: { clrB: string } }): string {
                return game.color?.clrB ?? activeRoundStore.activeRound.teamB.color;
            },
            setWinner(index: number, winner: GameWinner): void {
                activeRoundStore.setWinnerForIndex({ index, winner });
            },
            editColorsEnabled,
            activeColor,
            colors: computed(() => gameData.value.colors.map(group => ({
                name: group.meta.name,
                options: group.colors.map(color => ({
                    name: color.title,
                    value: `${group.meta.name}_${color.index}`,
                    disabled: group.meta.key === 'customColor'
                }))
            }))),
            setGameColor(index: number, color: string): void {
                const colorParts = color.split('_');
                const category = gameData.value.colors
                    .find(group => group.meta.key === colorParts[0]);
                const colorObject = category.colors.find(color => color.key === colorParts[1]);
                const colorsSwapped = games.value[index].color?.colorsSwapped
                    ?? activeRoundStore.swapColorsInternally;

                games.value[index].color = {
                    ...(colorsSwapped ? {
                        clrA: colorObject.clrB,
                        clrB: colorObject.clrA
                    } : {
                        clrA: colorObject.clrA,
                        clrB: colorObject.clrB
                    }),
                    index: colorObject.index,
                    title: colorObject.title,
                    isCustom: colorObject.isCustom,
                    clrNeutral: colorObject.clrNeutral,
                    categoryName: category.meta.name,
                    categoryKey: category.meta.key,
                    colorKey: colorObject.key,
                    colorsSwapped
                };
            },
            setColorsSwapped(index: number, colorsSwapped: boolean): void {
                activeRoundStore.swapRoundColor({ roundIndex: index, colorsSwapped });
            },
            setIsCustomColor(index: number, isCustom: boolean): void {
                if (!games.value[index].color) return;

                games.value[index].color = {
                    ...games.value[index].color,
                    categoryName: 'Custom Color',
                    categoryKey: 'customColor',
                    title: 'Custom Color',
                    colorKey: 'customColor',
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
            swapColorsInternally: computed(() => activeRoundStore.swapColorsInternally),
            handleUpdate(): void {
                activeRoundStore.updateActiveGames(games.value);
            },
            handleReset(): void {
                activeRoundStore.resetActiveRound();
            },
            nextGame,
            nextGameIndex,
            undoChanges(event: Event) {
                event.preventDefault();

                games.value = cloneDeep(activeRoundStore.activeRound.games);
            },
            settingsStore
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
        transition-property: border-width, background-color, color;
        border-style: solid;

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
