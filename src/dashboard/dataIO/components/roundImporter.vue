<template>
    <ipl-space>
        <div class="title">Round data</div>
        <ipl-input
            v-show="!useFileUpload"
            v-model="dataUrl"
            name="round-data-url"
            label="Data URL"
            :validator="validators.dataUrl"
        />
        <ipl-upload
            v-show="useFileUpload"
            v-model="roundFile"
            data-test="round-file-upload"
        />
        <div class="layout horizontal center-horizontal">
            <ipl-checkbox
                v-model="useFileUpload"
                small
                class="m-t-8"
                label="Upload file"
                data-test="use-file-upload-checkbox"
            />
        </div>
        <ipl-button
            label="Import"
            class="m-t-8"
            async
            progress-message="Importing..."
            data-test="import-button"
            :disabled="(!useFileUpload && !allValid) || (useFileUpload && !roundFile)"
            @click="handleImport"
        />
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref } from 'vue';
import { IplButton, IplSpace, IplInput, IplCheckbox, IplUpload } from '@iplsplatoon/vue-components';
import { allValid, validator } from '../../helpers/validation/validator';
import { notBlank } from '../../helpers/validation/stringValidators';
import { useTournamentDataStore } from '../../store/tournamentDataStore';

export default defineComponent({
    name: 'RoundImporter',

    components: { IplUpload, IplButton, IplCheckbox, IplInput, IplSpace },

    setup() {
        const tournamentDataStore = useTournamentDataStore();
        const useFileUpload = ref(false);
        const roundFile: Ref<File> = ref(null);
        const dataUrl: Ref<string> = ref(null);
        const validators = {
            dataUrl: validator(dataUrl, false, notBlank)
        };

        return {
            useFileUpload,
            roundFile,
            dataUrl,
            validators,
            allValid: computed(() => allValid(validators)),
            async handleImport() {
                if (useFileUpload.value) {
                    await tournamentDataStore.dispatch('uploadRoundData', { file: roundFile.value });
                } else {
                    await tournamentDataStore.dispatch('fetchRoundData', { url: dataUrl.value });
                }
            }
        };
    }
});
</script>