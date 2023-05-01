import Music from '../music.vue';
import { useMusicStore } from '../musicStore';
import { config, mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { IplToggle } from '@iplsplatoon/vue-components';

describe('Music', () => {
    config.global.stubs = {
        IplToggle: true,
        ManualSongEditor: true,
        IplErrorDisplay: true
    };

    it('updates musicShown value on music shown toggle interaction', () => {
        const wrapper = mount(Music, {
            global: {
                plugins: [ createTestingPinia() ]
            }
        });
        const store = useMusicStore();
        jest.spyOn(store, 'setMusicShown');

        wrapper.getComponent<typeof IplToggle>('[data-test="music-shown-toggle"]').vm.$emit('update:modelValue', true);

        expect(store.setMusicShown).toHaveBeenCalledWith(true);
    });

    it('displays expected source value if source is manual', async () => {
        const pinia = createTestingPinia();
        const store = useMusicStore();
        store.nowPlayingSource = 'manual';
        const wrapper = mount(Music, {
            global: {
                plugins: [ pinia ]
            }
        });

        expect(wrapper.get('.ipl-label').text()).toEqual('Now Playing (Manual)');
    });

    it('displays expected source value if source is lastfm', () => {
        const pinia = createTestingPinia();
        const store = useMusicStore();
        store.nowPlayingSource = 'lastfm';
        const wrapper = mount(Music, {
            global: {
                plugins: [ pinia ]
            }
        });

        expect(wrapper.get('.ipl-label').text()).toEqual('Now Playing (Last.fm)');
    });

    it('displays now playing song', () => {
        const pinia = createTestingPinia();
        const store = useMusicStore();
        store.nowPlaying = { song: 'dope song', artist: 'cool artist' };
        const wrapper = mount(Music, {
            global: {
                plugins: [ pinia ]
            }
        });

        expect(wrapper.get('[data-test="now-playing-text"]').text()).toEqual('cool artist - dope song');
    });

    it('handles missing song attributes', () => {
        const pinia = createTestingPinia();
        const store = useMusicStore();
        store.nowPlaying = { song: 'dope song', artist: null };
        const wrapper = mount(Music, {
            global: {
                plugins: [ pinia ]
            }
        });

        expect(wrapper.get('[data-test="now-playing-text"]').text()).toEqual('dope song');
    });

    it('handles missing song data', () => {
        const pinia = createTestingPinia();
        const store = useMusicStore();
        store.nowPlaying = { song: null, artist: null };
        const wrapper = mount(Music, {
            global: {
                plugins: [ pinia ]
            }
        });

        expect(wrapper.get('[data-test="now-playing-text"]').text()).toEqual('No song is currently playing.');
    });
});
