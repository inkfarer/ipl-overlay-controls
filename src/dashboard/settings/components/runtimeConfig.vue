<template>
    <ipl-space>
        <ipl-message
            v-if="isChanged"
            type="warning"
            data-test="version-change-warning"
            class="m-b-8"
        >
            Changing game versions will reset round and match data!
        </ipl-message>
        <ipl-select
            v-model="gameVersion"
            label="Game version"
            data-test="game-version-select"
            :options="gameVersionOptions"
        />
        <ipl-button
            class="m-t-8"
            label="Update"
            :color="isChanged ? 'red' : 'blue'"
            data-test="update-button"
            @click="doUpdate"
        />
    </ipl-space>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import { IplButton, IplMessage, IplSelect, IplSpace } from '@iplsplatoon/vue-components';
import { GameVersion, GameVersionHelper } from 'types/enums/gameVersion';
import { useSettingsStore } from '../settingsStore';
import { computed, ref } from 'vue';

export default defineComponent({
    name: 'RuntimeConfig',

    components: { IplMessage, IplButton, IplSelect, IplSpace },

    setup() {
        const store = useSettingsStore();
        const gameVersion = ref<GameVersion>(GameVersion.SPLATOON_2);

        store.watch(
            state => state.runtimeConfig.gameVersion,
            version => gameVersion.value = version as GameVersion,
            { immediate: true });

        return {
            gameVersion,
            gameVersionOptions: Object.values(GameVersion).map(version =>
                ({ value: version, name: GameVersionHelper.toPrettyString(version) })),
            isChanged: computed(() => gameVersion.value !== store.state.runtimeConfig.gameVersion),
            doUpdate() {
                store.dispatch('setGameVersion', gameVersion.value);
            }
        };
    }
});
</script>
