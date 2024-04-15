<template>
    <bordered-space :label="$t('teamDataImporter.sectionTitle')">
        <ipl-space>
            <template v-if="smashggEvents.length > 1">
                <ipl-select
                    v-model="smashggEvent"
                    :options="smashggEvents"
                    data-test="smashgg-event-selector"
                    :label="$t('teamDataImporter.startgg.eventSelect')"
                />
                <iploc-button
                    class="m-t-8"
                    :label="$t('teamDataImporter.startgg.importButton')"
                    async
                    :progress-message="$t('teamDataImporter.startgg.loadingImportButton')"
                    data-test="smashgg-event-import-button"
                    @click="handleSmashggEventImport"
                />
                <ipl-button
                    class="m-t-8"
                    :label="$t('teamDataImporter.startgg.cancelImportButton')"
                    color="red"
                    data-test="smashgg-event-import-cancel-button"
                    @click="handleSmashggImportCancel"
                />
            </template>
            <template v-else>
                <ipl-radio
                    v-model="dataSource"
                    :label="$t('teamDataImporter.dataSourceSelect')"
                    data-test="source-selector"
                    name="source-selector"
                    class="data-source-selector"
                    :options="dataSourceOptions"
                />
                <ipl-input
                    v-show="dataSource !== TournamentDataSource.UPLOAD || !useFileUpload"
                    v-model="tournamentId"
                    :label="$t('teamDataImporter.tournamentIdInput', { context: dataSource })"
                    name="tournament-id-input"
                    class="m-t-4"
                />
                <ipl-upload
                    v-show="dataSource === TournamentDataSource.UPLOAD && useFileUpload"
                    v-model="teamDataFile"
                    class="m-t-8"
                    :placeholder="$t('common:fileUploadPlaceholder')"
                    data-test="team-data-upload"
                />
                <div class="layout horizontal center-horizontal">
                    <ipl-checkbox
                        v-show="dataSource === TournamentDataSource.UPLOAD"
                        v-model="useFileUpload"
                        :label="$t('teamDataImporter.uploadFileCheckbox')"
                        class="m-t-8"
                        small
                        data-test="use-file-upload-checkbox"
                    />
                </div>
                <iploc-button
                    class="m-t-8"
                    :label="$t('teamDataImporter.importButton')"
                    :disabled="!allValid || refreshingTournamentData"
                    async
                    :progress-message="$t('teamDataImporter.loadingImportButton')"
                    data-test="import-button"
                    @click="handleImport"
                />
            </template>
        </ipl-space>
        <ipl-space
            data-test="saved-data-section"
            class="text-center m-t-8"
        >
            <div class="title">{{ $t('teamDataImporter.savedDataSection.title') }}</div>
            <a
                v-if="!!tournamentMetadata.url"
                :href="tournamentMetadata.url"
                target="_blank"
            >
                {{ tournamentMetadata.name ?? $t('teamDataImporter.savedDataSection.tournamentNamePlaceholder') }}
            </a>
            <span v-else>
                {{ tournamentMetadata.name ?? $t('teamDataImporter.savedDataSection.tournamentNamePlaceholder') }}
            </span>
            <span class="badge badge-blue m-l-6">
                {{ $t(`common:tournamentDataSource.${tournamentMetadata.source}`) }}
            </span>
            <br>
            {{ tournamentMetadata.id }}
            <template v-if="tournamentMetadata.source === TournamentDataSource.SMASHGG">
                <br>
                {{ tournamentMetadata.sourceSpecificData.smashgg.eventData.name }}
                ({{ tournamentMetadata.sourceSpecificData.smashgg.eventData.game }})
            </template>
            <iploc-button
                v-if="tournamentMetadata.source !== TournamentDataSource.UPLOAD &&
                    tournamentMetadata.source !== TournamentDataSource.UNKNOWN"
                class="m-t-6"
                :label="$t('teamDataImporter.savedDataSection.refreshButton')"
                async
                :progress-message="$t('teamDataImporter.savedDataSection.loadingRefreshButton')"
                data-test="refresh-button"
                @click="handleRefresh"
            />
        </ipl-space>
        <ipl-space class="m-t-8">
            <ipl-input
                v-model="shortName"
                :label="$t('teamDataImporter.shortTournamentNameInput')"
                name="shortName"
            />
            <ipl-button
                class="m-t-8"
                :label="$t('common:button.update')"
                data-test="update-short-name-button"
                :color="shortNameChanged ? 'red' : 'blue'"
                :disabled="!shortNameValid"
                :title="$t('common:button.rightClickUndoMessage')"
                @click="updateShortName"
                @right-click="undoShortNameChanges"
            />
        </ipl-space>
    </bordered-space>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, watch } from 'vue';
