import NextMatch from '../nextMatch.vue';
import { config, mount } from '@vue/test-utils';
import { useNextRoundStore } from '../../store/nextRoundStore';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { IplSmallToggle } from '@iplsplatoon/vue-components';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import difference from 'lodash/difference';
import { useHighlightedMatchStore } from '../highlightedMatchStore';

describe('NextMatch', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        HighlightedMatchPicker: true,
        ManualTeamPicker: true,
        IplErrorDisplay: true,
        IplCheckbox: true,
        IplSmallToggle: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();
        config.global.plugins = [pinia];

        useNextRoundStore().$state = {
            // @ts-ignore
            nextRound: {
                showOnStream: true
            }
        };
        // @ts-ignore
        useHighlightedMatchStore().tournamentData = { meta: { source: TournamentDataSource.BATTLEFY } };
    });

    describe('template', () => {
        it('matches snapshot', () => {
            const wrapper = mount(NextMatch);

            expect(wrapper.html()).toMatchSnapshot();
        });

        it('matches snapshot when choosing teams manually', async () => {
            const wrapper = mount(NextMatch);

            wrapper.getComponent<typeof IplSmallToggle>('[data-test="choose-manually-toggle"]').vm.$emit('update:modelValue', true);
            await wrapper.vm.$nextTick();

            expect(wrapper.html()).toMatchSnapshot();
        });
    });

    const importableSources = [
        TournamentDataSource.SMASHGG,
        TournamentDataSource.BATTLEFY,
        TournamentDataSource.SENDOU_INK
    ];

    it.each(difference(Object.values(TournamentDataSource), importableSources))('disables importing from source if the source is %s', source => {
        // @ts-ignore
        useHighlightedMatchStore().tournamentData = { meta: { source } };
        const wrapper = mount(NextMatch);

        const chooseManuallyToggle = wrapper.findComponent<typeof IplSmallToggle>('[data-test="choose-manually-toggle"]');
        expect(chooseManuallyToggle.exists()).toEqual(false);
    });

    it.each(importableSources)('allows importing from source if the source is %s', source => {
        // @ts-ignore
        useHighlightedMatchStore().tournamentData = { meta: { source } };
        const wrapper = mount(NextMatch);

        const chooseManuallyToggle = wrapper.findComponent<typeof IplSmallToggle>('[data-test="choose-manually-toggle"]');
        expect(chooseManuallyToggle.exists()).toEqual(true);
    });

    it('handles changing show on stream checkbox', async () => {
        const store = useNextRoundStore();
        store.setShowOnStream = jest.fn();
        const wrapper = mount(NextMatch);

        wrapper.getComponent<typeof IplSmallToggle>('[data-test="show-on-stream-toggle"]').vm.$emit('update:modelValue', false);
        await wrapper.vm.$nextTick();

        expect(store.setShowOnStream).toHaveBeenCalledWith(false);
    });
});
