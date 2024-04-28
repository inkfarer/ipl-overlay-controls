<template>
    <ipl-expanding-space
        key="teams-rounds"
        :title="$t('activeMatchEditor.sectionTitle')"
        data-test="active-match-editor"
    >
        <ipl-message
            v-if="isChanged && matchHasProgress"
            type="info"
            data-test="match-progress-message"
        >
            {{ 
                $t(selectedMatch.meta.isCompleted 
                       ? 'activeMatchEditor.selectedMatchCompletedMessage'
                       : 'activeMatchEditor.selectedMatchHasProgressMessage', 
                   {
                       matchName: selectedMatch.meta.name,
                       teamA: addDots(selectedMatch.teamA.name),
                       teamB: addDots(selectedMatch.teamB.name)
                   }) 
            }}
        </ipl-message>

        <div class="layout horizontal">
            <div class="layout vertical center-horizontal max-width">
                <ipl-select
                    v-model="teamAId"
                    :label="$t('activeMatchEditor.teamASelect')"
                    data-test="team-a-selector"
                    :options="teams"
                />
                <ipl-checkbox
                    v-model="teamAImageShown"
                    class="m-t-6"
                    :label="$t('activeMatchEditor.showTeamImageCheckbox')"
                    data-test="team-a-image-toggle"
                    small
                />
            </div>
            <div class="layout vertical center-horizontal max-width m-l-8">
                <ipl-select
                    v-model="teamBId"
                    :label="$t('activeMatchEditor.teamBSelect')"
                    data-test="team-b-selector"
                    :options="teams"
                />
                <ipl-checkbox
                    v-model="teamBImageShown"
                    class="m-t-6"
                    :label="$t('activeMatchEditor.showTeamImageCheckbox')"
                    data-test="team-b-image-toggle"
                    small
                />
            </div>
        </div>
        <ipl-select
            v-model="matchId"
            class="m-t-6"
            :options="matches"
            data-test="match-selector"
            :label="$t('activeMatchEditor.matchSelect')"
        />
        <ipl-input
            v-model="matchName"
            name="matchName"
            :label="$t('activeMatchEditor.matchNameInput')"
            class="m-t-6"
        />
        <ipl-button
            class="m-t-8"
            :label="$t('common:button.update')"
            :color="isChanged ? 'red' : 'blue'"
            data-test="update-match-button"
            :title="$t('common:button.rightClickUndoMessage')"
            @click="updateRound"
            @right-click="undoChanges"
        />
    </ipl-expanding-space>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { useTournamentDataStore } from '../../store/tournamentDataStore';
import { addDots } from '../../../helpers/stringHelper';
import { useActiveRoundStore } from '../../store/activeRoundStore';
import {
    IplButton,
    IplSelect,
    IplCheckbox,
    IplMessage,
    IplExpandingSpace,
    IplInput,
    provideValidators,
    notBlank,
    validator
} from '@iplsplatoon/vue-components';
import { useTranslation } from 'i18next-vue';

export default defineComponent({
    name: 'ActiveRoundEditor',

    components: { IplExpandingSpace, IplMessage, IplButton, IplCheckbox, IplSelect, IplInput },

    setup() {
        const { t } = useTranslation();

        const tournamentDataStore = useTournamentDataStore();
        const activeRoundStore = useActiveRoundStore();

        const activeRound = computed(() => activeRoundStore.activeRound);

        const teamAId = ref('');
        const teamBId = ref('');
        const matchId = ref('');
        const matchName = ref('');

        const selectedMatch = computed(() => tournamentDataStore.matchStore[matchId.value]);
        const matchHasProgress = computed(() =>
            selectedMatch.value?.teamA?.score > 0
            || selectedMatch.value?.teamB?.score > 0);

        watch(selectedMatch, newValue => {
            if (newValue) {
                teamAId.value = newValue.teamA.id;
                teamBId.value = newValue.teamB.id;
                matchName.value = newValue.meta.name;
            }
        });

        const isChanged = computed(() =>
            teamAId.value !== activeRoundStore.activeRound.teamA.id
            || teamBId.value !== activeRoundStore.activeRound.teamB.id
            || matchId.value !== activeRoundStore.activeRound.match.id
            || matchName.value !== activeRoundStore.activeRound.match.name);

        watch(
            () => activeRoundStore.activeRound.teamA.id,
            newValue => teamAId.value = newValue,
            { immediate: true });
        watch(
            () => activeRoundStore.activeRound.teamB.id,
            newValue => teamBId.value = newValue,
            { immediate: true });
        watch(
            () => activeRoundStore.activeRound.match.id,
            newValue => matchId.value = newValue,
            { immediate: true });
        watch(
            () => activeRoundStore.activeRound.match.name,
            newValue => matchName.value = newValue,
            { immediate: true });

        provideValidators({
            matchName: validator(false, notBlank)
        });

        const duplicateMatchNames = computed(() => {
            const roundNameSet = new Set();
            const result = new Set();

            Object.values(tournamentDataStore.matchStore).forEach(round => {
                if (roundNameSet.has(round.meta.name)) {
                    result.add(round.meta.name);
                }

                roundNameSet.add(round.meta.name);
            });

            return result;
        });

        return {
            teams: computed(() => tournamentDataStore.tournamentData.teams.map(team => ({
                value: team.id,
                name: addDots(team.name)
            }))),
            teamAId,
            teamBId,
            matchId,
            matchName,
            activeRound,
            teamAImageShown: computed({
                get() {
                    return activeRoundStore.activeRound.teamA.showLogo;
                },
                set(value: boolean) {
                    tournamentDataStore.setTeamImageHidden(
                        { teamId: activeRoundStore.activeRound.teamA.id, isVisible: value });
                }
            }),
            teamBImageShown: computed({
                get() {
                    return activeRoundStore.activeRound.teamB.showLogo;
                },
                set(value: boolean) {
                    tournamentDataStore.setTeamImageHidden(
                        { teamId: activeRoundStore.activeRound.teamB.id, isVisible: value });
                }
            }),
            matches: computed(() => Object.entries(tournamentDataStore.matchStore).map(([ key, value ]) => {
                const name = duplicateMatchNames.value.has(value.meta.name)
                    ? t('activeMatchEditor.duplicateMatchNameOption', {
                        matchName: value.meta.name,
                        teamA: value.teamA.name,
                        teamB: value.teamB.name
                    })
                    : value.meta.name;

                return ({ value: key, name });
            })),
            isChanged,
            updateRound() {
                activeRoundStore.setActiveRound({
                    matchId: matchId.value,
                    matchName: matchName.value,
                    teamAId: teamAId.value,
                    teamBId: teamBId.value
                });
            },
            selectedMatch,
            matchHasProgress,
            addDots,
            undoChanges(event: Event) {
                event.preventDefault();

                matchId.value = activeRoundStore.activeRound.match.id;
                matchName.value = activeRoundStore.activeRound.match.name;
                teamAId.value = activeRoundStore.activeRound.teamA.id;
                teamBId.value = activeRoundStore.activeRound.teamB.id;
            }
        };
    }
});
</script>
