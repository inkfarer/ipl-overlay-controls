import { NodeCGBrowser } from 'nodecg/browser';
import { createStore, Store, useStore } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import { InjectionKey } from 'vue';
import { ManualNowPlaying, MusicShown, NowPlaying, NowPlayingSource } from 'schemas';

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

export const musicStore = createStore<MusicStore>({
    state: {
        nowPlayingSource: null,
        nowPlaying: null,
        manualNowPlaying: null,
        musicShown: null
    },
    mutations: {
        setState(store, { name, val }: { name: string, val: unknown }): void {
            this.state[name] = cloneDeep(val);
        },
        setMusicShown(store, newValue: boolean): void {
            musicShown.value = newValue;
        },
        setNowPlayingSource(store, newValue: NowPlayingSource): void {
            nowPlayingSource.value = newValue;
        },
        setManualNowPlaying(store, newValue: ManualNowPlaying): void {
            manualNowPlaying.value = newValue;
        }
    }
});

export const musicStoreKey: InjectionKey<Store<MusicStore>> = Symbol();

export function useMusicStore(): Store<MusicStore> {
    return useStore(musicStoreKey);
}
