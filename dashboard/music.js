const nowPlaying = nodecg.Replicant('nowPlaying');
const nowPlayingManual = nodecg.Replicant('nowPlayingManual');
const musicShown = nodecg.Replicant('musicShown');
const mSongEnabled = nodecg.Replicant('mSongEnabled');

mSongEnabled.on('change', newValue => {
    document.querySelector('#checkManualSong').checked = newValue;
});

const clrRed = '#C9513E';
const clrBlue = '#3F51B5';

nowPlaying.on('change', newValue => {
    if (newValue.artist !== undefined && newValue.song !== undefined) {
        npText.innerText = newValue.artist + " - " + newValue.song;
    } else {
        npText.innerText = 'No song is playing at the moment.';
    }
});

nowPlayingManual.on('change', newValue => {
    songInput.value = newValue.song;
    artistInput.value = newValue.artist;
});

const toRed = ["songInput", "artistInput"];
toRed.forEach(element => {
    document.getElementById(element).addEventListener('input', () => { updateManual.style.backgroundColor = clrRed; });
});

updateManual.onclick = () => {
    updateManual.style.backgroundColor = clrBlue;
    nowPlayingManual.value.song = songInput.value;
    nowPlayingManual.value.artist = artistInput.value;
}

showMusic.onclick = () => { musicShown.value = true; }
hideMusic.onclick = () => { musicShown.value = false; }

function disableShowHideButtons(value) {
    if (value) {
        document.getElementById('hideMusic').disabled = false;
        document.getElementById('showMusic').disabled = true;
    } else {
        document.getElementById('showMusic').disabled = false;
        document.getElementById('hideMusic').disabled = true;
    }
}

musicShown.on('change', (newValue) => {
    disableShowHideButtons(newValue);
});