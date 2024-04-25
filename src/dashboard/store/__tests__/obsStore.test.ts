import { useObsStore } from '../obsStore';
import { mockSendMessage } from '../../__mocks__/mockNodecg';
import { createPinia, setActivePinia } from 'pinia';

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
});
