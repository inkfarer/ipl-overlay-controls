import BeginNextMatch from '../beginNextMatch.vue';
import { config, mount } from '@vue/test-utils';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useNextRoundStore } from '../../store/nextRoundStore';
import { useTournamentDataStore } from '../../store/tournamentDataStore';

describe('BeginNextMatch', () => {
    let pinia: TestingPinia;

    const mockNextRoundHelper = {
        __esModule: true,
        generateMatchNameForRound: jest.fn()
    };

    beforeEach(() => {
        mockNextRoundHelper.generateMatchNameForRound.mockReturnValue('Match Name');

        pinia = createTestingPinia();

        useTournamentDataStore().$state = {
            matchStore: {
                match1: {
                    // @ts-ignore
                    meta: { name: 'Cool Round' }
                }
            }
        };
    });

    jest.mock('../../../helpers/nextRound', () => mockNextRoundHelper);

    config.global.stubs = {
        IplInput: true,
        IplButton: true
    };

    it('matches snapshot', () => {
        const wrapper = mount(BeginNextMatch, {
            global: {
                plugins: [ pinia ]
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
        const wrapper = mount(BeginNextMatch, {
            global: {
                plugins: [ pinia ]
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
        const wrapper = mount(BeginNextMatch, {
            global: {
                plugins: [ pinia ]
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
