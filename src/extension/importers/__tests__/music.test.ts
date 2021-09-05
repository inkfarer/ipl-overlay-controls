import { MockNodecg } from '../../__mocks__/mockNodecg';
import { UnknownFunction } from '../../../helpers/__mocks__/module';

describe('music', () => {
    let nodecg: MockNodecg;

    const defaultBundleConfig = {
        lastfm: {
            apiKey: 'aiodwhjaqdoijw',
            secret: 'piwhjf08y3q4yr8ih'
        }
    };

    const setup = (bundleConfig: {[key: string]: unknown} = defaultBundleConfig) => {
        nodecg = new MockNodecg(bundleConfig);
        nodecg.init();

        require('../music');
    };

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
    });

    describe('nowPlayingSource', () => {
        beforeEach(() => {
            setup();
        });

        it('handles source changing to manual', () => {
            const expectedNowPlaying = { song: 'Cool Artist - Cool Song' };
            nodecg.replicants.nowPlayingSource.value = 'lastfm';
            nodecg.replicants.manualNowPlaying.value = expectedNowPlaying;

            nodecg.replicantListeners.nowPlayingSource('manual');

            expect(nodecg.replicants.nowPlaying.value).toEqual(expectedNowPlaying);
        });

        it('handles source changing to lastfm', () => {
            const expectedNowPlaying = { song: 'Cool Artist - Cool Song' };
            nodecg.replicants.nowPlayingSource.value = 'manual';
            nodecg.replicants.lastFmNowPlaying.value = expectedNowPlaying;

            nodecg.replicantListeners.nowPlayingSource('lastfm');

            expect(nodecg.replicants.nowPlaying.value).toEqual(expectedNowPlaying);
        });

        it('handles manual song changing', () => {
            const expectedNowPlaying = { song: 'Cool Artist - Cool Song' };
            nodecg.replicants.nowPlayingSource.value = 'manual';

            nodecg.replicantListeners.manualNowPlaying(expectedNowPlaying);

            expect(nodecg.replicants.nowPlaying.value).toEqual(expectedNowPlaying);
        });

        it('handles lastfm song changing', () => {
            const expectedNowPlaying = { song: 'Cool Artist - Cool Song' };
            nodecg.replicants.nowPlayingSource.value = 'lastfm';

            nodecg.replicantListeners.lastFmNowPlaying(expectedNowPlaying);

            expect(nodecg.replicants.nowPlaying.value).toEqual(expectedNowPlaying);
        });
    });

    describe('handleLastFm', () => {
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

        it('does not start a stream if missing bundle configuration', () => {
            setup({ lastfm: { } });

            nodecg.replicantListeners.lastFmSettings({});

            expect(mockStartStream).not.toHaveBeenCalled();
        });

        describe('with bundle configuration', () => {
            beforeEach(() => {
                setup();
            });

            it('does not start a stream if missing replicant configuration', () => {
                nodecg.replicantListeners.lastFmSettings({});

                expect(mockStartStream).not.toHaveBeenCalled();
            });

            describe('with replicant configuration', () => {
                beforeEach(() => {
                    nodecg.replicantListeners.lastFmSettings({ username: 'lastfm-user' });
                });

                it('stops existing track streams', () => {
                    nodecg.replicantListeners.lastFmSettings({ username: 'new-lastfm-user' });

                    expect(mockStartStream).toHaveBeenCalledTimes(2);
                    expect(mockStopStream).toHaveBeenCalled();
                });

                it('handles new tracks being started', () => {
                    trackStreamEvents.nowPlaying({
                        artist: { '#text': 'Artist' },
                        name: 'Song',
                        album: { '#text': 'Album' },
                        image: [ { }, { }, { '#text': 'image://url' } ]
                    });

                    expect(nodecg.replicants.lastFmNowPlaying.value).toEqual({
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
