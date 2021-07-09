import { version } from '../../package.json';
import * as nodecgContext from './util/nodecg';
import { existsSync, readdirSync, readFileSync } from 'fs';
import semver from 'semver/preload';

const nodecg = nodecgContext.get();
const bundlesDir = `${process.env.NODECG_ROOT}/bundles`;

const bundles = readdirSync(bundlesDir, { withFileTypes: true })
    .filter(dir => dir.isDirectory() && dir.name !== nodecg.bundleName);

bundles.forEach(bundle => {
    const bundlePackagePath = `${bundlesDir}/${bundle.name}/package.json`;
    if (existsSync(bundlePackagePath)) {
        const parsedPackage = JSON.parse(readFileSync(bundlePackagePath, 'utf-8'));

        if ('dashboardVersion' in parsedPackage && !semver.satisfies(version, parsedPackage.dashboardVersion)) {
            nodecg.log.warn(`Bundle ${bundle.name} expects version ${parsedPackage.dashboardVersion} of `
                + `${nodecg.bundleName}! The installed version is ${version}.`);
        }
    }
});
