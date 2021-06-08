import type { NodeCG } from 'nodecg/server';
import * as nodecgContext from './util/nodecg';
import { RadiaSettings } from 'types/schemas';

/* eslint-disable @typescript-eslint/no-var-requires */
export default (nodecg: NodeCG): void => {
    nodecgContext.set(nodecg);
    require('./music');
    require('./gameWinnerSetter')(nodecg);
    require('./tournamentImporter').listen(nodecg);
    require('./roundImporter').listen(nodecg);
    require('./fileImport')(nodecg);

    const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');

    if (!nodecg.bundleConfig || typeof nodecg.bundleConfig.radia === 'undefined') {
        nodecg.log.warn(
            `"radia" is not defined in cfg/${nodecg.bundleName}.json! The ability to import data via the Radia
            Production API won't be possible.`
        );
        radiaSettings.value.enabled = false;
    } else {
        radiaSettings.value.enabled = true;
        require('./radia').listen(nodecg);
    }
};
