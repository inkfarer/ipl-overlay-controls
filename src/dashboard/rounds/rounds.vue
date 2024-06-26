<template>
    <ipl-error-display class="m-b-8" />
    <ipl-sidebar v-model:is-open="openRoundSidebar">
        <ipl-space color="light">
            <iploc-button
                color="red"
                :label="$t('resetRoundsButton')"
                requires-confirmation
                data-test="reset-rounds-button"
                @click="resetRounds"
            />
        </ipl-space>
        <ipl-space
            class="layout horizontal m-t-8"
            color="light"
        >
            <div class="color-key color-key-next" /> {{ $t('roundListNextRoundColorKey') }}
        </ipl-space>
        <ipl-space
            v-for="(round, key) in rounds"
            :key="`round_${key}`"
            :color="selectedRoundId === key ? 'blue' : 'light'"
            class="m-t-8 round-option"
            :class="{
                'is-next-round': nextRoundId === key
            }"
            clickable
            :data-test="`round-option-${key}`"
            @click="selectRound(key)"
        >
            {{ round.meta.name }}
        </ipl-space>
    </ipl-sidebar>

    <ipl-expanding-space :title="$t('createRound.sectionTitle')">
        <div class="layout horizontal">
            <ipl-button
                :label="$t('createRound.create3GameRoundButton')"
                color="green"
                data-test="new-3-game-round"
                @click="createRound(3)"
            />
            <ipl-button
                :label="$t('createRound.create5GameRoundButton')"
                color="green"
                class="m-l-6"
                data-test="new-5-game-round"
                @click="createRound(5)"
            />
        </div>
        <ipl-button
            :label="$t('createRound.create7GameRoundButton')"
            color="green"
            class="m-t-6"
            data-test="new-7-game-round"
            @click="createRound(7)"
        />
    </ipl-expanding-space>

    <ipl-space
        class="layout horizontal center-vertical round-menu-space m-t-8"
        data-test="open-all-rounds-sidebar"
        clickable
        @click="openRoundSidebar = true"
    >
        <font-awesome-icon
            icon="bars"
            class="large-icon m-r-8"
        />
        {{ $t('showAllRoundsButton') }}
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
import { computed, defineComponent, Ref, ref, watch } from 'vue';
import {
    IplButton,
    IplSpace,
    IplSidebar,
    IplExpandingSpace
} from '@iplsplatoon/vue-components';
import { useTournamentDataStore } from '../store/tournamentDataStore';
import { RoundStore } from 'schemas';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import RoundEditor from './components/roundEditor.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useNextRoundStore } from '../store/nextRoundStore';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';
import { PlayType } from 'types/enums/playType';
import IplocButton from '../components/IplocButton.vue';

library.add(faBars);

export default defineComponent({
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'Rounds',

    components: {
        IplErrorDisplay,
        IplExpandingSpace,
        IplSidebar,
        RoundEditor,
        IplButton,
        IplSpace,
        FontAwesomeIcon,
        IplocButton
    },

    setup() {
        const store = useTournamentDataStore();
        const nextRoundStore = useNextRoundStore();
        const rounds: Ref<RoundStore> = ref({});
        const selectedRoundId = ref(Object.keys(store.roundStore)[0]);
        const openRoundSidebar = ref(false);
        const newRound = ref({});
        const creatingNewRound = ref(false);

        watch(() => store.roundStore, (newValue: RoundStore, oldValue: RoundStore) => {
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
            selectedRound: computed(() => store.roundStore[selectedRoundId.value]),
            resetRounds() {
                store.resetRoundStore();
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
                        name: 'New Round',
                        type: PlayType.BEST_OF
                    },
                    games: Array(gameCount).fill({ mode: 'Unknown Mode', stage: 'Unknown Stage' })
                };
                creatingNewRound.value = true;
            },
            creatingNewRound,
            newRound,
            nextRoundId: computed(() => nextRoundStore.nextRound.round.id)
        };
    }
});
</script>

<style lang="scss" scoped>
@import './src/dashboard/styles/colors';
@import './src/dashboard/styles/constants';

.top-bar-button {
    padding: 10px 20px;
    width: max-content;
}

.color-key {
    height: 18px;
    width: 18px;
    border-radius: $border-radius-inner;
    margin: 0 8px;

    &:first-child {
        margin-left: 0;
    }

    &.color-key-next {
        background-color: $yellow;
    }
}

.round-option {
    position: relative;
    overflow-wrap: anywhere;

    &.is-next-round {
        padding-right: 16px;

        &:after {
            border-radius: 0 $border-radius-outer $border-radius-outer 0;
            content: '';
            position: absolute;
            width: calc(100% - 8px);
            height: 100%;
            left: 0;
            top: 0;
            border-right: 8px solid $yellow;
        }
    }
}
</style>
