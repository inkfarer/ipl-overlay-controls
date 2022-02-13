import { version } from '../../package.json';
import * as nodecgContext from './helpers/nodecg';
import semver from 'semver/preload';
import { dependentBundles } from './helpers/bundleHelper';
import { RuntimeConfig } from '../types/schemas';
import { GameVersion, GameVersionHelper } from '../types/enums/gameVersion';

const nodecg = nodecgContext.get();
const runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');

dependentBundles.forEach(bundle => {
    if (!semver.satisfies(version, bundle.compatibleDashboardVersion)) {
        nodecg.log.warn(`Bundle '${bundle.name}' expects version ${bundle.compatibleDashboardVersion} of `
            + `${nodecg.bundleName}! The installed version is ${version}.`);
    }
    const gameVersion = runtimeConfig.value.gameVersion as GameVersion;
    if (!bundle.compatibleGameVersions.includes(gameVersion)) {
        nodecg.log.warn(`Bundle '${bundle.name}' is not compatible with ${GameVersionHelper.toPrettyString(gameVersion)}!`);
    }
});
