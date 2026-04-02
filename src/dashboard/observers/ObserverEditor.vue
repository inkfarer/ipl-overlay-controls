<template>
    <ipl-space style="position: relative">
        <caster-search
            v-if="observerStore.radiaIntegrationEnabled"
            @select="onCasterSelect"
        />
        <ipl-input
            ref="nameInput"
            v-model="model.name"
            name="name"
            :label="$t('nameInput')"
        />
        <ipl-input
            v-model="model.twitter"
            name="twitter"
            :label="$t('twitterInput')"
        />
        <ipl-input
            v-model="model.pronouns"
            name="pronouns"
            :label="$t('pronounInput')"
        />
        <ipl-button
            class="m-t-8"
            color="red"
            @click="emit('delete')"
        >
            <font-awesome-icon icon="xmark" />
            <span class="uppercase m-l-6">{{ $t('removeObserverButton') }}</span>
        </ipl-button>
    </ipl-space>
</template>

<script setup lang="ts">
import { CurrentObservers } from 'types/schemas/currentObservers';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { IplInput, IplSpace, IplButton } from '@iplsplatoon/vue-components';
import { ref } from 'vue';
import CasterSearch from '../casters/components/casterSearch.vue';
import { useObserverStore } from '../store/observerStore';
import { Caster } from 'schemas';

const model = defineModel<CurrentObservers[number]>();

const emit = defineEmits<{
    (e: 'delete'): void;
}>();

const observerStore = useObserverStore();

const nameInput = ref<InstanceType<typeof IplInput>>();

function focus() {
    nameInput.value?.focus();
}

function onCasterSelect(caster: Caster) {
    model.value = {
        name: caster.name,
        twitter: caster.twitter,
        pronouns: caster.pronouns,
    };
}

defineExpose({
    focus,
});
</script>
