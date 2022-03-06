import BeginNextMatch from '../beginNextMatch.vue';
import { createStore } from 'vuex';
import { config, mount } from '@vue/test-utils';
import { tournamentDataStoreKey } from '../../store/tournamentDataStore';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useNextRoundStore } from '../../store/nextRoundStore';

describe('BeginNextMatch', () => {
    let pinia: TestingPinia;

    const mockNextRoundHelper = {
        __esModule: true,
        generateMatchNameForRound: jest.fn()
    };

    beforeEach(() => {
        pinia = createTestingPinia();
    });

    jest.mock('../../../helpers/nextRound', () => mockNextRoundHelper);

    config.global.stubs = {
        IplInput: true,
        IplButton: true
    };

    function createTournamentDataStore() {
        return createStore({
            state: {
                matchStore: {
                    match1: {
                        meta: { name: 'Cool Round' }
                    }
                }
            }
        });
    }

    beforeEach(() => {
        mockNextRoundHelper.generateMatchNameForRound.mockReturnValue('Match Name');
    });

    it('matches snapshot', () => {
        const tournamentDataStore = createTournamentDataStore();
        const wrapper = mount(BeginNextMatch, {
            global: {
                plugins: [
                    pinia,
                    [tournamentDataStore, tournamentDataStoreKey]
                ]
            },
            props: {
                roundName: 'Cool Round'
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('handles beginning next match', async () => {
        const nextRoundStore = useNextRoundStore();
        nextRoundStore.beginNextMatch = jest.fn();
        const tournamentDataStore = createTournamentDataStore();
        const wrapper = mount(BeginNextMatch, {
            global: {
                plugins: [
                    pinia,
                    [tournamentDataStore, tournamentDataStoreKey]
                ]
            },
            props: {
                roundName: 'Cool Round'
            }
        });

        wrapper.getComponent('[name="matchName"]').vm.$emit('update:modelValue', 'New Match');
        await wrapper.vm.$nextTick();
        wrapper.getComponent('[data-test="begin-next-match-button"]').vm.$emit('click');

        expect(nextRoundStore.beginNextMatch).toHaveBeenCalledWith({ matchName: 'New Match' });
    });

    it('disables beginning match if match name is invalid', async () => {
        const tournamentDataStore = createTournamentDataStore();
        const wrapper = mount(BeginNextMatch, {
            global: {
                plugins: [
                    pinia,
                    [tournamentDataStore, tournamentDataStoreKey]
                ]
            },
            props: {
                roundName: 'Cool Round'
            }
        });

        wrapper.getComponent('[name="matchName"]').vm.$emit('update:modelValue', '');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="begin-next-match-button"]').attributes().disabled).toEqual('true');
    });
});
