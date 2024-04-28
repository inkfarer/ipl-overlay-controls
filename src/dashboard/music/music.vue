<template>
    <ipl-error-display class="m-b-8" />
    <ipl-space>
        <iploc-toggle
            v-model="musicShown"
            data-test="music-shown-toggle"
        />
    </ipl-space>
    <ipl-space class="m-t-8">
        <ipl-label>{{ $t('nowPlayingLabel', { context: musicStore.nowPlayingSource }) }}</ipl-label>
        <p data-test="now-playing-text">{{ nowPlaying }}</p>
    </ipl-space>
    <manual-song-editor class="m-t-8" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useMusicStore } from './musicStore';
import ManualSongEditor from './components/manualSongEditor.vue';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';
import { IplLabel, IplSpace, isBlank } from '@iplsplatoon/vue-components';
import IplocToggle from '../components/IplocToggle.vue';

export default defineComponent({
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'Music',

    components: { IplErrorDisplay, ManualSongEditor, IplLabel, IplocToggle, IplSpace },

    setup() {
        const musicStore = useMusicStore();

        return {
            musicStore,
            nowPlaying: computed(() => {
                const nowPlaying = musicStore.nowPlaying;
                const songName = [nowPlaying.artist, nowPlaying.song].filter(item => !isBlank(item)).join(' - ');
                return isBlank(songName) ? 'No song is currently playing.' : songName;
            }),
            musicShown: computed({
                get() {
                    return musicStore.musicShown;
                },
                set(value: boolean) {
                    musicStore.setMusicShown(value);
                }
            })
        };
    }
});
</script>
