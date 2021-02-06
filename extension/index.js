'use strict';

module.exports = function (nodecg) {
    require('./lastfm')(nodecg);
    require('./gameWinnerSetter')(nodecg);
    require('./tournamentImporter')(nodecg);
    require('./roundImporter')(nodecg);
};
