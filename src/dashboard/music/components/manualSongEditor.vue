<template>
    <ipl-expanding-space title="Change song manually">
        <ipl-checkbox
            v-model="nowPlayingSource"
            label="Enable"
            data-test="enable-manual-input-checkbox"
        />
        <ipl-input
            v-model="manualNowPlaying.artist"
            name="artist"
            label="Artist"
            class="m-t-6"
            @focuschange="handleFocusEvent"
        />
        <ipl-input
            v-model="manualNowPlaying.song"
            name="song"
            label="Song"
            @focuschange="handleFocusEvent"
        />
        <ipl-button
            label="Update"
            :color="buttonColor"
            class="m-t-8"
            data-test="manual-song-update-button"
            @click="handleUpdate"
        />
    </ipl-expanding-space>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useMusicStore } from '../musicStore';
import { IplButton, IplInput, IplCheckbox, IplExpandingSpace } from '@iplsplatoon/vue-components';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';

export default defineComponent({
    name: 'ManualSongEditor',

    components: { IplButton, IplInput, IplCheckbox, IplExpandingSpace },

    setup() {
        const musicStore = useMusicStore();
        const manualNowPlaying = ref(cloneDeep(musicStore.state.manualNowPlaying));
        const isEdited = computed(() => !isEqual(musicStore.state.manualNowPlaying, manualNowPlaying.value));
        const isFocused = ref(false);

        musicStore.watch(store => store.manualNowPlaying, newValue => {
            if (!isFocused.value) {
                manualNowPlaying.value = cloneDeep(newValue);
            }
        });

        return {
            nowPlayingSource: computed({
                get() {
                    return musicStore.state.nowPlayingSource === 'manual';
                },
                set(value: boolean) {
                    musicStore.commit('setNowPlayingSource', value ? 'manual' : 'lastfm');
                }
            }),
            handleFocusEvent(event: boolean) {
                isFocused.value = event;
            },
            buttonColor: computed(() => isEdited.value ? 'red' : 'blue'),
            manualNowPlaying,
            handleUpdate() {
                if (isEdited.value) {
                    musicStore.commit('setManualNowPlaying', manualNowPlaying.value);
                }
            }
        };
    }
});
</script>

<style lang="scss" scoped>

</style>
