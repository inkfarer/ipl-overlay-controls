<template>
    <ipl-expanding-space
        :key="key"
        class="m-t-8"
    >
        <template #title>
            {{ internalCaster.name }}
            <span class="badge badge-blue pronoun-badge">{{ internalCaster.pronouns }}</span>
            <span
                v-if="uncommitted"
                class="badge badge-red uncommitted-badge"
            >Unsaved</span>
        </template>
        <ipl-input
            v-model="internalCaster.name"
            name="name"
            label="Name"
            @focuschange="setFocused"
        />
        <ipl-input
            v-model="internalCaster.twitter"
            name="twitter"
            label="Twitter"
            @focuschange="setFocused"
        />
        <ipl-input
            v-model="internalCaster.pronouns"
            name="pronouns"
            label="Pronouns"
            @focuschange="setFocused"
        />
        <div class="layout horizontal m-t-8">
            <ipl-button
                :label="updateButtonLabel"
                :color="buttonColor"
                :disabled="disableSave"
                data-test="update-button"
                @click="updateCaster"
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
import IplExpandingSpace from '../../components/iplExpandingSpace.vue';
import IplButton from '../../components/iplButton.vue';
import IplInput from '../../components/iplInput.vue';
import { computed, defineComponent, getCurrentInstance, PropType, Ref, ref, watch } from 'vue';
import { Caster } from 'schemas';
import { useCasterStore } from '../../store/casterStore';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';

library.add(faTimes);

export default defineComponent({
    name: 'CasterEditor',

    components: { IplExpandingSpace, IplButton, IplInput },

    props: {
        caster: {
            type: Object as PropType<Caster>,
            required: true
        },
        casterId: {
            type: String,
            required: true
        },
        uncommitted: {
            type: Boolean,
            default: false
        }
    },

    emits: [ 'save' ],

    setup(props, { emit }) {
        const store = useCasterStore();
        const internalCaster: Ref<Caster> = ref({});
        const isFocused = ref(false);
        const isEdited = computed(() => !isEqual(props.caster, internalCaster.value));
        const key = getCurrentInstance().vnode.key as string;

        watch(() => props.caster, newValue => {
            if (!isFocused.value) {
                internalCaster.value = cloneDeep(newValue);
            }
        }, { immediate: true });

        return {
            internalCaster,
            key,
            async updateCaster() {
                if (props.uncommitted) {
                    const newId = await store.dispatch('saveUncommittedCaster', {
                        id: props.casterId,
                        caster: internalCaster.value
                    });
                    emit('save', newId);
                } else {
                    store.commit('updateCaster', { id: props.casterId, newValue: internalCaster.value });
                }
            },
            removeCaster() {
                if (props.uncommitted) {
                    store.commit('removeUncommittedCaster', props.casterId);
                } else {
                    store.commit('removeCaster', props.casterId);
                }
            },
            setFocused(focused: boolean) {
                isFocused.value = focused;
            },
            disableSave: computed(() => {
                return props.uncommitted && Object.keys(store.state.casters).length >= 3;
            }),
            isEdited,
            buttonColor: computed(() => props.uncommitted ? 'green' : isEdited.value ? 'red' : 'blue'),
            updateButtonLabel: computed(() => props.uncommitted ? 'Save' : 'Update')
        };
    }
});
</script>
