<template>
    <ipl-space>
        <div class="title">Team data</div>
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
                v-model="tournamentId"
                :label="idLabel"
                name="tournament-id-input"
                class="m-t-4"
                :validator="validators.tournamentId"
            />
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
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref } from 'vue';
import IplSpace from '../../components/iplSpace.vue';
import IplSelect from '../../components/iplSelect.vue';
import { Configschema } from 'schemas';
import isEmpty from 'lodash/isEmpty';
import { TournamentDataSource, TournamentDataSourceHelper } from 'types/enums/tournamentDataSource';
import IplInput from '../../components/iplInput.vue';
import { useTournamentDataStore } from '../../store/tournamentDataStore';
import IplButton from '../../components/iplButton.vue';
import { allValid, validator } from '../../helpers/validation/validator';
import { notBlank } from '../../helpers/validation/stringValidators';
import { SelectOptions } from '../../types/select';
import { GetTournamentDataResponse } from 'types/messages/tournamentData';

export default defineComponent({
    name: 'TeamDataImporter',

    components: { IplButton, IplInput, IplSelect, IplSpace },

    setup() {
        const tournamentDataStore = useTournamentDataStore();
        const hasSmashggConfig = computed(() => !isEmpty((nodecg.bundleConfig as Configschema).smashgg?.apiKey));
        const smashggEvents: Ref<SelectOptions> = ref([]);

        const dataSource: Ref<TournamentDataSource> = ref(TournamentDataSource.BATTLEFY);
        const tournamentId = ref('');
        const smashggEvent = ref('');

        const validators = {
            tournamentId: validator(tournamentId, false, notBlank)
        };

        return {
            tournamentMetadata: computed(() => tournamentDataStore.state.tournamentData.meta),
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
                        return 'Tournament ID';
                    case TournamentDataSource.SMASHGG:
                        return 'Tournament Slug';
                    case TournamentDataSource.UPLOAD:
                        return 'Data URL';
                    default:
                        throw new Error(`Unknown tournament data source '${dataSource.value}'`);
                }
            }),
            async handleImport() {
                const result: GetTournamentDataResponse = await tournamentDataStore.dispatch('getTournamentData', {
                    method: dataSource.value,
                    id: tournamentId.value
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
            },
            async handleSmashggEventImport() {
                await tournamentDataStore.dispatch('getSmashggEvent', { eventId: parseInt(smashggEvent.value) });
                smashggEvents.value = [];
            },
            handleSmashggImportCancel() {
                smashggEvents.value = [];
            },
            allValid: computed(() => allValid(validators)),
            validators,
            tournamentId,
            smashggEvents,
            smashggEvent,
            TournamentDataSource
        };
    }
});
</script>

<style lang="scss" scoped>
.existing-data {
    padding: 8px;
    border-radius: 5px;
    background-color: #181e29;
    text-align: center;
    word-break: break-all;
}
</style>
