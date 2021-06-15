import { addChangeReminder, setToggleButtonDisabled } from '../globalScripts';
import { LastFmNowPlaying, ManualNowPlaying, MusicShown, NowPlaying, NowPlayingSource } from 'schemas';

import '../globalStyles.css';

const lastFmNowPlaying = nodecg.Replicant<LastFmNowPlaying>('lastFmNowPlaying');
const manualNowPlaying = nodecg.Replicant<ManualNowPlaying>('manualNowPlaying');
const nowPlaying = nodecg.Replicant<NowPlaying>('nowPlaying');
const musicShown = nodecg.Replicant<MusicShown>('musicShown');
const nowPlayingSource = nodecg.Replicant<NowPlayingSource>('nowPlayingSource');

const manualSongToggle = document.getElementById('manual-song-toggle') as HTMLInputElement;

nowPlayingSource.on('change', newValue => {
    manualSongToggle.checked = newValue === 'manual';
});

manualSongToggle.addEventListener('change', e => {
    nowPlayingSource.value = (e.target as HTMLInputElement).checked ? 'manual' : 'lastfm';
});

lastFmNowPlaying.on('change', newValue => {
    const lastfmNowPlayingElem = document.getElementById(
        'lastfm-now-playing-text'
    );

    if (newValue.artist !== undefined && newValue.song !== undefined) {
        lastfmNowPlayingElem.innerText = `${newValue.artist} - ${newValue.song}`;
    } else {
        lastfmNowPlayingElem.innerText = 'No song is playing at the moment.';
    }
});

manualNowPlaying.on('change', newValue => {
    (document.getElementById('manual-song-name-input') as HTMLInputElement).value = newValue.song;
    (document.getElementById('manual-song-artist-input') as HTMLInputElement).value = newValue.artist;
});

addChangeReminder(
    document.querySelectorAll('.manual-song-change-reminder'),
    document.getElementById('update-manual-song')
);

document.getElementById('update-manual-song').onclick = () => {
    manualNowPlaying.value.song = (document.getElementById('manual-song-name-input') as HTMLInputElement).value;
    manualNowPlaying.value.artist = (document.getElementById('manual-song-artist-input') as HTMLInputElement).value;
};

document.getElementById('show-music-btn').onclick = () => { musicShown.value = true; };

document.getElementById('hide-music-btn').onclick = () => { musicShown.value = false; };

musicShown.on('change', newValue => {
    setToggleButtonDisabled(
        document.getElementById('show-music-btn'),
        document.getElementById('hide-music-btn'),
        newValue
    );
});

nowPlaying.on('change', newValue => {
    (document.getElementById('now-playing-text') as HTMLDivElement).innerText =
        `${newValue.artist} - ${newValue.song}`;
});
