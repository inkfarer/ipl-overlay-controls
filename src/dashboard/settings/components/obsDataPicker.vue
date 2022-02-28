<template>
    <ipl-message
        v-if="!hasObsData"
        type="info"
    >
        OBS data is missing. Please connect to an OBS websocket to continue.
    </ipl-message>
    <ipl-space v-else>
        <ipl-select
            v-model="gameplayScene"
            :options="sceneOptions"
            label="Gameplay scene"
            data-test="gameplay-scene-select"
        />
        <ipl-select
            v-model="intermissionScene"
            :options="sceneOptions"
            label="Intermission scene"
            data-test="intermission-scene-select"
            class="m-t-8"
        />
        <ipl-button
            label="Update"
            class="m-t-8"
            :color="isChanged ? 'red' : 'blue'"
            data-test="update-button"
            @click="update"
        />
    </ipl-space>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import { IplButton, IplMessage, IplSelect, IplSpace } from '@iplsplatoon/vue-components';
import { useObsStore } from '../../store/obsStore';
import { computed, ref } from 'vue';

export default defineComponent({
    name: 'ObsDataPicker',

    components: { IplButton, IplMessage, IplSelect, IplSpace },

    setup() {
        const obsStore = useObsStore();

        const gameplayScene = ref('');
        const intermissionScene = ref('');

        obsStore.watch(
            state => state.obsData.gameplayScene,
            scene => gameplayScene.value = scene,
            { immediate: true });
        obsStore.watch(
            state => state.obsData.intermissionScene,
            scene => intermissionScene.value = scene,
            { immediate: true });

        return {
            gameplayScene,
            intermissionScene,
            hasObsData: computed(() => obsStore.state.obsData.scenes != null),
            sceneOptions: computed(() => obsStore.state.obsData.scenes?.map(scene =>
                ({ value: scene, name: scene })) ?? []),
            isChanged: computed(() =>
                gameplayScene.value !== obsStore.state.obsData.gameplayScene
                || intermissionScene.value !== obsStore.state.obsData.intermissionScene),
            update() {
                obsStore.dispatch('setData', {
                    gameplayScene: gameplayScene.value,
                    intermissionScene: intermissionScene.value
                });
            }
        };
    }
});
</script>
