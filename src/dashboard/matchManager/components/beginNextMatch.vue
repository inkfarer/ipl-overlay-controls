<template>
    <div>
        <ipl-input
            v-model="matchName"
            name="matchName"
            :label="$t('nextMatchStarter.matchNameInput')"
        />
        <iploc-button
            :label="$t('nextMatchStarter.beginNextMatchButton')"
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
import { IplInput, provideValidators, validator } from '@iplsplatoon/vue-components';
import { useNextRoundStore } from '../../store/nextRoundStore';
import { notBlank } from '../../helpers/validators/stringValidators';
import IplocButton from '../../components/IplocButton.vue';

export default defineComponent({
    name: 'BeginNextMatch',

    components: { IplInput, IplocButton },

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
