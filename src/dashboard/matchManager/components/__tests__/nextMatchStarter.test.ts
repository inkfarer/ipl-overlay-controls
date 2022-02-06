import NextMatchStarter from '../nextMatchStarter.vue';
import { createStore } from 'vuex';
import { NextRoundStore, nextRoundStoreKey } from '../../../store/nextRoundStore';
import { config, mount } from '@vue/test-utils';

describe('NextMatchStarter', () => {
    config.global.stubs = {
        IplDataRow: true,
        BeginNextMatch: true
    };

    function createNextRoundStore() {
        return createStore<NextRoundStore>({
            state: {
                nextRound: {
                    teamA: { id: '123123', name: 'cool team A', showLogo: true, players: []},
                    teamB: { id: '345345', name: 'cool team B (long name long name long name long name long name)', showLogo: false, players: []},
                    round: { id: '0387', name: 'dope round' },
                    showOnStream: true,
                    games: []
                }
            }
        });
    }

    it('matches snapshot', () => {
        const store = createNextRoundStore();
        const wrapper = mount(NextMatchStarter, {
            global: {
                plugins: [[store, nextRoundStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });
});
