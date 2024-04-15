<template>
    <ipl-space>
        <ipl-message
            v-if="showIncompatibleBundlesMessage"
            type="warning"
            data-test="incompatible-bundle-warning"
            class="m-b-8"
            closeable
            @close="showIncompatibleBundlesMessage = false"
        >
            {{
                $t('general.incompatibleBundleWarning', {
                    count: incompatibleBundles.length,
                    bundles: incompatibleBundles,
                    gameVersion: currentGameVersion
                })
            }}
        </ipl-message>
        <ipl-message
            v-if="isGameVersionChanged"
            type="warning"
            data-test="version-change-warning"
            class="m-b-8"
        >
            {{ $t('general.gameVersionChangeWarning') }}
        </ipl-message>
        <ipl-select
            v-model="gameVersion"
            :label="$t('general.gameVersionSelect')"
            data-test="game-version-select"
            :options="gameVersionOptions"
        />
        <ipl-select
            v-model="locale"
            :label="$t('general.gameLocaleSelect')"
            data-test="locale-select"
            :options="localeOptions"
            class="m-t-6"
        />
        <ipl-select
            v-model="interfaceLocale"
            :label="$t('general.interfaceLocaleSelect')"
            data-test="interface-locale-select"
            :options="interfaceLocaleOptions"
            class="m-t-6"
        />
        <ipl-button
            class="m-t-8"
            :label="$t('common:button.update')"
            :color="isChanged ? 'red' : 'blue'"
            :title="$t('common:button.rightClickUndoMessage')"
            data-test="update-button"
            @click="doUpdate"
            @right-click="undoChanges"
        />
    </ipl-space>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IplButton, IplMessage, IplSelect, IplSpace } from '@iplsplatoon/vue-components';
import { GameVersion } from 'types/enums/gameVersion';
import { useSettingsStore } from '../../store/settingsStore';
import { computed, ref, watch } from 'vue';
import { SetGameVersionResponse } from 'types/messages/runtimeConfig';
import { Locale } from 'types/enums/Locale';
import { InterfaceLocale } from 'types/enums/InterfaceLocale';
import { useTranslation } from 'i18next-vue';

export default defineComponent({
    name: 'RuntimeConfig',

    components: { IplMessage, IplButton, IplSelect, IplSpace },

    setup() {
        const store = useSettingsStore();
        const { t } = useTranslation();

        const gameVersion = ref<GameVersion>(GameVersion.SPLATOON_2);
        const showIncompatibleBundlesMessage = ref(false);
        const incompatibleBundles = ref<string[]>([]);
        const isGameVersionChanged = computed(() => gameVersion.value !== store.runtimeConfig.gameVersion);

        const locale = ref<Locale>(null);
        const interfaceLocale = ref<InterfaceLocale>(null);

        watch(
            () => store.runtimeConfig.gameVersion,
            version => gameVersion.value = version as GameVersion,
            { immediate: true });
        watch(
            () => store.runtimeConfig.locale,
            newValue => locale.value = newValue as Locale,
            { immediate: true });
        watch(
            () => store.runtimeConfig.interfaceLocale,
            newValue => interfaceLocale.value = newValue as InterfaceLocale,
            { immediate: true });

        return {
            gameVersion,
            gameVersionOptions: Object.values(GameVersion).map(version =>
                ({ value: version, name: t(`common:gameVersion.${version}`) })),
            isGameVersionChanged,
            isChanged: computed(() =>
                isGameVersionChanged.value
                || locale.value !== store.runtimeConfig.locale
                || interfaceLocale.value !== store.runtimeConfig.interfaceLocale),
            currentGameVersion: computed(() => store.runtimeConfig.gameVersion),
            showIncompatibleBundlesMessage,
            incompatibleBundles,

            localeOptions: Object.values(Locale).map(locale =>
                ({ value: locale, name: t(`common:gameLocale.${locale}`) })),
            locale,

            interfaceLocaleOptions: Object.values(InterfaceLocale).map(locale =>
                ({ value: locale, name: t(`common:interfaceLanguage.${locale}`) })),
            interfaceLocale,

            async doUpdate() {
                if (isGameVersionChanged.value) {
                    const result: SetGameVersionResponse = await store.setGameVersion(gameVersion.value);
                    if (result.incompatibleBundles.length > 0) {
                        showIncompatibleBundlesMessage.value = true;
                        incompatibleBundles.value = result.incompatibleBundles;
                    } else {
                        showIncompatibleBundlesMessage.value = false;
                    }
                }

                if (locale.value !== store.runtimeConfig.locale) {
                    await store.setLocale(locale.value);
                }

                if (interfaceLocale.value !== store.runtimeConfig.interfaceLocale) {
                    store.setInterfaceLocale(interfaceLocale.value);
                }
            },
            undoChanges(event: Event) {
                event.preventDefault();

                gameVersion.value = store.runtimeConfig.gameVersion as GameVersion;
                locale.value = store.runtimeConfig.locale as Locale;
                interfaceLocale.value = store.runtimeConfig.interfaceLocale as InterfaceLocale;
            }
        };
    }
});
</script>
