<template>
    <ipl-space
        v-if="observers.length === 0 && newObservers.length === 0"
        clickable
        data-test="no-observers-button"
        @click="addObserver()"
    >
        <font-awesome-icon icon="plus" />
        {{ $t('noObserversMessage') }}
    </ipl-space>
    <form @submit.prevent>
        <observer-editor
            v-for="(observer, i) of observers"
            :key="i"
            :model-value="observer"
            class="m-b-8"
            :data-test="`observer-editor-${i}`"
            @delete="removeObserver(i)"
            @update:model-value="observers[i] = $event"
        />
        <observer-editor
            v-for="(observer, i) of newObservers"
            :ref="(el) => {
                if (i === newObservers.length - 1) {
                    lastObserverEditor = el as InstanceType<typeof ObserverEditor>;
                }
            }"
            :key="i"
            :model-value="observer"
            class="m-b-8"
            :data-test="`new-observer-editor-${i}`"
            @delete="removeNewObserver(i)"
            @update:model-value="newObservers[i] = $event"
        />
        <ipl-space
            v-if="observers.length > 0 || newObservers.length > 0"
            class="layout horizontal"
        >
            <ipl-button
                :color="anyObserverChanged ? 'red' : 'blue'"
                type="submit"
                data-test="save-all-button"
                @click="onSave()"
            >
                <font-awesome-icon icon="save" />
                <span class="uppercase m-l-6">{{ $t('saveAllButton') }}</span>
            </ipl-button>
            <ipl-button
                color="green"
                icon="plus"
                class="m-l-6"
                data-test="add-button"
                :title="$t('addButton')"
                @click="addObserver()"
            />
        </ipl-space>
    </form>
</template>

<script setup lang="ts">
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { IplButton, IplSpace } from '@iplsplatoon/vue-components';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { computed, nextTick, ref, watch } from 'vue';
import { CurrentObservers } from 'types/schemas/currentObservers';
import { useObserverStore } from '../store/observerStore';
import { faSave } from '@fortawesome/free-solid-svg-icons/faSave';
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import cloneDeep from 'lodash/cloneDeep';
import ObserverEditor from './ObserverEditor.vue';

library.add(faPlus, faSave, faXmark);

const observerStore = useObserverStore();

const observers = ref<CurrentObservers>([]);
const newObservers = ref<CurrentObservers>([]);
watch(() => observerStore.currentObservers, (newValue) => observers.value = cloneDeep(newValue), { immediate: true });

const lastObserverEditor = ref<InstanceType<typeof ObserverEditor>>();

const anyObserverChanged = computed(() =>
    newObservers.value.length > 0
    || observers.value.some((observer, i) => {
        const otherObserver = observerStore.currentObservers[i];
        return otherObserver.name !== observer.name
            || otherObserver.twitter !== observer.twitter
            || otherObserver.pronouns !== observer.pronouns;
    }));

function onSave() {
    observerStore.setCurrentObservers([
        ...observers.value,
        ...newObservers.value
    ]);
    newObservers.value = [];
}

function addObserver() {
    newObservers.value.push({
        name: 'Observer',
        twitter: '',
        pronouns: '',
    });

    nextTick(() => {
        lastObserverEditor.value?.focus();
    });
}

function removeObserver(index: number) {
    observerStore.removeObserver(index);
}

function removeNewObserver(index: number) {
    newObservers.value = newObservers.value.toSpliced(index, 1);
}
</script>
