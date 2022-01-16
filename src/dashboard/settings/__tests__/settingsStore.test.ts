import { settingsStore } from '../settingsStore';
import { mockSendMessage, replicants } from '../../__mocks__/mockNodecg';

describe('settingsStore', () => {
    describe('setState', () => {
        it('updates state', () => {
            settingsStore.commit('setState', { name: 'lastFmSettings', val: { foo: 'bar' } });

            expect(settingsStore.state.lastFmSettings).toEqual({ foo: 'bar' });
        });
    });

    describe('setLastFmSettings', () => {
        it('updates replicant value', () => {
            settingsStore.commit('setLastFmSettings', { newValue: { new: 'value' } });

            expect(replicants.lastFmSettings).toEqual({ new: 'value' });
        });
    });

    describe('setRadiaSettings', () => {
        it('updates replicant value', () => {
            settingsStore.commit('setRadiaSettings', { newValue: { new: 'value' } });

            expect(replicants.radiaSettings).toEqual({ new: 'value' });
        });
    });

    describe('attemptRadiaConnection', () => {
        it('sends message', () => {
            settingsStore.dispatch('attemptRadiaConnection');

            expect(mockSendMessage).toHaveBeenCalledWith('retryRadiaAvailabilityCheck');
        });
    });
});
