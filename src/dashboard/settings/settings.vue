<template>
    <ipl-error-display class="m-b-8" />
    <lastfm-settings />
    <radia-settings class="m-t-8" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LastfmSettings from './components/lastfmSettings.vue';
import RadiaSettings from './components/radiaSettings.vue';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';

export default defineComponent({
    name: 'Settings',

    components: {
        IplErrorDisplay,
        RadiaSettings,
        LastfmSettings
    }
});
</script>
