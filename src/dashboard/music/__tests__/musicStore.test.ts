import { musicStore } from '../musicStore';
import { replicants } from '../../__mocks__/mockNodecg';

describe('musicStore', () => {
    describe('setState', () => {
        it('updates state', () => {
            musicStore.commit('setState', { name: 'nowPlaying', val: { foo: 'bar' } });

            expect(musicStore.state.nowPlaying).toEqual({ foo: 'bar' });
        });
    });

    describe('setMusicShown', () => {
        it('updates replicant value', () => {
            musicStore.commit('setMusicShown', false);

            expect(replicants.musicShown).toEqual(false);
        });
    });

    describe('setNowPlayingSource', () => {
        it('updates replicant value', () => {
            musicStore.commit('setNowPlayingSource', 'lastfm');

            expect(replicants.nowPlayingSource).toEqual('lastfm');
        });
    });

    describe('setManualNowPlaying', () => {
        it('updates replicant value', () => {
            musicStore.commit('setManualNowPlaying', { song: 'cool song' });

            expect(replicants.manualNowPlaying).toEqual({ song: 'cool song' });
        });
    });
});
