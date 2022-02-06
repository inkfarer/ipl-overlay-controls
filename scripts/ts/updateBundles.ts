import { existsSync, readdirSync, readFileSync } from 'fs';
import { fetchTags } from './gitHelper';
import semver from 'semver';
import { execSync } from 'child_process';

const bundlesDir = '../..';
const bundles = readdirSync(bundlesDir, { withFileTypes: true })
    .filter(dir => dir.isDirectory() && dir.name !== 'ipl-overlay-controls');

bundles.forEach(bundle => {
    const bundlePath = `${bundlesDir}/${bundle.name}`;
    const bundlePackagePath = `${bundlePath}/package.json`;
    if (existsSync(bundlePackagePath)) {
        const parsedPackage = JSON.parse(readFileSync(bundlePackagePath, 'utf-8'));

        if ('compatibleDashboardVersion' in parsedPackage) {
            console.log(`Updating ${bundle.name}...`);
            console.log('Fetching versions...');
            const tags = fetchTags(bundlePath);
            const latestVersion = semver.maxSatisfying(tags, '');
            if (tags.length <= 0 || !latestVersion) {
                console.log('No versions found. Pulling changes from git...');
                try {
                    execSync(`git pull`, { cwd: bundlePath, stdio: [ 'ignore', 'ignore', 'pipe' ] });
                } catch (e) {
                    console.log(`Failed to update ${bundle.name}`, e);
                    return;
                }
            } else {
                console.log(`Checking out version ${latestVersion}...`);
                try {
                    execSync(
                        `git checkout ${latestVersion}`,
                        { cwd: bundlePath, stdio: [ 'ignore', 'ignore', 'pipe' ] });
                } catch (e) {
                    console.log(`Failed to update ${bundle.name}`, e);
                    return;
                }
            }
            console.log(`Updated ${bundle.name}`);
        }
    }
});
console.log('Done!');
