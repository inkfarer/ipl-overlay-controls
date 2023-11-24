import ManualTeamPicker from '../manualTeamPicker.vue';
import { config, mount } from '@vue/test-utils';
import { PlayType } from 'types/enums/playType';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useNextRoundStore } from '../../../store/nextRoundStore';
import { IplButton, IplInput, IplSelect } from '@iplsplatoon/vue-components';

describe('ManualTeamPicker', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        TeamSelect: true,
        RoundSelect: true,
        IplButton: true,
        IplInput: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

        useNextRoundStore().$state = {
            nextRound: {
                teamA: { id: '123123', name: 'cool team A', showLogo: true, players: []},
                teamB: { id: '345345', name: 'cool team B', showLogo: false, players: []},
                round: { id: '0387', name: 'dope round', type: PlayType.PLAY_ALL },
                showOnStream: true,
                games: [],
                name: 'test next round'
            }
        };
    });

    it('matches snapshot', () => {
        const wrapper = mount(ManualTeamPicker, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('changes button color when data is changed', async () => {
        const wrapper = mount(ManualTeamPicker, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplSelect>('[data-test="team-a-selector"]').vm.$emit('update:modelValue', '999999');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="update-button"]').attributes().color).toEqual('red');
    });

    it('handles updating data', async () => {
        const store = useNextRoundStore();
        store.setNextRound = jest.fn();
        const wrapper = mount(ManualTeamPicker, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplSelect>('[data-test="team-a-selector"]').vm.$emit('update:modelValue', '999999');
        wrapper.getComponent<typeof IplInput>('[name="match-name"]').vm.$emit('update:modelValue', 'test updated round name');
        await wrapper.vm.$nextTick();
        wrapper.getComponent<typeof IplButton>('[data-test="update-button"]').vm.$emit('click');

        expect(store.setNextRound).toHaveBeenCalledWith({
            teamAId: '999999',
            teamBId: '345345',
            roundId: '0387',
            name: 'test updated round name'
        });
    });

    it('reverts changes on update button right click', async () => {
        const wrapper = mount(ManualTeamPicker, {
            global: {
                plugins: [pinia]
            }
        });
        const event = new Event(null);
        jest.spyOn(event, 'preventDefault');

        wrapper.getComponent<typeof IplSelect>('[data-test="team-a-selector"]').vm.$emit('update:modelValue', '999999');
        wrapper.getComponent<typeof IplSelect>('[data-test="round-selector"]').vm.$emit('update:modelValue', '098098');
        wrapper.getComponent<typeof IplButton>('[data-test="update-button"]').vm.$emit('rightClick', event);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="team-a-selector"]').attributes().modelvalue).toEqual('123123');
        expect(wrapper.getComponent('[data-test="round-selector"]').attributes().modelvalue).toEqual('0387');
        expect(event.preventDefault).toHaveBeenCalled();
    });
});
