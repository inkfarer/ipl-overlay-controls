import Music from '../music.vue';
import { createStore } from 'vuex';
import { MusicStore, musicStoreKey } from '../musicStore';
import { config, mount } from '@vue/test-utils';

describe('Music', () => {
    config.global.stubs = {
        IplToggle: true,
        ManualSongEditor: true,
        IplErrorDisplay: true
    };

    function createMusicStore() {
        return createStore<MusicStore>({
            state: {
                nowPlayingSource: null,
                nowPlaying: { song: null, artist: null },
                manualNowPlaying: { song: null, artist: null },
                musicShown: null
            },
            mutations: {
                setMusicShown: jest.fn()
            }
        });
    }

    it('updates musicShown value on music shown toggle interaction', () => {
        const store = createMusicStore();
        jest.spyOn(store, 'commit');
        const wrapper = mount(Music, {
            global: {
                plugins: [ [ store, musicStoreKey ] ]
            }
        });

        wrapper.getComponent('[data-test="music-shown-toggle"]').vm.$emit('update:modelValue', true);

        expect(store.commit).toHaveBeenCalledWith('setMusicShown', true);
    });

    it('displays expected source value if source is manual', () => {
        const store = createMusicStore();
        store.state.nowPlayingSource = 'manual';
        const wrapper = mount(Music, {
            global: {
                plugins: [ [ store, musicStoreKey ] ]
            }
        });

        expect(wrapper.get('.ipl-label').text()).toEqual('Now Playing (Manual)');
    });

    it('displays expected source value if source is lastfm', () => {
        const store = createMusicStore();
        store.state.nowPlayingSource = 'lastfm';
        const wrapper = mount(Music, {
            global: {
                plugins: [ [ store, musicStoreKey ] ]
            }
        });

        expect(wrapper.get('.ipl-label').text()).toEqual('Now Playing (Last.fm)');
    });

    it('displays now playing song', () => {
        const store = createMusicStore();
        store.state.nowPlaying = { song: 'dope song', artist: 'cool artist' };
        const wrapper = mount(Music, {
            global: {
                plugins: [ [ store, musicStoreKey ] ]
            }
        });

        expect(wrapper.get('[data-test="now-playing-text"]').text()).toEqual('cool artist - dope song');
    });

    it('handles missing song attributes', () => {
        const store = createMusicStore();
        store.state.nowPlaying = { song: 'dope song', artist: null };
        const wrapper = mount(Music, {
            global: {
                plugins: [ [ store, musicStoreKey ] ]
            }
        });

        expect(wrapper.get('[data-test="now-playing-text"]').text()).toEqual('dope song');
    });

    it('handles missing song data', () => {
        const store = createMusicStore();
        store.state.nowPlaying = { song: null, artist: null };
        const wrapper = mount(Music, {
            global: {
                plugins: [ [ store, musicStoreKey ] ]
            }
        });

        expect(wrapper.get('[data-test="now-playing-text"]').text()).toEqual('No song is currently playing.');
    });
});
