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
            v-if="showLoadFromVc"
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
        <caster-editor
            v-for="(caster, id) in casters"
            :key="getCasterKey(id)"
            :caster-id="id"
            data-test="caster-editor"
            :caster="caster"
        />
        <caster-editor
            v-for="(caster, id) in uncommittedCasters"
            :key="getCasterKey(id)"
            :caster-id="id"
            :caster="caster"
            uncommitted
            data-test="uncommitted-caster-editor"
            @save="handleCasterSave"
        />
    </ipl-expanding-space-group>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useCasterStore } from '../store/casterStore';
import { IplButton, IplSpace, IplExpandingSpaceGroup } from '@iplsplatoon/vue-components';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import CasterEditor from './components/casterEditor.vue';
import isEmpty from 'lodash/isEmpty';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';
import { storeToRefs } from 'pinia';

library.add(faPlus);

export default defineComponent({
    name: 'Casters',

    components: { IplErrorDisplay, CasterEditor, IplExpandingSpaceGroup, IplButton, IplSpace },

    setup() {
        const store = useCasterStore();
        const storeRefs = storeToRefs(store);
        const activeCaster = ref<string>(null);
        const allCasters = computed(() => ({ ...storeRefs.casters.value, ...storeRefs.uncommittedCasters.value }));
        const getCasterKey = (id: string) => `caster_${id}`;
        const showLoadFromVc = computed(() =>
            store.radiaSettings.enabled && !isEmpty(store.radiaSettings.guildID));

        return {
            casters: storeRefs.casters,
            uncommittedCasters: storeRefs.uncommittedCasters,
            activeCaster,
            disableAddCaster: computed(() => Object.keys(allCasters.value).length >= 3),
            getCasterKey,
            async addCaster() {
                const newId = await store.addDefaultCaster();
                activeCaster.value = getCasterKey(newId);
            },
            handleCasterSave(newId: string) {
                activeCaster.value = getCasterKey(newId);
            },
            async loadFromVc() {
                return store.loadCastersFromVc();
            },
            showLoadFromVc,
            addCasterIcon: computed(() => showLoadFromVc.value ? 'plus' : null)
        };
    }
});
</script>
