const lastFmNode = require('lastfm').LastFmNode;

module.exports = function (nodecg) {
	if (!nodecg.bundleConfig || typeof nodecg.bundleConfig.lastfm === 'undefined') {
		nodecg.log.error(`"lastfm" is not defined in cfg/${nodecg.bundleName}.json! ` + 
			'Some graphics may not function as expected.');
		return;
	}

	const lastfm = new lastFmNode({
		api_key: nodecg.bundleConfig.lastfm.apiKey,
		secret: nodecg.bundleConfig.lastfm.secret
	});
	const trackStream = lastfm.stream(nodecg.bundleConfig.lastfm.targetAccount);

	const nowPlaying = nodecg.Replicant('nowPlaying', {
		defaultValue: false,
		persistent: false
	});

	trackStream.on('nowPlaying', track => {
		nowPlaying.value = {
			artist: track.artist['#text'],
			song: track.name,
			album: track.album['#text'],
			cover: track.image[2]['#text'],
			artistSong: `${track.artist['#text']} - ${track.name}`
		};
	});

	trackStream.on('error', () => {
		//nothing
	});

	trackStream.start();
}