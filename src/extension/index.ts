import type { NodeCG, NodeCGStatic } from 'nodecg/server';
import * as nodecgContext from './helpers/nodecg';
import { PredictionStore, RadiaSettings } from 'schemas';
import isEmpty from 'lodash/isEmpty';

/* eslint-disable @typescript-eslint/no-var-requires */
export = (nodecg: NodeCG & NodeCGStatic): void => {
    nodecgContext.set(nodecg);

    require('./importers/music');
    require('./importers/tournamentImporter');
    require('./importers/roundImporter');
    require('./importers/fileImport');
    require('./importers/highlightedMatches');
    require('./replicants/activeRound');
    require('./replicants/nextRound');
    require('./replicants/tournamentData');
    require('./replicants/casters');
    require('./versionChecker');

    const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');
    const predictionStore = nodecg.Replicant<PredictionStore>('predictionStore');
    predictionStore.value.status.socketOpen = false;

    if (isEmpty(nodecg.bundleConfig) || isEmpty(nodecg.bundleConfig.radia)) {
        nodecg.log.warn(
            `"radia" is not defined in cfg/${nodecg.bundleName}.json! The ability to import data via the Radia `
            + 'Production API will not be possible.'
        );
        radiaSettings.value.enabled = false;
        predictionStore.value.status.predictionsEnabled = false;
        predictionStore.value.status.predictionStatusReason = 'Missing bundle configuration.';
    } else {
        radiaSettings.value.enabled = true;
        require('./importers/casters');
        require('./importers/predictions');
    }
};
