import type { NodeCG, NodeCGStatic } from 'nodecg/server';
import * as nodecgContext from './helpers/nodecg';
import { PredictionStore, RadiaSettings, RuntimeConfig } from 'schemas';
import isEmpty from 'lodash/isEmpty';
import { ObsConnectorService } from './services/ObsConnectorService';
import { ObsConnectorController } from './controllers/ObsConnectorController';

/* eslint-disable @typescript-eslint/no-var-requires */
export = (nodecg: NodeCG & NodeCGStatic): void => {
    nodecgContext.set(nodecg);

    require('./importers/music');
    require('./importers/tournamentImporter');
    require('./importers/tournamentRefresh');
    require('./importers/roundImporter');
    require('./importers/fileImport');
    require('./importers/highlightedMatches');
    require('./replicants/activeRound');
    require('./replicants/nextRound');
    require('./replicants/tournamentData');
    require('./replicants/casters');
    require('./replicants/matchRoutes');
    require('./replicants/matchStore');
    require('./replicants/roundStore');
    require('./replicants/runtimeConfig');
    require('./replicants/scoreboardData');
    require('./versionChecker');

    // These imports are here so the files they depend on don't get executed too early.
    const { AutomationActionService } = require('./services/AutomationActionService');
    const { AutomationActionController } = require('./controllers/AutomationActionController');

    const obsConnectorService = new ObsConnectorService(nodecg);
    new ObsConnectorController(nodecg, obsConnectorService);
    const automationActionService = new AutomationActionService(nodecg, obsConnectorService);
    automationActionService.resetGameAutomationData();
    new AutomationActionController(nodecg, automationActionService);

    const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');
    const predictionStore = nodecg.Replicant<PredictionStore>('predictionStore');
    predictionStore.value.status.socketOpen = false;
    radiaSettings.value.enabled = false;

    const { initLocaleInfoIfNeeded } = require('./replicants/localeInfo');
    initLocaleInfoIfNeeded(nodecg.Replicant<RuntimeConfig>('runtimeConfig').value);

    if (isEmpty(nodecg.bundleConfig) || isEmpty(nodecg.bundleConfig.radia)) {
        nodecg.log.warn(
            `"radia" is not defined in cfg/${nodecg.bundleName}.json! The ability to import data via the Radia `
            + 'Production API will not be possible.'
        );

        predictionStore.value.status.predictionsEnabled = false;
        predictionStore.value.status.predictionStatusReason = 'Missing bundle configuration.';
    } else {
        require('./importers/radiaAvailabilityCheck');
        require('./importers/casters');
        require('./importers/predictions');
    }
};
