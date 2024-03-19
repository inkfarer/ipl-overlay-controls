import TeamDataImporter from '../teamDataImporter.vue';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { config, flushPromises, mount } from '@vue/test-utils';
import { mockBundleConfig } from '../../../__mocks__/mockNodecg';
import * as stringHelper from '../../../helpers/stringHelper';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useTournamentDataStore } from '../../../store/tournamentDataStore';
import { IplButton, IplCheckbox, IplInput, IplRadio, IplSelect, IplUpload } from '@iplsplatoon/vue-components';

describe('teamDataImporter', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        IplButton: true,
        IplSelect: true,
        IplInput: true,
        IplUpload: true,
        IplRadio: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

        useTournamentDataStore().$state = {
            tournamentData: {
                meta: {
                    id: '123123',
                    source: TournamentDataSource.BATTLEFY,
                    shortName: null,
                    name: 'Tournament Name'
                },
                teams: []
            },
            roundStore: {},
            matchStore: {}
        };
    });

    it('matches snapshot', () => {
        const store = useTournamentDataStore();
        store.tournamentData.meta = {
            source: TournamentDataSource.BATTLEFY,
            id: '123123asd',
            name: 'Cool Tournament',
            shortName: 'Cool Tournament',
            url: 'tournament://cool-tournament'
        };
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it.each([TournamentDataSource.UPLOAD, TournamentDataSource.BATTLEFY, TournamentDataSource.UNKNOWN])('displays data of existing tournament when its source is %s', source => {
        const store = useTournamentDataStore();
        store.tournamentData.meta = {
            source,
            id: '123123asd',
            name: 'Cool Tournament',
            shortName: 'Cool Tournament',
            url: 'tournament://cool-tournament'
        };
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.get('[data-test="saved-data-section"]').html()).toMatchSnapshot();
    });

    it('displays data of existing tournament if it is missing a name', () => {
        const store = useTournamentDataStore();
        store.tournamentData.meta = {
            source: TournamentDataSource.BATTLEFY,
            id: '123123asd',
            url: 'tounament://cool-tournament',
            shortName: null
        };
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.get('[data-test="saved-data-section"]').html()).toMatchSnapshot();
    });

    it('displays data of existing tournament if it is missing an URL', () => {
        const store = useTournamentDataStore();
        store.tournamentData.meta = {
            source: TournamentDataSource.BATTLEFY,
            id: '123123asd',
            name: 'cool tournament',
            shortName: 'cool tournament'
        };
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.get('[data-test="saved-data-section"]').html()).toMatchSnapshot();
    });

    it('displays data of existing tournament if it has smash.gg data', () => {
        const store = useTournamentDataStore();
        store.tournamentData.meta = {
            source: TournamentDataSource.SMASHGG,
            id: '123123asd',
            name: 'cool tournament',
            shortName: 'cool tournament',
            url: 'smashgg://cool-tournament',
            sourceSpecificData: {
                smashgg: {
                    tournamentId: 1234,
                    eventData: {
                        id: 1234,
                        name: 'Cool Event',
                        game: 'Splatoon 2'
                    }
                }
            }
        };
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.get('[data-test="saved-data-section"]').html()).toMatchSnapshot();
    });

    it('has expected data source options if bundle config is present', () => {
        mockBundleConfig.smashgg = { apiKey: 'ggkey123' };
        mockBundleConfig.sendouInk = { apiKey: 'sendoukey345' };
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [pinia]
            }
        });
        const sourceSelector = wrapper.getComponent<typeof IplRadio>('[data-test="source-selector"]');

        expect((sourceSelector.vm.$props as { options: unknown }).options).toEqual([
            { name: 'Battlefy', value: TournamentDataSource.BATTLEFY, disabled: false },
            { name: 'Smash.gg', value: TournamentDataSource.SMASHGG, disabled: false },
            { name: 'Uploaded file', value: TournamentDataSource.UPLOAD, disabled: false },
            { name: 'sendou.ink', value: TournamentDataSource.SENDOU_INK, disabled: false }
        ]);
    });

    it('has expected data source options if bundle config is not present', () => {
        mockBundleConfig.smashgg = undefined;
        mockBundleConfig.sendouInk = undefined;
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [pinia]
            }
        });
        const sourceSelector = wrapper.getComponent<typeof IplRadio>('[data-test="source-selector"]');

        expect((sourceSelector.vm.$props as { options: unknown }).options).toEqual([
            { name: 'Battlefy', value: TournamentDataSource.BATTLEFY, disabled: false },
            { name: 'Smash.gg', value: TournamentDataSource.SMASHGG, disabled: true },
            { name: 'Uploaded file', value: TournamentDataSource.UPLOAD, disabled: false },
            { name: 'sendou.ink', value: TournamentDataSource.SENDOU_INK, disabled: true }
        ]);
    });

    it('dispatches to store on import', () => {
        const store = useTournamentDataStore();
        store.getTournamentData = jest.fn();
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplRadio>('[data-test="source-selector"]').vm.$emit('update:modelValue', 'SMASHGG');
        wrapper.getComponent<typeof IplInput>('[name="tournament-id-input"]').vm.$emit('update:modelValue', 'cool-tourney');
        wrapper.getComponent<typeof IplButton>('[data-test="import-button"]').vm.$emit('click');

        expect(store.getTournamentData).toHaveBeenCalledWith({
            method: TournamentDataSource.SMASHGG,
            id: 'cool-tourney'
        });
    });

    it('extracts battlefy tournament URL on import', () => {
        const store = useTournamentDataStore();
        store.getTournamentData = jest.fn();
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [pinia]
            }
        });
        jest.spyOn(stringHelper, 'extractBattlefyTournamentId').mockReturnValue('battlefy-tournament-id');

        wrapper.getComponent<typeof IplRadio>('[data-test="source-selector"]').vm.$emit('update:modelValue', 'BATTLEFY');
        wrapper.getComponent<typeof IplInput>('[name="tournament-id-input"]').vm.$emit('update:modelValue', 'cool-tourney');
        wrapper.getComponent<typeof IplButton>('[data-test="import-button"]').vm.$emit('click');

        expect(store.getTournamentData).toHaveBeenCalledWith({
            method: TournamentDataSource.BATTLEFY,
            id: 'battlefy-tournament-id'
        });
        expect(stringHelper.extractBattlefyTournamentId).toHaveBeenCalled();
    });

    it('dispatches to store on import if file upload is enabled but source is not set to UPLOAD', async () => {
        const store = useTournamentDataStore();
        store.getTournamentData = jest.fn();
        store.uploadTeamData = jest.fn();
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplRadio>('[data-test="source-selector"]').vm.$emit('update:modelValue', 'SMASHGG');
        wrapper.getComponent<typeof IplInput>('[name="tournament-id-input"]').vm.$emit('update:modelValue', 'cool-tourney');
        wrapper.getComponent<typeof IplCheckbox>('[data-test="use-file-upload-checkbox"]').vm.$emit('update:modelValue', true);
        await wrapper.vm.$nextTick();
        wrapper.getComponent<typeof IplButton>('[data-test="import-button"]').vm.$emit('click');

        expect(store.getTournamentData).toHaveBeenCalledWith({
            method: TournamentDataSource.SMASHGG,
            id: 'cool-tourney'
        });
        expect(store.uploadTeamData).not.toHaveBeenCalled();
    });

    it('dispatches to store on file import', async () => {
        const file = new File([], 'mock-file');
        const store = useTournamentDataStore();
        store.uploadTeamData = jest.fn();
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplRadio>('[data-test="source-selector"]').vm.$emit('update:modelValue', 'UPLOAD');
        wrapper.getComponent<typeof IplCheckbox>('[data-test="use-file-upload-checkbox"]').vm.$emit('update:modelValue', true);
        wrapper.getComponent<typeof IplUpload>('[data-test="team-data-upload"]').vm.$emit('update:modelValue', file);
        await wrapper.vm.$nextTick();
        wrapper.getComponent<typeof IplButton>('[data-test="import-button"]').vm.$emit('click');

        expect(store.uploadTeamData).toHaveBeenCalledWith({ file });
    });

    it('shows smash.gg event selector if import returns more than one event', async () => {
        const store = useTournamentDataStore();
        store.getTournamentData = jest.fn().mockResolvedValue({
            events: [
                { id: 123123, name: 'Event One', game: 'Splatoon 2' },
                { id: 456456, name: 'Event Two', game: 'Ultimate' }
            ]
        });
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplButton>('[data-test="import-button"]').vm.$emit('click');
        await flushPromises();

        expect(wrapper.findComponent('[data-test="smashgg-event-selector"]').exists()).toEqual(true);
        expect(wrapper.findComponent('[data-test="smashgg-event-import-button"]').exists()).toEqual(true);
        expect(wrapper.findComponent('[data-test="smashgg-event-import-cancel-button"]').exists()).toEqual(true);
        expect(wrapper.findComponent('[data-test="import-button"]').exists()).toEqual(false);
    });

    it('dispatches to store on smash.gg event import', async () => {
        const store = useTournamentDataStore();
        store.getSmashggEvent = jest.fn().mockResolvedValue({});
        store.getTournamentData = jest.fn().mockResolvedValue({
            events: [
                { id: 123123, name: 'Event One', game: 'Splatoon 2' },
                { id: 456456, name: 'Event Two', game: 'Ultimate' }
            ]
        });
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplButton>('[data-test="import-button"]').vm.$emit('click');
        await flushPromises();
        wrapper.getComponent<typeof IplSelect>('[data-test="smashgg-event-selector"]').vm.$emit('update:modelValue', '456456');
        wrapper.getComponent<typeof IplButton>('[data-test="smashgg-event-import-button"]').vm.$emit('click');
        await flushPromises();

        expect(store.getSmashggEvent).toHaveBeenCalledWith({ eventId: 456456 });
        expect(wrapper.findComponent('[data-test="import-button"]').exists()).toEqual(true);
    });

    it('handles smash.gg event import being cancelled', async () => {
        const store = useTournamentDataStore();
        store.getSmashggEvent = jest.fn();
        store.getTournamentData = jest.fn().mockResolvedValue({
            events: [
                { id: 123123, name: 'Event One', game: 'Splatoon 2' },
                { id: 456456, name: 'Event Two', game: 'Ultimate' }
            ]
        });
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplButton>('[data-test="import-button"]').vm.$emit('click');
        await flushPromises();
        wrapper.getComponent<typeof IplButton>('[data-test="smashgg-event-import-cancel-button"]').vm.$emit('click');
        await wrapper.vm.$nextTick();

        expect(store.getSmashggEvent).not.toHaveBeenCalled();
        expect(wrapper.findComponent('[data-test="import-button"]').exists()).toEqual(true);
    });

    it('shows uploader if selected source is UPLOAD and file upload is enabled', async () => {
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplRadio>('[data-test="source-selector"]').vm.$emit('update:modelValue', 'UPLOAD');
        wrapper.getComponent<typeof IplCheckbox>('[data-test="use-file-upload-checkbox"]').vm.$emit('update:modelValue', true);
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent('[data-test="team-data-upload"]').isVisible()).toEqual(true);
        expect(wrapper.findComponent('[name="tournament-id-input"]').isVisible()).toEqual(false);
    });

    it('shows ID input if selected source is UPLOAD and file upload is disabled', async () => {
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplRadio>('[data-test="source-selector"]').vm.$emit('update:modelValue', 'UPLOAD');
        wrapper.getComponent<typeof IplCheckbox>('[data-test="use-file-upload-checkbox"]').vm.$emit('update:modelValue', false);
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent('[data-test="team-data-upload"]').isVisible()).toEqual(false);
        expect(wrapper.findComponent('[name="tournament-id-input"]').isVisible()).toEqual(true);
    });

    it('shows ID input if selected source is not UPLOAD and file upload is enabled', async () => {
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplCheckbox>('[data-test="use-file-upload-checkbox"]').vm.$emit('update:modelValue', true);
        wrapper.getComponent<typeof IplRadio>('[data-test="source-selector"]').vm.$emit('update:modelValue', 'BATTLEFY');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent('[data-test="team-data-upload"]').isVisible()).toEqual(false);
        expect(wrapper.findComponent('[name="tournament-id-input"]').isVisible()).toEqual(true);
    });

    it('handles updating short name', async () => {
        const store = useTournamentDataStore();
        store.setShortName = jest.fn();
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplInput>('[name="shortName"]').vm.$emit('update:modelValue', 'Tournament Name');
        wrapper.getComponent<typeof IplButton>('[data-test="update-short-name-button"]').vm.$emit('click');
        await wrapper.vm.$nextTick();

        expect(store.setShortName).toHaveBeenCalledWith('Tournament Name');
    });

    it('reverts short name changes on update button right click', async () => {
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [pinia]
            }
        });
        const event = new Event(null);
        jest.spyOn(event, 'preventDefault');

        wrapper.getComponent<typeof IplInput>('[name="shortName"]').vm.$emit('update:modelValue', 'Tourney Name');
        wrapper.getComponent<typeof IplButton>('[data-test="update-short-name-button"]').vm.$emit('rightClick', event);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[name="shortName"]').attributes().modelvalue).toEqual('Tournament Name');
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('handles refreshing tournament data', () => {
        const tournamentDataStore = useTournamentDataStore();
        tournamentDataStore.refreshTournamentData = jest.fn();
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplButton>('[data-test="refresh-button"]').vm.$emit('click');

        expect(tournamentDataStore.refreshTournamentData).toHaveBeenCalled();
    });
});
