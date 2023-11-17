<template>
    <ipl-error-display class="m-b-8" />
    <ipl-message
        v-if="!isSupported || !isConfigured"
        type="warning"
    >
        <template v-if="!isSupported">
            Unsupported source ({{ TournamentDataSourceHelper
                .toPrettyString(tournamentDataStore.tournamentData.meta.source as TournamentDataSource) }})
        </template>
        <template v-else>
            Missing configuration for source '{{ TournamentDataSourceHelper
                .toPrettyString(tournamentDataStore.tournamentData.meta.source as TournamentDataSource) }}'
        </template>
    </ipl-message>
    <template v-else>
        <ipl-space 
            class="m-b-8"
            data-test="loaded-bracket-space"
        >
            <div class="title">Loaded bracket</div>
            <template v-if="bracketStore.bracketData == null">
                No brackets currently loaded.
            </template>
            <template v-else>
                <ipl-data-row
                    label="Event Name"
                    :value="bracketStore.bracketData.eventName"
                />
                <ipl-data-row 
                    label="Bracket Name"
                    :value="bracketStore.bracketData.name"
                />
                <ipl-data-row 
                    v-if="matchGroupNames !== bracketStore.bracketData.name"
                    label="Match Groups"
                    :value="matchGroupNames"
                />
                <ipl-data-row
                    v-if="bracketStore.bracketData.roundNumber != null"
                    label="Round Number"
                    :value="`Round ${bracketStore.bracketData.roundNumber}`"
                />
            </template>
        </ipl-space>
        <ipl-space>
            <ipl-button
                label="Load bracket data"
                data-test="load-bracket-data-button"
                async
                @click="getMatchQuery"
            />
            <match-query-param-input
                v-for="param in bracketQuery"
                :key="param.key"
                :param="param"
                :query="queryResult"
                @change="(key, value) => queryResult[key] = value"
                @parameter-add="key => activeParams.add(key)"
                @parameter-remove="key => activeParams.delete(key)"
                @loading="isLoading = $event"
            />
            <ipl-button
                v-if="bracketQuery.length > 0"
                async
                label="Submit"
                data-test="submit-bracket-query-button"
                class="m-t-8"
                :disabled="!activeParamsFilled || isLoading"
                @click="submitBracketQuery"
            />
        </ipl-space>
    </template>
</template>

<script setup lang="ts">
import type NodeCG from '@nodecg/types';
import { IplButton, IplDataRow, IplMessage, IplSpace } from '@iplsplatoon/vue-components';
import { computed, ref, Ref } from 'vue';
import { MatchQueryParameter, MatchImporter, MatchQueryResult } from '@tourneyview/importer';
import MatchQueryParamInput from './MatchQueryParamInput.vue';
import { useBracketStore } from '../store/bracketStore';
import { useTournamentDataStore } from '../store/tournamentDataStore';
import { Configschema } from 'types/schemas';
import { getMatchImporter } from '../../helpers/BracketHelper';
import { TournamentDataSource, TournamentDataSourceHelper } from 'types/enums/tournamentDataSource';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';

const bracketStore = useBracketStore();
const tournamentDataStore = useTournamentDataStore();
const isSupported = computed(() => ['BATTLEFY', 'SMASHGG'].includes(tournamentDataStore.tournamentData.meta.source));
const isConfigured = computed(() => tournamentDataStore.tournamentData.meta.source !== 'SMASHGG' || (nodecg as NodeCG.ClientAPI<Configschema>).bundleConfig?.smashgg?.apiKey != null);

const matchGroupNames = computed(() => {
    if (bracketStore.bracketData == null) {
        return '';
    }

    return bracketStore.bracketData.matchGroups.reduce((result, group, i) => {
        result += group.name;
        if (i !== bracketStore.bracketData.matchGroups.length - 1) {
            result += ', ';
        }

        return result;
    }, '');
});

const activeParams: Ref<Set<string>> = ref(new Set<string>());
const bracketQuery: Ref<MatchQueryParameter[]> = ref([]);
const queryResult: Ref<Record<string, string | number>> = ref({ });
const isLoading = ref<boolean>(false);

function getImporter(): MatchImporter<MatchQueryResult> {
    return getMatchImporter(
        tournamentDataStore.tournamentData.meta.source as TournamentDataSource,
        (nodecg as NodeCG.ClientAPI<Configschema>).bundleConfig);
}

const activeParamsFilled = computed(() => {
    return Array.from(activeParams.value).every(param => queryResult.value[param] != null);
});

async function getMatchQuery() {
    const importer = getImporter();
    bracketQuery.value = await importer.getMatchQueryOptions(tournamentDataStore.tournamentData.meta.id);
}

async function submitBracketQuery() {
    return nodecg.sendMessage('getBracket', queryResult.value);
}
</script>
