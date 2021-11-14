<template>
    <ipl-sidebar v-model:is-open="openRoundSidebar">
        <ipl-space color="light">
            <ipl-button
                color="red"
                label="Reset rounds"
                requires-confirmation
                data-test="reset-rounds-button"
                @click="resetRounds"
            />
        </ipl-space>
        <ipl-space
            v-for="(round, key) in rounds"
            :key="`round_${key}`"
            color="light"
            class="m-t-8 round-option"
            :class="{ selected: selectedRoundId === key }"
            :data-test="`round-option-${key}`"
            @click="selectRound(key)"
        >
            {{ round.meta.name }}
        </ipl-space>
    </ipl-sidebar>

    <ipl-expanding-space title="Create Round">
        <div class="layout horizontal">
            <ipl-button
                label="3 Games"
                color="green"
                data-test="new-3-game-round"
                @click="createRound(3)"
            />
            <ipl-button
                label="5 Games"
                color="green"
                class="m-l-6"
                data-test="new-5-game-round"
                @click="createRound(5)"
            />
        </div>
        <ipl-button
            label="7 Games"
            color="green"
            class="m-t-6"
            data-test="new-7-game-round"
            @click="createRound(7)"
        />
    </ipl-expanding-space>

    <ipl-space
        class="layout horizontal center-vertical round-menu-space m-t-8"
        data-test="open-all-rounds-sidebar"
        @click="openRoundSidebar = true"
    >
        <font-awesome-icon
            icon="bars"
            class="menu-icon"
        />
        All Rounds
    </ipl-space>
    <round-editor
        v-if="!!selectedRound"
        class="m-t-8"
        :round-id="selectedRoundId"
        :round="creatingNewRound ? newRound : selectedRound"
        :is-new-round="creatingNewRound"
        data-test="round-editor"
        @cancel-new-round="creatingNewRound = false"
        @create-new-round="selectRound"
    />
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref } from 'vue';
import IplSpace from '../components/iplSpace.vue';
import IplButton from '../components/iplButton.vue';
import { useTournamentDataStore } from '../store/tournamentDataStore';
import { RoundStore } from 'schemas';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import RoundEditor from './components/roundEditor.vue';
import IplSidebar from '../components/iplSidebar.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import IplExpandingSpace from '../components/iplExpandingSpace.vue';

library.add(faBars);

export default defineComponent({
    name: 'Rounds',

    components: { IplExpandingSpace, IplSidebar, RoundEditor, IplButton, IplSpace, FontAwesomeIcon },

    setup() {
        const store = useTournamentDataStore();
        const rounds: Ref<RoundStore> = ref({});
        const selectedRoundId = ref(Object.keys(store.state.roundStore)[0]);
        const openRoundSidebar = ref(false);
        const newRound = ref({});
        const creatingNewRound = ref(false);

        store.watch(store => store.roundStore, (newValue: RoundStore, oldValue: RoundStore) => {
            if (!newValue[selectedRoundId.value]) {
                selectedRoundId.value = Object.keys(newValue)[0];
            }

            Object.entries(newValue).forEach(([key, value]) => {
                if (!isEqual(value, oldValue?.[key])) {
                    rounds.value[key] = cloneDeep(value);
                }
            });

            Object.keys(rounds.value).forEach(key => {
                if (!newValue[key]) {
                    delete rounds.value[key];
                }
            });
        }, { immediate: true, deep: true });

        return {
            rounds,
            selectedRoundId,
            selectedRound: computed(() => store.state.roundStore[selectedRoundId.value]),
            resetRounds() {
                store.dispatch('resetRoundStore');
            },
            openRoundSidebar,
            selectRound(key: string): void {
                creatingNewRound.value = false;
                openRoundSidebar.value = false;
                selectedRoundId.value = key;
            },
            createRound(gameCount: 3 | 5 | 7): void {
                newRound.value = {
                    meta: {
                        name: 'New Round'
                    },
                    games: Array(gameCount).fill({ mode: 'Unknown Mode', stage: 'Unknown Stage' })
                };
                creatingNewRound.value = true;
            },
            creatingNewRound,
            newRound
        };
    }
});
</script>

<style lang="scss" scoped>
.top-bar-button {
    padding: 10px 20px;
    width: max-content;
}

.round-option {
    user-select: none;
    cursor: pointer;
    transition-duration: 100ms;

    &.selected {
        background-color: #6155BD;
    }
}

.menu-icon {
    font-size: 1.25em;
    margin-right: 8px;
}

.round-menu-space {
    user-select: none;
    cursor: pointer;
    font-weight: 500;
}
</style>