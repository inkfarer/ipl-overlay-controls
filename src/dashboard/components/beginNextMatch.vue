<template>
    <div>
        <ipl-input
            v-model="matchName"
            name="matchName"
            label="Match Name"
            :validator="validators.matchName"
        />
        <ipl-button
            label="Begin next match"
            color="red"
            class="m-t-8"
            requires-confirmation
            data-test="begin-next-match-button"
            :disabled="!allValid"
            @click="beginNextMatch"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import { IplButton, IplInput } from '@iplsplatoon/vue-components';
import { useNextRoundStore } from '../store/nextRoundStore';
import { allValid, validator } from '../helpers/validation/validator';
import { notBlank } from '../helpers/validation/stringValidators';
import { computed, ref, watchEffect } from 'vue';
import { useTournamentDataStore } from '../store/tournamentDataStore';
import { generateMatchNameForRound } from '../../helpers/nextRound';

export default defineComponent({
    name: 'BeginNextMatch',

    components: { IplInput, IplButton },

    props: {
        roundName: {
            type: String,
            required: true
        }
    },

    setup(props) {
        const nextRoundStore = useNextRoundStore();
        const tournamentDataStore = useTournamentDataStore();
        const matchName = ref('');

        const validators = {
            matchName: validator(matchName, false, notBlank)
        };

        watchEffect(() => {
            matchName.value = generateMatchNameForRound(tournamentDataStore.state.matchStore, props.roundName);
        });

        return {
            validators,
            matchName,
            allValid: computed(() => allValid(validators)),
            beginNextMatch() {
                nextRoundStore.dispatch('beginNextMatch', { matchName: matchName.value });
            }
        };
    }
});
</script>
