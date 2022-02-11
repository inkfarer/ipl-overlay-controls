import ManualTeamPicker from '../manualTeamPicker.vue';
import { createStore } from 'vuex';
import { NextRoundStore, nextRoundStoreKey } from '../../../store/nextRoundStore';
import { config, mount } from '@vue/test-utils';
import { PlayType } from 'types/enums/playType';

describe('ManualTeamPicker', () => {
    config.global.stubs = {
        TeamSelect: true,
        RoundSelect: true,
        IplButton: true
    };

    function createNextRoundStore() {
        return createStore<NextRoundStore>({
            state: {
                nextRound: {
                    teamA: { id: '123123', name: 'cool team A', showLogo: true, players: []},
                    teamB: { id: '345345', name: 'cool team B', showLogo: false, players: []},
                    round: { id: '0387', name: 'dope round', type: PlayType.PLAY_ALL },
                    showOnStream: true,
                    games: []
                }
            },
            mutations: {
                setShowOnStream: jest.fn()
            },
            actions: {
                beginNextMatch: jest.fn(),
                setNextRound: jest.fn()
            }
        });
    }

    it('matches snapshot', () => {
        const store = createNextRoundStore();
        const wrapper = mount(ManualTeamPicker, {
            global: {
                plugins: [[store, nextRoundStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('changes button color when data is changed', async () => {
        const store = createNextRoundStore();
        const wrapper = mount(ManualTeamPicker, {
            global: {
                plugins: [[store, nextRoundStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="team-a-selector"]').vm.$emit('update:modelValue', '999999');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="update-button"]').attributes().color).toEqual('red');
    });

    it('handles updating data', async () => {
        const store = createNextRoundStore();
        jest.spyOn(store, 'dispatch');
        const wrapper = mount(ManualTeamPicker, {
            global: {
                plugins: [[store, nextRoundStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="team-a-selector"]').vm.$emit('update:modelValue', '999999');
        await wrapper.vm.$nextTick();
        wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');

        expect(store.dispatch).toHaveBeenCalledWith('setNextRound', {
            teamAId: '999999',
            teamBId: '345345',
            roundId: '0387'
        });
    });
});
