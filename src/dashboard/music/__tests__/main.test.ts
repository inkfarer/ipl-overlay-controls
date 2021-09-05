import { MockNodecg } from '../../__mocks__/mockNodecg';
import { dispatch, elementById } from '../../helpers/elemHelper';

describe('main', () => {
    let nodecg: MockNodecg;

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <button id="update-manual-song"></button>
            <button id="show-music-btn"></button>
            <button id="hide-music-btn"></button>
            <input id="manual-song-toggle">
            <input id="manual-song-name-input">
            <input id="manual-song-artist-input">
            <div id="lastfm-now-playing-text"></div>
            <div id="now-playing-text"></div>`;

        require('../main');
    });

    describe('nowPlayingSource: change', () => {
        it('checks manual song toggle in source is manual', () => {
            nodecg.listeners.nowPlayingSource('manual');

            expect(elementById<HTMLInputElement>('manual-song-toggle').checked).toEqual(true);
        });

        it('unchecks manual song toggle in source is lastfm', () => {
            nodecg.listeners.nowPlayingSource('lastfm');

            expect(elementById<HTMLInputElement>('manual-song-toggle').checked).toEqual(false);
        });
    });

    describe('manual-song-toggle: change', () => {
        it('sets nowPlayingSource to manual if checked', () => {
            const toggle = elementById<HTMLInputElement>('manual-song-toggle');
            toggle.checked = true;

            dispatch(toggle, 'change');

            expect(nodecg.replicants.nowPlayingSource.value).toEqual('manual');
        });

        it('sets nowPlayingSource to lastfm if checked', () => {
            const toggle = elementById<HTMLInputElement>('manual-song-toggle');
            toggle.checked = false;

            dispatch(toggle, 'change');

            expect(nodecg.replicants.nowPlayingSource.value).toEqual('lastfm');
        });
    });

    describe('lastFmNowPlaying: change', () => {
        it('updates song name', () => {
            nodecg.listeners.lastFmNowPlaying({ artist: 'Cool Artist', song: 'Cool Song' });

            expect(elementById('lastfm-now-playing-text').innerText).toEqual('Cool Artist - Cool Song');
        });

        it('handles missing values', () => {
            nodecg.listeners.lastFmNowPlaying({ artist: undefined, song: undefined });

            expect(elementById('lastfm-now-playing-text').innerText).toEqual('No song is playing at the moment.');
        });
    });

    describe('manualNowPlaying: change', () => {
        it('updates inputs', () => {
            nodecg.listeners.manualNowPlaying({ artist: 'Rad Artist', song: 'Rad Song' });

            expect(elementById<HTMLInputElement>('manual-song-name-input').value).toEqual('Rad Song');
            expect(elementById<HTMLInputElement>('manual-song-artist-input').value).toEqual('Rad Artist');
        });
    });

    describe('update-manual-song: click', () => {
        it('updates manualNowPlaying value', () => {
            nodecg.replicants.manualNowPlaying.value = { song: 'Song', artist: 'Artist' };
            elementById<HTMLInputElement>('manual-song-name-input').value = 'Dope Song';
            elementById<HTMLInputElement>('manual-song-artist-input').value = 'Dope Artist';

            dispatch(elementById('update-manual-song'), 'click');

            expect(nodecg.replicants.manualNowPlaying.value).toEqual({ song: 'Dope Song', artist: 'Dope Artist' });
        });
    });

    describe('show-music-btn: click', () => {
        it('updates musicShown value', () => {
            dispatch(elementById('show-music-btn'), 'click');

            expect(nodecg.replicants.musicShown.value).toEqual(true);
        });
    });

    describe('hide-music-btn: click', () => {
        it('updates musicShown value', () => {
            dispatch(elementById('hide-music-btn'), 'click');

            expect(nodecg.replicants.musicShown.value).toEqual(false);
        });
    });

    describe('musicShown: change', () => {
        it('updates toggles if value is true', () => {
            nodecg.listeners.musicShown(true);

            expect(elementById<HTMLButtonElement>('show-music-btn').disabled).toEqual(true);
            expect(elementById<HTMLButtonElement>('hide-music-btn').disabled).toEqual(false);
        });

        it('updates toggles if value is false', () => {
            nodecg.listeners.musicShown(false);

            expect(elementById<HTMLButtonElement>('show-music-btn').disabled).toEqual(false);
            expect(elementById<HTMLButtonElement>('hide-music-btn').disabled).toEqual(true);
        });
    });

    describe('nowPlaying: change', () => {
        it('updates text display', () => {
            nodecg.listeners.nowPlaying({ artist: 'Artiste', song: 'Moosic' });

            expect(elementById('now-playing-text').innerText).toEqual('Artiste - Moosic');
        });
    });
});
