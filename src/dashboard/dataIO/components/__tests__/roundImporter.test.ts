import RoundImporter from '../roundImporter.vue';
import { config, mount } from '@vue/test-utils';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useTournamentDataStore } from '../../../store/tournamentDataStore';
import { IplButton, IplCheckbox, IplInput, IplUpload } from '@iplsplatoon/vue-components';

describe('roundImporter', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        IplButton: true,
        IplInput: true,
        IplUpload: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

        useTournamentDataStore().$state = {
            tournamentData: {
                meta: {
                    id: '123123',
                    source: TournamentDataSource.BATTLEFY,
                    shortName: 'A tournament'
                },
                teams: []
            },
            roundStore: {},
            matchStore: {}
        };
    });

    it('dispatches to store on URL import', async () => {
        const store = useTournamentDataStore();
        store.fetchRoundData = jest.fn();
        const wrapper = mount(RoundImporter, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplCheckbox>('[data-test="use-file-upload-checkbox"]').vm.$emit('update:modelValue', false);
        wrapper.getComponent<typeof IplInput>('[name="round-data-url"]').vm.$emit('update:modelValue', 'data://url');
        await wrapper.vm.$nextTick();
        wrapper.getComponent<typeof IplButton>('[data-test="import-button"]').vm.$emit('click');

        expect(store.fetchRoundData).toHaveBeenCalledWith({ url: 'data://url' });
    });

    it('dispatches to store on file import', async () => {
        const store = useTournamentDataStore();
        store.uploadRoundData = jest.fn();
        const wrapper = mount(RoundImporter, {
            global: {
                plugins: [pinia]
            }
        });
        const file = new File([], 'test-file');

        wrapper.getComponent<typeof IplCheckbox>('[data-test="use-file-upload-checkbox"]').vm.$emit('update:modelValue', true);
        wrapper.getComponent<typeof IplUpload>('[data-test="round-file-upload"]').vm.$emit('update:modelValue', file);
        await wrapper.vm.$nextTick();
        wrapper.getComponent<typeof IplButton>('[data-test="import-button"]').vm.$emit('click');

        expect(store.uploadRoundData).toHaveBeenCalledWith({ file });
    });

    it('shows uploader when file upload is selected', async () => {
        const wrapper = mount(RoundImporter, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplCheckbox>('[data-test="use-file-upload-checkbox"]').vm.$emit('update:modelValue', true);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="round-file-upload"]').isVisible()).toEqual(true);
        expect(wrapper.getComponent('[name="round-data-url"]').isVisible()).toEqual(false);
    });

    it('shows url input when file upload is deselected', async () => {
        const wrapper = mount(RoundImporter, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplCheckbox>('[data-test="use-file-upload-checkbox"]').vm.$emit('update:modelValue', false);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="round-file-upload"]').isVisible()).toEqual(false);
        expect(wrapper.getComponent('[name="round-data-url"]').isVisible()).toEqual(true);
    });
});
