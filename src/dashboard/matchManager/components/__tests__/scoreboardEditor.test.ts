import ScoreboardEditor from '../scoreboardEditor.vue';
import { config, mount } from '@vue/test-utils';
import { useScoreboardStore } from '../../../store/scoreboardStore';
import { createTestingPinia, TestingPinia } from '@pinia/testing';

describe('ScoreboardEditor', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        IplToggle: true,
        IplDataRow: true,
        FontAwesomeIcon: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

        useScoreboardStore().$state = {
            scoreboardData: {
                flavorText: 'whoa',
                isVisible: false
            }
        };
    });

    it('matches snapshot', async () => {
        const wrapper = mount(ScoreboardEditor, {
            global: {
                plugins: [ pinia ]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('updates isVisible on store change', async () => {
        const store = useScoreboardStore();
        const wrapper = mount(ScoreboardEditor, {
            global: {
                plugins: [ pinia ]
            }
        });

        store.scoreboardData.isVisible = false;
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent('[data-test="scoreboard-visible-toggle"]').attributes().modelvalue)
            .toEqual('false');
    });

    it('updates scoreboard visible on toggle interaction', async () => {
        const store = useScoreboardStore();
        store.setScoreboardVisible = jest.fn();
        const wrapper = mount(ScoreboardEditor, {
            global: {
                plugins: [ pinia ]
            }
        });

        wrapper.findComponent('[data-test="scoreboard-visible-toggle"]').vm.$emit('update:modelValue', true);

        expect(store.setScoreboardVisible).toHaveBeenCalledWith(true);
    });
});
