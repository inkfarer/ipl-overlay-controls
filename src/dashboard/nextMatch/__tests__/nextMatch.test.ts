import NextMatch from '../nextMatch.vue';
import { config, mount } from '@vue/test-utils';
import { useNextRoundStore } from '../../store/nextRoundStore';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { IplSmallToggle } from '@iplsplatoon/vue-components';

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

        useNextRoundStore().$state = {
            // @ts-ignore
            nextRound: {
                showOnStream: true
            }
        };
    });

    describe('template', () => {
        it('matches snapshot', () => {
            const wrapper = mount(NextMatch, {
                global: {
                    plugins: [pinia]
                }
            });

            expect(wrapper.html()).toMatchSnapshot();
        });

        it('matches snapshot when choosing teams manually', async () => {
            const wrapper = mount(NextMatch, {
                global: {
                    plugins: [pinia]
                }
            });

            wrapper.getComponent<typeof IplSmallToggle>('[data-test="choose-manually-toggle"]').vm.$emit('update:modelValue', true);
            await wrapper.vm.$nextTick();

            expect(wrapper.html()).toMatchSnapshot();
        });
    });

    it('handles changing show on stream checkbox', async () => {
        const store = useNextRoundStore();
        store.setShowOnStream = jest.fn();
        const wrapper = mount(NextMatch, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplSmallToggle>('[data-test="show-on-stream-toggle"]').vm.$emit('update:modelValue', false);
        await wrapper.vm.$nextTick();

        expect(store.setShowOnStream).toHaveBeenCalledWith(false);
    });
});
