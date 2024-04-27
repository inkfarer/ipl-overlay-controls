<template>
    <obs-socket-settings class="m-t-8" />
    <obs-data-picker
        v-if="obsSocketEnabled"
        class="m-t-8"
    />
</template>

<script setup lang="ts">
import ObsSocketSettings from './obsSocketSettings.vue';
import ObsDataPicker from './obsDataPicker.vue';
import { useObsStore } from '../../store/obsStore';
import { computed } from 'vue';

const obsStore = useObsStore();
const obsSocketEnabled = computed(() => obsStore.obsState.enabled);
</script>
