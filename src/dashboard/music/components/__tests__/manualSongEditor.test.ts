import ManualSongEditor from '../manualSongEditor.vue';
import { config, mount } from '@vue/test-utils';
import { useMusicStore } from '../../musicStore';
import { createTestingPinia } from '@pinia/testing';
import { IplButton, IplCheckbox, IplInput } from '@iplsplatoon/vue-components';

describe('ManualSongEditor', () => {
    config.global.stubs = {
        IplCheckbox: true,
        IplInput: true,
        IplButton: true
    };

    it('ticks enable checkbox if source is manual', () => {
        const pinia = createTestingPinia();
        const store = useMusicStore();
        store.nowPlayingSource = 'manual';
        const wrapper = mount(ManualSongEditor, {
            global: {
                plugins: [ pinia ]
            }
        });

        expect(wrapper.getComponent('[data-test="enable-manual-input-checkbox"]').attributes().modelvalue)
            .toEqual('true');
    });

    it('unticks enable checkbox if source is not manual', () => {
        const pinia = createTestingPinia();
        const store = useMusicStore();
        store.nowPlayingSource = 'lastfm';
        const wrapper = mount(ManualSongEditor, {
            global: {
                plugins: [ pinia ]
            }
        });

        expect(wrapper.getComponent('[data-test="enable-manual-input-checkbox"]').attributes().modelvalue)
            .toEqual('false');
    });

    it('sets now playing source to manual if enable checkbox is ticked', () => {
        const pinia = createTestingPinia();
        const store = useMusicStore();
        jest.spyOn(store, 'setNowPlayingSource');
        const wrapper = mount(ManualSongEditor, {
            global: {
                plugins: [ pinia ]
            }
        });

        wrapper.getComponent<typeof IplCheckbox>('[data-test="enable-manual-input-checkbox"]').vm.$emit('update:modelValue', true);

        expect(store.setNowPlayingSource).toHaveBeenCalledWith('manual');
    });

    it('sets now playing source to lastfm if enable checkbox is unticked', () => {
        const pinia = createTestingPinia();
        const store = useMusicStore();
        jest.spyOn(store, 'setNowPlayingSource');
        const wrapper = mount(ManualSongEditor, {
            global: {
                plugins: [ pinia ]
            }
        });

        wrapper.getComponent<typeof IplCheckbox>('[data-test="enable-manual-input-checkbox"]').vm.$emit('update:modelValue', false);

        expect(store.setNowPlayingSource).toHaveBeenCalledWith('lastfm');
    });

    it('updates data if unfocused', async () => {
        const pinia = createTestingPinia();
        const store = useMusicStore();
        store.manualNowPlaying = { song: 'cool song', artist: 'dope artist' };
        const wrapper = mount(ManualSongEditor, {
            global: {
                plugins: [ pinia ]
            }
        });

        store.manualNowPlaying = { song: 'dope song', artist: 'cool artist' };
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[name="artist"]').attributes().modelvalue).toEqual('cool artist');
        expect(wrapper.getComponent('[name="song"]').attributes().modelvalue).toEqual('dope song');
    });

    it('does not update data if any field is focused', async () => {
        const pinia = createTestingPinia();
        const store = useMusicStore();
        store.manualNowPlaying = { song: 'cool song', artist: 'dope artist' };
        const wrapper = mount(ManualSongEditor, {
            global: {
                plugins: [ pinia ]
            }
        });
        const artistInput = wrapper.getComponent<typeof IplInput>('[name="artist"]');

        artistInput.vm.$emit('focuschange', true);
        store.manualNowPlaying = { song: 'dope song', artist: 'cool artist' };
        await wrapper.vm.$nextTick();

        expect(artistInput.attributes().modelvalue).toEqual('dope artist');
        expect(wrapper.getComponent('[name="song"]').attributes().modelvalue).toEqual('cool song');
    });

    it('has expected button color if data is not updated', () => {
        const pinia = createTestingPinia();
        const store = useMusicStore();
        store.manualNowPlaying = { song: 'cool song', artist: 'dope artist' };
        const wrapper = mount(ManualSongEditor, {
            global: {
                plugins: [ pinia ]
            }
        });

        expect(wrapper.getComponent('[data-test="manual-song-update-button"]').attributes().color).toEqual('blue');
    });

    it('has expected button color if data is updated', async () => {
        const pinia = createTestingPinia();
        const store = useMusicStore();
        store.manualNowPlaying = { song: 'cool song', artist: 'dope artist' };
        const wrapper = mount(ManualSongEditor, {
            global: {
                plugins: [ pinia ]
            }
        });

        wrapper.getComponent<typeof IplInput>('[name="artist"]').vm.$emit('update:modelValue', 'new artist');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="manual-song-update-button"]').attributes().color).toEqual('red');
    });

    it('commits update to store on update button click if data is changed', () => {
        const pinia = createTestingPinia();
        const store = useMusicStore();
        jest.spyOn(store, 'setManualNowPlaying');
        const wrapper = mount(ManualSongEditor, {
            global: {
                plugins: [ pinia ]
            }
        });

        wrapper.getComponent<typeof IplInput>('[name="artist"]').vm.$emit('update:modelValue', 'new artist');
        wrapper.getComponent<typeof IplInput>('[name="song"]').vm.$emit('update:modelValue', 'new song');
        wrapper.getComponent<typeof IplButton>('[data-test="manual-song-update-button"]').vm.$emit('click');

        expect(store.setManualNowPlaying).toHaveBeenCalledWith({ artist: 'new artist', song: 'new song' });
    });

    it('does not commit update to store if data has not changed', () => {
        const pinia = createTestingPinia();
        const store = useMusicStore();
        jest.spyOn(store, 'setManualNowPlaying');
        const wrapper = mount(ManualSongEditor, {
            global: {
                plugins: [ pinia ]
            }
        });

        wrapper.getComponent<typeof IplButton>('[data-test="manual-song-update-button"]').vm.$emit('click');

        expect(store.setManualNowPlaying).not.toHaveBeenCalled();
    });

    it('reverts changes when update button is right clicked', async () => {
        const pinia = createTestingPinia();
        const store = useMusicStore();
        store.manualNowPlaying.song = 'old song';
        store.manualNowPlaying.artist = 'old artist';
        const wrapper = mount(ManualSongEditor, {
            global: {
                plugins: [ pinia ]
            }
        });
        const event = new Event(null);
        jest.spyOn(event, 'preventDefault');

        wrapper.getComponent<typeof IplInput>('[name="artist"]').vm.$emit('update:modelValue', 'new artist');
        wrapper.getComponent<typeof IplInput>('[name="song"]').vm.$emit('update:modelValue', 'new song');
        await wrapper.vm.$nextTick();

        wrapper.getComponent<typeof IplButton>('[data-test="manual-song-update-button"]').vm.$emit('rightClick', event);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[name="artist"]').attributes().modelvalue).toEqual('old artist');
        expect(wrapper.getComponent('[name="song"]').attributes().modelvalue).toEqual('old song');
        expect(event.preventDefault).toHaveBeenCalled();
    });
});
