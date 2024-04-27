import type NodeCG from '@nodecg/types';
import * as nodecgContext from './helpers/nodecg';
import { Configschema, PredictionStore, RadiaSettings, RuntimeConfig } from 'schemas';
import isEmpty from 'lodash/isEmpty';
import { ObsConnectorService } from './services/ObsConnectorService';
import { AssetPathService } from './services/AssetPathService';
import { GameVersion } from 'types/enums/gameVersion';

import i18next, { type Resource } from 'i18next';
import { InterfaceLocale } from 'types/enums/InterfaceLocale';

function loadTranslation(locale: string, name: string) {
    try {
        return require(`../helpers/i18n/${locale.toLowerCase()}/${name}.json`);
    } catch (ignore) {
        return null;
    }
}

function loadTranslations(): Resource {
    const result: Resource = { };
    for (const locale of Object.values(InterfaceLocale)) {
        result[locale.toLowerCase()] = {
            common: loadTranslation(locale, 'common'),
            translation: loadTranslation(locale, 'server')
        };
    }

    return result;
}

function initI18n(nodecg: NodeCG.ServerAPI) {
    i18next.init({
        lng: 'en',
        fallbackLng: 'en',
        resources: loadTranslations(),
        interpolation: {
            escapeValue: false
        }
    });

    const runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');
    runtimeConfig.on('change', (newValue, oldValue) => {
        if (!oldValue || newValue.interfaceLocale !== oldValue.interfaceLocale) {
            i18next.changeLanguage(newValue.interfaceLocale.toLowerCase()).catch(e => {
                nodecg.log.error('Failed to change interface language', e);
            });
        }
    });
}

/* eslint-disable @typescript-eslint/no-var-requires */
export = (nodecg: NodeCG.ServerAPI<Configschema>): void => {
    initI18n(nodecg);
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
    require('./replicants/scoreboardData');
    require('./versionChecker');

    // These imports are here so the files they depend on don't get executed too early.
    // This should become a non-issue as more of the codebase gets converted to classes.
    const { AutomationActionService } = require('./services/AutomationActionService');
    const { AutomationActionController } = require('./controllers/AutomationActionController');
    const { ReplicantFixerService } = require('./services/ReplicantFixerService');
    const { LocaleInfoService } = require('./services/LocaleInfoService');
    const { RuntimeConfigController } = require('./controllers/RuntimeConfigController');
    const { ScreenshotParserService } = require('./services/ScreenshotParserService');
    const { ObsConnectorController } = require('./controllers/ObsConnectorController');

    const screenshotParserService = new ScreenshotParserService(nodecg);

    const obsConnectorService = new ObsConnectorService(nodecg);
    new ObsConnectorController(nodecg, obsConnectorService, screenshotParserService);

    const automationActionService = new AutomationActionService(nodecg, obsConnectorService);
    automationActionService.resetGameAutomationData();
    new AutomationActionController(nodecg, automationActionService);

    const replicantFixerService = new ReplicantFixerService(nodecg);
    replicantFixerService.fix();

    const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');
    const predictionStore = nodecg.Replicant<PredictionStore>('predictionStore');
    predictionStore.value.status.socketOpen = false;
    radiaSettings.value.enabled = false;

    const runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');
    const assetPathService = new AssetPathService(nodecg);
    assetPathService.updateAssetPaths(runtimeConfig.value.gameVersion as GameVersion);

    const localeInfoService = new LocaleInfoService(nodecg);
    localeInfoService.initIfNeeded();
    new RuntimeConfigController(nodecg, localeInfoService, assetPathService);

    if (isEmpty(nodecg.bundleConfig) || isEmpty(nodecg.bundleConfig.radia)) {
        nodecg.log.warn(i18next.t('missingRadiaConfigurationWarning', { bundleName: nodecg.bundleName }));

        predictionStore.value.status.predictionsEnabled = false;
        predictionStore.value.status.predictionStatusReason = 'missingConfiguration';
    } else {
        require('./importers/radiaAvailabilityCheck');
        require('./importers/predictions');

        const { CasterImportController } = require('./controllers/CasterImportController');
        const { RadiaProductionsService } = require('./services/RadiaProductionsService');
        const { RadiaProductionsClient } = require('./clients/RadiaProductionsClient');

        const radiaProductionsClient = new RadiaProductionsClient(
            nodecg.bundleConfig.radia.url,
            nodecg.bundleConfig.radia.authentication);
        const radiaProductionsService = new RadiaProductionsService(nodecg, radiaProductionsClient);
        new CasterImportController(nodecg, radiaProductionsService);
    }
};
