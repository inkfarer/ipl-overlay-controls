import type { NodeCG, NodeCGStatic } from 'nodecg/server';
import * as nodecgContext from './helpers/nodecg';
import { PredictionStore, RadiaSettings } from 'schemas';

/* eslint-disable @typescript-eslint/no-var-requires */
export default (nodecg: NodeCG & NodeCGStatic): void => {
    nodecgContext.set(nodecg);

    require('./importers/music');
    require('./importers/tournamentImporter');
    require('./importers/roundImporter');
    require('./importers/fileImport');
    require('./importers/highlightedMatches');
    require('./replicants/activeRound');
    require('./replicants/nextRound');
    require('./replicants/tournamentData');
    require('./versionChecker');

    const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');
    const predictionStore = nodecg.Replicant<PredictionStore>('predictionStore');

    if (!nodecg.bundleConfig || typeof nodecg.bundleConfig.radia === 'undefined') {
        nodecg.log.warn(
            `"radia" is not defined in cfg/${nodecg.bundleName}.json! The ability to import data via the Radia
            Production API won't be possible.`
        );
        radiaSettings.value.enabled = false;
        predictionStore.value.enablePrediction = false;
    } else {
        radiaSettings.value.enabled = true;
        require('./importers/casters');
        require('./importers/predictions');
    }
};
