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
import { computed,  defineComponent, Ref, ref } from 'vue';
import { useCasterStore } from '../store/casterStore';
import IplSpace from '../components/iplSpace.vue';
import IplButton from '../components/iplButton.vue';
import IplExpandingSpaceGroup from '../components/iplExpandingSpaceGroup.vue';
import { Casters } from 'schemas';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import CasterEditor from './components/casterEditor.vue';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';

library.add(faPlus);

export default defineComponent({
    name: 'Casters',

    components: { IplErrorDisplay, CasterEditor, IplExpandingSpaceGroup, IplButton, IplSpace },

    setup() {
        const store = useCasterStore();
        const casters: Ref<Casters> = ref({});
        const uncommittedCasters = computed(() => store.state.uncommittedCasters);
        const activeCaster = ref<string>(null);
        const allCasters = computed(() => ({ ...casters.value, ...uncommittedCasters.value }));
        const getCasterKey = (id: string) => `caster_${id}`;
        const showLoadFromVc = computed(() =>
            store.state.radiaSettings.enabled && !isEmpty(store.state.radiaSettings.guildID));

        store.watch(store => store.casters, (newValue: Casters, oldValue: Casters) => {
            Object.entries(newValue).forEach(([key, value]) => {
                if (!isEqual(value, oldValue?.[key])) {
                    casters.value[key] = cloneDeep(value);
                }
            });

            Object.keys(casters.value).forEach(key => {
                if (!newValue[key]) {
                    delete casters.value[key];
                }
            });

        }, { immediate: true, deep: true });

        return {
            casters,
            uncommittedCasters,
            activeCaster,
            disableAddCaster: computed(() => Object.keys(allCasters.value).length >= 3),
            getCasterKey,
            addCaster() {
                store.dispatch('addUncommittedCaster').then(newId => {
                    activeCaster.value = getCasterKey(newId);
                });
            },
            handleCasterSave(newId: string) {
                activeCaster.value = getCasterKey(newId);
            },
            async loadFromVc() {
                return store.dispatch('loadCastersFromVc');
            },
            showLoadFromVc,
            addCasterIcon: computed(() => showLoadFromVc.value ? 'plus' : null)
        };
    }
});
</script>
