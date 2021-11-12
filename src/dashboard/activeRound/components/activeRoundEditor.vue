<template>
    <div>
        <ipl-message
            v-if="isChanged && roundHasProgress"
            type="info"
            data-test="round-progress-message"
        >
            {{ selectedRound.meta.isCompleted
                ? `'${selectedRound.meta.name}' is already completed.`
                : `'${selectedRound.meta.name}' already has saved progress.` }}
            {{ `(${selectedRound.teamA.name} vs ${selectedRound.teamB.name})` }}
        </ipl-message>
        <ipl-space>
            <div class="layout horizontal">
                <div class="layout vertical center-horizontal max-width">
                    <ipl-select
                        v-model="teamAId"
                        label="Team A"
                        data-test="team-a-selector"
                        :options="teams"
                    />
                    <ipl-checkbox
                        v-model="teamAImageShown"
                        class="m-t-6"
                        label="Show image"
                        data-test="team-a-image-toggle"
                        small
                    />
                    <div
                        class="color-display m-t-6"
                        :style="{ backgroundColor: activeRound.teamA.color }"
                        data-test="team-a-color-display"
                    />
                </div>
                <div class="layout vertical center-horizontal max-width m-l-8">
                    <ipl-select
                        v-model="teamBId"
                        label="Team B"
                        data-test="team-b-selector"
                        :options="teams"
                    />
                    <ipl-checkbox
                        v-model="teamBImageShown"
                        class="m-t-6"
                        label="Show image"
                        data-test="team-b-image-toggle"
                        small
                    />
                    <div
                        class="color-display m-t-6"
                        :style="{ backgroundColor: activeRound.teamB.color }"
                        data-test="team-b-color-display"
                    />
                </div>
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
            <ipl-select
                v-model="roundId"
                class="m-t-6"
                :options="rounds"
                data-test="round-selector"
                label="Round"
            />
            <ipl-button
                class="m-t-8"
                label="Update"
                :color="isChanged ? 'red' : 'blue'"
                data-test="update-round-button"
                @click="updateRound"
            />
        </ipl-space>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import IplSpace from '../../components/iplSpace.vue';
import IplSelect from '../../components/iplSelect.vue';
import IplCheckbox from '../../components/iplCheckbox.vue';
import { useTournamentDataStore } from '../../store/tournamentDataStore';
import { addDots } from '../../helpers/stringHelper';
import { useActiveRoundStore } from '../../store/activeRoundStore';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import IplButton from '../../components/iplButton.vue';
import { colors } from '../../../helpers/splatoonData';
import { ColorInfo } from 'types/colors';
import { getContrastingTextColor } from '../../helpers/colorHelper';
import IplMessage from '../../components/iplMessage.vue';

library.add(faChevronRight, faChevronLeft);

export default defineComponent({
    name: 'ActiveRoundEditor',

    components: { IplMessage, IplButton, IplCheckbox, IplSelect, IplSpace, FontAwesomeIcon },

    setup() {
        const tournamentDataStore = useTournamentDataStore();
        const activeRoundStore = useActiveRoundStore();

        const activeRound = computed(() => activeRoundStore.state.activeRound);

        const teamAId = ref('');
        const teamBId = ref('');
        const roundId = ref('');

        const selectedRound = computed(() => tournamentDataStore.state.roundStore[roundId.value]);
        const roundHasProgress = computed(() => selectedRound.value.teamA?.score > 0
            || selectedRound.value.teamB?.score > 0);

        watch(selectedRound, newValue => {
            if (roundHasProgress.value) {
                teamAId.value = newValue.teamA.id;
                teamBId.value = newValue.teamB.id;
            } else {
                teamAId.value = activeRoundStore.state.activeRound.teamA.id;
                teamBId.value = activeRoundStore.state.activeRound.teamB.id;
            }
        });

        const isChanged = computed(() =>
            teamAId.value !== activeRoundStore.state.activeRound.teamA.id
            || teamBId.value !== activeRoundStore.state.activeRound.teamB.id
            || roundId.value !== activeRoundStore.state.activeRound.round.id);

        activeRoundStore.watch(
            store => store.activeRound.teamA.id,
            newValue => teamAId.value = newValue,
            { immediate: true });
        activeRoundStore.watch(
            store => store.activeRound.teamB.id,
            newValue => teamBId.value = newValue,
            { immediate: true });
        activeRoundStore.watch(
            store => store.activeRound.round.id,
            newValue => roundId.value = newValue,
            { immediate: true });

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
            teams: computed(() => tournamentDataStore.state.tournamentData.teams.map(team => ({
                value: team.id,
                name: addDots(team.name)
            }))),
            teamAId,
            teamBId,
            roundId,
            activeRound,
            teamAImageShown: computed({
                get() {
                    return activeRoundStore.state.activeRound.teamA.showLogo;
                },
                set(value: boolean) {
                    tournamentDataStore.commit('setTeamImageHidden',
                        { teamId: activeRoundStore.state.activeRound.teamA.id, isVisible: value });
                }
            }),
            teamBImageShown: computed({
                get() {
                    return activeRoundStore.state.activeRound.teamB.showLogo;
                },
                set(value: boolean) {
                    tournamentDataStore.commit('setTeamImageHidden',
                        { teamId: activeRoundStore.state.activeRound.teamB.id, isVisible: value });
                }
            }),
            nextColor,
            previousColor,
            getBorderColor(color: string): string {
                return getContrastingTextColor(color, 'white', '#181E29');
            },
            setActiveColor(color: ColorInfo) {
                if (colorTogglesDisabled.value) return;

                activeRoundStore.dispatch('setActiveColor', {
                    color,
                    categoryName: selectedColorGroup.value.meta.name
                });
            },
            colorTogglesDisabled,
            swapColors() {
                activeRoundStore.dispatch('swapColors');
            },
            rounds: computed(() => Object.entries(tournamentDataStore.state.roundStore).map(([ key, value ]) => ({
                value: key,
                name: value.meta.name
            }))),
            isChanged,
            updateRound() {
                activeRoundStore.commit('setActiveRound', {
                    roundId: roundId.value,
                    teamAId: teamAId.value,
                    teamBId: teamBId.value
                });
            },
            selectedRound,
            roundHasProgress
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
