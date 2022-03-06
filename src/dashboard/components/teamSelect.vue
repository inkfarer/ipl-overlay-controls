<template>
    <div class="layout vertical center-horizontal max-width">
        <ipl-select
            v-model="teamId"
            :label="label"
            data-test="team-selector"
            :options="teams"
        />
        <ipl-checkbox
            v-model="teamImageShown"
            class="m-t-6"
            label="Show image"
            data-test="team-image-toggle"
            small
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import { useTournamentDataStore } from '../store/tournamentDataStore';
import { computed, PropType } from 'vue';
import { addDots } from '../../helpers/stringHelper';
import { IplCheckbox, IplSelect } from '@iplsplatoon/vue-components';

export default defineComponent({
    name: 'TeamSelect',

    components: { IplSelect, IplCheckbox },

    props: {
        modelValue: {
            type: [String, null] as PropType<string | null>,
            required: true
        },
        label: {
            type: String,
            required: true
        }
    },

    emits: ['update:modelValue'],

    setup(props, { emit }) {
        const tournamentDataStore = useTournamentDataStore();
        const teamId = computed({
            get() {
                return props.modelValue;
            },
            set(value: string) {
                emit('update:modelValue', value);
            }
        });
        const teamData = computed(() =>
            tournamentDataStore.state.tournamentData.teams.find(team => team.id === teamId.value));

        return {
            teamId,
            teams: computed(() => tournamentDataStore.state.tournamentData.teams.map(team =>
                ({ value: team.id, name: addDots(team.name) }))),
            teamImageShown: computed({
                get() {
                    return teamData.value?.showLogo ?? true;
                },
                set(value: boolean) {
                    tournamentDataStore.dispatch('setTeamImageHidden',
                        { teamId: teamId.value, isVisible: value });
                }
            })
        };
    }
});
</script>
