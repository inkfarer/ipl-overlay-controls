<template>
    <ipl-message
        v-if="!hasObsData"
        type="info"
    >
        {{ $t('obs.missingDataMessage') }}
    </ipl-message>
    <ipl-space v-else>
        <ipl-select
            v-model="gameplayInput"
            :options="videoInputOptions"
            :label="$t('obs.gameplayInputSelect')"
            data-test="gameplay-input-select"
        />
        <ipl-select
            v-model="gameplayScene"
            :options="sceneOptions"
            :label="$t('obs.gameplaySceneSelect')"
            data-test="gameplay-scene-select"
            class="m-t-8"
        />
        <ipl-select
            v-model="intermissionScene"
            :options="sceneOptions"
            :label="$t('obs.intermissionSceneSelect')"
            data-test="intermission-scene-select"
            class="m-t-8"
        />
        <ipl-button
            :label="$t('common:button.update')"
            class="m-t-8"
            :color="isChanged ? 'red' : 'blue'"
            :title="$t('common:button.rightClickUndoMessage')"
            data-test="update-button"
            :disabled="anyOptionsMissing"
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
import { sendMessage } from '../../helpers/nodecgHelper';

export default defineComponent({
    name: 'ObsDataPicker',

    components: { IplButton, IplMessage, IplSelect, IplSpace },

    setup() {
        const obsStore = useObsStore();

        const gameplayInput = ref('');
        const gameplayScene = ref('');
        const intermissionScene = ref('');

        watch(
            () => obsStore.currentConfig,
            newConfig => {
                gameplayInput.value = newConfig?.gameplayInput ?? null;
                gameplayScene.value = newConfig?.gameplayScene ?? null;
                intermissionScene.value = newConfig?.intermissionScene ?? null;
            },
            { immediate: true });

        return {
            gameplayInput,
            gameplayScene,
            intermissionScene,
            hasObsData: computed(() => obsStore.obsState.scenes != null),
            sceneOptions: computed(() => obsStore.obsState.scenes?.map(scene =>
                ({ value: scene, name: scene })) ?? []),
            videoInputOptions: computed(() => (obsStore.obsState.inputs ?? [])
                .filter(input => !input.noVideoOutput)
                .map(input => ({ value: input.name, name: input.name }))),
            isChanged: computed(() =>
                gameplayScene.value !== obsStore.currentConfig?.gameplayScene
                || intermissionScene.value !== obsStore.currentConfig?.intermissionScene
                || gameplayInput.value !== obsStore.currentConfig?.gameplayInput),
            anyOptionsMissing: computed(() =>
                gameplayScene.value == null || intermissionScene.value == null || gameplayInput.value == null),
            async update() {
                await sendMessage('setObsConfig', {
                    gameplayScene: gameplayScene.value,
                    intermissionScene: intermissionScene.value,
                    gameplayInput: gameplayInput.value
                });
            },
            undoChanges(event: Event) {
                event.preventDefault();

                gameplayInput.value = obsStore.currentConfig?.gameplayInput;
                gameplayScene.value = obsStore.currentConfig?.gameplayScene;
                intermissionScene.value = obsStore.currentConfig?.intermissionScene;
            }
        };
    }
});
</script>
