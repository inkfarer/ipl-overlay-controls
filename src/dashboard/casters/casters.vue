<template>
    <ipl-error-display class="m-b-8" />
    <ipl-space class="layout horizontal">
        <ipl-button
            :icon="addCasterIcon"
            :label="$t('controls.addCaster')"
            color="green"
            :disabled="disableAddCaster"
            data-test="add-caster-button"
            @click="addCaster"
        />
        <ipl-button
            v-if="radiaIntegrationEnabled && selectedCasterSet === 'casters'"
            class="m-l-6"
            async
            data-test="upload-casters-button"
            icon="arrow-up-from-bracket"
            :title="$t('controls.uploadCastersToRadia')"
            @click="uploadCasters"
        />
        <iploc-button
            v-if="radiaIntegrationEnabled && selectedCasterSet === 'casters'"
            class="m-l-6"
            :label="$t('controls.loadFromVoiceChat')"
            async
            data-test="load-from-vc-button"
            @click="loadFromVc"
        />
    </ipl-space>
    <ipl-space
        v-if="casterSetOptions.length > 1"
        class="m-t-8"
        style="padding-top: 4px;"
    >
        <ipl-select
            :model-value="selectedCasterSet"
            :label="$t('controls.casterSetSelect')"
            :option-groups="casterSetOptions"
            @update:model-value="onCasterSetSelect"
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
                    data-test="caster-editor"
                    :caster="element"
                    :bundle-name="selectedCasterSetMeta.bundleName"
                    :caster-set-key="selectedCasterSetMeta.casterSetKey"
                    @save="handleCasterSave"
                />
            </template>
        </draggable>
    </ipl-expanding-space-group>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';
import { useCasterStore } from '../store/casterStore';
import { IplButton, IplExpandingSpaceGroup, IplSelect, IplSpace } from '@iplsplatoon/vue-components';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons/faArrowUpFromBracket';
import CasterEditor from './components/casterEditor.vue';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';
import { storeToRefs } from 'pinia';
import { Caster } from 'schemas';
import Draggable from 'vuedraggable';
import { sendMessage } from '../helpers/nodecgHelper';
import IplocButton from '../components/IplocButton.vue';
import { useTranslation } from 'i18next-vue';

library.add(faPlus, faArrowUpFromBracket);

export default defineComponent({
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'Casters',

    components: {
        IplSelect,
        IplExpandingSpaceGroup,
        IplErrorDisplay,
        CasterEditor,
        IplButton,
        IplSpace,
        Draggable,
        IplocButton
    },

    setup() {
        const i18n = useTranslation();
        const store = useCasterStore();
        const storeRefs = storeToRefs(store);
        const activeCaster = ref(null);


        const selectedCasterSet = ref('casters');
        const defaultCasterSetMeta = { casterSetKey: 'casters', bundleName: nodecg.bundleName, maxItems: 3 };
        const selectedCasterSetMeta = ref<typeof defaultCasterSetMeta>(defaultCasterSetMeta);

        watch(() => store.runtimeConfig.activeGraphicsBundles, newValue => {
            if (!newValue.includes(selectedCasterSetMeta.value.bundleName)) {
                selectedCasterSet.value = 'casters';
                selectedCasterSetMeta.value = defaultCasterSetMeta;
            }
        });

        const casters = ref([]);
        watchEffect(() => {
            const result: Array<Caster & { id: string, uncommitted: boolean }> = [];
            if (selectedCasterSetMeta.value.bundleName === nodecg.bundleName) {
                Object.entries(storeRefs.casters.value).forEach(([key, caster]) => {
                    result.push({ id: String(key), ...caster, uncommitted: false });
                });
                Object.entries(storeRefs.uncommittedCasters.value).forEach(([key, caster]) => {
                    result.push({ id: String(key), ...caster, uncommitted: true });
                });
            } else {
                // eslint-disable-next-line max-len
                Object.entries(store.bundleCasterSets[selectedCasterSetMeta.value.bundleName][selectedCasterSetMeta.value.casterSetKey]).forEach(([key, caster]) => {
                    result.push({ id: String(key), ...caster, uncommitted: false });
                });
                // eslint-disable-next-line max-len
                const uncommittedCasters = store.uncommittedBundleCasters[selectedCasterSetMeta.value.bundleName]?.[selectedCasterSetMeta.value.casterSetKey];
                if (uncommittedCasters != null) {
                    Object.entries(uncommittedCasters).forEach(([key, caster]) => {
                        result.push({ id: String(key), ...caster, uncommitted: true });
                    });
                }
            }
            casters.value = result;
        });

        return {
            casters,
            uncommittedCasters: storeRefs.uncommittedCasters,
            activeCaster,
            disableAddCaster: computed(() => casters.value.length >= selectedCasterSetMeta.value.maxItems),
            async addCaster() {
                activeCaster.value = store.addDefaultCaster(
                    selectedCasterSetMeta.value.bundleName,
                    selectedCasterSetMeta.value.casterSetKey);
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
            addCasterIcon: computed(() => store.radiaIntegrationEnabled && selectedCasterSet.value === 'casters' ? 'plus' : null),
            async onMove() {
                await store.setCasterOrder(
                    selectedCasterSetMeta.value.bundleName,
                    selectedCasterSetMeta.value.casterSetKey,
                    casters.value
                        .filter(caster => !caster.uncommitted)
                        .map(caster => caster.id));
            },
            onCasterSetSelect(value: string, option: { casterSetKey: string, bundleName: string, maxItems: number }) {
                selectedCasterSet.value = value;
                selectedCasterSetMeta.value = option;
            },
            selectedCasterSet,
            selectedCasterSetMeta,
            casterSetOptions: computed(() => {
                const result = [{
                    name: 'Casters',
                    options: [{ value: 'casters', name: 'Casters', bundleName: 'ipl-overlay-controls', maxItems: 3 }]
                }];

                store.runtimeConfig.activeGraphicsBundles.forEach(activeBundle => {
                    const declaredConfig = store.bundleDeclaredConfig[activeBundle];
                    if (
                        declaredConfig != null
                        && declaredConfig.casterSets != null
                        && declaredConfig.casterSets.length > 0
                    ) {
                        result.push({
                            name: activeBundle,
                            options: declaredConfig.casterSets.map(casterSet => ({
                                name: casterSet.names?.[i18n.i18next.language.toUpperCase()] ?? casterSet.key,
                                value: `${activeBundle}__${casterSet.key}`,
                                casterSetKey: casterSet.key,
                                bundleName: activeBundle,
                                maxItems: casterSet.maxItems
                            }))
                        });
                    }
                });

                return result;
            })
        };
    }
});
</script>
