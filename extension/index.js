'use strict';

module.exports = function (nodecg) {
	require('./lastfm')(nodecg);
	require('./mapWinnerSetter')(nodecg);
};
