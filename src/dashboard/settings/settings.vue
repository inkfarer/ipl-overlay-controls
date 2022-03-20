<template>
    <ipl-error-display class="m-b-8" />
    <ipl-sidebar v-model:is-open="showSidebar">
        <ipl-space
            v-for="(name, key) in settingsSections"
            :key="key"
            :data-test="`section-selector_${key}`"
            clickable
            :color="visibleSection === key ? 'blue' : 'light'"
            class="m-b-8"
            @click="visibleSection = key; showSidebar = false"
        >
            {{ name }}
        </ipl-space>
    </ipl-sidebar>
    <ipl-space
        class="layout horizontal m-t-8"
        data-test="open-sidebar-button"
        clickable
        @click="showSidebar = true"
    >
        <font-awesome-icon
            icon="bars"
            class="large-icon m-r-8"
        />
        All Settings
    </ipl-space>
    <lastfm-settings
        v-if="visibleSection === 'lastfm'"
        class="m-t-8"
    />
    <radia-settings
        v-else-if="visibleSection === 'radia'"
        class="m-t-8"
    />
    <runtime-config
        v-else-if="visibleSection === 'gameVersion'"
        class="m-t-8"
    />
    <template v-else-if="visibleSection === 'obs-socket'">
        <obs-socket-settings class="m-t-8" />
        <obs-data-picker
            v-if="obsSocketEnabled"
            class="m-t-8"
        />
    </template>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import LastfmSettings from './components/lastfmSettings.vue';
import RadiaSettings from './components/radiaSettings.vue';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';
import RuntimeConfig from './components/runtimeConfig.vue';
import { IplSidebar, IplSpace } from '@iplsplatoon/vue-components';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import ObsSocketSettings from './components/obsSocketSettings.vue';
import ObsDataPicker from './components/obsDataPicker.vue';
import { useObsStore } from '../store/obsStore';

library.add(faBars);

const settingsSections = {
    lastfm: 'Last.fm',
    radia: 'Radia',
    gameVersion: 'Game version',
    'obs-socket': 'OBS Socket'
};

export default defineComponent({
    name: 'Settings',

    components: {
        ObsDataPicker,
        ObsSocketSettings,
        FontAwesomeIcon,
        IplSidebar,
        IplSpace,
        RuntimeConfig,
        IplErrorDisplay,
        RadiaSettings,
        LastfmSettings
    },

    setup() {
        const obsStore = useObsStore();

        return {
            obsSocketEnabled: computed(() => obsStore.obsData.enabled),
            visibleSection: ref<keyof typeof settingsSections>('obs-socket'),
            showSidebar: ref(false),
            settingsSections
        };
    }
});
</script>
