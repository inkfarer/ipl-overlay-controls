import { MockNodecg } from '../../__mocks__/mockNodecg_legacy';
import { dispatch, elementById } from '../../helpers/elemHelper';
import { PredictionStatus } from 'types/enums/predictionStatus';
import difference from 'lodash/difference';

describe('cancelPrediction', () => {
    let nodecg: MockNodecg;

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <button id="cancel-prediction-btn"></button>
            <div id="prediction-request-status"></div>`;

        require('../cancelPrediction');
    });

    describe('cancel-prediction-btn: confirm', () => {
        it('sends no message if current prediction does not exist', () => {
            nodecg.replicants.predictionStore.value = { currentPrediction: undefined };

            dispatch(elementById('cancel-prediction-btn'), 'confirm');

            expect(nodecg.sendMessage).not.toHaveBeenCalled();
        });

        difference(Object.values(PredictionStatus),
            [PredictionStatus.ACTIVE, PredictionStatus.LOCKED]).forEach(status => {
            it(`sends no message if status is ${status}`, () => {
                nodecg.replicants.predictionStore.value = { currentPrediction: { status: status } };

                dispatch(elementById('cancel-prediction-btn'), 'confirm');

                expect(nodecg.sendMessage).not.toHaveBeenCalled();
            });
        });

        difference(Object.values(PredictionStatus),
            [PredictionStatus.RESOLVED, PredictionStatus.CANCELED]).forEach(status => {
            it(`sends a message if status is ${status}`, () => {
                nodecg.replicants.predictionStore.value = {
                    currentPrediction: { status: status, id: '123123123' }
                };

                dispatch(elementById('cancel-prediction-btn'), 'confirm');

                expect(nodecg.sendMessage).toHaveBeenCalledWith('patchPrediction',
                    { id: '123123123', status: PredictionStatus.CANCELED }, expect.any(Function));
            });
        });
    });
});
