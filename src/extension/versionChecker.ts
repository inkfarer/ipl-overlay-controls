import { version } from '../../package.json';
import * as nodecgContext from './helpers/nodecg';
import semver from 'semver/preload';
import { dependentBundles } from './helpers/bundleHelper';

const nodecg = nodecgContext.get();

dependentBundles.forEach(bundle => {
    if (!semver.satisfies(version, bundle.compatibleDashboardVersion)) {
        nodecg.log.warn(`Bundle ${bundle.name} expects version ${bundle.compatibleDashboardVersion} of `
            + `${nodecg.bundleName}! The installed version is ${version}.`);
    }
});
