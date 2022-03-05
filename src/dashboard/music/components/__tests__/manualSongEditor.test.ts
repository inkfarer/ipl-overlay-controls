import ManualSongEditor from '../manualSongEditor.vue';
import { config, mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { MusicStore, musicStoreKey } from '../../musicStore';

describe('ManualSongEditor', () => {
    config.global.stubs = {
        IplCheckbox: true,
        IplInput: true,
        IplButton: true
    };

    function createMusicStore() {
        return createStore<MusicStore>({
            state: {
                nowPlayingSource: null,
                nowPlaying: null,
                manualNowPlaying: { song: null, artist: null },
                musicShown: null
            },
            mutations: {
                setNowPlayingSource: jest.fn(),
                setManualNowPlaying: jest.fn()
            }
        });
    }

    it('ticks enable checkbox if source is manual', () => {
        const store = createMusicStore();
        store.state.nowPlayingSource = 'manual';
        const wrapper = mount(ManualSongEditor, {
            global: {
                plugins: [ [ store, musicStoreKey ] ]
            }
        });

        expect(wrapper.getComponent('[data-test="enable-manual-input-checkbox"]').attributes().modelvalue)
            .toEqual('true');
    });

    it('unticks enable checkbox if source is not manual', () => {
        const store = createMusicStore();
        store.state.nowPlayingSource = 'lastfm';
        const wrapper = mount(ManualSongEditor, {
            global: {
                plugins: [ [ store, musicStoreKey ] ]
            }
        });

        expect(wrapper.getComponent('[data-test="enable-manual-input-checkbox"]').attributes().modelvalue)
            .toEqual('false');
    });

    it('sets now playing source to manual if enable checkbox is ticked', () => {
        const store = createMusicStore();
        jest.spyOn(store, 'commit');
        const wrapper = mount(ManualSongEditor, {
            global: {
                plugins: [ [ store, musicStoreKey ] ]
            }
        });

        wrapper.getComponent('[data-test="enable-manual-input-checkbox"]').vm.$emit('update:modelValue', true);

        expect(store.commit).toHaveBeenCalledWith('setNowPlayingSource', 'manual');
    });

    it('sets now playing source to lastfm if enable checkbox is unticked', () => {
        const store = createMusicStore();
        jest.spyOn(store, 'commit');
        const wrapper = mount(ManualSongEditor, {
            global: {
                plugins: [ [ store, musicStoreKey ] ]
            }
        });

        wrapper.getComponent('[data-test="enable-manual-input-checkbox"]').vm.$emit('update:modelValue', false);

        expect(store.commit).toHaveBeenCalledWith('setNowPlayingSource', 'lastfm');
    });

    it('updates data if unfocused', async () => {
        const store = createMusicStore();
        store.state.manualNowPlaying = { song: 'cool song', artist: 'dope artist' };
        const wrapper = mount(ManualSongEditor, {
            global: {
                plugins: [ [ store, musicStoreKey ] ]
            }
        });

        store.state.manualNowPlaying = { song: 'dope song', artist: 'cool artist' };
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[name="artist"]').attributes().modelvalue).toEqual('cool artist');
        expect(wrapper.getComponent('[name="song"]').attributes().modelvalue).toEqual('dope song');
    });

    it('does not update data if any field is focused', async () => {
        const store = createMusicStore();
        store.state.manualNowPlaying = { song: 'cool song', artist: 'dope artist' };
        const wrapper = mount(ManualSongEditor, {
            global: {
                plugins: [ [ store, musicStoreKey ] ]
            }
        });
        const artistInput = wrapper.getComponent('[name="artist"]');

        artistInput.vm.$emit('focuschange', true);
        store.state.manualNowPlaying = { song: 'dope song', artist: 'cool artist' };
        await wrapper.vm.$nextTick();

        expect(artistInput.attributes().modelvalue).toEqual('dope artist');
        expect(wrapper.getComponent('[name="song"]').attributes().modelvalue).toEqual('cool song');
    });

    it('has expected button color if data is not updated', () => {
        const store = createMusicStore();
        store.state.manualNowPlaying = { song: 'cool song', artist: 'dope artist' };
        const wrapper = mount(ManualSongEditor, {
            global: {
                plugins: [ [ store, musicStoreKey ] ]
            }
        });

        expect(wrapper.getComponent('[data-test="manual-song-update-button"]').attributes().color).toEqual('blue');
    });

    it('has expected button color if data is updated', async () => {
        const store = createMusicStore();
        store.state.manualNowPlaying = { song: 'cool song', artist: 'dope artist' };
        const wrapper = mount(ManualSongEditor, {
            global: {
                plugins: [ [ store, musicStoreKey ] ]
            }
        });

        wrapper.getComponent('[name="artist"]').vm.$emit('update:modelValue', 'new artist');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="manual-song-update-button"]').attributes().color).toEqual('red');
    });

    it('commits update to store on update button click if data is changed', () => {
        const store = createMusicStore();
        jest.spyOn(store, 'commit');
        const wrapper = mount(ManualSongEditor, {
            global: {
                plugins: [ [ store, musicStoreKey ] ]
            }
        });

        wrapper.getComponent('[name="artist"]').vm.$emit('update:modelValue', 'new artist');
        wrapper.getComponent('[name="song"]').vm.$emit('update:modelValue', 'new song');
        wrapper.getComponent('[data-test="manual-song-update-button"]').vm.$emit('click');

        expect(store.commit).toHaveBeenCalledWith('setManualNowPlaying', { artist: 'new artist', song: 'new song' });
    });

    it('does not commit update to store if data has not changed', () => {
        const store = createMusicStore();
        jest.spyOn(store, 'commit');
        const wrapper = mount(ManualSongEditor, {
            global: {
                plugins: [ [ store, musicStoreKey ] ]
            }
        });

        wrapper.getComponent('[data-test="manual-song-update-button"]').vm.$emit('click');

        expect(store.commit).not.toHaveBeenCalled();
    });

    it('reverts changes when update button is right clicked', async () => {
        const store = createMusicStore();
        store.state.manualNowPlaying.song = 'old song';
        store.state.manualNowPlaying.artist = 'old artist';
        const wrapper = mount(ManualSongEditor, {
            global: {
                plugins: [ [ store, musicStoreKey ] ]
            }
        });
        const event = new Event(null);
        jest.spyOn(event, 'preventDefault');

        wrapper.getComponent('[name="artist"]').vm.$emit('update:modelValue', 'new artist');
        wrapper.getComponent('[name="song"]').vm.$emit('update:modelValue', 'new song');
        await wrapper.vm.$nextTick();

        wrapper.getComponent('[data-test="manual-song-update-button"]').vm.$emit('right-click', event);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[name="artist"]').attributes().modelvalue).toEqual('old artist');
        expect(wrapper.getComponent('[name="song"]').attributes().modelvalue).toEqual('old song');
        expect(event.preventDefault).toHaveBeenCalled();
    });
});
