import { useMusicStore } from '../musicStore';
import { replicants } from '../../__mocks__/mockNodecg';
import { createPinia, setActivePinia } from 'pinia';

describe('musicStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('setMusicShown', () => {
        it('updates replicant value', () => {
            const store = useMusicStore();
            store.setMusicShown(false);

            expect(replicants.musicShown).toEqual(false);
        });
    });

    describe('setNowPlayingSource', () => {
        it('updates replicant value', () => {
            const store = useMusicStore();
            store.setNowPlayingSource('lastfm');

            expect(replicants.nowPlayingSource).toEqual('lastfm');
        });
    });

    describe('setManualNowPlaying', () => {
        it('updates replicant value', () => {
            const store = useMusicStore();
            store.setManualNowPlaying({ song: 'cool song' });

            expect(replicants.manualNowPlaying).toEqual({ song: 'cool song' });
        });
    });
});
