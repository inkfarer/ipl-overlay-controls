import { version } from '../../package.json';
import * as nodecgContext from './helpers/nodecg';
import semver from 'semver/preload';
import { dependentBundles } from './helpers/bundleHelper';
import { RuntimeConfig } from '../types/schemas';
import { GameVersion } from '../types/enums/gameVersion';
import i18next from 'i18next';

const nodecg = nodecgContext.get();
const runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');

dependentBundles.forEach(bundle => {
    if (!semver.satisfies(version, bundle.compatibleDashboardVersion)) {
        nodecg.log.warn(i18next.t('versionChecker.incompatibleBundleWarning', {
            otherBundle: bundle.name,
            compatibleVersion: bundle.compatibleDashboardVersion,
            thisBundle: nodecg.bundleName,
            installedVersion: version
        }));
    }
    const gameVersion = runtimeConfig.value.gameVersion as GameVersion;
    if (!bundle.compatibleGameVersions.includes(gameVersion)) {
        nodecg.log.warn(i18next.t('versionChecker.incompatibleGameVersionWarning', {
            bundleName: bundle.name,
            gameVersion
        }));
    }
});
