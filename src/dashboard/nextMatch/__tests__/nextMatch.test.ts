import NextMatch from '../nextMatch.vue';
import { createStore } from 'vuex';
import { config, mount } from '@vue/test-utils';
import { nextRoundStoreKey } from '../../store/nextRoundStore';

describe('NextMatch', () => {
    config.global.stubs = {
        HighlightedMatchPicker: true,
        ManualTeamPicker: true,
        IplErrorDisplay: true,
        IplCheckbox: true
    };

    function createNextRoundStore() {
        return createStore({
            state: {
                nextRound: {
                    showOnStream: true
                }
            },
            mutations: {
                setShowOnStream: jest.fn()
            }
        });
    }

    describe('template', () => {
        it('matches snapshot', () => {
            const store = createNextRoundStore();
            const wrapper = mount(NextMatch, {
                global: {
                    plugins: [[store, nextRoundStoreKey]]
                }
            });

            expect(wrapper.html()).toMatchSnapshot();
        });

        it('matches snapshot when choosing teams manually', async () => {
            const store = createNextRoundStore();
            const wrapper = mount(NextMatch, {
                global: {
                    plugins: [[store, nextRoundStoreKey]]
                }
            });

            wrapper.getComponent('[data-test="choose-manually-toggle"]').vm.$emit('update:modelValue', true);
            await wrapper.vm.$nextTick();

            expect(wrapper.html()).toMatchSnapshot();
        });
    });

    it('handles changing show on stream checkbox', async () => {
        const store = createNextRoundStore();
        jest.spyOn(store, 'commit');
        const wrapper = mount(NextMatch, {
            global: {
                plugins: [[store, nextRoundStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="show-on-stream-toggle"]').vm.$emit('update:modelValue', false);
        await wrapper.vm.$nextTick();

        expect(store.commit).toHaveBeenCalledWith('setShowOnStream', false);
    });
});
