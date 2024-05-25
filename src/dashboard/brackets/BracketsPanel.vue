<template>
    <ipl-error-display class="m-b-8" />
    <ipl-message
        v-if="!isSupported || !isConfigured"
        type="warning"
    >
        <template v-if="!isSupported">
            {{ $t('common:brackets.unsupportedSourceError', 
                  { source: tournamentDataStore.tournamentData.meta.source }) }}
        </template>
        <template v-else>
            {{ $t('missingConfigurationWarning', { source: tournamentDataStore.tournamentData.meta.source }) }}
        </template>
    </ipl-message>
    <template v-else>
        <ipl-space 
            class="m-b-8"
            data-test="loaded-bracket-space"
        >
            <div class="title">{{ $t('loadedBracketSection.title') }}</div>
            <template v-if="bracketStore.bracketData == null">
                {{ $t('loadedBracketSection.noDataMessage') }}
            </template>
            <template v-else>
                <ipl-data-row
                    :label="$t('loadedBracketSection.eventNameRow')"
                    :value="bracketStore.bracketData.eventName"
                />
                <ipl-data-row 
                    :label="$t('loadedBracketSection.bracketNameRow')"
                    :value="bracketStore.bracketData.name"
                />
                <ipl-data-row 
                    v-if="matchGroupNames !== bracketStore.bracketData.name"
                    :label="$t('loadedBracketSection.matchGroupsRow')"
                    :value="matchGroupNames"
                />
                <ipl-data-row
                    v-if="bracketStore.bracketData.roundNumber != null"
                    :label="$t('loadedBracketSection.roundNumberRow')"
                    :value="`Round ${bracketStore.bracketData.roundNumber}`"
                />
            </template>
        </ipl-space>
        <ipl-space>
            <iploc-button
                :label="$t('bracketLoaderSection.loadDataButton')"
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
            <iploc-button
                v-if="bracketQuery.length > 0"
                async
                :label="$t('bracketLoaderSection.submitBracketQueryButton')"
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
import { IplDataRow, IplMessage, IplSpace } from '@iplsplatoon/vue-components';
import { computed, ref, Ref } from 'vue';
import { MatchQueryParameter, MatchImporter, MatchQueryResult } from '@tourneyview/importer';
import MatchQueryParamInput from './components/MatchQueryParamInput.vue';
import { useBracketStore } from '../store/bracketStore';
import { useTournamentDataStore } from '../store/tournamentDataStore';
import { Configschema } from 'types/schemas';
import { getMatchImporter } from '../../helpers/BracketHelper';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';
import IplocButton from '../components/IplocButton.vue';

const bracketStore = useBracketStore();
const tournamentDataStore = useTournamentDataStore();
const isSupported = computed(() => ['BATTLEFY', 'SMASHGG', 'SENDOU_INK'].includes(tournamentDataStore.tournamentData.meta.source));
const isConfigured = computed(() => {
    if (tournamentDataStore.tournamentData.meta.source === 'SMASHGG') {
        return (nodecg as NodeCG.ClientAPI<Configschema>).bundleConfig?.smashgg?.apiKey != null;
    } else if (tournamentDataStore.tournamentData.meta.source === 'SENDOU_INK') {
        return (nodecg as NodeCG.ClientAPI<Configschema>).bundleConfig?.sendouInk?.apiKey != null;
    }

    return true;
});

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
    const options = await Promise.all((await importer.getMatchQueryOptions(tournamentDataStore.tournamentData.meta.id))
        .map(async (option) => {
            // If possible, select the correct event ID automatically.
            const startggEventId = tournamentDataStore.tournamentData.meta.sourceSpecificData?.smashgg?.eventData.id;
            if (
                tournamentDataStore.tournamentData.meta.source === 'SMASHGG'
                && startggEventId != null
                && option.key === 'eventId'
                && option.type === 'select'
            ) {
                const eventOption = option.options.find(eventOption => eventOption.value === startggEventId);
                if (eventOption != null) {
                    return [
                        {
                            name: 'Event',
                            type: 'static',
                            key: 'eventId',
                            value: startggEventId
                        } satisfies MatchQueryParameter,
                        ...(await eventOption.getParams())
                    ];
                }
            }

            return option;
        }));

    bracketQuery.value = options.flat();
}

async function submitBracketQuery() {
    return nodecg.sendMessage('getBracket', queryResult.value);
}
</script>
