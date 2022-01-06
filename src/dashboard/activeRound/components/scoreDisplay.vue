<template>
    <ipl-space class="layout horizontal center-horizontal center-vertical">
        <ipl-space
            color="light"
            class="layout horizontal score-display-space"
        >
            <div class="layout vertical">
                <ipl-button
                    icon="plus"
                    color="green"
                    small
                    :disabled="disableAddScore"
                    data-test="team-a-plus-btn"
                    @click="setWinner(GameWinner.ALPHA)"
                />
                <ipl-button
                    class="m-t-4"
                    icon="minus"
                    color="red"
                    small
                    data-test="team-a-minus-btn"
                    :disabled="lastWinner === GameWinner.BRAVO || lastWinner == null"
                    @click="removeWinner"
                />
            </div>
            <div class="layout horizontal center-horizontal center-vertical score-wrapper left">
                <span class="score">{{ teamAScore }}</span>
            </div>
        </ipl-space>
        <span class="score-separator">:</span>
        <ipl-space
            color="light"
            class="layout horizontal score-display-space"
        >
            <div class="layout horizontal center-horizontal center-vertical score-wrapper right">
                <span class="score">{{ teamBScore }}</span>
            </div>
            <div class="layout vertical">
                <ipl-button
                    icon="plus"
                    color="green"
                    small
                    :disabled="disableAddScore"
                    data-test="team-b-plus-btn"
                    @click="setWinner(GameWinner.BRAVO)"
                />
                <ipl-button
                    class="m-t-4"
                    icon="minus"
                    color="red"
                    small
                    :disabled="lastWinner === GameWinner.ALPHA || lastWinner == null"
                    data-test="team-b-minus-btn"
                    @click="removeWinner"
                />
            </div>
        </ipl-space>
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { IplButton, IplSpace } from '@iplsplatoon/vue-components';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faMinus } from '@fortawesome/free-solid-svg-icons/faMinus';
import { useActiveRoundStore } from '../../store/activeRoundStore';
import { GameWinner } from 'types/enums/gameWinner';
import last from 'lodash/last';

library.add(faPlus, faMinus);

export default defineComponent({
    name: 'ScoreDisplay',

    components: { IplButton, IplSpace },

    setup() {
        const store = useActiveRoundStore();

        return {
            teamAScore: computed(() => store.state.activeRound.teamA.score),
            teamBScore: computed(() => store.state.activeRound.teamB.score),
            GameWinner,
            setWinner(winner: GameWinner) {
                store.dispatch('setWinner', { winner });
            },
            removeWinner() {
                store.dispatch('removeWinner');
            },
            disableAddScore: computed(() => {
                const activeRound = store.state.activeRound;
                return activeRound.teamA.score + activeRound.teamB.score >= activeRound.games.length;
            }),
            lastWinner: computed(() =>
                last(store.state.activeRound.games.filter(game => game.winner !== GameWinner.NO_WINNER))?.winner)
        };
    }
});
</script>

<style lang="scss" scoped>
.score-wrapper {
    width: 60px;
    font-size: 3.25em;
    font-weight: 500;

    &.right {
        margin-right: 4px;
    }

    &.left {
        margin-left: 4px;
    }

    span {
        user-select: none;
    }
}

.ipl-space.score-display-space {
    padding: 4px;
}

.score-separator {
    font-size: 2.75em;
    margin: -5px 6px 0;
    font-weight: 900;
    user-select: none;
}
</style>
