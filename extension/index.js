'use strict';

module.exports = function (nodecg) {
	require('./lastfm')(nodecg);
	require('./mapWinnerSetter')(nodecg);
	require('./tourneyImporter')(nodecg);
	require('./mapImporter')(nodecg);
};
