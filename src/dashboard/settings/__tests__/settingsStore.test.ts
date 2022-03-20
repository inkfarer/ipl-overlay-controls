import { mockSendMessage, replicants } from '../../__mocks__/mockNodecg';
import { createPinia, setActivePinia } from 'pinia';
import { useSettingsStore } from '../settingsStore';
import { GameVersion } from 'types/enums/gameVersion';

describe('settingsStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('setLastFmSettings', () => {
        it('updates replicant value', () => {
            const store = useSettingsStore();

            // @ts-ignore
            store.setLastFmSettings({ newValue: { new: 'value' } });

            expect(replicants.lastFmSettings).toEqual({ new: 'value' });
        });
    });

    describe('setRadiaSettings', () => {
        it('updates replicant value', () => {
            const store = useSettingsStore();

            // @ts-ignore
            store.setRadiaSettings({ newValue: { new: 'value' } });

            expect(replicants.radiaSettings).toEqual({ new: 'value' });
        });
    });

    describe('attemptRadiaConnection', () => {
        it('sends message', () => {
            const store = useSettingsStore();

            store.attemptRadiaConnection();

            expect(mockSendMessage).toHaveBeenCalledWith('retryRadiaAvailabilityCheck');
        });
    });

    describe('setGameVersion', () => {
        it('sends message', () => {
            const store = useSettingsStore();

            store.setGameVersion(GameVersion.SPLATOON_3);

            expect(mockSendMessage).toHaveBeenCalledWith('setGameVersion', { version: 'SPLATOON_3' });
        });
    });
});
