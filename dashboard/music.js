const lastFmNowPlaying = nodecg.Replicant('lastFmNowPlaying');
const manualNowPlaying = nodecg.Replicant('manualNowPlaying');
const musicShown = nodecg.Replicant('musicShown');
const manualSongInputEnabled = nodecg.Replicant('manualSongInputEnabled');

manualSongInputEnabled.on('change', (newValue) => {
    document.getElementById('manual-song-toggle').checked = newValue;
});

lastFmNowPlaying.on('change', (newValue) => {
    const lastfmNowPlayingElem = document.getElementById(
        'lastfm-now-playing-text'
    );

    if (newValue.artist !== undefined && newValue.song !== undefined) {
        lastfmNowPlayingElem.innerText = `${newValue.artist} - ${newValue.song}`;
    } else {
        lastfmNowPlayingElem.innerText = 'No song is playing at the moment.';
    }
});

manualNowPlaying.on('change', (newValue) => {
    document.getElementById('manual-song-name-input').value = newValue.song;
    document.getElementById('manual-song-artist-input').value = newValue.artist;
});

addChangeReminder(
    document.querySelectorAll('.manual-song-change-reminder'),
    document.getElementById('update-manual-song')
);

document.getElementById('update-manual-song').onclick = () => {
    manualNowPlaying.value.song = document.getElementById(
        'manual-song-name-input'
    ).value;
    manualNowPlaying.value.artist = document.getElementById(
        'manual-song-artist-input'
    ).value;
};

document.getElementById('show-music-btn').onclick = () => {
    musicShown.value = true;
};
document.getElementById('hide-music-btn').onclick = () => {
    musicShown.value = false;
};

musicShown.on('change', (newValue) => {
    setToggleButtonDisabled(
        document.getElementById('show-music-btn'),
        document.getElementById('hide-music-btn'),
        newValue
    );
});
