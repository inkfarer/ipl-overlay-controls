import NextMatchStarter from '../nextMatchStarter.vue';
import { config, mount } from '@vue/test-utils';
import { PlayType } from 'types/enums/playType';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useNextRoundStore } from '../../../store/nextRoundStore';

describe('NextMatchStarter', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        IplDataRow: true,
        BeginNextMatch: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

        useNextRoundStore().$state = {
            nextRound: {
                teamA: { id: '123123', name: 'cool team A', showLogo: true, players: []},
                teamB: { id: '345345', name: 'cool team B (long name long name long name long name long name)', showLogo: false, players: []},
                round: { id: '0387', name: 'dope round', type: PlayType.PLAY_ALL },
                showOnStream: true,
                games: []
            }
        };
    });

    it('matches snapshot', () => {
        const wrapper = mount(NextMatchStarter, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });
});
