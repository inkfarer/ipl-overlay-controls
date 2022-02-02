import RoundImporter from '../roundImporter.vue';
import { config, mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { TournamentDataStore, tournamentDataStoreKey } from '../../../store/tournamentDataStore';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';

describe('roundImporter', () => {
    config.global.stubs = {
        IplButton: true,
        IplInput: true,
        IplUpload: true
    };

    const mockUploadRoundData = jest.fn();
    const mockFetchRoundData = jest.fn();

    function createTournamentDataStore() {
        return createStore<TournamentDataStore>({
            state: {
                tournamentData: {
                    meta: {
                        id: '123123',
                        source: TournamentDataSource.BATTLEFY
                    },
                    teams: []
                },
                roundStore: {},
                matchStore: {}
            },
            actions: {
                fetchRoundData: mockFetchRoundData,
                uploadRoundData: mockUploadRoundData
            }
        });
    }

    it('dispatches to store on URL import', async () => {
        const store = createTournamentDataStore();
        const wrapper = mount(RoundImporter, {
            global: {
                plugins: [[store, tournamentDataStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="use-file-upload-checkbox"]').vm.$emit('update:modelValue', false);
        wrapper.getComponent('[name="round-data-url"]').vm.$emit('update:modelValue', 'data://url');
        await wrapper.vm.$nextTick();
        wrapper.getComponent('[data-test="import-button"]').vm.$emit('click');

        expect(mockFetchRoundData).toHaveBeenCalledWith(expect.any(Object), { url: 'data://url' });
    });

    it('dispatches to store on file import', async () => {
        const store = createTournamentDataStore();
        const wrapper = mount(RoundImporter, {
            global: {
                plugins: [[store, tournamentDataStoreKey]]
            }
        });
        const file = new File([], 'test-file');

        wrapper.getComponent('[data-test="use-file-upload-checkbox"]').vm.$emit('update:modelValue', true);
        wrapper.getComponent('[data-test="round-file-upload"]').vm.$emit('update:modelValue', file);
        await wrapper.vm.$nextTick();
        wrapper.getComponent('[data-test="import-button"]').vm.$emit('click');

        expect(mockUploadRoundData).toHaveBeenCalledWith(expect.any(Object), { file });
    });

    it('shows uploader when file upload is selected', async () => {
        const store = createTournamentDataStore();
        const wrapper = mount(RoundImporter, {
            global: {
                plugins: [[store, tournamentDataStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="use-file-upload-checkbox"]').vm.$emit('update:modelValue', true);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="round-file-upload"]').isVisible()).toEqual(true);
        expect(wrapper.getComponent('[name="round-data-url"]').isVisible()).toEqual(false);
    });

    it('shows url input when file upload is deselected', async () => {
        const store = createTournamentDataStore();
        const wrapper = mount(RoundImporter, {
            global: {
                plugins: [[store, tournamentDataStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="use-file-upload-checkbox"]').vm.$emit('update:modelValue', false);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="round-file-upload"]').isVisible()).toEqual(false);
        expect(wrapper.getComponent('[name="round-data-url"]').isVisible()).toEqual(true);
    });
});
