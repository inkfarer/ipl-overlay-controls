import { ManualNowPlaying, MusicShown, NowPlaying, NowPlayingSource } from 'schemas';
import { defineStore } from 'pinia';

const nowPlayingSource = nodecg.Replicant<NowPlayingSource>('nowPlayingSource');
const nowPlaying = nodecg.Replicant<NowPlaying>('nowPlaying');
const manualNowPlaying = nodecg.Replicant<ManualNowPlaying>('manualNowPlaying');
const musicShown = nodecg.Replicant<MusicShown>('musicShown');

export const musicReps = [ nowPlayingSource, nowPlaying, manualNowPlaying, musicShown ];

export interface MusicStore {
    nowPlayingSource: NowPlayingSource;
    nowPlaying: NowPlaying;
    manualNowPlaying: ManualNowPlaying;
    musicShown: MusicShown
}

export const useMusicStore = defineStore('music', {
    state: () => ({
        nowPlayingSource: null,
        nowPlaying: { },
        manualNowPlaying: { },
        musicShown: null
    } as MusicStore),
    actions: {
        setMusicShown(newValue: boolean): void {
            musicShown.value = newValue;
        },
        setNowPlayingSource(newValue: NowPlayingSource): void {
            nowPlayingSource.value = newValue;
        },
        setManualNowPlaying(newValue: ManualNowPlaying): void {
            manualNowPlaying.value = newValue;
        }
    }
});
