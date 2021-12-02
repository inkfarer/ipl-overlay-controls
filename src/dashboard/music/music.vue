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
import IplSpace from '../components/iplSpace.vue';
import IplToggle from '../components/iplToggle.vue';
import IplLabel from '../components/iplLabel.vue';
import isEmpty from 'lodash/isEmpty';
import ManualSongEditor from './components/manualSongEditor.vue';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';

export default defineComponent({
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
                const { nowPlaying } = musicStore.state;
                const songName = [nowPlaying.artist, nowPlaying.song].filter(item => !isEmpty(item)).join(' - ');
                return isEmpty(songName) ? 'No song is currently playing.' : songName;
            }),
            nowPlayingSource: computed(() => nowPlayingSourceLabels[musicStore.state.nowPlayingSource]),
            musicShown: computed({
                get() {
                    return musicStore.state.musicShown;
                },
                set(value: boolean) {
                    musicStore.commit('setMusicShown', value);
                }
            })
        };
    }
});
</script>
