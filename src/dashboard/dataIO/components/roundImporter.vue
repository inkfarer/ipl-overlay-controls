<template>
    <bordered-space label="Round data">
        <ipl-space>
            <ipl-input
                v-show="!useFileUpload"
                v-model="dataUrl"
                name="round-data-url"
                label="Data URL / maps.iplabs.ink URL"
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
    </bordered-space>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref } from 'vue';
import {
    IplButton,
    IplSpace,
    IplInput,
    IplCheckbox,
    IplUpload,
    provideValidators,
    validator,
    allValid,
    notBlank
} from '@iplsplatoon/vue-components';
import { useTournamentDataStore } from '../../store/tournamentDataStore';
import BorderedSpace from '../../components/BorderedSpace.vue';

export default defineComponent({
    name: 'RoundImporter',

    components: { BorderedSpace, IplUpload, IplButton, IplCheckbox, IplInput, IplSpace },

    setup() {
        const tournamentDataStore = useTournamentDataStore();
        const useFileUpload = ref(false);
        const roundFile: Ref<File> = ref(null);
        const dataUrl: Ref<string> = ref(null);
        const validators = {
            'round-data-url': validator(dataUrl, false, notBlank)
        };
        provideValidators(validators);

        return {
            useFileUpload,
            roundFile,
            dataUrl,
            allValid: computed(() => allValid(validators)),
            async handleImport() {
                if (useFileUpload.value) {
                    await tournamentDataStore.uploadRoundData({ file: roundFile.value });
                } else {
                    await tournamentDataStore.fetchRoundData({ url: dataUrl.value });
                }
            }
        };
    }
});
</script>
