import ScoreboardEditor from '../scoreboardEditor.vue';
import { config, mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { ScoreboardStore, scoreboardStoreKey } from '../../../store/scoreboardStore';

describe('ScoreboardEditor', () => {
    config.global.stubs = {
        IplInput: true,
        IplButton: true,
        IplToggle: true
    };

    const createScoreboardStore = () => {
        return createStore<ScoreboardStore>({
            state: {
                scoreboardData: {
                    flavorText: 'whoa',
                    isVisible: false
                }
            },
            mutations: {
                setFlavorText: jest.fn(),
                setScoreboardVisible: jest.fn()
            }
        });
    };

    it('updates flavor text from store if input is not focused', async () => {
        const store = createScoreboardStore();
        const wrapper = mount(ScoreboardEditor, {
            global: {
                plugins: [ [ store, scoreboardStoreKey ] ]
            }
        });

        store.state.scoreboardData.flavorText = 'new flavor text';
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent('[name="flavor-text"]').attributes().modelvalue).toEqual('new flavor text');
    });

    it('does not update flavor text from store if input is focused', async () => {
        const store = createScoreboardStore();
        const wrapper = mount(ScoreboardEditor, {
            global: {
                plugins: [ [ store, scoreboardStoreKey ] ]
            }
        });

        const flavorTextInput = wrapper.findComponent('[name="flavor-text"]');
        flavorTextInput.vm.$emit('focuschange', true);
        store.state.scoreboardData.flavorText = 'new flavor text';
        store.state.scoreboardData.isVisible = false;
        await wrapper.vm.$nextTick();

        expect(flavorTextInput.attributes().modelvalue).toEqual('whoa');
    });

    it('updates isVisible on store change', async () => {
        const store = createScoreboardStore();
        const wrapper = mount(ScoreboardEditor, {
            global: {
                plugins: [ [ store, scoreboardStoreKey ] ]
            }
        });

        store.state.scoreboardData.isVisible = false;
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent('[data-test="scoreboard-visible-toggle"]').attributes().modelvalue)
            .toEqual('false');
    });

    it('updates flavor text on button press', async () => {
        const store = createScoreboardStore();
        jest.spyOn(store, 'commit');
        const wrapper = mount(ScoreboardEditor, {
            global: {
                plugins: [ [ store, scoreboardStoreKey ] ]
            }
        });

        wrapper.findComponent('[name="flavor-text"]').vm.$emit('update:modelValue', 'flavor text!!!');
        wrapper.findComponent('[data-test="update-button"]').vm.$emit('click');

        expect(store.commit).toHaveBeenCalledWith('setFlavorText', 'flavor text!!!');
    });

    it('updates scoreboard visible on toggle interaction', async () => {
        const store = createScoreboardStore();
        jest.spyOn(store, 'commit');
        const wrapper = mount(ScoreboardEditor, {
            global: {
                plugins: [ [ store, scoreboardStoreKey ] ]
            }
        });

        wrapper.findComponent('[data-test="scoreboard-visible-toggle"]').vm.$emit('update:modelValue', true);

        expect(store.commit).toHaveBeenCalledWith('setScoreboardVisible', true);
    });

    it('colors update button when data is updated', async () => {
        const store = createScoreboardStore();
        const wrapper = mount(ScoreboardEditor, {
            global: {
                plugins: [ [ store, scoreboardStoreKey ] ]
            }
        });

        const button = wrapper.findComponent('[data-test="update-button"]');
        expect(button.attributes().color).toEqual('blue');
        wrapper.findComponent('[name="flavor-text"]').vm.$emit('update:modelValue', 'flavor text!!!');
        await wrapper.vm.$nextTick();

        expect(button.attributes().color).toEqual('red');
    });
});
