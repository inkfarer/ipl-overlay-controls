import type { NodeCG } from 'nodecg/server';
import * as nodecgContext from './util/nodecg';

/* eslint-disable @typescript-eslint/no-var-requires */
export default (nodecg: NodeCG): void => {
    nodecgContext.set(nodecg);
    require('./music');
    require('./gameWinnerSetter')(nodecg);
    require('./tournamentImporter').listen(nodecg);
    require('./roundImporter').listen(nodecg);
    require('./fileImport')(nodecg);
    require('./radia').listen(nodecg);
};
