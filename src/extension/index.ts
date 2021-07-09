import type { NodeCG } from 'nodecg/server';
import * as nodecgContext from './util/nodecg';
import { RadiaSettings } from 'schemas';

/* eslint-disable @typescript-eslint/no-var-requires */
export default (nodecg: NodeCG): void => {
    nodecgContext.set(nodecg);

    require('./music');
    require('./gameData');
    require('./tournamentImporter');
    require('./roundImporter');
    require('./fileImport');
    require('./highlightedMatches');
    require('./colorData');
    require('./versionChecker');

    const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');

    if (!nodecg.bundleConfig || typeof nodecg.bundleConfig.radia === 'undefined') {
        nodecg.log.warn(
            `"radia" is not defined in cfg/${nodecg.bundleName}.json! The ability to import data via the Radia
            Production API won't be possible.`
        );
        radiaSettings.value.enabled = false;
    } else {
        radiaSettings.value.enabled = true;
        require('./radia');
    }
};
