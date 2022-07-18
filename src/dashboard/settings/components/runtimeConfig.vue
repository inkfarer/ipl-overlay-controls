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
            {{ pluralizeWithoutCount('Bundle', incompatibleBundles.length) }} {{ prettyPrintList(incompatibleBundles) }}
            {{ pluralizeWithoutCount('is', incompatibleBundles.length, 'are') }} incompatible with
            {{ GameVersionHelper.toPrettyString(currentGameVersion) }}.
        </ipl-message>
        <ipl-message
            v-if="isGameVersionChanged"
            type="warning"
            data-test="version-change-warning"
            class="m-b-8"
        >
            Changing game versions will reset round and match data!
        </ipl-message>
        <ipl-select
            v-model="gameVersion"
            label="Game version"
            data-test="game-version-select"
            :options="gameVersionOptions"
        />
        <ipl-select
            v-model="locale"
            label="Language"
            data-test="locale-select"
            :options="localeOptions"
            class="m-t-6"
        />
        <ipl-button
            class="m-t-8"
            label="Update"
            :color="isChanged ? 'red' : 'blue'"
            :title="RIGHT_CLICK_UNDO_MESSAGE"
            data-test="update-button"
            @click="doUpdate"
            @right-click="undoChanges"
        />
    </ipl-space>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import { IplButton, IplMessage, IplSelect, IplSpace } from '@iplsplatoon/vue-components';
import { GameVersion, GameVersionHelper } from 'types/enums/gameVersion';
import { useSettingsStore } from '../../store/settingsStore';
import { computed, ref, watch } from 'vue';
import { SetGameVersionResponse } from 'types/messages/runtimeConfig';
import { prettyPrintList } from '../../../helpers/array';
import { pluralizeWithoutCount } from '../../helpers/stringHelper';
import { RIGHT_CLICK_UNDO_MESSAGE } from '../../../extension/helpers/strings';
import { Locale, LocaleHelper } from 'types/enums/Locale';

export default defineComponent({
    name: 'RuntimeConfig',

    components: { IplMessage, IplButton, IplSelect, IplSpace },

    setup() {
        const store = useSettingsStore();

        const gameVersion = ref<GameVersion>(GameVersion.SPLATOON_2);
        const showIncompatibleBundlesMessage = ref(false);
        const incompatibleBundles = ref<string[]>([]);
        const isGameVersionChanged = computed(() => gameVersion.value !== store.runtimeConfig.gameVersion);

        const locale = ref<Locale>(null);

        watch(
            () => store.runtimeConfig.gameVersion,
            version => gameVersion.value = version as GameVersion,
            { immediate: true });
        watch(
            () => store.runtimeConfig.locale,
            newValue => locale.value = newValue as Locale,
            { immediate: true });

        return {
            RIGHT_CLICK_UNDO_MESSAGE,
            prettyPrintList,
            GameVersionHelper,
            gameVersion,
            pluralizeWithoutCount,
            gameVersionOptions: Object.values(GameVersion).map(version =>
                ({ value: version, name: GameVersionHelper.toPrettyString(version) })),
            isGameVersionChanged,
            isChanged: computed(() =>
                isGameVersionChanged.value || locale.value !== store.runtimeConfig.locale),
            currentGameVersion: computed(() => store.runtimeConfig.gameVersion),
            showIncompatibleBundlesMessage,
            incompatibleBundles,

            localeOptions: Object.values(Locale).map(locale =>
                ({ value: locale, name: LocaleHelper.toPrettyString(locale) })),
            locale,

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
            },
            undoChanges(event: Event) {
                event.preventDefault();

                gameVersion.value = store.runtimeConfig.gameVersion as GameVersion;
                locale.value = store.runtimeConfig.locale as Locale;
            }
        };
    }
});
</script>
