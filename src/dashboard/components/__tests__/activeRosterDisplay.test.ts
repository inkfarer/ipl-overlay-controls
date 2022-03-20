import ActiveRosterDisplay from '../activeRosterDisplay.vue';
import { config, mount } from '@vue/test-utils';
import { useActiveRoundStore } from '../../store/activeRoundStore';
import { createTestingPinia, TestingPinia } from '@pinia/testing';

describe('ActiveRosterDisplay', () => {
    let pinia: TestingPinia;

    beforeEach(() => {
        pinia = createTestingPinia();

        useActiveRoundStore().$state = {
            activeRound: {
                // @ts-ignore
                teamA: 'Team One',
                // @ts-ignore
                teamB: 'Team Two'
            }
        };
    });

    config.global.stubs = {
        TeamRosterDisplay: true
    };

    it('matches snapshot', () => {
        const wrapper = mount(ActiveRosterDisplay, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });
});
