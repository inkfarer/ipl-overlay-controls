'use strict';

module.exports = function (nodecg) {
	require('./music')(nodecg);
	require('./gameWinnerSetter')(nodecg);
	require('./tournamentImporter').listen(nodecg);
	require('./roundImporter').listen(nodecg);
	require('./fileImport')(nodecg);
	require('./radia').listen(nodecg);
};
