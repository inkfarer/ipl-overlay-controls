import { UnknownFunction } from '../../../helpers/__mocks__/module';
import { mockBundleConfig, replicantChangeListeners, replicants } from '../../__mocks__/mockNodecg';

const mockStopStream = jest.fn();
const mockStartStream = jest.fn();
let trackStreamEvents: {[event: string]: UnknownFunction} = { };

beforeEach(() => {
    trackStreamEvents = { };
});

jest.mock('lastfm', () => ({
    LastFmNode: jest.fn().mockReturnValue({
        stream: jest.fn().mockReturnValue({
            stop: mockStopStream,
            start: mockStartStream,
            on: (event: string, cb: UnknownFunction) => {
                trackStreamEvents[event] = cb;
            }
        })
    })
}));

describe('music', () => {
    require('../music');

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('nowPlayingSource', () => {
        it('handles source changing to manual', () => {
            const expectedNowPlaying = { song: 'Cool Artist - Cool Song' };
            replicants.nowPlayingSource = 'lastfm';
            replicants.manualNowPlaying = expectedNowPlaying;

            replicantChangeListeners.nowPlayingSource('manual');

            expect(replicants.nowPlaying).toEqual(expectedNowPlaying);
        });

        it('handles source changing to lastfm', () => {
            const expectedNowPlaying = { song: 'Cool Artist - Cool Song' };
            replicants.nowPlayingSource = 'manual';
            replicants.lastFmNowPlaying = expectedNowPlaying;

            replicantChangeListeners.nowPlayingSource('lastfm');

            expect(replicants.nowPlaying).toEqual(expectedNowPlaying);
        });

        it('handles manual song changing', () => {
            const expectedNowPlaying = { song: 'Cool Artist - Cool Song' };
            replicants.nowPlayingSource = 'manual';

            replicantChangeListeners.manualNowPlaying(expectedNowPlaying);

            expect(replicants.nowPlaying).toEqual(expectedNowPlaying);
        });

        it('handles lastfm song changing', () => {
            const expectedNowPlaying = { song: 'Cool Artist - Cool Song' };
            replicants.nowPlayingSource = 'lastfm';

            replicantChangeListeners.lastFmNowPlaying(expectedNowPlaying);

            expect(replicants.nowPlaying).toEqual(expectedNowPlaying);
        });
    });

    describe('handleLastFm', () => {
        it('does not start a stream if missing bundle configuration', () => {
            mockBundleConfig.lastfm = {};

            replicantChangeListeners.lastFmSettings({});

            expect(mockStartStream).not.toHaveBeenCalled();
        });

        describe('with bundle configuration', () => {
            it('does not start a stream if missing replicant configuration', () => {
                replicantChangeListeners.lastFmSettings({});

                expect(mockStartStream).not.toHaveBeenCalled();
            });

            describe('with replicant configuration', () => {
                beforeEach(() => {
                    replicantChangeListeners.lastFmSettings({ username: 'lastfm-user' });
                });

                it('stops existing track streams', () => {
                    replicantChangeListeners.lastFmSettings({ username: 'new-lastfm-user' });

                    expect(mockStartStream).toHaveBeenCalledTimes(2);
                    expect(mockStopStream).toHaveBeenCalledTimes(1);
                });

                it('handles new tracks being started', () => {
                    trackStreamEvents.nowPlaying({
                        artist: { '#text': 'Artist' },
                        name: 'Song',
                        album: { '#text': 'Album' },
                        image: [ { }, { }, { '#text': 'image://url' } ]
                    });

                    expect(replicants.lastFmNowPlaying).toEqual({
                        artist: 'Artist',
                        song: 'Song',
                        album: 'Album',
                        cover: 'image://url',
                        artistSong: 'Artist - Song'
                    });
                });

                it('handles track stream throwing "user not found" error', () => {
                    trackStreamEvents.error({ error: 6 });

                    expect(mockStopStream).toHaveBeenCalled();
                });

                it('ignores other track stream errors', () => {
                    mockStopStream.mockClear();
                    trackStreamEvents.error({ error: 5 });
                    trackStreamEvents.error({ error: 1 });
                    trackStreamEvents.error({ error: 7 });
                    trackStreamEvents.error({ error: 1403987 });

                    expect(mockStopStream).not.toHaveBeenCalled();
                });
            });
        });
    });
});
