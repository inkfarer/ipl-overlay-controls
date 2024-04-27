import { useObsStore } from '../obsStore';
import { mockSendMessage } from '../../__mocks__/mockNodecg';
import { createPinia, setActivePinia } from 'pinia';
import { ObsStatus } from 'types/enums/ObsStatus';

describe('obsStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('connect', () => {
        it('sends message to connect to OBS', () => {
            const store = useObsStore();

            store.connect({ address: 'localhost', password: 'pwd' });

            expect(mockSendMessage).toHaveBeenCalledWith('connectToObs', { address: 'localhost', password: 'pwd' });
        });
    });

    describe('startGame', () => {
        it('sends message to extension', () => {
            const store = useObsStore();

            store.startGame();

            expect(mockSendMessage).toHaveBeenCalledWith('startGame');
        });
    });

    describe('endGame', () => {
        it('sends message to extension', () => {
            const store = useObsStore();

            store.endGame();

            expect(mockSendMessage).toHaveBeenCalledWith('endGame');
        });
    });

    describe('fastForwardToNextGameAutomationTask', () => {
        it('sends message to extension', () => {
            const store = useObsStore();

            store.fastForwardToNextGameAutomationTask();

            expect(mockSendMessage).toHaveBeenCalledWith('fastForwardToNextGameAutomationTask');
        });
    });

    describe('setEnabled', () => {
        it('sends message to extension', () => {
            const store = useObsStore();

            store.setEnabled(false);

            expect(mockSendMessage).toHaveBeenCalledWith('setObsSocketEnabled', false);
        });
    });

    describe('currentConfig', () => {
        it('returns nothing if current scene collection is unknown', () => {
            const store = useObsStore();
            store.obsState = { enabled: true, status: ObsStatus.CONNECTED };
            store.obsConfig = [];
            expect(store.currentConfig).toBeUndefined();
        });

        it('returns nothing if current scene collection has no config', () => {
            const store = useObsStore();
            store.obsState = {
                enabled: true,
                status: ObsStatus.CONNECTED,
                currentSceneCollection: 'test-scene-collection'
            };
            store.obsConfig = [];
            expect(store.currentConfig).toBeUndefined();
        });

        it('returns config for the current scene collection', () => {
            const store = useObsStore();
            store.obsState = {
                enabled: true,
                status: ObsStatus.CONNECTED,
                currentSceneCollection: 'test-scene-collection'
            };
            store.obsConfig = [
                { sceneCollection: 'test-scene-collection-2', gameplayInput: 'test-gameplay-input-2' },
                { sceneCollection: 'test-scene-collection', gameplayInput: 'test-gameplay-input' }
            ];

            expect(store.currentConfig).toEqual({ sceneCollection: 'test-scene-collection', gameplayInput: 'test-gameplay-input' });
        });
    });
});
