const lastFmNode = require('lastfm').LastFmNode;

module.exports = function (nodecg) {
    handleLastFm(nodecg);
};

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
        
        trackStream = lastfm.stream(
            newValue.username
        );

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
                nodecg.log.info(`Last.fm couldn't find user "${newValue.username}" - error message: "${e.message}"`);

                trackStream.stop();
            }
        });

        trackStream.start();
    });
}
