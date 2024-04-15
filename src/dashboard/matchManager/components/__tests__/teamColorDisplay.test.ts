import { useActiveRoundStore } from '../../../store/activeRoundStore';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { config, mount } from '@vue/test-utils';
import TeamColorDisplay from '../teamColorDisplay.vue';

describe('teamColorDisplay', () => {
    let pinia: TestingPinia;

    beforeEach(() => {
        pinia = createTestingPinia();
        config.global.plugins = [pinia];

        const activeRoundStore = useActiveRoundStore();
        activeRoundStore.swapColorsInternally = false;
        activeRoundStore.activeRound = {
            // @ts-ignore
            teamA: {
                name: 'Cool First Team'
            },
            // @ts-ignore
            teamB: {
                name: 'Cool Second Team (long name for testing!!!!!!!!)'
            }
        };
    });

    it('matches snapshot', () => {
        const wrapper = mount(TeamColorDisplay, {
            props: {
                teamAColor: '#2C2CDB',
                teamBColor: '#F56522'
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when colors are missing', () => {
        const wrapper = mount(TeamColorDisplay, {
            props: {
                teamAColor: null,
                teamBColor: null
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when colors are swapped', () => {
        const activeRoundStore = useActiveRoundStore();
        activeRoundStore.swapColorsInternally = true;
        const wrapper = mount(TeamColorDisplay, {
            props: {
                teamAColor: '#2C2CDB',
                teamBColor: '#F56522'
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });
});
