<template>
    <ipl-error-display class="m-b-8" />
    <ipl-space>
        <ipl-toggle
            v-model="musicShown"
            data-test="music-shown-toggle"
        />
    </ipl-space>
    <ipl-space class="m-t-8">
        <ipl-label>Now Playing ({{ nowPlayingSource }})</ipl-label>
        <p data-test="now-playing-text">{{ nowPlaying }}</p>
    </ipl-space>
    <manual-song-editor class="m-t-8" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useMusicStore } from './musicStore';
import { NowPlayingSource } from 'schemas';
import ManualSongEditor from './components/manualSongEditor.vue';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';
import { IplLabel, IplSpace, IplToggle, isBlank } from '@iplsplatoon/vue-components';

export default defineComponent({
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'Music',

    components: { IplErrorDisplay, ManualSongEditor, IplLabel, IplToggle, IplSpace },

    setup() {
        const musicStore = useMusicStore();
        const nowPlayingSourceLabels: Record<NowPlayingSource, string> = {
            lastfm: 'Last.fm',
            manual: 'Manual'
        };

        return {
            nowPlaying: computed(() => {
                const nowPlaying = musicStore.nowPlaying;
                const songName = [nowPlaying.artist, nowPlaying.song].filter(item => !isBlank(item)).join(' - ');
                return isBlank(songName) ? 'No song is currently playing.' : songName;
            }),
            nowPlayingSource: computed(() => nowPlayingSourceLabels[musicStore.nowPlayingSource]),
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
