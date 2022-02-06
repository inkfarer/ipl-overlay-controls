import BeginNextMatch from '../beginNextMatch.vue';
import { createStore } from 'vuex';
import { config, mount } from '@vue/test-utils';
import { nextRoundStoreKey } from '../../store/nextRoundStore';
import { tournamentDataStoreKey } from '../../store/tournamentDataStore';

describe('BeginNextMatch', () => {
    const mockNextRoundHelper = {
        __esModule: true,
        generateMatchNameForRound: jest.fn()
    };

    jest.mock('../../../helpers/nextRound', () => mockNextRoundHelper);

    config.global.stubs = {
        IplInput: true,
        IplButton: true
    };

    function createNextRoundStore() {
        return createStore({
            actions: {
                beginNextMatch: jest.fn()
            }
        });
    }

    function createTournamentDataStore() {
        return createStore({
            state: {
                matchStore: {
                    match1: {
                        meta: { relatedRoundId: 'round1' }
                    }
                }
            }
        });
    }

    beforeEach(() => {
        mockNextRoundHelper.generateMatchNameForRound.mockReturnValue('Match Name');
    });

    it('matches snapshot', () => {
        const nextRoundStore = createNextRoundStore();
        const tournamentDataStore = createTournamentDataStore();
        const wrapper = mount(BeginNextMatch, {
            global: {
                plugins: [
                    [nextRoundStore, nextRoundStoreKey],
                    [tournamentDataStore, tournamentDataStoreKey]
                ]
            },
            props: {
                roundId: 'round1',
                roundName: 'Cool Round'
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('handles beginning next match', async () => {
        const nextRoundStore = createNextRoundStore();
        jest.spyOn(nextRoundStore, 'dispatch');
        const tournamentDataStore = createTournamentDataStore();
        const wrapper = mount(BeginNextMatch, {
            global: {
                plugins: [
                    [nextRoundStore, nextRoundStoreKey],
                    [tournamentDataStore, tournamentDataStoreKey]
                ]
            },
            props: {
                roundId: 'round1',
                roundName: 'Cool Round'
            }
        });

        wrapper.getComponent('[name="matchName"]').vm.$emit('update:modelValue', 'New Match');
        await wrapper.vm.$nextTick();
        wrapper.getComponent('[data-test="begin-next-match-button"]').vm.$emit('click');

        expect(nextRoundStore.dispatch).toHaveBeenCalledWith('beginNextMatch', { matchName: 'New Match' });
    });

    it('disables beginning match if match name is invalid', async () => {
        const nextRoundStore = createNextRoundStore();
        const tournamentDataStore = createTournamentDataStore();
        const wrapper = mount(BeginNextMatch, {
            global: {
                plugins: [
                    [nextRoundStore, nextRoundStoreKey],
                    [tournamentDataStore, tournamentDataStoreKey]
                ]
            },
            props: {
                roundId: 'round1',
                roundName: 'Cool Round'
            }
        });

        wrapper.getComponent('[name="matchName"]').vm.$emit('update:modelValue', '');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="begin-next-match-button"]').attributes().disabled).toEqual('true');
    });
});
