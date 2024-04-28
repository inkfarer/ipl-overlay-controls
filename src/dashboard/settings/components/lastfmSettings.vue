<template>
    <ipl-space>
        <div class="title">{{ $t('sectionName.lastfm') }}</div>
        <ipl-input
            v-model="settings.username"
            name="username"
            :label="$t('lastfm.usernameInput')"
            @focuschange="handleFocusEvent"
        />
        <ipl-button
            :label="$t('common:button.update')"
            class="m-t-8"
            :color="buttonColor"
            :title="$t('common:button.rightClickUndoMessage')"
            data-test="update-button"
            @click="handleUpdate"
            @right-click="undoChanges"
        />
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, watch } from 'vue';
import { IplButton, IplInput, IplSpace } from '@iplsplatoon/vue-components';
import { useSettingsStore } from '../../store/settingsStore';
import isEqual from 'lodash/isEqual';
import { LastFmSettings } from 'schemas';
import cloneDeep from 'lodash/cloneDeep';

export default defineComponent({
    name: 'LastfmSettings',

    components: {
        IplButton,
        IplInput,
        IplSpace
    },

    setup() {
        const isFocused = ref(false);
        const isChanged = computed(() => !isEqual(settings.value, store.lastFmSettings));
        const store = useSettingsStore();
        const settings: Ref<LastFmSettings> = ref(cloneDeep(store.lastFmSettings));

        watch(() => store.lastFmSettings, (newValue) => {
            if (!isFocused.value) {
                settings.value = cloneDeep(newValue);
            }
        }, { deep: true });

        return {
            focused: isFocused,
            handleFocusEvent(event: boolean) {
                isFocused.value = event;
            },
            isChanged,
            buttonColor: computed(() => isChanged.value ? 'red' : 'blue'),
            settings,
            handleUpdate() {
                if (isChanged.value) {
                    store.setLastFmSettings({ newValue: settings.value });
                }
            },
            undoChanges(event: Event) {
                event.preventDefault();

                settings.value = cloneDeep(store.lastFmSettings);
            }
        };
    }
});
</script>
