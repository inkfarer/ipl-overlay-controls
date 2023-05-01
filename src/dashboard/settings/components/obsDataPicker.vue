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
            :title="RIGHT_CLICK_UNDO_MESSAGE"
            data-test="update-button"
            @click="update"
            @right-click="undoChanges"
        />
    </ipl-space>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IplButton, IplMessage, IplSelect, IplSpace } from '@iplsplatoon/vue-components';
import { useObsStore } from '../../store/obsStore';
import { computed, ref, watch } from 'vue';
import { RIGHT_CLICK_UNDO_MESSAGE } from '../../../extension/helpers/strings';

export default defineComponent({
    name: 'ObsDataPicker',

    components: { IplButton, IplMessage, IplSelect, IplSpace },

    setup() {
        const obsStore = useObsStore();

        const gameplayScene = ref('');
        const intermissionScene = ref('');

        watch(
            () => obsStore.obsData.gameplayScene,
            scene => gameplayScene.value = scene,
            { immediate: true });
        watch(
            () => obsStore.obsData.intermissionScene,
            scene => intermissionScene.value = scene,
            { immediate: true });

        return {
            RIGHT_CLICK_UNDO_MESSAGE,
            gameplayScene,
            intermissionScene,
            hasObsData: computed(() => obsStore.obsData.scenes != null),
            sceneOptions: computed(() => obsStore.obsData.scenes?.map(scene =>
                ({ value: scene, name: scene })) ?? []),
            isChanged: computed(() =>
                gameplayScene.value !== obsStore.obsData.gameplayScene
                || intermissionScene.value !== obsStore.obsData.intermissionScene),
            update() {
                obsStore.setData({
                    gameplayScene: gameplayScene.value,
                    intermissionScene: intermissionScene.value
                });
            },
            undoChanges(event: Event) {
                event.preventDefault();

                gameplayScene.value = obsStore.obsData.gameplayScene;
                intermissionScene.value = obsStore.obsData.intermissionScene;
            }
        };
    }
});
</script>
