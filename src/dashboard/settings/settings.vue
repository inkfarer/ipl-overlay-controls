<template>
    <ipl-error-display class="m-b-8" />
    <ipl-sidebar v-model:is-open="showSidebar">
        <ipl-space
            v-for="(section, index) in settingsSections"
            :key="section.key"
            :data-test="`section-selector_${section.key}`"
            clickable
            :color="visibleSection === index ? 'blue' : 'light'"
            class="m-b-8"
            @click="visibleSection = index; showSidebar = false"
        >
            {{ section.name }}
        </ipl-space>
    </ipl-sidebar>
    <ipl-space
        class="layout horizontal m-t-8 m-b-8"
        data-test="open-sidebar-button"
        clickable
        @click="showSidebar = true"
    >
        <font-awesome-icon
            icon="bars"
            class="large-icon m-r-8"
        />
        {{ $t('showAllSettingsButton') }}
    </ipl-space>
    <component :is="settingsSections[visibleSection].component" />
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
import { useTranslation } from 'i18next-vue';
import ObsSettings from './components/obsSettings.vue';

library.add(faBars);

export default defineComponent({
    // eslint-disable-next-line vue/multi-word-component-names
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
        const { t } = useTranslation();
        const obsStore = useObsStore();

        const settingsSections = computed(() => [
            {
                key: 'general',
                name: t('sectionName.general'),
                component: RuntimeConfig
            },
            {
                key: 'lastfm',
                name: t('sectionName.lastfm'),
                component: LastfmSettings
            },
            {
                key: 'radia',
                name: t('sectionName.radia'),
                component: RadiaSettings
            },
            {
                key: 'obs',
                name: t('sectionName.obs'),
                component: ObsSettings
            }
        ]);

        return {
            settingsSections,
            obsSocketEnabled: computed(() => obsStore.obsData.enabled),
            visibleSection: ref(0),
            showSidebar: ref(false)
        };
    }
});
</script>
