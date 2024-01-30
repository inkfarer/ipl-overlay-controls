import Rounds from '../rounds.vue';
import { config, mount } from '@vue/test-utils';
import { useNextRoundStore } from '../../store/nextRoundStore';
import { PlayType } from 'types/enums/playType';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useTournamentDataStore } from '../../store/tournamentDataStore';
import RoundEditor from '../components/roundEditor.vue';
import { IplButton, IplSpace } from '@iplsplatoon/vue-components';

describe('Rounds', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        FontAwesomeIcon: true,
        IplButton: true,
        RoundEditor: true,
        IplErrorDisplay: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

        useNextRoundStore().$state = {
            nextRound: {
                // @ts-ignore
                round: {
                    id: '2426'
                }
            }
        };

        useTournamentDataStore().$state = {
            tournamentData: {
                meta: { id: '1093478', source: 'SMASHGG', shortName: null },
                teams: [
                    { id: '123123', name: 'cool team A', players: [], showLogo: true },
                    { id: '345345', name: 'cool team B', players: [], showLogo: false }
                ]
            },
            roundStore: {
                '0387': {
                    meta: { name: 'dope round', type: PlayType.BEST_OF },
                    games: []
                },
                '9573': {
                    meta: { name: 'dope round the second', type: PlayType.PLAY_ALL },
                    games: []
                },
                '2426': {
                    meta: { name: 'dope round the third', type: PlayType.BEST_OF },
                    games: []
                }
            },
            matchStore: {}
        };
    });


    it('matches snapshot', () => {
        const wrapper = mount(Rounds, {
            global: {
                plugins: [ pinia ]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('resets round store on reset button click', () => {
        const tournamentDataStore = useTournamentDataStore();
        tournamentDataStore.resetRoundStore = jest.fn();
        const wrapper = mount(Rounds, {
            global: {
                plugins: [ pinia ]
            }
        });

        wrapper.getComponent<typeof IplButton>('[data-test="reset-rounds-button"]').vm.$emit('click');

        expect(tournamentDataStore.resetRoundStore).toHaveBeenCalled();
    });

    it('selects expected round by default', async () => {
        const wrapper = mount(Rounds, {
            global: {
                plugins: [ pinia ]
            }
        });
        const roundEditor = wrapper.getComponent<typeof RoundEditor>('[data-test="round-editor"]');

        expect(roundEditor.props().roundId).toEqual('2426');
        expect(roundEditor.props().round).toEqual({
            games: [],
            meta: {
                name: 'dope round the third',
                type: PlayType.BEST_OF
            }
        });
        expect(roundEditor.props().isNewRound).toEqual(false);
    });

    it('switches selected round when round is selected from sidebar', async () => {
        const wrapper = mount(Rounds, {
            global: {
                plugins: [ pinia ]
            }
        });
        const roundEditor = wrapper.getComponent<typeof RoundEditor>('[data-test="round-editor"]');

        wrapper.getComponent<typeof IplSpace>('[data-test="round-option-9573"]').vm.$emit('click');
        await wrapper.vm.$nextTick();

        expect(roundEditor.props().roundId).toEqual('9573');
        expect(roundEditor.props().round).toEqual({
            games: [],
            meta: {
                name: 'dope round the second',
                type: PlayType.PLAY_ALL
            }
        });
        expect(roundEditor.props().isNewRound).toEqual(false);
    });

    it('handles new 3-game round being created', async () => {
        const wrapper = mount(Rounds, {
            global: {
                plugins: [ pinia ]
            }
        });
        const roundEditor = wrapper.getComponent<typeof RoundEditor>('[data-test="round-editor"]');

        wrapper.getComponent<typeof IplButton>('[data-test="new-3-game-round"]').vm.$emit('click');
        await wrapper.vm.$nextTick();

        expect(roundEditor.props().round).toEqual({
            games: [
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' }
            ],
            meta: {
                name: 'New Round',
                type: PlayType.BEST_OF
            }
        });
        expect(roundEditor.props().isNewRound).toEqual(true);
    });

    it('handles new 5-game round being created', async () => {
        const wrapper = mount(Rounds, {
            global: {
                plugins: [ pinia ]
            }
        });
        const roundEditor = wrapper.getComponent<typeof RoundEditor>('[data-test="round-editor"]');

        wrapper.getComponent<typeof IplButton>('[data-test="new-5-game-round"]').vm.$emit('click');
        await wrapper.vm.$nextTick();

        expect(roundEditor.props().round).toEqual({
            games: [
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' }
            ],
            meta: {
                name: 'New Round',
                type: PlayType.BEST_OF
            }
        });
        expect(roundEditor.props().isNewRound).toEqual(true);
    });

    it('handles new 7-game round being created', async () => {
        const wrapper = mount(Rounds, {
            global: {
                plugins: [ pinia ]
            }
        });
        const roundEditor = wrapper.getComponent<typeof RoundEditor>('[data-test="round-editor"]');

        wrapper.getComponent<typeof IplButton>('[data-test="new-7-game-round"]').vm.$emit('click');
        await wrapper.vm.$nextTick();

        expect(roundEditor.props().round).toEqual({
            games: [
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' }
            ],
            meta: {
                name: 'New Round',
                type: PlayType.BEST_OF
            }
        });
        expect(roundEditor.props().isNewRound).toEqual(true);
    });

    it('handles round creation being cancelled', async () => {
        const wrapper = mount(Rounds, {
            global: {
                plugins: [ pinia ]
            }
        });
        const roundEditor = wrapper.getComponent<typeof RoundEditor>('[data-test="round-editor"]');

        wrapper.getComponent<typeof IplButton>('[data-test="new-7-game-round"]').vm.$emit('click');
        await wrapper.vm.$nextTick();
        roundEditor.vm.$emit('cancelNewRound');
        await wrapper.vm.$nextTick();

        expect(roundEditor.props().isNewRound).toEqual(false);
    });

    it('handles round being created', async () => {
        const wrapper = mount(Rounds, {
            global: {
                plugins: [ pinia ]
            }
        });
        const roundEditor = wrapper.getComponent<typeof RoundEditor>('[data-test="round-editor"]');

        wrapper.getComponent<typeof IplButton>('[data-test="new-7-game-round"]').vm.$emit('click');
        await wrapper.vm.$nextTick();
        roundEditor.vm.$emit('createNewRound', '0387');
        await wrapper.vm.$nextTick();

        expect(roundEditor.props().isNewRound).toEqual(false);
        expect(roundEditor.props().roundId).toEqual('0387');
        expect(roundEditor.props().round).toEqual({
            meta: { name: 'dope round', type: PlayType.BEST_OF },
            games: []
        });
    });
});
