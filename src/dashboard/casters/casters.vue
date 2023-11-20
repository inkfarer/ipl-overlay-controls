<template>
    <ipl-error-display class="m-b-8" />
    <ipl-space class="layout horizontal">
        <ipl-button
            :icon="addCasterIcon"
            label="Add caster"
            color="green"
            :disabled="disableAddCaster"
            data-test="add-caster-button"
            @click="addCaster"
        />
        <ipl-button
            v-if="radiaIntegrationEnabled"
            class="m-l-6"
            async
            data-test="upload-casters-button"
            icon="arrow-up-from-bracket"
            title="Upload casters to Radia"
            @click="uploadCasters"
        />
        <ipl-button
            v-if="radiaIntegrationEnabled"
            class="m-l-6"
            label="Load from VC"
            async
            data-test="load-from-vc-button"
            progress-message="Loading..."
            @click="loadFromVc"
        />
    </ipl-space>
    <ipl-expanding-space-group
        v-model="activeCaster"
        data-test="caster-editor-group"
    >
        <draggable
            :list="casters"
            item-key="id"
            handle=".caster-elem-grip"
            data-test="casters-draggable"
            @end="onMove"
        >
            <template #item="{ element }">
                <caster-editor
                    :key="element.id"
                    :caster-id="element.id"
                    :uncommitted="element.uncommitted"
                    data-test="caster-editor"
                    :caster="element"
                    @save="handleCasterSave"
                />
            </template>
        </draggable>
    </ipl-expanding-space-group>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watchEffect } from 'vue';
import { useCasterStore } from '../store/casterStore';
import { IplButton, IplExpandingSpaceGroup, IplSpace } from '@iplsplatoon/vue-components';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons/faArrowUpFromBracket';
import CasterEditor from './components/casterEditor.vue';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';
import { storeToRefs } from 'pinia';
import { Caster } from 'schemas';
import Draggable from 'vuedraggable';
import { sendMessage } from '../helpers/nodecgHelper';

library.add(faPlus, faArrowUpFromBracket);

export default defineComponent({
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'Casters',

    components: { IplExpandingSpaceGroup, IplErrorDisplay, CasterEditor, IplButton, IplSpace, Draggable },

    setup() {
        const store = useCasterStore();
        const storeRefs = storeToRefs(store);
        const activeCaster = ref(null);
        const allCasters = computed(() => ({ ...storeRefs.casters.value, ...storeRefs.uncommittedCasters.value }));

        const casters = ref([]);
        watchEffect(() => {
            const result: Array<Caster & { id: string, uncommitted: boolean }> = [];
            Object.entries(storeRefs.casters.value).forEach(([key, caster]) => {
                result.push({ id: String(key), ...caster, uncommitted: false });
            });
            Object.entries(storeRefs.uncommittedCasters.value).forEach(([key, caster]) => {
                result.push({ id: String(key), ...caster, uncommitted: true });
            });
            casters.value = result;
        });

        return {
            casters,
            uncommittedCasters: storeRefs.uncommittedCasters,
            activeCaster,
            disableAddCaster: computed(() => Object.keys(allCasters.value).length >= 3),
            async addCaster() {
                activeCaster.value = store.addDefaultCaster();
            },
            handleCasterSave(newId: string) {
                activeCaster.value = newId;
            },
            async loadFromVc() {
                return store.loadCastersFromVc();
            },
            async uploadCasters() {
                return sendMessage('pushCastersToRadia');
            },
            radiaIntegrationEnabled: storeRefs.radiaIntegrationEnabled,
            addCasterIcon: computed(() => store.radiaIntegrationEnabled ? 'plus' : null),
            async onMove() {
                await store.setCasterOrder(casters.value
                    .filter(caster => !caster.uncommitted)
                    .map(caster => caster.id));
            }
        };
    }
});
</script>
