import { MockNodecg } from '../../__mocks__/mockNodecg_legacy';
import { dispatch, elementById } from '../../helpers/elemHelper';
import difference from 'lodash/difference';
import { PredictionStatus } from 'types/enums/predictionStatus';

describe('lockPrediction', () => {
    let nodecg: MockNodecg;

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <button id="lock-prediction-btn"></button>
            <div id="prediction-request-status"></div>`;

        require('../lockPrediction');
    });

    describe('lock-prediction-btn: confirm', () => {
        it('sends no message if current prediction does not exist', () => {
            nodecg.replicants.predictionStore.value = { currentPrediction: undefined };

            dispatch(elementById('lock-prediction-btn'), 'confirm');

            expect(nodecg.sendMessage).not.toHaveBeenCalled();
        });

        difference(Object.values(PredictionStatus), [PredictionStatus.ACTIVE]).forEach(status => {
            it(`sends no message if status is ${status}`, () => {
                nodecg.replicants.predictionStore.value = { currentPrediction: { status: status } };

                dispatch(elementById('lock-prediction-btn'), 'confirm');

                expect(nodecg.sendMessage).not.toHaveBeenCalled();
            });
        });

        difference(Object.values(PredictionStatus),
            [PredictionStatus.RESOLVED, PredictionStatus.CANCELED, PredictionStatus.LOCKED]).forEach(status => {
            it(`sends a message if status is ${status}`, () => {
                nodecg.replicants.predictionStore.value = {
                    currentPrediction: { status: status, id: '123123123' }
                };

                dispatch(elementById('lock-prediction-btn'), 'confirm');

                expect(nodecg.sendMessage).toHaveBeenCalledWith('patchPrediction',
                    { id: '123123123', status: PredictionStatus.LOCKED }, expect.any(Function));
            });
        });
    });
});
