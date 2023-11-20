import CreatePredictionDialog from '../createPredictionDialog.vue';
import { config, flushPromises, mount } from '@vue/test-utils';
import { PredictionStatus } from 'types/enums/predictionStatus';
import { mockDialog, mockGetDialog } from '../../__mocks__/mockNodecg';
import { closeDialog } from '../../helpers/dialogHelper';
import { PlayType } from 'types/enums/playType';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useNextRoundStore } from '../../store/nextRoundStore';
import { usePredictionDataStore } from '../../store/predictionDataStore';
import { IplButton, IplDialogTitle, IplInput } from '@iplsplatoon/vue-components';

jest.mock('../../helpers/dialogHelper');

describe('CreatePredictionDialog', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        IplInput: true,
        FontAwesomeIcon: true,
        IplErrorDisplay: true,
        IplDialogTitle: true
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

        usePredictionDataStore().$state = {
            predictionStore: {
                status: {
                    socketOpen: true,
                    predictionsEnabled: true
                },
                currentPrediction: {
                    id: 'prediction123',
                    broadcasterId: 'ipl',
                    broadcasterName: 'IPL',
                    broadcasterLogin: 'eye pee el',
                    title: 'Who will win?',
                    outcomes: [
                        {
                            id: 'outcome-1',
                            title: 'First Team',
                            users: 5,
                            pointsUsed: 10000,
                            topPredictors: [],
                            color: 'BLUE'
                        },
                        {
                            id: 'outcome-2',
                            title: 'Second Team',
                            users: 1,
                            pointsUsed: 1,
                            topPredictors: [],
                            color: 'PINK'
                        }
                    ],
                    duration: 60,
                    status: PredictionStatus.ACTIVE,
                    creationTime: '2020',
                }
            }
        };
    });

    it('matches snapshot when existing prediction is locked', () => {
        const predictionDataStore = usePredictionDataStore();
        predictionDataStore.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        const wrapper = mount(CreatePredictionDialog, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when existing prediction is active', () => {
        const predictionDataStore = usePredictionDataStore();
        predictionDataStore.predictionStore.currentPrediction.status = PredictionStatus.ACTIVE;
        const wrapper = mount(CreatePredictionDialog, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot', () => {
        const predictionDataStore = usePredictionDataStore();
        predictionDataStore.predictionStore.currentPrediction.status = PredictionStatus.RESOLVED;
        const wrapper = mount(CreatePredictionDialog, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('disables submit button if any fields are invalid', async () => {
        const predictionDataStore = usePredictionDataStore();
        predictionDataStore.predictionStore.currentPrediction.status = PredictionStatus.RESOLVED;
        const wrapper = mount(CreatePredictionDialog, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplInput>('[type="number"]').vm.$emit('update:modelValue', 0);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent<typeof IplButton>('[data-test="create-prediction-button"]').props().disabled).toEqual(true);
    });

    it('handles creating prediction and closes dialog on create button click', async () => {
        const predictionDataStore = usePredictionDataStore();
        predictionDataStore.createPrediction = jest.fn();
        predictionDataStore.predictionStore.currentPrediction.status = PredictionStatus.RESOLVED;
        const wrapper = mount(CreatePredictionDialog, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplInput>('[type="number"]').vm.$emit('update:modelValue', 128);
        wrapper.getComponent<typeof IplButton>('[data-test="create-prediction-button"]').vm.$emit('click');
        await flushPromises();

        expect(predictionDataStore.createPrediction).toHaveBeenCalledWith({
            title: 'Who do you think will win this match?',
            duration: 128,
            teamAName: 'cool team A',
            teamBName: 'cool team B'
        });
        expect(mockGetDialog).toHaveBeenCalledWith('createPredictionDialog');
        expect(mockDialog.close).toHaveBeenCalledTimes(1);
    });

    it('resets data to defaults on reset button click', async () => {
        const predictionDataStore = usePredictionDataStore();
        predictionDataStore.predictionStore.currentPrediction.status = PredictionStatus.RESOLVED;
        const wrapper = mount(CreatePredictionDialog, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplInput>('[type="number"]').vm.$emit('update:modelValue', 128);
        wrapper.getComponent<typeof IplInput>('[name="title"]').vm.$emit('update:modelValue', 'Who will win?');
        wrapper.getComponent<typeof IplInput>('[name="team-a-name"]').vm.$emit('update:modelValue', 'Team One!!!');
        wrapper.getComponent<typeof IplInput>('[name="team-b-name"]').vm.$emit('update:modelValue', 'Team Two?!?!?!?');
        wrapper.getComponent<typeof IplButton>('[data-test="reset-inputs-button"]').vm.$emit('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[type="number"]').attributes().modelvalue).toEqual('120');
        expect(wrapper.getComponent('[name="title"]').attributes().modelvalue).toEqual('Who do you think will win this match?');
        expect(wrapper.getComponent('[name="team-a-name"]').attributes().modelvalue).toEqual('cool team A');
        expect(wrapper.getComponent('[name="team-b-name"]').attributes().modelvalue).toEqual('cool team B');
    });

    it('closes dialog on dialog title close event', () => {
        const wrapper = mount(CreatePredictionDialog, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplDialogTitle>('ipl-dialog-title-stub').vm.$emit('close');

        expect(closeDialog).toHaveBeenCalledWith('createPredictionDialog');
    });
});
