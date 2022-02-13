import ScoreboardEditor from '../scoreboardEditor.vue';
import { config, mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { ScoreboardStore, scoreboardStoreKey } from '../../../store/scoreboardStore';

describe('ScoreboardEditor', () => {
    config.global.stubs = {
        IplToggle: true,
        IplDataRow: true
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

    it('matches snapshot', async () => {
        const store = createScoreboardStore();
        const wrapper = mount(ScoreboardEditor, {
            global: {
                plugins: [ [ store, scoreboardStoreKey ] ]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
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
});
