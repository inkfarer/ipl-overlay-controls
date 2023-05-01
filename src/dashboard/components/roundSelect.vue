<template>
    <div>
        <ipl-select
            v-model="value"
            label="Round"
            :options="roundOptions"
            data-test="round-selector"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IplSelect } from '@iplsplatoon/vue-components';
import { useTournamentDataStore } from '../store/tournamentDataStore';
import { computed, PropType } from 'vue';
import { Round } from 'schemas';

export type RoundSelectRound = {
    id: string,
    roundData: Round
}

export default defineComponent({
    name: 'RoundSelect',

    components: { IplSelect },

    props: {
        modelValue: {
            type: [String, null] as PropType<string | null>,
            required: true
        }
    },

    emits: ['update:modelValue', 'update:roundData'],

    setup(props, { emit }) {
        const tournamentDataStore = useTournamentDataStore();

        function emitRoundData(roundId: string) {
            emit('update:roundData', {
                id: roundId,
                roundData: tournamentDataStore.roundStore[roundId]
            });
        }

        emitRoundData(props.modelValue);

        const value = computed({
            get() {
                return props.modelValue;
            },
            set(value: string) {
                emit('update:modelValue', value);
                emitRoundData(value);
            }
        });

        return {
            value,
            roundOptions: computed(() => Object.entries(tournamentDataStore.roundStore).map(([key, value]) =>
                ({ value: key, name: value.meta.name })))
        };
    }
});
</script>
