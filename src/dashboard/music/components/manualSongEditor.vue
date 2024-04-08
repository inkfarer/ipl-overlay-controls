<template>
    <ipl-expanding-space :title="$t('changeSongManually.sectionHeading')">
        <ipl-checkbox
            v-model="nowPlayingSource"
            :label="$t('changeSongManually.enableCheckboxLabel')"
            data-test="enable-manual-input-checkbox"
        />
        <ipl-input
            v-model="manualNowPlaying.artist"
            name="artist"
            :label="$t('changeSongManually.artistInputLabel')"
            class="m-t-6"
            @focuschange="handleFocusEvent"
        />
        <ipl-input
            v-model="manualNowPlaying.song"
            name="song"
            :label="$t('changeSongManually.songInputLabel')"
            @focuschange="handleFocusEvent"
        />
        <ipl-button
            :label="$t('common:button.update')"
            :color="buttonColor"
            class="m-t-8"
            data-test="manual-song-update-button"
            :title="RIGHT_CLICK_UNDO_MESSAGE"
            @click="handleUpdate"
            @right-click="undo"
        />
    </ipl-expanding-space>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { useMusicStore } from '../musicStore';
import { IplButton, IplInput, IplCheckbox, IplExpandingSpace } from '@iplsplatoon/vue-components';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import { RIGHT_CLICK_UNDO_MESSAGE } from '../../../extension/helpers/strings';

export default defineComponent({
    name: 'ManualSongEditor',

    components: { IplButton, IplInput, IplCheckbox, IplExpandingSpace },

    setup() {
        const musicStore = useMusicStore();
        const manualNowPlaying = ref(cloneDeep(musicStore.manualNowPlaying));
        const isEdited = computed(() => !isEqual(musicStore.manualNowPlaying, manualNowPlaying.value));
        const isFocused = ref(false);

        watch(() => musicStore.manualNowPlaying, newValue => {
            if (!isFocused.value) {
                manualNowPlaying.value = cloneDeep(newValue);
            }
        });

        return {
            RIGHT_CLICK_UNDO_MESSAGE,
            nowPlayingSource: computed({
                get() {
                    return musicStore.nowPlayingSource === 'manual';
                },
                set(value: boolean) {
                    musicStore.setNowPlayingSource(value ? 'manual' : 'lastfm');
                }
            }),
            handleFocusEvent(event: boolean) {
                isFocused.value = event;
            },
            buttonColor: computed(() => isEdited.value ? 'red' : 'blue'),
            manualNowPlaying,
            handleUpdate() {
                if (isEdited.value) {
                    musicStore.setManualNowPlaying(manualNowPlaying.value);
                }
            },
            undo(event: Event) {
                event.preventDefault();

                manualNowPlaying.value = cloneDeep(musicStore.manualNowPlaying);
            }
        };
    }
});
</script>
