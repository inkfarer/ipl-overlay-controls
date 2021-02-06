'use strict';

module.exports = function (nodecg) {
    require('./music')(nodecg);
    require('./gameWinnerSetter')(nodecg);
    require('./tournamentImporter')(nodecg);
    require('./roundImporter')(nodecg);
};
