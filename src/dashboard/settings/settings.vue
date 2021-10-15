<template>
    <lastfm-settings />
    <radia-settings class="m-t-8" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LastfmSettings from './components/lastfmSettings.vue';
import RadiaSettings from './components/radiaSettings.vue';

export default defineComponent({
    name: 'Settings',

    components: {
        RadiaSettings,
        LastfmSettings
    }
});
</script>
