<template>
    <bordered-space :label="$t('roundImporter.sectionTitle')">
        <ipl-space>
            <ipl-input
                v-show="!useFileUpload"
                v-model="dataUrl"
                name="round-data-url"
                :label="$t('roundImporter.roundDataUrlInput')"
            />
            <ipl-upload
                v-show="useFileUpload"
                v-model="roundFile"
                data-test="round-file-upload"
                :placeholder="$t('common:fileUploadPlaceholder')"
            />
            <div class="layout horizontal center-horizontal">
                <ipl-checkbox
                    v-model="useFileUpload"
                    small
                    class="m-t-8"
                    :label="$t('roundImporter.uploadFileCheckbox')"
                    data-test="use-file-upload-checkbox"
                />
            </div>
            <ipl-button
                :label="$t('roundImporter.importButton')"
                class="m-t-8"
                async
                :progress-message="$t('roundImporter.loadingImportButton')"
                data-test="import-button"
                :disabled="(!useFileUpload && !allValid) || (useFileUpload && !roundFile)"
                @click="handleImport"
            />
        </ipl-space>
    </bordered-space>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue';
import {
    IplButton,
    IplSpace,
    IplInput,
    IplCheckbox,
    IplUpload,
    provideValidators,
    validator,
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
        const { allValid } = provideValidators({
            'round-data-url': validator(false, notBlank)
        });

        return {
            useFileUpload,
            roundFile,
            dataUrl,
            allValid,
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
