<template>
    <ipl-space>
        <div class="title">Tournament data</div>
        <template v-if="smashggEvents.length > 1">
            <ipl-select
                v-model="smashggEvent"
                :options="smashggEvents"
                data-test="smashgg-event-selector"
                label="Event"
            />
            <ipl-button
                class="m-t-8"
                label="Import"
                async
                progress-message="Importing..."
                data-test="smashgg-event-import-button"
                @click="handleSmashggEventImport"
            />
            <ipl-button
                class="m-t-8"
                label="Cancel"
                color="red"
                data-test="smashgg-event-import-cancel-button"
                @click="handleSmashggImportCancel"
            />
        </template>
        <template v-else>
            <ipl-select
                v-model="dataSource"
                label="Source"
                data-test="source-selector"
                :options="dataSourceOptions"
            />
            <ipl-input
                v-show="dataSource !== TournamentDataSource.UPLOAD || !useFileUpload"
                v-model="tournamentId"
                :label="idLabel"
                name="tournament-id-input"
                class="m-t-4"
            />
            <ipl-upload
                v-show="dataSource === TournamentDataSource.UPLOAD && useFileUpload"
                v-model="teamDataFile"
                class="m-t-8"
                data-test="team-data-upload"
            />
            <div class="layout horizontal center-horizontal">
                <ipl-checkbox
                    v-show="dataSource === TournamentDataSource.UPLOAD"
                    v-model="useFileUpload"
                    label="Upload file"
                    class="m-t-8"
                    small
                    data-test="use-file-upload-checkbox"
                />
            </div>
            <ipl-button
                class="m-t-8"
                label="Import"
                :disabled="!allValid"
                async
                progress-message="Importing..."
                data-test="import-button"
                @click="handleImport"
            />
        </template>
        <div class="existing-data m-t-8">
            <div class="title">Saved data</div>
            <a
                v-if="!!tournamentMetadata.url"
                :href="tournamentMetadata.url"
                target="_blank"
            >{{ tournamentMetadata.name ?? 'No name' }}</a>
            <span v-else>{{ tournamentMetadata.name ?? 'No name' }}</span>
            <span class="badge badge-blue m-l-6">{{ getDataSourceName(tournamentMetadata.source) }}</span>
            <br>
            {{ tournamentMetadata.id }}
            <template v-if="tournamentMetadata.source === TournamentDataSource.SMASHGG">
                <br>
                {{ tournamentMetadata.sourceSpecificData.smashgg.eventData.name }}
                ({{ tournamentMetadata.sourceSpecificData.smashgg.eventData.game }})
            </template>
        </div>
        <ipl-input
            v-model="shortName"
            label="Short tournament name"
            name="shortName"
            class="m-t-4"
        />
        <ipl-button
            class="m-t-8"
            label="Update"
            data-test="update-short-name-button"
            :color="shortNameChanged ? 'red' : 'blue'"
            :disabled="!shortNameValidator.isValid"
            :title="RIGHT_CLICK_UNDO_MESSAGE"
            @click="updateShortName"
            @right-click="undoShortNameChanges"
        />
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, watch } from 'vue';
import { Configschema } from 'schemas';
import isEmpty from 'lodash/isEmpty';
import { TournamentDataSource, TournamentDataSourceHelper } from 'types/enums/tournamentDataSource';
import { useTournamentDataStore } from '../../store/tournamentDataStore';
import {
    IplButton,
    IplSpace,
    IplSelect,
    IplInput,
    IplUpload,
    IplCheckbox,
    provideValidators,
    notBlank,
    validator,
    allValid
} from '@iplsplatoon/vue-components';
import { SelectOptions } from '../../types/select';
import { GetTournamentDataResponse } from 'types/messages/tournamentData';
import { extractBattlefyTournamentId } from '../../helpers/stringHelper';
import { RIGHT_CLICK_UNDO_MESSAGE } from '../../../extension/helpers/strings';

export default defineComponent({
    name: 'TeamDataImporter',

    components: { IplCheckbox, IplUpload, IplButton, IplInput, IplSelect, IplSpace },

    setup() {
        const tournamentDataStore = useTournamentDataStore();
        const hasSmashggConfig = computed(() => !isEmpty((nodecg.bundleConfig as Configschema).smashgg?.apiKey));
        const smashggEvents: Ref<SelectOptions> = ref([]);

        const dataSource: Ref<TournamentDataSource> = ref(TournamentDataSource.BATTLEFY);
        const tournamentId = ref('');
        const smashggEvent = ref('');
        const teamDataFile: Ref<File> = ref(null);
        const useFileUpload = ref(false);

        const shortName = ref('');
        const shortNameValidator = validator(shortName, false, notBlank);

        watch(
            () => tournamentDataStore.tournamentData.meta.shortName,
            newValue => shortName.value = newValue,
            { immediate: true });

        const validators = {
            'tournament-id-input': validator(tournamentId, false, notBlank)
        };

        provideValidators({
            ...validators,
            shortName: shortNameValidator
        });

        return {
            RIGHT_CLICK_UNDO_MESSAGE,
            teamDataFile,
            useFileUpload,
            tournamentMetadata: computed(() => tournamentDataStore.tournamentData.meta),
            dataSourceOptions: computed(() => {
                const options = [
                    TournamentDataSource.BATTLEFY,
                    TournamentDataSource.UPLOAD
                ];

                if (hasSmashggConfig.value) {
                    options.splice(1, 0, TournamentDataSource.SMASHGG);
                }

                return options.map(option => ({
                    value: option,
                    name: TournamentDataSourceHelper.toPrettyString(option)
                }));
            }),
            dataSource,
            getDataSourceName(value: TournamentDataSource) {
                return TournamentDataSourceHelper.toPrettyString(value);
            },
            idLabel: computed(() => {
                switch (dataSource.value) {
                    case TournamentDataSource.BATTLEFY:
                        return 'Tournament URL';
                    case TournamentDataSource.SMASHGG:
                        return 'Tournament Slug';
                    case TournamentDataSource.UPLOAD:
                        return 'Data URL';
                    default:
                        throw new Error(`Unknown tournament data source '${dataSource.value}'`);
                }
            }),
            async handleImport() {
                if (dataSource.value === TournamentDataSource.UPLOAD && useFileUpload.value) {
                    return tournamentDataStore.uploadTeamData({ file: teamDataFile.value });
                } else {
                    const id = dataSource.value === TournamentDataSource.BATTLEFY
                        ? extractBattlefyTournamentId(tournamentId.value)
                        : tournamentId.value;

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
            allValid: computed(() => allValid(validators) || (useFileUpload.value && !!teamDataFile.value)),
            tournamentId,
            smashggEvents,
            smashggEvent,
            TournamentDataSource,

            shortName,
            shortNameValidator,
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
            }
        };
    }
});
</script>

<style lang="scss" scoped>
@import './src/dashboard/styles/colors';
@import './src/dashboard/styles/constants';

.existing-data {
    padding: 8px;
    border-radius: $border-radius-inner;
    background-color: $background-tertiary;
    text-align: center;
    word-break: break-all;
}
</style>
