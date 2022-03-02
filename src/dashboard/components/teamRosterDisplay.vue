<template>
    <div>
        <div class="text-bold m-b-4 wrap-anywhere text-size-medium">{{ addDots(team.name) }}</div>
        <div
            v-for="player in team.players"
            :key="player.name"
            class="m-t-2 wrap-anywhere"
        >
            {{ addDots(player.name) }}
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import { PropType } from 'vue';
import { ActiveRoundTeam } from 'schemas';
import { addDots } from '../../helpers/stringHelper';

export default defineComponent({
    name: 'TeamRosterDisplay',

    props: {
        team: {
            type: Object as PropType<ActiveRoundTeam>,
            required: true
        }
    },

    setup() {
        return {
            addDots
        };
    }
});
</script>
