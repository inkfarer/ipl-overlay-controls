<template>
    <ipl-space>
        <ipl-input
            v-model="roundInternal.meta.name"
            label="Name"
            name="round-name"
        />
        <ipl-select
            v-model="roundInternal.meta.type"
            name="round-type"
            label="Type"
            class="m-t-6"
            :options="typeOptions"
        />
        <template
            v-for="(game, index) in roundInternal.games"
            :key="`game-editor-${index}`"
        >
            <div class="separator">
                <span>{{ index + 1 }}</span>
            </div>
            <ipl-select
                v-model="game.mode"
                :options="modes"
                :data-test="`mode-selector-${index}`"
            />
            <ipl-select
                v-model="game.stage"
                class="m-t-8"
                :options="stages"
                :data-test="`stage-selector-${index}`"
            />
        </template>
        <div class="layout horizontal m-t-8">
            <ipl-button
                :label="isNewRound ? 'Save' : 'Update'"
                :color="isNewRound ? 'green' : isChanged ? 'red' : 'blue'"
                data-test="update-button"
                :title="isNewRound ? undefined : RIGHT_CLICK_UNDO_MESSAGE"
                @click="handleUpdate"
                @right-click="undoChanges"
            />
            <ipl-button
                icon="times"
                class="m-l-6"
                color="red"
                data-test="remove-button"
                @click="handleDelete"
            />
        </div>
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, Ref, watch } from 'vue';
import type { Round } from 'schemas';
import { useTournamentDataStore } from '../../store/tournamentDataStore';
import { IplButton, IplInput, IplSelect, IplSpace } from '@iplsplatoon/vue-components';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import cloneDeep from 'lodash/cloneDeep';
import { PlayType } from 'types/enums/playType';
import { useSettingsStore } from '../../settings/settingsStore';
import { perGameData } from '../../../helpers/gameData/gameData';
import { RIGHT_CLICK_UNDO_MESSAGE } from '../../../extension/helpers/strings';
import { PlayTypeHelper } from '../../../helpers/enums/playTypeHelper';

library.add(faTimes);

export default defineComponent({
    name: 'RoundEditor',

    components: { IplSpace, IplSelect, IplButton, IplInput },

    props: {
        round: {
            type: Object as PropType<Round>,
            required: true
        },
        roundId: {
            type: String,
            required: true
        },
        isNewRound: {
            type: Boolean,
            required: true
        }
    },

    emits: ['cancelNewRound', 'createNewRound'],

    setup(props, { emit }) {
        const store = useTournamentDataStore();
        const settingsStore = useSettingsStore();
        const gameData = computed(() => perGameData[settingsStore.state.runtimeConfig.gameVersion]);
        const roundInternal: Ref<Round> = ref(null);

        watch(() => props.round, (newValue, oldValue) => {
            roundInternal.value = {
                ...newValue,
                meta: cloneDeep(newValue.meta),
                games: newValue.games.map((game, index) => {
                    const oldGame = oldValue?.games[index];
                    const result = {
                        ...roundInternal.value?.games?.[index]
                    };

                    if (oldGame?.mode !== game.mode) result.mode = game.mode;
                    if (oldGame?.stage !== game.stage) result.stage = game.stage;

                    return result;
                })
            };
        }, { immediate: true });

        return {
            RIGHT_CLICK_UNDO_MESSAGE,
            roundInternal,
            stages: computed(() => gameData.value.stages.map(stage => ({ value: stage, name: stage }))),
            modes: computed(() => gameData.value.modes.map(stage => ({ value: stage, name: stage }))),
            async handleUpdate() {
                const updates = {
                    roundName: roundInternal.value.meta.name,
                    type: roundInternal.value.meta.type,
                    games: roundInternal.value.games.map(game => ({ mode: game.mode, stage: game.stage }))
                };

                if (props.isNewRound) {
                    const result = await store.insertRound(updates);

                    if (props.isNewRound) {
                        emit('createNewRound', result.id);
                    }
                } else {
                    await store.updateRound({
                        id: props.roundId,
                        ...updates
                    });
                }
            },
            handleDelete() {
                if (props.isNewRound) {
                    emit('cancelNewRound');
                } else {
                    return store.removeRound({ roundId: props.roundId });
                }
            },
            isChanged: computed(() => {
                return props.round.meta.name !== roundInternal.value?.meta.name
                    || props.round.meta.type !== roundInternal.value?.meta.type
                    || props.round.games.some((game, index) => {
                        const internalGame = roundInternal.value?.games[index];
                        return game.mode !== internalGame.mode || game.stage !== internalGame.stage;
                    });
            }),
            typeOptions: computed(() => {
                return Object.values(PlayType).map(type => ({
                    value: type,
                    name: PlayTypeHelper.toPrettyString(type, roundInternal.value.games.length)
                }));
            }),
            undoChanges(event: Event) {
                if (props.isNewRound) return;
                event.preventDefault();

                roundInternal.value = cloneDeep(props.round);
            }
        };
    }
});
</script>

<style lang="scss" scoped>
@import './src/dashboard/styles/colors';

.separator {
    width: 100%;
    text-align: center;
    border-bottom: 1px solid $text-color;
    color: $text-color;
    line-height: 0.1em;
    margin: 14px 0 10px;
    user-select: none;
}

.separator span {
    background: $background-primary;
    padding: 0 10px;
}
</style>
