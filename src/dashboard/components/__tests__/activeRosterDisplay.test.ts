import ActiveRosterDisplay from '../activeRosterDisplay.vue';
import { createStore } from 'vuex';
import { config, mount } from '@vue/test-utils';
import { activeRoundStoreKey } from '../../store/activeRoundStore';

describe('ActiveRosterDisplay', () => {
    config.global.stubs = {
        TeamRosterDisplay: true
    };

    function createActiveRoundStore() {
        return createStore({
            state: {
                activeRound: {
                    teamA: 'Team One',
                    teamB: 'Team Two'
                }
            }
        });
    }

    it('matches snapshot', () => {
        const store = createActiveRoundStore();
        const wrapper = mount(ActiveRosterDisplay, {
            global: {
                plugins: [[store, activeRoundStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });
});
