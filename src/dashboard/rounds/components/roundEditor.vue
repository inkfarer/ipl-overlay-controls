<template>
    <ipl-space>
        <ipl-input
            v-model="roundInternal.meta.name"
            label="Name"
            name="round-name"
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
                @click="handleUpdate"
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
import IplInput from '../../components/iplInput.vue';
import { useTournamentDataStore } from '../../store/tournamentDataStore';
import IplButton from '../../components/iplButton.vue';
import { splatModes, splatStages } from '../../../helpers/splatoonData';
import IplSelect from '../../components/iplSelect.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import IplSpace from '../../components/iplSpace.vue';
import cloneDeep from 'lodash/cloneDeep';

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
        const roundInternal: Ref<Round> = ref(null);

        watch(() => props.round, (newValue, oldValue) => {
            roundInternal.value = {
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
            roundInternal,
            stages: splatStages.map(stage => ({ value: stage, name: stage })),
            modes: splatModes.map(mode => ({ value: mode, name: mode })),
            async handleUpdate() {
                const result = await store.dispatch('updateRound', {
                    ...!props.isNewRound && { id: props.roundId },
                    roundName: roundInternal.value.meta.name,
                    games: roundInternal.value.games.map(game => ({ mode: game.mode, stage: game.stage }))
                });

                if (props.isNewRound) {
                    emit('createNewRound', result.id);
                }
            },
            handleDelete() {
                if (props.isNewRound) {
                    emit('cancelNewRound');
                } else {
                    store.commit('removeRound', { roundId: props.roundId });
                }
            },
            isChanged: computed(() => {
                return props.round.meta.name !== roundInternal.value?.meta.name
                    || props.round.games.some((game, index) => {
                        const internalGame = roundInternal.value?.games[index];
                        return game.mode !== internalGame.mode || game.stage !== internalGame.stage;
                    });
            })
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