import { Configschema } from 'schemas';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { useTournamentDataStore } from '../../store/tournamentDataStore';
import {
    IplButton,
    IplCheckbox,
    IplInput,
    IplRadio,
    IplSelect,
    IplSpace,
    IplUpload,
    provideValidators,
    validator
} from '@iplsplatoon/vue-components';
import { SelectOptions } from '../../types/select';
import { GetTournamentDataResponse } from 'types/messages/tournamentData';
import { extractBattlefyTournamentId, extractSendouInkTournamentId } from '../../helpers/stringHelper';
import BorderedSpace from '../../components/BorderedSpace.vue';
import { isBlank } from '../../../helpers/stringHelper';
import { useTranslation } from 'i18next-vue';
import { notBlank } from '../../helpers/validators/stringValidators';
import IplocButton from '../../components/IplocButton.vue';

export default defineComponent({
    name: 'TeamDataImporter',

    components: {
        BorderedSpace,
        IplCheckbox,
        IplUpload,
        IplButton,
        IplInput,
        IplSelect,
        IplSpace,
        IplRadio,
        IplocButton
    },

    setup() {
        const { t } = useTranslation();

        const tournamentDataStore = useTournamentDataStore();
        const hasSmashggConfig = !isBlank((nodecg.bundleConfig as Configschema).smashgg?.apiKey);
        const hasSendouInkConfig = !isBlank((nodecg.bundleConfig as Configschema).sendouInk?.apiKey);
        const smashggEvents: Ref<SelectOptions> = ref([]);

        const dataSource: Ref<TournamentDataSource> = ref(TournamentDataSource.BATTLEFY);
        const tournamentId = ref('');
        const smashggEvent = ref('');
        const teamDataFile: Ref<File> = ref(null);
        const useFileUpload = ref(false);

        const shortName = ref('');

        const refreshingTournamentData = ref(false);

        watch(
            () => tournamentDataStore.tournamentData.meta.shortName,
            newValue => shortName.value = newValue,
            { immediate: true });

        const { fieldIsValid } = provideValidators({
            'tournament-id-input': validator(false, notBlank),
            shortName: validator(true, notBlank)
        });

        function normalizeTournamentId() {
            switch (dataSource.value) {
                case TournamentDataSource.BATTLEFY:
                    return extractBattlefyTournamentId(tournamentId.value);
                case TournamentDataSource.SENDOU_INK:
                    return extractSendouInkTournamentId(tournamentId.value);
                default:
                    return tournamentId.value;
            }
        }

        return {
            teamDataFile,
            useFileUpload,
            tournamentMetadata: computed(() => tournamentDataStore.tournamentData.meta),
            dataSourceOptions: [
                TournamentDataSource.BATTLEFY,
                TournamentDataSource.SMASHGG,
                TournamentDataSource.UPLOAD,
                TournamentDataSource.SENDOU_INK
            ].map(option => ({
                value: option,
                name: t(`common:tournamentDataSource.${option}`),
                disabled: (option === TournamentDataSource.SMASHGG && !hasSmashggConfig)
                    || (option === TournamentDataSource.SENDOU_INK && !hasSendouInkConfig)
            })),
            dataSource,
            async handleImport() {
                if (dataSource.value === TournamentDataSource.UPLOAD && useFileUpload.value) {
                    return tournamentDataStore.uploadTeamData({ file: teamDataFile.value });
                } else {
                    const id = normalizeTournamentId();

                    const result: GetTournamentDataResponse = await tournamentDataStore.getTournamentData({
                        method: dataSource.value,
                        id
                    });

                    if (result?.events?.length > 1) {
                        smashggEvents.value = result.events.map(event => ({
                            name: `${event.name} (${event.game})`,
                            value: event.id.toString()
                        }));
                        smashggEvent.value = result.events[0].id.toString();
                    } else {
                        smashggEvents.value = [];
                    }
                }
            },
            async handleSmashggEventImport() {
                await tournamentDataStore.getSmashggEvent({ eventId: parseInt(smashggEvent.value) });
                smashggEvents.value = [];
            },
            handleSmashggImportCancel() {
                smashggEvents.value = [];
            },
            allValid: computed(() => fieldIsValid('tournament-id-input') || (useFileUpload.value && !!teamDataFile.value)),
            tournamentId,
            smashggEvents,
            smashggEvent,
            TournamentDataSource,

            shortName,
            shortNameValid: computed(() => fieldIsValid('shortName')),
            shortNameChanged: computed(() =>
                tournamentDataStore.tournamentData.meta.shortName !== shortName.value),
            updateShortName() {
                tournamentDataStore.setShortName(shortName.value);
            },
            undoShortNameChanges(event: Event) {
                event.preventDefault();

                shortName.value
                    = tournamentDataStore.tournamentData.meta.shortName
                    ?? tournamentDataStore.tournamentData.meta.name;
            },

            refreshingTournamentData,
            async handleRefresh() {
                refreshingTournamentData.value = true;
                try {
                    await tournamentDataStore.refreshTournamentData();
                } finally {
                    refreshingTournamentData.value = false;
                }
            }
        };
    }
});
</script>

<style lang="scss">
@import './src/dashboard/styles/colors';
@import './src/dashboard/styles/constants';

.darker-space {
    padding: 8px;
    border-radius: $border-radius-inner;
    background-color: rgba(0, 0, 0, 0.15);
    word-break: break-all;
}

.data-source-selector .ipl-radio__options {
    padding: 0 4px 4px;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: $border-radius-inner;
}
</style>
