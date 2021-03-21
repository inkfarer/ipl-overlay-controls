const lastFmNode = require('lastfm').LastFmNode;
const clone = require('clone');

module.exports = function (nodecg) {
    handleLastFm(nodecg);
    handleNowPlaying(nodecg);
};

function handleNowPlaying(nodecg) {
    const lastFmNowPlaying = nodecg.Replicant('lastFmNowPlaying');
    const manualNowPlaying = nodecg.Replicant('manualNowPlaying');

    const replicantToSource = {
        lastfm: lastFmNowPlaying,
        manual: manualNowPlaying,
    };

    const nowPlayingSource = nodecg.Replicant('nowPlayingSource');
    const nowPlaying = nodecg.Replicant('nowPlaying');

    nowPlayingSource.on('change', (newValue) => {
        switch (newValue) {
            case 'manual':
                nowPlaying.value = clone(manualNowPlaying.value);
                break;
            case 'lastfm':
                nowPlaying.value = clone(lastFmNowPlaying.value);
                break;
        }
    });

    for (const [key, value] of Object.entries(replicantToSource)) {
        value.on('change', (newValue) => {
            if (nowPlayingSource.value === key) {
                nowPlaying.value = clone(newValue);
            }
        });
    }
}

function handleLastFm(nodecg) {
    if (
        !nodecg.bundleConfig ||
        typeof nodecg.bundleConfig.lastfm === 'undefined'
    ) {
        nodecg.log.error(
            `"lastfm" is not defined in cfg/${nodecg.bundleName}.json! ` +
                'Some graphics may not function as expected.'
        );
        return;
    }

    const lastfm = new lastFmNode({
        api_key: nodecg.bundleConfig.lastfm.apiKey,
        secret: nodecg.bundleConfig.lastfm.secret,
    });

    const nowPlaying = nodecg.Replicant('lastFmNowPlaying', {
        persistent: false,
    });

    const lastFmSettings = nodecg.Replicant('lastFmSettings');
    var trackStream;

    lastFmSettings.on('change', (newValue) => {
        if (trackStream) {
            trackStream.stop();
        }

        trackStream = lastfm.stream(newValue.username);

        trackStream.on('nowPlaying', (track) => {
            nowPlaying.value = {
                artist: track.artist['#text'],
                song: track.name,
                album: track.album['#text'],
                cover: track.image[2]['#text'],
                artistSong: `${track.artist['#text']} - ${track.name}`,
            };
        });

        trackStream.on('error', (e) => {
            // Error 6 = "User not found"
            if (e.error === 6) {
                nodecg.log.info(
                    `Last.fm couldn't find user "${newValue.username}" - error message: "${e.message}"`
                );

                trackStream.stop();
            }
        });

        trackStream.start();
    });
}
