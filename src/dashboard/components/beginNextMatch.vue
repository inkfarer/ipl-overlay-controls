<template>
    <div>
        <ipl-input
            v-model="matchName"
            name="matchName"
            label="Match Name"
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
import { defineComponent, watch, ref } from 'vue';
import { IplButton, IplInput, notBlank, provideValidators, validator } from '@iplsplatoon/vue-components';
import { useNextRoundStore } from '../store/nextRoundStore';

export default defineComponent({
    name: 'BeginNextMatch',

    components: { IplInput, IplButton },

    setup() {
        const nextRoundStore = useNextRoundStore();
        const matchName = ref('');

        const { allValid } = provideValidators({
            matchName: validator(true, notBlank)
        });

        watch(() => nextRoundStore.nextRound.name, newValue => {
            matchName.value = newValue;
        }, { immediate: true });

        return {
            matchName,
            allValid,
            beginNextMatch() {
                nextRoundStore.beginNextMatch({ matchName: matchName.value });
            }
        };
    }
});
</script>
