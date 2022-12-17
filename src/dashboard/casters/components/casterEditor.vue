<template>
    <ipl-expanding-space
        :key="key"
        class="m-t-8"
    >
        <template #header-extra>
            <font-awesome-icon
                v-if="!uncommitted"
                icon="grip-vertical"
                class="caster-elem-grip"
            />
        </template>
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
            :formatter="twitterFormatter"
            @focuschange="setFocused"
        />
        <ipl-input
            v-model="internalCaster.pronouns"
            name="pronouns"
            label="Pronouns"
            :formatter="pronounFormatter"
            @focuschange="setFocused"
        />
        <ipl-input
            v-model="internalCaster.imageUrl"
            name="imageUrl"
            label="Image URL"
            @focuschange="setFocused"
        />
        <div class="layout horizontal m-t-8">
            <ipl-button
                :label="updateButtonLabel"
                :color="buttonColor"
                :disabled="disableSave"
                data-test="update-button"
                :title="uncommitted ? undefined : RIGHT_CLICK_UNDO_MESSAGE"
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
import { RIGHT_CLICK_UNDO_MESSAGE } from '../../../extension/helpers/strings';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons/faGripVertical';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faTimes, faGripVertical);

export default defineComponent({
    name: 'CasterEditor',

    components: { IplExpandingSpace, IplButton, IplInput, FontAwesomeIcon },

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
        const internalCaster: Ref<Caster> = ref(null);
        const isFocused = ref(false);
        const isEdited = computed(() => !isEqual(props.caster, internalCaster.value));
        const key = getCurrentInstance().vnode.key as string;

        watch(() => props.caster, (newValue, oldValue) => {
            if (!isFocused.value && !isEqual(newValue, oldValue)) {
                internalCaster.value = cloneDeep(newValue);
            }
        }, { immediate: true });

        return {
            RIGHT_CLICK_UNDO_MESSAGE,
            internalCaster,
            key,
            async updateCaster() {
                const caster = cloneDeep(internalCaster.value);
                // @ts-ignore: They exist, I assure you
                delete caster.id;
                // @ts-ignore: They exist, I assure you
                delete caster.uncommitted;

                if (props.uncommitted) {
                    const newId = await store.saveUncommittedCaster({
                        id: props.casterId,
                        caster
                    });
                    emit('save', newId);
                } else {
                    store.updateCaster({
                        id: props.casterId,
                        newValue: caster
                    });
                }
            },
            removeCaster() {
                if (props.uncommitted) {
                    store.removeUncommittedCaster(props.casterId);
                } else {
                    store.removeCaster(props.casterId);
                }
            },
            setFocused(focused: boolean) {
                isFocused.value = focused;
            },
            disableSave: computed(() => {
                return props.uncommitted && Object.keys(store.casters).length >= 3;
            }),
            isEdited,
            buttonColor: computed(() => props.uncommitted ? 'green' : isEdited.value ? 'red' : 'blue'),
            updateButtonLabel: computed(() => props.uncommitted ? 'Save' : 'Update'),
            pronounFormatter: (input: string) => input.toLowerCase(),
            twitterFormatter: (input: string) => input.startsWith('@') ? input : '@' + input,
            undoChanges(event: Event) {
                if (props.uncommitted) return;
                event.preventDefault();

                internalCaster.value = cloneDeep(props.caster);
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
</style>
