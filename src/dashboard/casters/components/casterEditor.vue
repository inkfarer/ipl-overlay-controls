<template>
    <ipl-expanding-space
        :key="key"
        class="m-t-8 caster-editor"
    >
        <template #header-extra>
            <font-awesome-icon
                v-if="!caster.uncommitted"
                icon="grip-vertical"
                class="caster-elem-grip"
            />
        </template>
        <template #title>
            {{ internalCaster.name }}
            <span class="badge badge-blue pronoun-badge">{{ internalCaster.pronouns }}</span>
            <span
                v-if="caster.uncommitted"
                class="badge badge-red uncommitted-badge"
            >
                {{ $t('casterEditor.unsavedCasterBadge') }}
            </span>
        </template>
        <caster-search
            v-if="store.radiaIntegrationEnabled"
            data-test="caster-search"
            @select="onSearchSelect"
        />
        <ipl-input
            v-model="internalCaster.name"
            name="name"
            :label="$t('casterEditor.nameInput')"
            @focuschange="setFocused"
        />
        <ipl-input
            v-model="internalCaster.twitter"
            name="twitter"
            :label="$t('casterEditor.twitterInput')"
            :formatter="twitterFormatter"
            @focuschange="setFocused"
        />
        <ipl-input
            v-model="internalCaster.pronouns"
            name="pronouns"
            :label="$t('casterEditor.pronounInput')"
            :formatter="pronounFormatter"
            @focuschange="setFocused"
        />
        <ipl-input
            v-model="internalCaster.imageUrl"
            name="imageUrl"
            :label="$t('casterEditor.imageUrlInput')"
            @focuschange="setFocused"
        />
        <ipl-input
            v-model="internalCaster.videoUrl"
            name="videoUrl"
            :label="$t('casterEditor.videoUrlInput')"
            @focuschange="setFocused"
        />
        <div class="layout horizontal m-t-8">
            <ipl-button
                :label="updateButtonLabel"
                :color="buttonColor"
                :disabled="disableSave"
                data-test="update-button"
                :title="caster.uncommitted ? undefined : $t('common:button.rightClickUndoMessage')"
                @click="updateCaster"
                @right-click="undoChanges"
            />
            <ipl-button
                icon="times"
                class="m-l-6"
                color="red"
                data-test="remove-button"
                @click="removeCaster"
            />
        </div>
    </ipl-expanding-space>
</template>

<script lang="ts">
import { IplButton, IplInput, IplExpandingSpace } from '@iplsplatoon/vue-components';
import { computed, defineComponent, getCurrentInstance, PropType, Ref, ref, watch } from 'vue';
import { Caster } from 'schemas';
import { useCasterStore } from '../../store/casterStore';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons/faGripVertical';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import CasterSearch from './casterSearch.vue';
import { useTranslation } from 'i18next-vue';

library.add(faTimes, faGripVertical);

type CasterProp = Caster & { id: string, uncommitted: boolean };

export default defineComponent({
    name: 'CasterEditor',

    components: { CasterSearch, IplExpandingSpace, IplButton, IplInput, FontAwesomeIcon },

    props: {
        bundleName: {
            type: String,
            required: true
        },
        casterSetKey: {
            type: String,
            required: true
        },
        caster: {
            type: Object as PropType<CasterProp>,
            required: true
        }
    },

    emits: [ 'save' ],

    setup(props, { emit }) {
        const store = useCasterStore();
        const internalCaster: Ref<CasterProp> = ref(null);
        const isFocused = ref(false);
        const isEdited = computed(() => !isEqual(props.caster, internalCaster.value));
        const key = getCurrentInstance().vnode.key as string;
        const { t } = useTranslation();

        watch(() => props.caster, (newValue, oldValue) => {
            if (!isFocused.value && !isEqual(newValue, oldValue)) {
                internalCaster.value = cloneDeep(newValue);
            }
        }, { immediate: true });

        return {
            store,
            internalCaster,
            key,
            async updateCaster() {
                const caster = cloneDeep(internalCaster.value);
                delete caster.id;
                delete caster.uncommitted;

                if (props.caster.uncommitted) {
                    const newId = await store.createCaster(props.bundleName, props.casterSetKey, caster);
                    emit('save', newId);
                    store.removeUncommittedCaster(props.bundleName, props.casterSetKey, props.caster.id);
                } else {
                    store.updateCaster(props.bundleName, props.casterSetKey, props.caster.id, caster);
                }
            },
            removeCaster() {
                if (props.caster.uncommitted) {
                    store.removeUncommittedCaster(props.bundleName, props.casterSetKey, props.caster.id);
                } else {
                    store.removeCaster(props.bundleName, props.casterSetKey, props.caster.id);
                }
            },
            setFocused(focused: boolean) {
                isFocused.value = focused;
            },
            disableSave: computed(() => {
                return props.caster.uncommitted && Object.keys(store.casters).length >= 3;
            }),
            isEdited,
            buttonColor: computed(() => props.caster.uncommitted ? 'green' : isEdited.value ? 'red' : 'blue'),
            updateButtonLabel: computed(() => props.caster.uncommitted ? t('casterEditor.saveNewCasterButtonLabel') : t('common:button.update')),
            pronounFormatter: (input: string) => input.toLowerCase(),
            twitterFormatter: (input: string) => input.startsWith('@') ? input : '@' + input,
            undoChanges(event: Event) {
                if (props.caster.uncommitted) return;
                event.preventDefault();

                internalCaster.value = cloneDeep(props.caster);
            },

            onSearchSelect(caster: Caster) {
                internalCaster.value = {
                    ...internalCaster.value,
                    name: caster.name,
                    twitter: caster.twitter,
                    pronouns: caster.pronouns
                };
            }
        };
    }
});
</script>

<style lang="scss">
@import '../../styles/colors';

.caster-elem-grip {
    color: $input-color;
    margin: 0 4px;
    position: relative;
}

.caster-editor .content {
    position: relative;
}
</style>
