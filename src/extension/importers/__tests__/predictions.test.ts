import { MockNodecg } from '../../__mocks__/mockNodecg';
import { PredictionStore } from 'schemas';
import { PredictionStatus } from 'types/enums/predictionStatus';

jest.useFakeTimers();

describe('predictions', () => {
    const mockHasPredictionSupport = jest.fn();
    const mockGetPredictions = jest.fn();
    const mockCreatePrediction = jest.fn();
    const mockUpdatePrediction = jest.fn();
    let nodecg: MockNodecg;

    jest.mock('../clients/radiaClient', () => ({
        __esModule: true,
        hasPredictionSupport: mockHasPredictionSupport,
        getPredictions: mockGetPredictions,
        createPrediction: mockCreatePrediction,
        updatePrediction: mockUpdatePrediction
    }));

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
        nodecg = new MockNodecg({
            radia: {
                url: 'radia://api',
                authentication: 'radia_auth'
            }
        });
        nodecg.init();

        require('../predictions');
    });

    describe('radiaSettings', () => {
        beforeEach(() => {
            nodecg.replicants.predictionStore.value = { enablePrediction: null, currentPrediction: null };
        });

        it('sets replicant data if predictions are not supported', async () => {
            mockHasPredictionSupport.mockResolvedValue(false);

            await nodecg.replicantListeners.radiaSettings({ guildID: '104928194082103' });

            expect(mockHasPredictionSupport).toHaveBeenCalledWith('104928194082103');
            expect(nodecg.replicants.predictionStore.value).toEqual(
                { currentPrediction: null, enablePrediction: false });
        });

        it('sets replicant data if predictions are supported', async () => {
            mockHasPredictionSupport.mockResolvedValue(true);

            await nodecg.replicantListeners.radiaSettings({ guildID: '142235235' });

            expect(mockHasPredictionSupport).toHaveBeenCalledWith('142235235');
            expect(nodecg.replicants.predictionStore.value).toEqual(
                { currentPrediction: null, enablePrediction: true });
        });

        it('fetches prediction data if supported', async () => {
            mockHasPredictionSupport.mockResolvedValue(true);
            mockGetPredictions.mockResolvedValue([
                { id: 'FIRST-PREDICTION', outcomes: [ ]},
                { id: 'SECOND-PREDICTION', outcomes: [ ]}
            ]);

            await nodecg.replicantListeners.radiaSettings({ guildID: '142235235' });

            expect((nodecg.replicants.predictionStore.value as PredictionStore).currentPrediction)
                .toEqual({ id: 'FIRST-PREDICTION', outcomes: [ ]});
        });
    });

    describe('predictionStore', () => {
        beforeEach(() => {
            jest.spyOn(global, 'setInterval');
            nodecg.replicants.predictionStore.value = { currentPrediction: null };
        });

        // Async timer callbacks are a pain to test, so this is only partially covered.
        // In addition, this logic is planned to be replaced in 3.1.0.
        it('fetches prediction data periodically if prediction status is active', async () => {
            mockGetPredictions.mockResolvedValue([
                { id: 'FIRST-PREDICTION', outcomes: [ ]},
                { id: 'SECOND-PREDICTION', outcomes: [ ]}
            ]);
            nodecg.replicantListeners.predictionStore({
                currentPrediction: { status: PredictionStatus.ACTIVE }
            });
            nodecg.replicants.radiaSettings.value = { guildID: '109874593285' };

            expect(setInterval).toHaveBeenCalledTimes(1);
            expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 25000);

            jest.runOnlyPendingTimers();

            expect(mockGetPredictions).toHaveBeenCalled();
        });
    });

    describe('getPredictions', () => {
        beforeEach(() => {
            nodecg.replicants.radiaSettings.value = { guildID: '5209358732' };
            nodecg.replicants.predictionStore.value = { currentPrediction: null };
        });

        it('fetches prediction data', async () => {
            const expectedPrediction = { id: 'FIRST-PREDICTION', outcomes: [{ }]};
            mockGetPredictions.mockResolvedValue([
                expectedPrediction,
                { id: 'SECOND-PREDICTION', outcomes: [ ]}
            ]);
            const ack = jest.fn();

            await nodecg.messageListeners.getPredictions(null, ack);

            expect(mockGetPredictions).toHaveBeenCalledWith('5209358732');
            expect(ack).toHaveBeenCalledWith(null, expectedPrediction);
            expect((nodecg.replicants.predictionStore.value as PredictionStore).currentPrediction)
                .toEqual(expectedPrediction);
        });

        it('does not assign prediction data if an empty response is found', async () => {
            mockGetPredictions.mockResolvedValue([ ]);
            const ack = jest.fn();

            await nodecg.messageListeners.getPredictions(null, ack);

            expect(ack).toHaveBeenCalledWith(null, null);
            expect((nodecg.replicants.predictionStore.value as PredictionStore).currentPrediction).toBeNull();
        });

        it('handles errors', async () => {
            mockGetPredictions.mockRejectedValue('error');
            const ack = jest.fn();

            await nodecg.messageListeners.getPredictions(null, ack);

            expect(ack).toHaveBeenCalledWith('error');
        });
    });

    describe('postPrediction', () => {
        beforeEach(() => {
            nodecg.replicants.radiaSettings.value = { guildID: '2057205' };
            nodecg.replicants.predictionStore.value = { currentPrediction: null };
        });

        it('sends given data to API client', async () => {
            const apiResponse = { id: 'UPDATED-PREDICTION', outcomes: [{ }]};
            const message = { status: 'RESOLVED' };
            mockCreatePrediction.mockResolvedValue(apiResponse);
            const ack = jest.fn();

            await nodecg.messageListeners.postPrediction(message, ack);

            expect(ack).toHaveBeenCalledWith(null, apiResponse);
            expect(mockCreatePrediction).toHaveBeenCalledWith('2057205', message);
            expect((nodecg.replicants.predictionStore.value as PredictionStore).currentPrediction).toEqual(apiResponse);
        });

        it('handles errors', async () => {
            mockCreatePrediction.mockRejectedValue('error');
            const ack = jest.fn();

            await nodecg.messageListeners.postPrediction({ }, ack);

            expect(ack).toHaveBeenCalledWith('error');
        });
    });

    describe('patchPrediction', () => {
        beforeEach(() => {
            nodecg.replicants.radiaSettings.value = { guildID: '2057205' };
            nodecg.replicants.predictionStore.value = { currentPrediction: null };
        });

        it('sends given data to API client', async () => {
            const apiResponse = { id: 'UPDATED-PREDICTION', outcomes: [{ }]};
            const message = { status: 'RESOLVED' };
            mockUpdatePrediction.mockResolvedValue(apiResponse);
            const ack = jest.fn();

            await nodecg.messageListeners.patchPrediction(message, ack);

            expect(ack).toHaveBeenCalledWith(null, apiResponse);
            expect(mockUpdatePrediction).toHaveBeenCalledWith('2057205', message);
            expect((nodecg.replicants.predictionStore.value as PredictionStore).currentPrediction).toEqual(apiResponse);
        });

        it('handles errors', async () => {
            mockUpdatePrediction.mockRejectedValue('error');
            const ack = jest.fn();

            await nodecg.messageListeners.patchPrediction({ }, ack);

            expect(ack).toHaveBeenCalledWith('error');
        });
    });
});
