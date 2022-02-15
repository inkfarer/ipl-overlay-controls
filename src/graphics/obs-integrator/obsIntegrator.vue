<template>
    <div
        v-if="isObs"
        class="layout vertical center-horizontal"
    >
        <ipl-message
            v-if="showOutdatedPluginWarning"
            type="warning"
            class="width-cap m-t-8"
            data-test="outdated-plugin-warning"
        >
            <div class="title">Outdated OBS version!</div>
            The installed OBS browser source plugin is out of date.<br>
            Integrations may not work on this version of OBS Studio.<br>
            Please update your OBS Studio version.
        </ipl-message>
    </div>
    <div
        v-else
        class="layout vertical center-horizontal"
    >
        <ipl-space class="width-cap">
            <div class="title">IPL-OC obs-integrator</div>
            Integrates with OBS Studio to automate common tasks during broadcast.
        </ipl-space>
    </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import { IplMessage, IplSpace } from '@iplsplatoon/vue-components';
import semver from 'semver/preload';
import { ref } from 'vue';

export default defineComponent({
    name: 'ObsIntegrator',

    components: { IplMessage, IplSpace },

    setup() {
        const pluginVersion = semver.parse(window.obsstudio?.pluginVersion);
        // See https://github.com/obsproject/obs-browser/tags
        const pluginOutOfDate = !semver.satisfies(pluginVersion, '^2.16.2');
        const showOutdatedPluginWarning = ref(pluginOutOfDate);
        if (pluginOutOfDate) {
            setTimeout(() => showOutdatedPluginWarning.value = false, 60000);
        }

        return {
            isObs: window.obsstudio != null,
            pluginVersion,
            showOutdatedPluginWarning
        };
    }
});
</script>
